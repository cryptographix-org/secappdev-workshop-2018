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
  }

  loginTypeA( json: { challenge: string }, password: string ): Buffer {
    let uss = new UserSecurityServices( this.userID );

    let challenge = Buffer.from( json.challenge, BASE64 );
    Logger.logInfo( "Challenge = " + challenge.toString( BASE64 ) );

    return uss.buildLoginA( challenge, password );
  }

  loginTypeB( json: { challenge: string, salt: string }, password: string ): Buffer {
    let uss = new UserSecurityServices( this.userID );

    let challenge = Buffer.from( json.challenge, BASE64 );
    let salt = Buffer.from( json.salt, BASE64 );

    return uss.buildLoginB( challenge, salt, password );
  }

}
