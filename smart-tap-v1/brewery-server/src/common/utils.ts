export const HEX = 'hex';
export const BASE64 = 'base64';
export const UTF8 = 'utf8';

export function allocSecureBuffer( len: number ): Buffer
{
  return Buffer.alloc( len );
}

export function freeSecureBuffer( buf: Buffer )
{
  //return Buffer.( len );
}
