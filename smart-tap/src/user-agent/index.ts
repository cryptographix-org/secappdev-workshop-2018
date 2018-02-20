import * as Sodium from '../common/sodium';

import { Logger } from '../common/logger';
import { HEX, BASE64, UTF8 } from '../common/utils';

import { UserAgent } from './user-agent';

let userAgent = new UserAgent();

let arg = 2;
let args = process.argv;

let err = true;
while( arg < args.length ) {
  let cmd = args[ arg++ ];

  err = false;
  switch( cmd ) {
    case '-loginA': {
      Logger.logInfo( cmd + ': ' );

      userAgent.setLoginInfo( args[ arg++ ] );

      let buf = userAgent.loginTypeA( { challenge: args[arg+1] }, args[arg] );
      arg += 2;

      let result = { sealedLogin: buf.toString( BASE64 ) };

      Logger.logInfo( JSON.stringify( result ) );
      break;
    }

    case '-loginB': {
      Logger.logInfo( cmd + ': ' );

      userAgent.setLoginInfo( args[ arg++ ] );

      let buf = userAgent.loginTypeB( { challenge: args[arg+1], salt: args[arg+2]  }, args[arg] );
      arg += 3;

      let result = { signedLogin: buf.toString( BASE64 ) };

      Logger.logInfo( JSON.stringify( result ) );
      break;
    }

    case '-wallet': {
      Logger.logInfo( cmd + ': ' );

      let json = { method: args[arg], param: args[arg+1] };
      arg += 2;

      let nonce;
      if ( ( arg + 2 >= args.length ) || ( args[ arg + 2 ][0] == '-' ) ) {
        nonce = userAgent.getNonce();
      }
      else {
        nonce = args[arg+2];
        ++arg;
      }

      let buf = userAgent.walletCommand( json, nonce );

      let result = { secureDatagram: buf.toString( BASE64 ), nonce };

      Logger.logInfo( JSON.stringify( result ) );
      break;
    }

    default:
      err = true;
      arg = 1000;
      break;
  }
}

if ( err ) {
  console.log( 'Syntax: ' + args[1] );
  console.log( ' -loginA <user> <password> <challenge>' );
  console.log( ' -loginB <user> <password> <challenge> <salt>' );
  console.log( ' -wallet <method> <param> <nonce>' );
}
