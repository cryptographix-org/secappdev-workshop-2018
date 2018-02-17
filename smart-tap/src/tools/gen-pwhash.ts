import * as Sodium from 'sodium-native';

let startTime = Date.now();

let pwHash = Buffer.alloc( 32 );
let salt = Buffer.alloc( Sodium.crypto_pwhash_SALTBYTES ); // 16
Sodium.randombytes_buf( salt );
//Buffer.from('4a7801235cf4782b0847dc19112dd300','hex').copy(salt);
for( let xx = 0; xx < 1; ++xx ) {
  Sodium.crypto_pwhash(pwHash,
                  Buffer.from("amuchbiggerpassword","utf8"),
                  salt,
                  Sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
                  Sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
                  Sodium.crypto_pwhash_ALG_DEFAULT)
}
console.log( "PWHASH - " + Sodium.crypto_pwhash_ALG_DEFAULT)
console.log( "salt:" + salt.toString('hex'));
console.log( "hash:" + pwHash.toString('hex'));
console.log( "time: " + (Date.now() - startTime ) / 1);

let pwHashString = Buffer.alloc( Sodium.crypto_pwhash_STRBYTES );
Sodium.crypto_pwhash_str(pwHashString,
                Buffer.from("amuchbiggerpassword","utf8"),
                Sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
                Sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE)
console.log( "hash_str:" + pwHashString.toString('utf8'));

let ok = Sodium.crypto_pwhash_str_verify(pwHashString,
                Buffer.from("amuchbiggerpassword","utf8") )
console.log( "hash_ver_ok:" + ok);
let nok = Sodium.crypto_pwhash_str_verify(pwHashString,
                Buffer.from("amuchbiggerpassword_but_wrong","utf8") )
console.log( "hash_ver_nok:" + nok);
