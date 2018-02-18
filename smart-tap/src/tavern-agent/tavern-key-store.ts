import * as Sodium from 'sodium-native';
import { PublicKey, SecretKey, KeyPair } from 'sodium-native';
import { HEX, BASE64, UTF8 } from '../common/utils';

export class TavernKeyStore {
  breweryStreamPublicKey: PublicKey;

  tavernStreamKeyPair: KeyPair;

  constructor( tavernID: string ) {
    this.breweryStreamPublicKey = Buffer.from('72a7fa62c82277d694e37c87c1747d4977b6801876c5a5af425691e72976571c', HEX);

    let tavernMasterSeed = Buffer.from( 'e88b26ce0a3a091c1fa30ee3cf3f1145b780161561953cdbc84a34fa767802e3', HEX );
    let tavernSeed = Buffer.alloc( Sodium.crypto_kx_SEEDBYTES );


    Sodium.crypto_kdf_derive_from_key( tavernSeed, 0, Buffer.from( tavernID, UTF8 ), tavernMasterSeed );

    //console.log( "TV-SEED: " + tavernSeed.toString( HEX ) );

    this.deriveTavernStreamKeyPair( tavernSeed );
  }

  deriveTavernStreamKeyPair( tavernStreamSeed: Buffer ) {
    this.tavernStreamKeyPair = {
      SecretKey: Buffer.alloc( Sodium.crypto_kx_SECRETKEYBYTES ),
      PublicKey: Buffer.alloc( Sodium.crypto_kx_PUBLICKEYBYTES )
    };

    Sodium.crypto_kx_seed_keypair(
      this.tavernStreamKeyPair.PublicKey,
      this.tavernStreamKeyPair.SecretKey,
      tavernStreamSeed );

    //console.log( "TV-PK: " + this.tavernStreamKeyPair.PublicKey.toString( BASE64 ) );
  }

}
