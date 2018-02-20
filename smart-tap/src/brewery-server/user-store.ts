import * as Sodium from 'sodium-native';
import { PublicKey, SecretKey } from 'sodium-native';
import { HEX, BASE64, UTF8 } from '../common/utils';

import { UserSecurityServices } from '../user-agent/user-security-services';

export class UserInfo {
  id: string;
  name: string;

  comments?: string;

  isTavernAdmin?: boolean = false;
  isAdmin?: boolean = false;

  passwordHash?: string;

  salt?: Buffer;
  signPublicKey?: PublicKey;

  datagramPublicKey?: PublicKey;
}

export class User extends UserInfo {
  constructor( info?: UserInfo ) {
    super();

    if ( info )
      this.fromJSON( info );
  }

  setPassword( password: string ) {
    let pwBuf = Buffer.from( password, UTF8 );
    let pwHash = Buffer.alloc( Sodium.crypto_pwhash_STRBYTES );

    Sodium.crypto_pwhash_str( pwHash,
      pwBuf,
      Sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
      Sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE );

    // Remove trailing '\0';
    let i = pwHash.length;
    while( ( i > 0 ) && ( pwHash[ i - 1 ] == 0 ) )
      --i;

    this.passwordHash = pwHash.slice(0, i).toString( UTF8 );

    pwBuf.fill( 0 );

    // Separate SALT from string
    let salt = this.passwordHash.split('$')[ 4 ];

    this.salt = Buffer.from( salt, BASE64 );

    // and recalculate Signature PublicKey
    let uss = new UserSecurityServices( this.id );
    uss.buildLoginB( Buffer.alloc( 0 ), this.salt, password );

    this.signPublicKey = uss.userSignaturePublicKey;
    this.datagramPublicKey = uss.userDatagramPublicKey;
  }

  verifyPassword( password: string ): boolean {
    let pwBuf = Buffer.from( password, UTF8 );
    let pwHash = Buffer.alloc( Sodium.crypto_pwhash_STRBYTES );

    // Fixed-length buffer ... argh!
    Buffer.from( this.passwordHash, UTF8 ).copy( pwHash );

    let ok = Sodium.crypto_pwhash_str_verify( pwHash, pwBuf );

    pwBuf.fill( 0 );

    return ok;
  }

  genPassword( len: number ): string {
    let pwseed = Sodium.randombytes_uniform( 10 ** len );
    let password = ( "0".repeat(len) + pwseed.toString() ).substr( -len );

    this.setPassword( password );

    return password;
  }

  // Serialize
  toJSON(): Object {
    let json = {
      id: this.id,
      name: this.name,

      ... (this as UserInfo),

      signPublicKey: (this.signPublicKey)? this.signPublicKey.toString( BASE64 ) : undefined,
      datagramPublicKey: (this.datagramPublicKey)? this.datagramPublicKey.toString( BASE64 ) : undefined,
      salt: (this.salt)? this.salt.toString( BASE64 ) : undefined,
    }

    return json;
  }

  // De-serialize
  fromJSON( info: UserInfo ) {
    let obj: any = info; // cheap cast

    Object.assign( this, {
      ...info,
      signPublicKey: (info.signPublicKey) ? Buffer.from( obj.signPublicKey, BASE64 ) : undefined,
      datagramPublicKey: (info.datagramPublicKey) ? Buffer.from( obj.datagramPublicKey, BASE64 ) : undefined,
      salt: (info.salt) ? Buffer.from( obj.salt, BASE64 ) : undefined,
    } );

    //console.log( this );
  }

}

export class UserStore {
  users: Map<string, User> = new Map();

  constructor( users: UserInfo[] = [] ) {

    // Setup initial data
    users.forEach( (info, index) => {
      this.addUser( info );
    } );
  }

  getUser( id: string ): User {
    return this.users.get( id );
  }

  addUser( info: UserInfo ): User {
    let user = new User( info );

    this.users.set( user.id, user );

    return user;
  }

  toJSON(): Object {
    let json = [];

    this.users.forEach( (user) => {
      json.push( user.toJSON() );
    })

    return json;
  }
}
