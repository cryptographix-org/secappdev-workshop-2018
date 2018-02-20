import * as Sodium from 'sodium-native';
import { PublicKey, SecretKey } from 'sodium-native';
import { HEX, BASE64, UTF8 } from '../common/utils';

import { User, UserStore } from './user-store';
import { BreweryKeyStore } from './brewery-key-store';

export class Session {
  sessionStore: SessionStore;

  id: string;

  timeStamp: number;

  isAuthenticated: boolean;
  failCount: number;

  challenge: Buffer;

  user: User;

  userDatagramPublicKey: PublicKey;

  //
  constructor( store: SessionStore, user: User, id?: string ) {

    this.sessionStore = store;

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

  authenticateSessionA( sealedBox: Buffer ): boolean {
    let ok: boolean;

    let plain = Buffer.alloc( sealedBox.length - Sodium.crypto_box_SEALBYTES );

    ok = Sodium.crypto_box_seal_open( plain, sealedBox, this.sessionStore.keyStore.breweryUserKeys.PublicKey, this.sessionStore.keyStore.breweryUserKeys.SecretKey );
    if ( !ok ) {
      // log
      return false;
    }

    let loginInfo = JSON.parse( plain.toString( 'utf8') );
    //console.log( loginInfo );
    //console.log( Buffer.from( loginInfo.challenge || "", BASE64 ).toString( HEX ) );
    //console.log( sess );

    ok = ( loginInfo.userID == this.user.id )
        && Sodium.sodium_memcmp( Buffer.from( loginInfo.challenge || "", BASE64 ), this.challenge, this.challenge.length )
        && this.user.verifyPassword( loginInfo.password || "");

    this.setAuthenticated( ok, loginInfo.userDatagramPublicKey );

    return ok;
  }

  authenticateSessionB( signedBox: Buffer ): boolean {
    let ok: boolean;

    let plain = Buffer.alloc( signedBox.length - Sodium.crypto_sign_BYTES );

    ok = Sodium.crypto_sign_open( plain, signedBox, this.user.signPublicKey );
    if ( !ok ) {
      // log
      return false;
    }

    let loginInfo = JSON.parse( plain.toString( 'utf8') );
    //console.log( loginInfo );
    //console.log( Buffer.from( loginInfo.challenge || "", BASE64 ).toString( HEX ) );
    //console.log( sess );

    ok = ( loginInfo.userID == this.user.id )
        && Sodium.sodium_memcmp( Buffer.from( loginInfo.challenge || "", BASE64 ), this.challenge, this.challenge.length );

    this.setAuthenticated( ok, this.user.datagramPublicKey );

    return ok;
  }

  static NONCE_SIZE = Sodium.crypto_box_NONCEBYTES;

  wrapSecureDatagram( payload: Object, wrapNonce: Buffer ): Buffer {

    let wrapPayload = Buffer.from( JSON.stringify( payload ), UTF8 );

    let wrappedBox = Buffer.alloc( wrapPayload.length + Sodium.crypto_box_MACBYTES );

    Sodium.crypto_box_easy( wrappedBox, wrapPayload, wrapNonce, this.userDatagramPublicKey, this.sessionStore.keyStore.breweryUserKeys.SecretKey );

    return wrappedBox;
  }

  upwrapSecureDatagram( wrappedBox: Buffer, wrapNonce: Buffer ): Object {

    let unwrappedBox = Buffer.alloc( wrappedBox.length - Sodium.crypto_box_MACBYTES );

    Sodium.crypto_box_open_easy( unwrappedBox, wrappedBox, wrapNonce, this.userDatagramPublicKey, this.sessionStore.keyStore.breweryUserKeys.SecretKey );
    console.log( "Got: " + unwrappedBox.toString( UTF8 ) );
    let unwrappedPayload = JSON.parse( unwrappedBox.toString( UTF8 ) );

    return unwrappedPayload;
  }



}

export class SessionStore {
  userStore: UserStore;
  keyStore: BreweryKeyStore;

  sessions: Map<string, Session> = new Map();

  constructor( keyStore: BreweryKeyStore, userStore: UserStore ) {
    this.keyStore = keyStore;

    this.userStore = userStore;
  }

  createSession( userID: string ): Session {
    let user = this.userStore.getUser( userID );

    if ( !user )
      throw new Error( "User '" + userID + "' not found" );

    // Close and remove existing session for this user
    let userSession = this.lookupSessionForUser( userID );
    if ( userSession ) {
      this.sessions.delete( userSession.id );
    }

    let session = new Session( this, user );

    this.sessions.set( session.id, session );

    return session;
  }

  lookupSession( id: string ): Session {
    let session = this.sessions.get( id );

    if ( session ) {
      // Timeout if ( !session.isAuthenticated )
    }

    return session;
  }

  lookupSessionForUser( userID: string ): Session {
    let userSession;

    this.sessions.forEach( (session) => {
      if ( session.user && session.user.id == userID )
        userSession = session;
    });

    return userSession;
  }

  countSessions( isAuth?: boolean ): number {
    let count = 0;

    this.sessions.forEach( (session) => {
      if ( ( isAuth == undefined ) || ( !!isAuth == !!session.isAuthenticated ) )
        count++;
    });

    return count;
  }


}
