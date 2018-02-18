import * as Sodium from 'sodium-native';

export const HEX = 'hex';
export const BASE64 = 'base64';
export const UTF8 = 'utf8';

export class SecureBuffer extends Buffer {
  static secureAlloc( size: number ): SecureBuffer {
    let buf = Sodium.sodium_malloc( size );

    Sodium.sodium_mlock( buf );
    Sodium.sodium_mprotect_readwrite( buf );

    return buf;
  }

  static secureFrom( data: any, encoding: any ): SecureBuffer {
    let buf = Buffer.from( data, encoding );
    let secureBuf = SecureBuffer.secureAlloc( buf.length );

    buf.copy( secureBuf );

    buf.fill( 0 );

    return secureBuf;
  }

  static makeReadOnly( buf: SecureBuffer ) {
    Sodium.sodium_mprotect_readonly( buf );
  }
  static makeReadWrite( buf: SecureBuffer ) {
    Sodium.sodium_mprotect_readwrite( buf );
  }
  static makeNoAccess( buf: SecureBuffer ) {
    Sodium.sodium_mprotect_noaccess( buf );
  }

  static secureClean( buf: SecureBuffer ) {
    // Will clear memory and unlock
    Sodium.sodium_munlock( buf );
  }
}
