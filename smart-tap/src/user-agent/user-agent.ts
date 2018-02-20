import { Logger } from '../common/logger';
import { HEX, BASE64, UTF8 } from '../common/utils';

import { UserKeyStore } from './user-key-store';
import { UserSecurityServices } from './user-security-services';

export class UserAgent {
  keyStore: UserKeyStore;

  constructor() {
    this.keyStore = new UserKeyStore();
  }

  userID: string;
  setLoginInfo( userID: string ) {
    Logger.logInfo( "UserID = " + userID );
    this.userID = userID;

    this.uss = new UserSecurityServices( this.userID );
  }

  uss: UserSecurityServices;

  loginTypeA( json: { challenge: string }, password: string ): Buffer {
    let challenge = Buffer.from( json.challenge, BASE64 );
    Logger.logInfo( "Challenge = " + challenge.toString( BASE64 ) );

    return this.uss.buildLoginA( challenge, password );
  }

  loginTypeB( json: { challenge: string, salt: string }, password: string ): Buffer {

    let challenge = Buffer.from( json.challenge, BASE64 );
    let salt = Buffer.from( json.salt, BASE64 );

    return this.uss.buildLoginB( challenge, salt, password );
  }

  walletCommand( json: { method: string, param: string }, nonce: string ) {

    let nonceBuf = Buffer.from( nonce, BASE64 );

    return this.uss.wrapSecureDatagram( json, nonceBuf );
  }

  getNonce(): string {

    return this.uss.buildNonce().toString( BASE64 );
  }
}
