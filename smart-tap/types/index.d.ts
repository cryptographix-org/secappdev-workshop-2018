declare module 'sodium-native' {
  type PublicKey = Buffer;
  type SecretKey = Buffer;
  type KeyPair = { SecretKey, PublicKey };

  function sodium_memzero(buffer: Buffer);
  function sodium_mlock(buffer: Buffer);
  function sodium_munlock(buffer: Buffer);
  function sodium_malloc(size: number): Buffer;
  function sodium_mprotect_noaccess(buffer: Buffer);
  function sodium_mprotect_readonly(buffer: Buffer);
  function sodium_mprotect_readwrite(buffer: Buffer);
  function randombytes_random(): number;
  function randombytes_uniform(upper_bound: number): number;
  function randombytes_buf(buffer: Buffer);
  function randombytes_buf_deterministic(buffer: Buffer, seed: Buffer);
  function sodium_pad(buf: Buffer, unpaddedLength: number, blocksize: number): number;
  function sodium_unpad(buf: Buffer, paddedLength: number, blocksize: number): number;

  function crypto_sign_seed_keypair(publicKey: PublicKey, secretKey: SecretKey, seed: Buffer);
  function crypto_sign_keypair(publicKey: PublicKey, secretKey: SecretKey);
  function crypto_sign(signedMessage: Buffer, message: Buffer, secretKey: SecretKey);
  function crypto_sign_open(message: Buffer, signedMessage: Buffer, publicKey: PublicKey): boolean;
  function crypto_sign_detached(signature: Buffer, message: Buffer, secretKey: SecretKey);
  function crypto_sign_verify_detached(signature: Buffer, message: Buffer, publicKey: PublicKey): boolean;

  function crypto_sign_ed25519_pk_to_curve25519(curve_pk, ed_pk);
  function crypto_sign_ed25519_sk_to_curve25519(curve_sk, ed_sk);

  function crypto_generichash(output: Buffer, input: Buffer, [key]);
  function crypto_generichash_batch(output: Buffer, inputArray, [key]);

  /*function var instance = crypto_generichash_instance([key], [outputLength]);
  function instance.update(input: Buffer);
  function instance.final(output: Buffer);*/

  function crypto_box_seed_keypair(publicKey: PublicKey, secretKey: SecretKey, seed: Buffer);
  function crypto_box_keypair(publicKey: PublicKey, secretKey: SecretKey);
  function crypto_box_detached(cipher: Buffer, mac: Buffer, message: Buffer, nonce: Buffer, publicKey: PublicKey, secretKey: SecretKey);
  function crypto_box_easy(cipher: Buffer, message: Buffer, nonce: Buffer, publicKey: PublicKey, secretKey: SecretKey);
  function crypto_box_open_detached(message: Buffer, cipher: Buffer, mac: Buffer, nonce: Buffer, publicKey: PublicKey, secretKey: SecretKey): boolean;
  function crypto_box_open_easy(message: Buffer, cipher: Buffer, nonce: Buffer, publicKey: PublicKey, secretKey: SecretKey): boolean;
  function crypto_box_seal(cipher: Buffer, message: Buffer, publicKey: PublicKey);
  function crypto_box_seal_open(message: Buffer, cipher: Buffer, publicKey: PublicKey, secretKey: SecretKey): boolean;

  function crypto_secretbox_detached(cipher: Buffer, mac: Buffer, message: Buffer, nonce: Buffer, secretKey: SecretKey);
  function crypto_secretbox_easy(cipher: Buffer, message: Buffer, nonce: Buffer, secretKey: SecretKey);
  function crypto_secretbox_open_detached(message: Buffer, cipher: Buffer, mac: Buffer, nonce: Buffer, secretKey: SecretKey): boolean;
  function crypto_secretbox_open_easy(message: Buffer, cipher: Buffer, nonce: Buffer, secretKey: SecretKey): boolean;

  function crypto_stream(cipher: Buffer, nonce: Buffer, key: SecretKey);
  function crypto_stream_xor(cipher: Buffer, message: Buffer, nonce: Buffer, key: SecretKey);
  function crypto_stream_chacha20_xor(cipher: Buffer, message: Buffer, nonce: Buffer, key: SecretKey);

  /*function var instance = crypto_stream_xor_instance(nonce: Buffer, key: SecretKey);
  function var instance = crypto_stream_chacha20_xor_instance(nonce: Buffer, key: SecretKey);
  function instance.update(cipher: Buffer, message: Buffer);
  function instance.final();*/

  function crypto_auth(output: Buffer, input: Buffer, key: SecretKey);
  function crypto_auth_verify(output: Buffer, input: Buffer, key: SecretKey): boolean;

  function crypto_onetimeauth(output: Buffer, input: Buffer, key: SecretKey);
  function crypto_onetimeauth_verify(output: Buffer, input: Buffer, key: SecretKey): boolean;

  /*function var instance = crypto_onetimeauth_instance(key: SecretKey);
  function instance.update(input);
  function instance.final(output);*/
  function crypto_pwhash(output: Buffer, password, salt, opslimit, memlimit, algorithm);
  function crypto_pwhash_str(output: Buffer, password, opslimit, memlimit);
  function crypto_pwhash_str_verify(str, password): boolean;
  function crypto_pwhash_str_needs_rehash(hash, opslimit, memlimit): boolean;
  function crypto_pwhash_async(output: Buffer, password, salt, opslimit, memlimit, algorithm, callback);
  function crypto_pwhash_str_async(output: Buffer, password, opslimit, memlimit, callback);
  function crypto_pwhash_str_verify_async(str, password, callback);

  function crypto_kx_keypair(publicKey: PublicKey, secretKey: SecretKey);
  function crypto_kx_seed_keypair(publicKey: PublicKey, secretKey: SecretKey, seed);
  function crypto_kx_client_session_keys(rx: SecretKey, tx: SecretKey, clientPublicKey: PublicKey, clientSecretKey: SecretKey, serverPublicKey: PublicKey);
  function crypto_kx_server_session_keys(rx: SecretKey, tx: SecretKey, serverPublicKey: PublicKey, serverSecretKey: SecretKey, clientPublicKey: PublicKey);

  function crypto_scalarmult_base(publicKey: PublicKey, secretKey: SecretKey);
  function crypto_scalarmult(sharedSecret: Buffer, secretKey: SecretKey, remotePublicKey: PublicKey);

  function crypto_shorthash(output: Buffer, input: Buffer, key: SecretKey);

  function crypto_kdf_keygen(key: SecretKey);
  function crypto_kdf_derive_from_key(subkey: SecretKey, subkeyId: number, context: any, key: SecretKey);

  function crypto_hash_sha256(output: Buffer, input: Buffer);
  function crypto_hash_sha512(output: Buffer, input);
  /*function var instance = crypto_hash_sha256_instance();
  function instance.update(input);
  function instance.final(output);
  function var instance = crypto_hash_sha512_instance();
  function instance.update(input);
  function instance.final(output);*/

  const SODIUM_LIBRARY_VERSION_MAJOR: number;
  const SODIUM_LIBRARY_VERSION_MINOR: number;
  const crypto_aead_chacha20poly1305_ABYTES: number;
  const crypto_aead_chacha20poly1305_KEYBYTES: number;
  const crypto_aead_chacha20poly1305_NPUBBYTES: number;
  const crypto_aead_chacha20poly1305_NSECBYTES: any;
  const crypto_aead_chacha20poly1305_ietf_ABYTES: any;
  const crypto_aead_chacha20poly1305_ietf_KEYBYTES: any;
  const crypto_aead_chacha20poly1305_ietf_NPUBBYTES: any;
  const crypto_aead_chacha20poly1305_ietf_NSECBYTES: any;
  const crypto_auth_BYTES: number;
  const crypto_auth_KEYBYTES: number;
  const crypto_auth_hmacsha256_BYTES: number;
  const crypto_auth_hmacsha256_KEYBYTES: number;
  const crypto_auth_hmacsha512_BYTES: number;
  const crypto_auth_hmacsha512_KEYBYTES: number;
  const crypto_box_BEFORENMBYTES: number;
  const crypto_box_MACBYTES: number;
  const crypto_box_NONCEBYTES: number;
  const crypto_box_PUBLICKEYBYTES: number;
  const crypto_box_SEALBYTES: number;
  const crypto_box_SECRETKEYBYTES: number;
  const crypto_box_SEEDBYTES: number;
  const crypto_generichash_BYTES: number;
  const crypto_generichash_BYTES_MAX: number;
  const crypto_generichash_BYTES_MIN: number;
  const crypto_generichash_KEYBYTES: number;
  const crypto_generichash_KEYBYTES_MAX: number;
  const crypto_generichash_KEYBYTES_MIN: number;
  const crypto_hash_BYTES: number;
  const crypto_onetimeauth_BYTES: number;
  const crypto_onetimeauth_KEYBYTES: number;
  const crypto_pwhash_ALG_ARGON2I13: any;
  const crypto_pwhash_ALG_DEFAULT: number;
  const crypto_pwhash_MEMLIMIT_INTERACTIVE: number;
  const crypto_pwhash_MEMLIMIT_MODERATE: any;
  const crypto_pwhash_MEMLIMIT_SENSITIVE: any;
  const crypto_pwhash_OPSLIMIT_INTERACTIVE: number;
  const crypto_pwhash_OPSLIMIT_MODERATE: any;
  const crypto_pwhash_OPSLIMIT_SENSITIVE: any;
  const crypto_pwhash_SALTBYTES: number;
  const crypto_pwhash_STRBYTES: any;
  const crypto_pwhash_STR_VERIFY: any;
  const crypto_pwhash_scryptsalsa208sha256_MEMLIMIT_INTERACTIVE: number;
  const crypto_pwhash_scryptsalsa208sha256_MEMLIMIT_SENSITIVE: any;
  const crypto_pwhash_scryptsalsa208sha256_OPSLIMIT_INTERACTIVE: number;
  const crypto_pwhash_scryptsalsa208sha256_OPSLIMIT_SENSITIVE: number;
  const crypto_pwhash_scryptsalsa208sha256_SALTBYTES: number;
  const crypto_pwhash_scryptsalsa208sha256_STRBYTES: any;
  const crypto_pwhash_scryptsalsa208sha256_STR_VERIFY: any;
  const crypto_scalarmult_BYTES: number;
  const crypto_scalarmult_SCALARBYTES: number;
  const crypto_secretbox_KEYBYTES: number;
  const crypto_secretbox_MACBYTES: number;
  const crypto_secretbox_NONCEBYTES: number;
  const crypto_shorthash_BYTES: number;
  const crypto_shorthash_KEYBYTES: number;
  const crypto_sign_BYTES: number;
  const crypto_sign_PUBLICKEYBYTES: number;
  const crypto_sign_SECRETKEYBYTES: number;
  const crypto_sign_SEEDBYTES: number;
  const crypto_stream_chacha20_KEYBYTES: number;
  const crypto_stream_chacha20_NONCEBYTES: number;
}
