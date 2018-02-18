import * as Sodium from 'sodium-native';
import { PublicKey, SecretKey, KeyPair } from 'sodium-native';
import { HEX, BASE64, UTF8, allocSecureBuffer, freeSecureBuffer } from '../common/utils';

import { UserKeyStore } from './user-key-store';

export class UserSecurityServices {
  keyStore: UserKeyStore;

  userID: string;

  userDatagramSecretKey: Buffer;
  userDatagramPublicKey: Buffer;

  userSignatureSecretKey: Buffer;
  userSignaturePublicKey: Buffer;

  constructor( userID: string ) {
    this.keyStore = new UserKeyStore();

    this.userID = userID;
  }

  buildLoginA( challenge: Buffer, password: string ): Buffer {

    // Generate a random Datagram key for this session
    let userDatagramSeed = Buffer.alloc( Sodium.crypto_box_SEEDBYTES );
    Sodium.randombytes_buf( userDatagramSeed );

    this.deriveUserDatagramKeys( userDatagramSeed );

    let loginInfo = {
      userID: this.userID,
      password,
      challenge: challenge.toString( BASE64 ),
      userDatagramPublicKey: this.userDatagramPublicKey
    };

    //console.log( loginInfo );

    let loginPayload = Buffer.from( JSON.stringify( loginInfo ), UTF8 );

    let box = Buffer.alloc( loginPayload.length + Sodium.crypto_box_SEALBYTES );

    Sodium.crypto_box_seal( box, loginPayload, this.keyStore.breweryUserPublicKey );

    return box;
  }

  buildLoginB( challenge: Buffer, salt: Buffer, password: string ) {
    let pwBuf = Buffer.from( password, UTF8 );
    let pwHash = Buffer.alloc( Sodium.crypto_box_SEEDBYTES + Sodium.crypto_sign_SEEDBYTES );

    // Hash and generate two seeds
    Sodium.crypto_pwhash( pwHash,
      pwBuf,
      salt,
      Sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
      Sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
      Sodium.crypto_pwhash_ALG_DEFAULT );

    pwBuf.fill( 0 );

    this.deriveUserDatagramKeys( pwHash.slice( 0, Sodium.crypto_box_SEEDBYTES ) );
    this.deriveUserSignatureKeys( pwHash.slice( Sodium.crypto_box_SEEDBYTES ) );

    let message = {
      userID: this.userID,
      challenge: challenge.toString( BASE64 )
    };

    let loginPayload = Buffer.from( JSON.stringify( message ), UTF8 );

    let signedPayload = Buffer.alloc( loginPayload.length + Sodium.crypto_sign_BYTES );

    Sodium.crypto_sign( signedPayload, loginPayload, this.userSignatureSecretKey );

    return signedPayload;
  }

  deriveUserDatagramKeys( userDatagramSeed: Buffer ) {
    this.userDatagramSecretKey = Buffer.alloc( Sodium.crypto_box_SECRETKEYBYTES );
    this.userDatagramPublicKey = Buffer.alloc( Sodium.crypto_box_PUBLICKEYBYTES );

    Sodium.crypto_box_seed_keypair( this.userDatagramPublicKey, this.userDatagramSecretKey, userDatagramSeed );

    console.log( "UDG-PK: " + this.userDatagramPublicKey.toString( BASE64 ) )
  }

  deriveUserSignatureKeys( userSignatureSeed: Buffer ) {
    this.userSignatureSecretKey = Buffer.alloc( Sodium.crypto_sign_SECRETKEYBYTES );
    this.userSignaturePublicKey = Buffer.alloc( Sodium.crypto_sign_PUBLICKEYBYTES );

    Sodium.crypto_sign_seed_keypair( this.userSignaturePublicKey, this.userSignatureSecretKey, userSignatureSeed );

    //console.log( "PK: " + this.userSignaturePublicKey.toString( BASE64 ) )
  }

  wrapSecureDatagram( payload: Object, wrapNonce: Buffer ): Buffer {

    let wrapPayload = Buffer.from( JSON.stringify( payload ), UTF8 );

    let wrappedBox = Buffer.alloc( wrapPayload.length + Sodium.crypto_box_MACBYTES );

    Sodium.crypto_box_easy( wrappedBox, wrapPayload, wrapNonce, this.keyStore.breweryUserPublicKey, this.userDatagramSecretKey );

    return wrappedBox;
  }

  upwrapSecureDatagram( wrappedBox: Buffer, wrapNonce: Buffer ): Object {

    let unwrappedBox = Buffer.alloc( wrappedBox.length - Sodium.crypto_box_MACBYTES );

    Sodium.crypto_box_open_easy( unwrappedBox, wrappedBox, wrapNonce, this.keyStore.breweryUserPublicKey, this.userDatagramSecretKey );

    let unwrappedPayload = JSON.parse( unwrappedBox.toString( UTF8 ) );

    return unwrappedPayload;
  }

  static NONCE_SIZE = Sodium.crypto_box_NONCEBYTES;

  buildNonce( ...args: Buffer[] ): Buffer {
    let nonce = Buffer.concat( args );

    // Fill remaining space with random
    if ( nonce.length < UserSecurityServices.NONCE_SIZE ) {
      let rand = Buffer.alloc( UserSecurityServices.NONCE_SIZE - nonce.length );
      Sodium.randombytes_buf( rand );

      nonce = Buffer.concat( [ nonce, rand ] );
    };

    return nonce;
  }
}
