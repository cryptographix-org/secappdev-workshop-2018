import * as Sodium from 'sodium-native';

/* Declare missing constants */
declare module 'sodium-native' {
  function sodium_compare( buf1: Buffer, buf2: Buffer, len: number ): number;
  function sodium_memcmp( buf1: Buffer, buf2: Buffer, len: number ): boolean;
  function sodium_pad( buffer: Buffer, unpaddedLength: number ): number;
  function sodium_unpad(): boolean;

  const crypto_kx_SECRETKEYBYTES = 32;
  const crypto_kx_PUBLICKEYBYTES = 32;
  const crypto_kx_SEEDBYTES = 32;
  const crypto_kx_SESSIONKEYBYTES = 32;

  const crypto_kdf_KEYBYTES = 32;
  const crypto_kdf_BYTES_MIN = 16;
  const crypto_kdf_BYTES_MAX = 64;
  const crypto_kdf_CONTEXTBYTES = 8;

  const crypto_secretstream_xchacha20poly1305_KEYBYTES = 32;
  const crypto_secretstream_xchacha20poly1305_HEADERBYTES = 24;
  const crypto_secretstream_xchacha20poly1305_ABYTES = 17;
  const crypto_secretstream_xchacha20poly1305_MESSAGEBYTES_MAX = 274877906816
  const crypto_secretstream_xchacha20poly1305_TAGBYTES = 1;

  const crypto_secretstream_xchacha20poly1305_TAG_MESSAGE: Buffer;
  const crypto_secretstream_xchacha20poly1305_TAG_PUSH: Buffer;
  const crypto_secretstream_xchacha20poly1305_TAG_REKEY: Buffer;
  const crypto_secretstream_xchacha20poly1305_TAG_FINAL: Buffer;

  function crypto_secretstream_xchacha20poly1305_state_new();


  function crypto_secretstream_xchacha20poly1305_keygen( k: SecretKey );

  function crypto_secretstream_xchacha20poly1305_init_push(state: any, header: Buffer, secretKey: SecretKey);
  function crypto_secretstream_xchacha20poly1305_push(state: any, cipher: Buffer, message: Buffer, nully, tag: Buffer );

  function crypto_secretstream_xchacha20poly1305_init_pull(state: any, header: Buffer, secretKey: SecretKey);
  function crypto_secretstream_xchacha20poly1305_pull(state: any, message: Buffer, tag: Buffer, cipher: Buffer);


  const crypto_pwhash_ALG_ARGON2ID13;
  const crypto_pwhash_BYTES_MIN = 16;
  const crypto_pwhash_BYTES_MAX = 4294967295
  const crypto_pwhash_PASSWD_MIN = 0;
  const crypto_pwhash_PASSWD_MAX = 4294967295;
  const crypto_pwhash_OPSLIMIT_MIN = 1;
  const crypto_pwhash_OPSLIMIT_MAX = 4294967295;
  const crypto_pwhash_MEMLIMIT_MIN = 8192;
  const crypto_pwhash_MEMLIMIT_MAX = 4398046510080;

  /*class SecureBuffer extends Buffer {
    static secureAlloc( size: number ): SecureBuffer;
    static secureFrom( data: any, encoding: any ): SecureBuffer;
    static makeReadOnly( buf: SecureBuffer );
    static makeReadWrite( buf: SecureBuffer );
    static makeNoAccess( buf: SecureBuffer );
    static secureClean( buf: SecureBuffer );
 }*/
}
