import * as Sodium from '../common/sodium';

import { Logger } from '../common/logger';
import { HEX, BASE64, UTF8 } from '../common/utils';

import { UserAgent } from './user-agent';

let userAgent = new UserAgent();

let arg = 2;
let args = process.argv;

let cmd = args[ arg++ ];

switch( cmd ) {
  case 'loginA': {
    Logger.logInfo( cmd + ': ' );

    userAgent.setLoginInfo( args[ arg++ ] );

    let buf = userAgent.loginTypeA( { challenge: args[arg+1] }, args[arg] );

    let result = { sealedLogin: buf.toString( BASE64 ) };

    Logger.logInfo( JSON.stringify( result ) );
    break;
  }

  case 'loginB': {
    Logger.logInfo( cmd + ': ' );

    userAgent.setLoginInfo( args[ arg++ ] );

    let buf = userAgent.loginTypeB( { challenge: args[arg+1], salt: args[arg+2]  }, args[arg] );

    let result = { signedLogin: buf.toString( BASE64 ) };

    Logger.logInfo( JSON.stringify( result ) );
    break;
  }

  default:
    console.log( 'Syntax: ' + args[1] );
    console.log( '  loginA <user> <password> <challenge>' );
    console.log( '  loginB <user> <password> <challenge> <salt>' );
    break;
}
