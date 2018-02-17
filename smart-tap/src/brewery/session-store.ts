import * as Sodium from 'sodium-native';
import { PublicKey, SecretKey } from 'sodium-native';
import { HEX, BASE64, UTF8 } from '../common/utils';

import { User, UserStore } from './user-store';
import { BreweryKeyStore } from './brewery-key-store';

export class Session {
  id: string;

  timeStamp: number;

  isAuthenticated: boolean;
  failCount: number;

  challenge: Buffer;

  user: User;

  userDatagramPublicKey: PublicKey;

  //
  constructor( user: User, id?: string ) {

    if ( !id ) {
      // gen random session ID
      let rnd = Buffer.alloc( 16 );

      Sodium.randombytes_buf( rnd );

      id = rnd.toString( BASE64 );
    }

    this.id = id;
    this.isAuthenticated = false;
    this.user = user;
    this.timeStamp = Date.now();

    // gen random Challenge
    this.challenge = Buffer.alloc( 16 );
    Sodium.randombytes_buf( this.challenge );
  }

  //
  setAuthenticated( ok, userDatagramPublicKey?: PublicKey ) {

    this.isAuthenticated = ok;
    if ( ok ) {
      this.timeStamp = Date.now();

      // and save public-key
      this.userDatagramPublicKey = userDatagramPublicKey;
    }
    else {
      // TODO: control lock-out
    }
  }
}

export class SessionStore {
  userStore: UserStore;
  keyStore: BreweryKeyStore;

  sessions: Map<string, Session> = new Map();

  constructor( userStore: UserStore, keyStore: BreweryKeyStore ) {
    this.userStore = userStore;
    this.keyStore = keyStore;
  }

  createSession( userID: string ): Session {
    let user = this.userStore.getUser( userID );

    if ( !user )
      throw new Error( "User '" + userID + "' not found" );

    let session = new Session( user );

    this.sessions.set( session.id, session );

    return session;
  }

  lookupSession( id: string ): Session {
    return this.sessions.get( id );
  }

  authenticateSessionA( sessionID: string, sealedBox: Buffer ): boolean {
    let ok: boolean;

    let sess = this.lookupSession( sessionID );
    if ( !sess ) {
      // log
      return false;
    }

    let plain = Buffer.alloc( sealedBox.length - Sodium.crypto_box_SEALBYTES );

    ok = Sodium.crypto_box_seal_open( plain, sealedBox, this.keyStore.breweryUserKeys.PublicKey, this.keyStore.breweryUserKeys.SecretKey );
    if ( !ok ) {
      // log
      return false;
    }

    let loginInfo = JSON.parse( plain.toString( 'utf8') );
    //console.log( loginInfo );
    //console.log( Buffer.from( loginInfo.challenge || "", BASE64 ).toString( HEX ) );
    //console.log( sess );

    ok = ( loginInfo.userID == sess.user.id )
        && Sodium.sodium_memcmp( Buffer.from( loginInfo.challenge || "", BASE64 ), sess.challenge, sess.challenge.length )
        && sess.user.verifyPassword( loginInfo.password || "");

    sess.setAuthenticated( ok, loginInfo.userDatagramPublicKey );

    return ok;
  }

  authenticateSessionB( sessionID: string, signedBox: Buffer ): boolean {
    let ok: boolean;

    let sess = this.lookupSession( sessionID );
    if ( !sess ) {
      // log
      return false;
    }

    let plain = Buffer.alloc( signedBox.length - Sodium.crypto_sign_BYTES );

    ok = Sodium.crypto_sign_open( plain, signedBox, sess.user.signPublicKey );
    if ( !ok ) {
      // log
      return false;
    }

    let loginInfo = JSON.parse( plain.toString( 'utf8') );
    //console.log( loginInfo );
    //console.log( Buffer.from( loginInfo.challenge || "", BASE64 ).toString( HEX ) );
    //console.log( sess );

    ok = ( loginInfo.userID == sess.user.id )
        && Sodium.sodium_memcmp( Buffer.from( loginInfo.challenge || "", BASE64 ), sess.challenge, sess.challenge.length );

    sess.setAuthenticated( ok, sess.user.datagramPublicKey );

    return ok;
  }

  static NONCE_SIZE = Sodium.crypto_box_NONCEBYTES;

  wrapSecureDatagram( sessionID: string, payload: Object, wrapNonce: Buffer ): Buffer {

    let sess = this.lookupSession( sessionID );
    if ( !sess ) {
      // log
      return null;
    }

    let wrapPayload = Buffer.from( JSON.stringify( payload ), UTF8 );

    let wrappedBox = Buffer.alloc( wrapPayload.length + Sodium.crypto_box_MACBYTES );

    Sodium.crypto_box_easy( wrappedBox, wrapPayload, wrapNonce, sess.userDatagramPublicKey, this.keyStore.breweryUserKeys.SecretKey );

    return wrappedBox;
  }

  upwrapSecureDatagram( sessionID: string, wrappedBox: Buffer, wrapNonce: Buffer ): Object {

    let sess = this.lookupSession( sessionID );
    if ( !sess ) {
      // log
      return null;
    }

    let unwrappedBox = Buffer.alloc( wrappedBox.length - Sodium.crypto_box_MACBYTES );

    Sodium.crypto_box_open_easy( unwrappedBox, wrappedBox, wrapNonce, sess.userDatagramPublicKey, this.keyStore.breweryUserKeys.SecretKey );

    let unwrappedPayload = JSON.parse( unwrappedBox.toString( UTF8 ) );

    return unwrappedPayload;
  }

}
