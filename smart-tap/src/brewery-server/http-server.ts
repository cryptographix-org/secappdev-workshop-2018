import * as path from 'path';
import * as fs from 'fs';

import * as express from 'express';
import * as bodyParser from 'body-parser';

import { HEX, BASE64, UTF8 } from '../common/utils';

import { BreweryServices } from './brewery-services';

let initUsers = require( path.resolve( 'user-base.json' ) );

let brewery = new BreweryServices( initUsers );

let httpServer = express()
  .use(bodyParser.json())
  .use( '/static/vendor', express.static('./public/static/vendor/' ) )
  .use( '/static', express.static('./public/static/brewery/' ) )
  .get( '/', (req,res)=> {
    res.sendFile( 'index.html', { root: './public/smart-tap/' } );
  });

httpServer.get('/info', (req,res) => {
  let info: Object = {
    info: "Brewery Server",
    version: "v1",
    totalSessions: brewery.sessionStore.countSessions(),
    authSessions: brewery.sessionStore.countSessions( true ),
  };

  let sessions = [];
  brewery.sessionStore.sessions.forEach( (session) => {
    let s = {
      id: session.id,
      user: session.user && session.user.id,
      isAuth: session.isAuthenticated
    };

    sessions.push( s );
  })
  info = {
    ...info,
    sessions
  }

  res.json( info );
});

httpServer.get( '/login/:userID', (req,res) => {
  let session = brewery.sessionStore.createSession( req.params.userID );

  console.log( req.params );
  res.json( {
    sessionID: session.id,
    challenge: session.challenge.toString( BASE64 )
  } );
});

httpServer.post( '/login/:userID', (req,res) => {
  let session = brewery.sessionStore.lookupSessionForUser( req.params.userID );

  if ( !req.is('json') ) {
    res.status( 400 ).send( 'JSON expected');

    return;
  }

  let post = req.body;

  if ( !session || !post.sessionID || ( post.sessionID != session.id )) {
    res.json( { error: 'Invalid session' } );

    return;
  }

  let ok = false;
  let authType: string;

  try {
    console.log( post );

    if ( post.sealedLogin ) {
      ok = session.authenticateSessionA( Buffer.from( post.sealedLogin ) );
      authType = "A";
    }
    else if ( post.signedLogin ) {
      ok = session.authenticateSessionB( Buffer.from( post.signedLogin ) );
      authType = "B";
    }
    else {
      res.status( 202 );

      return;
    }

    res.json( { authenticated: ok, authType } );
  }
  catch( e ) {
    console.log( e );
    res.status( 500 ).send( e.toString() + "\n" + e.stack );

    return;
  }

});


let listenerUI = httpServer.listen( 8080 );
