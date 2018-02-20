import * as path from 'path';
import * as fs from 'fs';

import * as express from 'express';
import * as bodyParser from 'body-parser';

import * as Sodium from 'sodium-native';
import { Logger } from '../common/logger';
import { HEX, BASE64, UTF8 } from '../common/utils';

import { BreweryServices } from './brewery-services';
import { Session } from './session-store';

let initUsers = require( path.resolve( 'user-base.json' ) );
let initTaverns = require( path.resolve( 'tavern-base.json' ) );

let brewery = new BreweryServices( initUsers, initTaverns );

let httpServer = express()
  .use(bodyParser.json())
  .use( '/static/vendor', express.static('./public/static/vendor/' ) )
  .use( '/static', express.static('./public/static/brewery/' ) )
  .get( '/', (req,res)=> {
    res.sendFile( 'index.html', { root: './public/smart-tap/' } );
  });

httpServer.get('/info', (req,res)=> {

  let sessions = [];
  brewery.sessionStore.sessions.forEach( (session)=> {
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

function setError( res, msg ) {
  let json = { error: msg };

  Logger.logDebug( "=> ", JSON.stringify( json ) );
  res.json( json );

  return;
}

function checkJSON( req, res ): any {
  if ( !req.is('json') ) {
    res.status( 400 ).send( 'JSON expected');

    return null;
  }

  return req.body;
}

function checkUserSession( req, res, userID? ): Session {
  let post = checkJSON( req, res );

  let session: Session;

  if ( userID )
    session = brewery.sessionStore.lookupSessionForUser( userID );
  else
    session = brewery.sessionStore.lookupSession( post.sessionID );

  if ( !session || !post.sessionID || ( post.sessionID != session.id )) {
    setError( res, 'Missing Credentials' );

    return null;
  }

  return session;
}

httpServer.post( '/echo', (req,res)=> {
  try {
    Logger.logInfo( "POST /echo/" );

    let post = checkJSON( req, res );
    if ( !post )
      return;

    Logger.logInfo( " <= ", JSON.stringify( post ) );

    let json = post;
    Logger.logInfo( " => ", JSON.stringify( json ) );

    res.json( json );
  }
  catch( e ) {
    Logger.logError( e );
    res.status( 500 ).send( e.toString() + "\n" + e.stack );

    return;
  }
} );



httpServer.get( '/login/:userID', (req,res)=> {
  try {
    let userID = req.params.userID;
    Logger.logInfo( "GET /login/", userID );

    if ( !brewery.userStore.getUser( userID ) ) {
      return setError( res, 'User not found' );
    }

    let session = brewery.sessionStore.createSession( userID );

    let json = {
      sessionID: session.id,
      challenge: session.challenge.toString( BASE64 ),
      salt: session.user.salt.toString( BASE64 ),
    };

    Logger.logInfo( "=> ", JSON.stringify( json ) );

    res.json( json );
  }
  catch( e ) {
    Logger.logError( e );
    res.status( 500 ).send( e.toString() + "\n" + e.stack );

    return;
  }
});

httpServer.post( '/login/:userID', (req,res)=> {
  try {
    let userID = req.params.userID;
    Logger.logInfo( "POST /login/", userID );

    let post = checkJSON( req, res );
    if ( !post )
      return;

    Logger.logInfo( " <= ", JSON.stringify( post ) );

    let session = checkUserSession( req, res, userID );
    if ( !session )
      return;

    let ok = false;
    let authType: string;

    if ( post.sealedLogin ) {
      ok = session.authenticateSessionA( Buffer.from( post.sealedLogin, BASE64 ) );
      authType = "A";
    }
    else if ( post.signedLogin ) {
      ok = session.authenticateSessionB( Buffer.from( post.signedLogin, BASE64 ) );
      authType = "B";
    }
    else {
      return setError( res, 'Missing Credentials' );
    }

    let json = { authenticated: ok, authType };
    Logger.logInfo( " => ", JSON.stringify( json ) );

    res.json( json );
  }
  catch( e ) {
    Logger.logError( e );
    res.status( 500 ).send( e.toString() + "\n" + e.stack );

    return;
  }
} );

httpServer.post( '/wallet/:userID', (req,res)=> {
  try {
    let userID = req.params.userID;
    Logger.logInfo( "POST /wallet/", userID );

    let post = checkJSON( req, res );
    if ( !post )
      return;

    Logger.logInfo( " <= ", JSON.stringify( post ) );

    let session = checkUserSession( req, res, userID );
    if ( !session )
      return;

    let ok = false;
    let rxDatagram;

    if ( post.secureDatagram && post.nonce ) {
      rxDatagram = session.upwrapSecureDatagram( Buffer.from( post.secureDatagram, BASE64 ), Buffer.from( post.nonce, BASE64 ) );

      if ( rxDatagram )
        Logger.logDebug( "  == ", JSON.stringify( rxDatagram ) );

      if ( rxDatagram.method == 'Greeting' )
        rxDatagram.param = 'Aangenaam kennis te maken, libsodium ninja';
    }
    else {
      return setError( res, 'Missing Data' );
    }

    let json = { message: rxDatagram };
    Logger.logInfo( " => ", JSON.stringify( json ) );

    res.json( json );
  }
  catch( e ) {
    Logger.logError( e );
    res.status( 500 ).send( e.toString() + "\n" + e.stack );

    return;
  }
});

httpServer.get( '/user/:userID', (req,res)=> {
  try {
    let userID = req.params.userID;
    Logger.logInfo( "get /user/", userID );

    let user = brewery.userStore.getUser( userID );
    if (!user) {
      return setError( res, 'Missing Data' );
    }

    let json = user;
    Logger.logInfo( " => ", JSON.stringify( json ) );

    res.json( json );
  }
  catch( e ) {
    Logger.logError( e );
    res.status( 500 ).send( e.toString() + "\n" + e.stack );

    return;
  }
});

httpServer.post( '/user/:userID/add', (req,res)=> {
  try {
    let userID = req.params.userID;
    Logger.logInfo( "POST /user/", userID, '/add' );

    let post = checkJSON( req, res );
    if ( !post )
      return;

    Logger.logInfo( " <= ", JSON.stringify( post ) );

    let session = checkUserSession( req, res, 'sean' );
    if ( !session )
      return;

    if ( post.name ) {
      brewery.userStore.addUser( {
        id: userID,
        name: post.name
      } );

      if ( post.password )
        brewery.userStore.getUser( userID ).setPassword( post.password );
    }
    else if ( post.password ) {
      brewery.userStore.getUser( userID ).setPassword( post.password );
    }
    else {
      return setError( res, 'Missing Data' );
    }

    let json = { success: 'OK' };
    Logger.logInfo( " => ", JSON.stringify( json ) );

    res.json( json );

    fs.writeFileSync( path.resolve( 'user-base.json' ),
      JSON.stringify( brewery.userStore.toJSON(), null, 2 ), UTF8 );
  }
  catch( e ) {
    Logger.logError( e );
    res.status( 500 ).send( e.toString() + "\n" + e.stack );

    return;
  }
});

httpServer.get( '/tavern/:tavernID', (req,res)=> {
  try {
    let tavernID = req.params.tavernID;
    Logger.logInfo( "POST /tavernID/", tavernID );

    let tav = brewery.tavernStore.getTavern( tavernID );
    if (!tav) {
      return setError( res, 'Missing Tavern' );
    }

    //tav.deriveTavernStreamKeys( brewery.keyStore.breweryTavernKeys );

    let json = tav;
    Logger.logInfo( " => ", JSON.stringify( json ) );

    res.json( json );
  }
  catch( e ) {
    Logger.logError( e );
    res.status( 500 ).send( e.toString() + "\n" + e.stack );

    return;
  }
} );

httpServer.post( '/tavern/:tavernID/add', (req,res)=> {
  try {
    let tavernID = req.params.tavernID;
    Logger.logInfo( "POST /tavernID/", tavernID, '/add' );

    let post = checkJSON( req, res );
    if ( !post )
      return;

    Logger.logInfo( " <= ", JSON.stringify( post ) );

    if ( post.name ) {
      brewery.tavernStore.addTavern( {
        id: tavernID,
        name: post.name,
        comments: post.comments,
        streamPublicKey: post.key && Buffer.from( post.key, BASE64 )
      } );
    }
    else if ( post.key ) {
      brewery.tavernStore.getTavern( tavernID ).streamPublicKey = Buffer.from( post.key, BASE64 );
      if ( post.comments )
        brewery.tavernStore.getTavern( tavernID ).comments = post.comments;
    }
    else {
      return setError( res, 'Missing Data' );
    }

    let json = { success: 'OK' };
    Logger.logInfo( " => ", JSON.stringify( json ) );

    fs.writeFileSync( path.resolve( 'tavern-base.json' ),
      JSON.stringify( brewery.tavernStore.toJSON(), null, 2 ), UTF8 );

    res.json( json );
  }
  catch( e ) {
    Logger.logError( e );
    res.status( 500 ).send( e.toString() + "\n" + e.stack );

    return;
  }
} );

httpServer.post( '/tavern/:tavernID', (req,res)=> {
  try {
    let tavernID = req.params.tavernID;
    Logger.logInfo( "POST /tavern/", tavernID );

    let post = checkJSON( req, res );
    if ( !post )
      return;

    Logger.logInfo( " <= ", JSON.stringify( post ) );

    let tav = brewery.tavernStore.getTavern( tavernID );
    if ( !tav )
      return setError( res, 'Unknown Tavern' );;

    let outChunk, inData;

    if ( post.chunk ) {

      if ( !tav.txStreamState )
        outChunk = tav.initTavernStreams( Buffer.from( post.chunk, BASE64 ) );
      else
        inData = tav.processClientChunk( Buffer.from( post.chunk, BASE64 ) );
    }

    if ( !outChunk ) {
      let outData = "SERVER SAYS: " + Sodium. randombytes_uniform( 1000 );

      outChunk = tav.buildClientChunk( Buffer.from( outData, BASE64 ) );
    }

    let json = { success: 'OK', chunk: outChunk.toString( BASE64) };
    Logger.logInfo( " => ", JSON.stringify( json ) );

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
