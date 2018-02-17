import * as path from 'path';
import * as fs from 'fs';
import * as Sodium from 'sodium-native';

import { HEX, BASE64, UTF8 } from '../common/utils';

import { BreweryKeyStore } from './brewery-key-store';
import { SessionStore } from './session-store';

import { UserInfo, User, UserStore } from './user-store';
import { UserSecurityServices } from '../user-agent/user-security-services';

import { TavernStore, TavernInfo } from './tavern-store';
import { TavernSecurityServices } from '../tavern-agent/tavern-security-services';


let initUsers = require( path.resolve( 'user-base.json' ) );
let userStore = new UserStore( initUsers );

let keyStore = new BreweryKeyStore();

let sessionStore = new SessionStore( userStore, keyStore );

let sessionID = sessionStore.createSession( 'guzzler' ).id;
let sess = sessionStore.lookupSession( sessionID );

let uss = new UserSecurityServices();

if ( 0 ) {
  userStore.users.forEach( (user, id) => {
    let pw = user.comments || user.genPassword( 6 );

    user.comments = pw;

    if ( !user.salt ) {
      let salt = user.passwordHash.split('$')[ 4 ];

      user.salt = Buffer.from( salt, BASE64 );
    }

    uss.buildLoginB( user.id, Buffer.alloc( 0 ), user.salt, pw );

    user.signPublicKey = uss.userSignaturePublicKey;
    //console.log( user.id + ' : ' + pw + ' : ' + user.verifyPassword( pw ) );
    console.log( user.id + ' : ' + user.salt.toString( HEX ) + ' : ' + user.signPublicKey.toString( HEX ) );
  })

  fs.writeFileSync( path.resolve( 'user-base.json' ),
    JSON.stringify( userStore.toJSON(), null, 2 ),
    'utf8' );
}


let sealedBox = uss.buildLoginA( 'guzzler', sess.challenge, '227489' );

let ok = sessionStore.authenticateSessionA( sessionID, sealedBox );
if ( !ok )
  console.log( "Not Authenticated B" )

let signedBox = uss.buildLoginB( 'guzzler', sess.challenge, sess.user.salt, '227489' );

ok = sessionStore.authenticateSessionB( sessionID, signedBox );
if ( !ok )
  console.log( "Not Authenticated B" )


let nonce = uss.buildNonce();

let msg1 = { message: "hello" };

let userDatagram = uss.wrapSecureDatagram( msg1, nonce );

let in1 = sessionStore.upwrapSecureDatagram( sessionID, userDatagram, nonce );

console.log( "Server Received: " + JSON.stringify( in1 ) );

nonce = uss.buildNonce();

let msg2 = { message: "Aangenaam kennis te maken" };

let svrDatagram = sessionStore.wrapSecureDatagram( sessionID, msg2, nonce );

let in2 = uss.upwrapSecureDatagram( svrDatagram, nonce );

console.log( "User Received: " + JSON.stringify( in2 ) );

let tavernStore = new TavernStore( keyStore );
let tavInfo1: TavernInfo = {
  id: "tavern-1",
  name: "TAVERN-1",

  streamPublicKey: Buffer.from( "E8vT5scTaY99FXyQPP+77NBRvFTaYT/B4Qb/eMd9PFM=", BASE64 ),

  comments: "e88b26ce0a3a091c1fa30ee3cf3f1145b780161561953cdbc84a34fa767802e3" // SEED
}

tavernStore.addTavern( tavInfo1 );

let tav1 = tavernStore.getTavern( "tavern-1" );
console.log( tav1 );

let tss = new TavernSecurityServices();

// init Tavern-side stream
let initChunk = tss.initBreweryStreams();

// send initial Chunk to server .. init Server-side streams
let brewChunk = tav1.initTavernStreams( initChunk );

// and process server-response Chunk
tss.processServerChunk( brewChunk );

let m1Chunk = tss.buildServerChunk( Buffer.from( JSON.stringify( { message: "secret message" }), UTF8 ) );
console.log( "Chunk: " + m1Chunk.toString( HEX ) );
console.log( "     : " + m1Chunk.toString( UTF8 ) );
let m1Plain = tav1.processClientChunk( m1Chunk );
console.log( "Plain: " + m1Plain.toString( UTF8 ) );

let m2Chunk = tav1.buildClientChunk( Buffer.from( JSON.stringify( { message: "secret reply" }), UTF8 ) );
console.log( "Chunk: " + m2Chunk.toString( HEX ) );
console.log( "     : " + m2Chunk.toString( UTF8 ) );
let m2Plain = tss.processServerChunk( m2Chunk );
console.log( "Plain: " + m2Plain.toString( UTF8 ) );






/*
//let rxhdr = Buffer.alloc( Sodium.crypto_secretstream_xchacha20poly1305_HEADERBYTES );
let m2 = Buffer.alloc( c1.length - Sodium.crypto_secretstream_xchacha20poly1305_ABYTES );
let t = Buffer.alloc( 1 );

}
let m1 = Buffer.from("secret message", "utf8");
let c1 = Buffer.alloc( m1.length + Sodium.crypto_secretstream_xchacha20poly1305_ABYTES );
Sodium.crypto_secretstream_xchacha20poly1305_push( this.txStreamState, c1, m1, null, Sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE );
console.log( c1 );


Sodium.crypto_secretstream_xchacha20poly1305_pull( this.rxStreamState, m2, t, c1 );
console.log( m2.toString( 'utf8') );



var buffer = sodium.sodium_malloc(size)
sodium.sodium_memzero(buffer)
sodium.sodium_mlock(buffer)
sodium.sodium_mprotect_noaccess(buffer)
sodium.sodium_mprotect_readwrite(buffer)
sodium.sodium_mprotect_readonly(buffer)


crypto_auth(output, input, key);
var bool = crypto_auth_verify(output, input, key);

crypto_kx_seed_keypair(publicKey, secretKey, seed)
crypto_kx_client_session_keys(rx, tx, clientPublicKey, clientSecretKey, serverPublicKey)
crypto_kx_server_session_keys(rx, tx, serverPublicKey, serverSecretKey, clientPublicKey)

sodium.crypto_secretbox_easy(cipher, message, nonce, key)

console.log('Encrypted message:', cipher)

var plainText = new Buffer(cipher.length - sodium.crypto_secretbox_MACBYTES)

if (!sodium.crypto_secretbox_open_easy(plainText, cipher, nonce, key))

Sodium.crypto_aead*/
