import * as path from 'path';
import * as fs from 'fs';

import * as express from 'express';
import * as bodyParser from 'body-parser';

import { Logger } from '../common/logger';
import { HEX, BASE64, UTF8 } from '../common/utils';

import { BreweryServices } from './brewery-services';
import { Session } from './session-store';

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

  let sessions = [];
  brewery.sessionStore.sessions.forEach( (session) => {
    let s = {
      id: session.id,
      user: session.user && session.user.id,
      isAuth: session.isAuthenticated
    };

    sessions.push( s );
  })

  let info = {
    info: "IoB Brewery Server",
    version: "v1",
    totalSessions: brewery.sessionStore.countSessions(),
    authSessions: brewery.sessionStore.countSessions( true ),
    sessions,
  };

  Logger.logDebug( "Info: ", JSON.stringify( info ) );

  res.json( info );
});

httpServer.get( '/login/:userID', (req,res) => {
  let userID = req.params.userID;
  let session = brewery.sessionStore.createSession( userID );

  Logger.logDebug( "GET /login/", userID );

  let json = {
    sessionID: session.id,
    challenge: session.challenge.toString( BASE64 ),
    salt: session.user.salt.toString( BASE64 ),
  };

  Logger.logDebug( " => ", JSON.stringify( json ) );

  res.json( json );
});

function checkUserSession( req, res, userID? ): Session {
  if ( !req.is('json') ) {
    res.status( 400 ).send( 'JSON expected');

    return null;
  }

  let post = req.body;

  let session: Session;

  if ( userID )
    session = brewery.sessionStore.lookupSessionForUser( userID );
  else
    session = brewery.sessionStore.lookupSession( post.sessionID );

  if ( !session || !post.sessionID || ( post.sessionID != session.id )) {
    res.json( { error: 'Invalid session' } );

    return null;
  }

  return session;
}

httpServer.post( '/login/:userID', (req,res) => {
  let userID = req.params.userID;
  let session = checkUserSession( req, res, userID );

  let post = req.body;

  let ok = false;
  let authType: string;

  try {
    Logger.logDebug( "POST /login/", userID );
    Logger.logDebug( "  <= ", JSON.stringify( post ) );

    if ( post.sealedLogin ) {
      ok = session.authenticateSessionA( Buffer.from( post.sealedLogin, BASE64 ) );
      authType = "A";
    }
    else if ( post.signedLogin ) {
      ok = session.authenticateSessionB( Buffer.from( post.signedLogin, BASE64 ) );
      authType = "B";
    }
    else {
      res.status( 202 );

      return;
    }

    let json = { authenticated: ok, authType };
    Logger.logDebug( "  => ", JSON.stringify( json ) );

    res.json( json );
  }
  catch( e ) {
    Logger.logError( e );
    res.status( 500 ).send( e.toString() + "\n" + e.stack );

    return;
  }
} );

httpServer.post( '/wallet/:userID', (req,res) => {
  let userID = req.params.userID;
  let session = checkUserSession( req, res, userID );

  let post = req.body;

  let ok = false;
  let rxDatagram;

  try {
    Logger.logDebug( "POST /wallet/", userID );
    Logger.logDebug( "  <= ", JSON.stringify( post ) );

    if ( post.secureDatagram && post.nonce ) {
      rxDatagram = session.upwrapSecureDatagram( Buffer.from( post.secureDatagram, BASE64 ), Buffer.from( post.nonce, BASE64 ) );

      if ( rxDatagram )
        Logger.logDebug( "  == ", JSON.stringify( rxDatagram ) );
    }
    else {
      res.status( 202 );

      return;
    }

    let json = { message: rxDatagram };
    Logger.logDebug( "  => ", JSON.stringify( json ) );

    res.json( json );
  }
  catch( e ) {
    Logger.logError( e );
    res.status( 500 ).send( e.toString() + "\n" + e.stack );

    return;
  }
});

let listenerUI = httpServer.listen( 8080 );
Logger.logInfo( "IoB BreweryServer listening on port " + listenerUI.address().port );
