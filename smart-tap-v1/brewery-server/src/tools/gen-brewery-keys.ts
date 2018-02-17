import * as Sodium from 'sodium-native';

let identSecretKey = Buffer.alloc( Sodium.crypto_sign_SECRETKEYBYTES );
let identPublicKey = Buffer.alloc( Sodium.crypto_sign_PUBLICKEYBYTES );

let identSeed = Buffer.from('4ebe6d514f48932cba58f2e114965743f631d1affa0169fa753111e7159104f1','hex');
Sodium.crypto_sign_seed_keypair( identPublicKey, identSecretKey, identSeed );

//bsk.copy( brewerySecretKey );
console.log( "IDENT");
console.log( "     identSeed:" + identSeed.toString('hex'));
console.log( "identSecretKey:" + identSecretKey.toString('hex'));
console.log( "identPublicKey:" + identPublicKey.toString('hex'));
console.log( "");

let brewerySeed = Buffer.from('96ee951b0e535a40cb3b7c8f438d57465da244123e7eea85186dfa1dd9082977','hex');

let brewerySignatureSeed = Buffer.alloc( Sodium.crypto_sign_SEEDBYTES );
Sodium.crypto_kdf_derive_from_key( brewerySignatureSeed, 1, Buffer.from( "BREWSIGN", "utf8" ), brewerySeed );

let breweryTavernStreamSeed = Buffer.alloc( Sodium.crypto_kx_SEEDBYTES );
Sodium.crypto_kdf_derive_from_key( breweryTavernStreamSeed, 1, Buffer.from( "BREWTAVN", "utf8" ), brewerySeed );

let breweryUserBoxSeed = Buffer.alloc( Sodium.crypto_box_SEEDBYTES );
Sodium.crypto_kdf_derive_from_key( breweryUserBoxSeed, 1, Buffer.from( "BREWUSER", "utf8" ), brewerySeed );

console.log( "KDF")
console.log( "brewerySeed:" + brewerySeed.toString('hex'));
console.log( "brewerySignatureSeed:" + brewerySignatureSeed.toString('hex'));
console.log( "breweryTavernStreamSeed:" + breweryTavernStreamSeed.toString('hex'));
console.log( "breweryUserBoxSeed:" + breweryUserBoxSeed.toString('hex'));
console.log( "");

console.log( "SIGN")
let brewerySignSecretKey = Buffer.alloc( Sodium.crypto_sign_SECRETKEYBYTES );
let brewerySignPublicKey = Buffer.alloc( Sodium.crypto_sign_PUBLICKEYBYTES );
Sodium.crypto_sign_seed_keypair( brewerySignPublicKey, brewerySignSecretKey, brewerySignatureSeed );
console.log( "brewerySignSecretKey:" + brewerySignSecretKey.toString('hex'));
console.log( "brewerySignPublicKey:" + brewerySignPublicKey.toString('hex'));
console.log( "");

console.log( "TAVERN")
let breweryTavernSecretKey = Buffer.alloc( Sodium.crypto_kx_SECRETKEYBYTES );
let breweryTavernPublicKey = Buffer.alloc( Sodium.crypto_kx_PUBLICKEYBYTES );

Sodium.crypto_kx_seed_keypair( breweryTavernPublicKey, breweryTavernSecretKey, brewerySeed );

console.log( "breweryTavernSecretKey:" + breweryTavernSecretKey.toString('hex'));
console.log( "breweryTavernPublicKey:" + breweryTavernPublicKey.toString('hex'));
console.log( "");

console.log( "USER")
let breweryUserSecretKey = Buffer.alloc( Sodium.crypto_box_SECRETKEYBYTES );
let breweryUserPublicKey = Buffer.alloc( Sodium.crypto_box_PUBLICKEYBYTES );

Sodium.crypto_box_seed_keypair( breweryUserPublicKey, breweryUserSecretKey, breweryUserBoxSeed );

console.log( "breweryUserSecretKey:" + breweryUserSecretKey.toString('hex'));
console.log( "breweryUserPublicKey:" + breweryUserPublicKey.toString('hex'));

console.log( "SECRET_STREAM" );
let state = Sodium.crypto_secretstream_xchacha20poly1305_state_new();
//console.log( state );
//state = null;
let hdr = Buffer.alloc( Sodium.crypto_secretstream_xchacha20poly1305_HEADERBYTES );
Sodium.crypto_secretstream_xchacha20poly1305_init_push( state, hdr, breweryUserSecretKey );

let m1 = Buffer.from("secret message", "utf8");
let c1 = Buffer.alloc( m1.length + Sodium.crypto_secretstream_xchacha20poly1305_ABYTES );
Sodium.crypto_secretstream_xchacha20poly1305_push( state, c1, m1, null, Sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE );
console.log( c1 );


let rxstate = Sodium.crypto_secretstream_xchacha20poly1305_state_new();
//let rxhdr = Buffer.alloc( Sodium.crypto_secretstream_xchacha20poly1305_HEADERBYTES );
Sodium.crypto_secretstream_xchacha20poly1305_init_pull( rxstate, hdr, breweryUserSecretKey );
let m2 = Buffer.alloc( c1.length - Sodium.crypto_secretstream_xchacha20poly1305_ABYTES );
let t = Buffer.alloc( 1 );

Sodium.crypto_secretstream_xchacha20poly1305_pull( rxstate, m2, t, c1 );
console.log( m2.toString( 'utf8') );


//console.log( Sodium.SODIUM_LIBRARY_VERSION_MAJOR + "." + Sodium.SODIUM_LIBRARY_VERSION_MINOR);
//console.log( Sodium.SODIUM_LIBRARY_VERSION_MAJOR + "." + Sodium.SODIUM_LIBRARY_VERSION_MINOR);
