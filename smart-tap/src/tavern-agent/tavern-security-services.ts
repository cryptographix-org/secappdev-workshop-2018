import * as Sodium from 'sodium-native';
import { PublicKey, SecretKey, KeyPair } from 'sodium-native';
import { HEX, BASE64, UTF8, allocSecureBuffer, freeSecureBuffer } from '../common/utils';

import { TavernKeyStore } from './tavern-key-store';

export class TavernSecurityServices {
  keyStore: TavernKeyStore;

  tavernStreamSecretKey: Buffer;
  tavernStreamPublicKey: Buffer;

  constructor( tavernID: string ) {
    this.keyStore = new TavernKeyStore( tavernID );
  }

  /**
   *
  **/
  deriveTavernStreamKeys( ): { txStreamSecretKey: SecretKey, rxStreamSecretKey: SecretKey } {
    let txStreamSecretKey: SecretKey = Buffer.alloc( Sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES );
    let rxStreamSecretKey: SecretKey = Buffer.alloc( Sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES );

    Sodium.crypto_kx_client_session_keys(
      rxStreamSecretKey,
      txStreamSecretKey,
      this.keyStore.tavernStreamKeyPair.PublicKey,
      this.keyStore.tavernStreamKeyPair.SecretKey,
      this.keyStore.breweryStreamPublicKey );

    return {
      txStreamSecretKey,
      rxStreamSecretKey
    }
  }

  txStreamState;
  rxStreamState;

  initBreweryStreams(): Buffer {

    let keys = this.deriveTavernStreamKeys( );
    console.log( "TSS:");
    console.log( keys );

    this.txStreamState = Sodium.crypto_secretstream_xchacha20poly1305_state_new();

    let hdr = Buffer.alloc( Sodium.crypto_secretstream_xchacha20poly1305_HEADERBYTES );
    Sodium.crypto_secretstream_xchacha20poly1305_init_push( this.txStreamState, hdr, keys.txStreamSecretKey );

    this.rxStreamState = null;

    return hdr;
  }

  processServerChunk( rxChunk: Buffer, tag?: Buffer ): Buffer {
    let rxData: Buffer = null;

    if ( !this.rxStreamState ) {
      let keys = this.deriveTavernStreamKeys( );

      console.log( "TSS:");
      console.log( keys );

      this.rxStreamState = Sodium.crypto_secretstream_xchacha20poly1305_state_new();

      Sodium.crypto_secretstream_xchacha20poly1305_init_pull( this.rxStreamState, rxChunk, keys.rxStreamSecretKey );
    }
    else {
      let rxTag = tag || Buffer.alloc( 1 );

      rxData = Buffer.alloc( rxChunk.length - Sodium.crypto_secretstream_xchacha20poly1305_ABYTES );

      Sodium.crypto_secretstream_xchacha20poly1305_pull( this.rxStreamState, rxData, rxTag, rxChunk );
    }

    return rxData;
  }

  buildServerChunk( txData: Buffer, tag: Buffer = Sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE ): Buffer {
    let txChunk = Buffer.alloc( txData.length + Sodium.crypto_secretstream_xchacha20poly1305_ABYTES );

    Sodium.crypto_secretstream_xchacha20poly1305_push( this.txStreamState, txChunk, txData, null, Sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE );

    return txChunk;
  }

  static NONCE_SIZE = Sodium.crypto_box_NONCEBYTES;

  buildNonce( ...args: Buffer[] ): Buffer {
    let nonce = Buffer.concat( args );

    // Fill remaining space with random
    if ( nonce.length < TavernSecurityServices.NONCE_SIZE ) {
      let rand = Buffer.alloc( TavernSecurityServices.NONCE_SIZE - nonce.length );
      Sodium.randombytes_buf( rand );

      nonce = Buffer.concat( [ nonce, rand ] );
    };

    return nonce;
  }
}
