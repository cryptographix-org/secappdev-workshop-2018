import * as Sodium from 'sodium-native';
import { PublicKey, SecretKey, KeyPair } from 'sodium-native';
import { HEX, BASE64, UTF8 } from '../common/utils';

export class TavernKeyStore {
  breweryStreamPublicKey: PublicKey;

  tavernStreamKeyPair: KeyPair;

  constructor() {
    this.breweryStreamPublicKey = Buffer.from('72a7fa62c82277d694e37c87c1747d4977b6801876c5a5af425691e72976571c', HEX);

/*    let x = Buffer.alloc( this.breweryStreamPublicKey.length );
    Sodium.randombytes_buf( x );

    console.log( "TV-SEED: " + x.toString( HEX ) );
    this.deriveTavernStreamKeyPair( x );
    */

    this.deriveTavernStreamKeyPair( Buffer.from( 'e88b26ce0a3a091c1fa30ee3cf3f1145b780161561953cdbc84a34fa767802e3', HEX ) );
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

    console.log( "TV-PK: " + this.tavernStreamKeyPair.PublicKey.toString( BASE64 ) );
  }

}
