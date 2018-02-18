import * as Sodium from 'sodium-native';
import { PublicKey, SecretKey, KeyPair } from 'sodium-native';
import { HEX, BASE64, UTF8 } from '../common/utils';

import { BreweryKeyStore } from './brewery-key-store';

/**
 * Persisted information about a Tavern
**/
export class TavernInfo {
  id: string;
  name: string;

  comments?: string;  // SEED

  streamPublicKey?: PublicKey;
}

/**
 * Server-side Tavern objects
**/
export class Tavern extends TavernInfo {

  keyStore: BreweryKeyStore;

  //
  constructor( info?: TavernInfo ) {
    super();

    if ( info )
      this.fromJSON( info );
  }

  // Serialize
  toJSON(): Object {
    let json = {
      id: this.id,
      name: this.name,

      ... (this as TavernInfo),

      streamPublicKey: (this.streamPublicKey)? this.streamPublicKey.toString( BASE64 ) : undefined,
    }

    return json;
  }

  // De-serialize
  fromJSON( info: TavernInfo ) {
    let obj: any = info; // cheap cast

    Object.assign( this, {
      ...info,
      streamPublicKey: (info.streamPublicKey) ? Buffer.from( obj.streamPublicKey, BASE64 ) : undefined,
    } );

    //console.log( this );
  }

  /**
   *
  **/
  deriveTavernStreamKeys( breweryTavernKeys: KeyPair ): { txStreamSecretKey: SecretKey, rxStreamSecretKey: SecretKey } {
    let txStreamSecretKey: SecretKey = Buffer.alloc( Sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES );
    let rxStreamSecretKey: SecretKey = Buffer.alloc( Sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES );

    Sodium.crypto_kx_server_session_keys(
      rxStreamSecretKey,
      txStreamSecretKey,
      breweryTavernKeys.PublicKey,
      breweryTavernKeys.SecretKey,
      this.streamPublicKey );

    return {
      txStreamSecretKey,
      rxStreamSecretKey
    }
  }

  txStreamState;
  rxStreamState;

  initTavernStreams( initChunk: Buffer ): Buffer {

    let keys = this.deriveTavernStreamKeys( this.keyStore.breweryTavernKeys );
    //console.log( "TavernStore:");
    //console.log( keys );

    // Init stream-from-tavern
    this.rxStreamState = Sodium.crypto_secretstream_xchacha20poly1305_state_new();
    Sodium.crypto_secretstream_xchacha20poly1305_init_pull( this.rxStreamState, initChunk, keys.rxStreamSecretKey );

    // Init stream-to-tavern
    this.txStreamState = Sodium.crypto_secretstream_xchacha20poly1305_state_new();

    let hdr = Buffer.alloc( Sodium.crypto_secretstream_xchacha20poly1305_HEADERBYTES );
    Sodium.crypto_secretstream_xchacha20poly1305_init_push( this.txStreamState, hdr, keys.txStreamSecretKey );

    return hdr;
  }

  processClientChunk( rxChunk: Buffer, tag?: Buffer ): Buffer {

    let rxtag = tag || Buffer.alloc( 1 );

    let rxData = Buffer.alloc( rxChunk.length - Sodium.crypto_secretstream_xchacha20poly1305_ABYTES );

    Sodium.crypto_secretstream_xchacha20poly1305_pull( this.rxStreamState, rxData, rxtag, rxChunk );

    return rxData;
  }

  buildClientChunk( txData: Buffer, tag: Buffer = Sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE ): Buffer {
    let txChunk = Buffer.alloc( txData.length + Sodium.crypto_secretstream_xchacha20poly1305_ABYTES );

    Sodium.crypto_secretstream_xchacha20poly1305_push( this.txStreamState, txChunk, txData, null, Sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE );

    return txChunk;
  }

}


/**
 * Container class for Taverns
**/
export class TavernStore {
  keyStore: BreweryKeyStore;

  taverns: Map<string, Tavern> = new Map();

  constructor( keyStore: BreweryKeyStore, taverns: TavernInfo[] = [] ) {
    this.keyStore = keyStore;

    // Setup initial data
    taverns.forEach( (info, index) => {
      this.addTavern( info );
    } );
  }

  getTavern( id: string ): Tavern {
    return this.taverns.get( id );
  }

  addTavern( info: TavernInfo ): Tavern {
    let tavern = new Tavern( info );

    tavern.keyStore = this.keyStore;

    this.taverns.set( tavern.id, tavern );

    return tavern;
  }

  toJSON(): Object {
    let json = [];

    this.taverns.forEach( (tavern) => {
      json.push( tavern.toJSON() );
    })

    return json;
  }
}
