import * as path from 'path';
import * as fs from 'fs';
import * as Sodium from 'sodium-native';

import { HEX, BASE64, UTF8 } from '../common/utils';

import { BreweryKeyStore } from './brewery-key-store';
import { SessionStore } from './session-store';

import { UserInfo, User, UserStore } from './user-store';

import { TavernStore, TavernInfo } from './tavern-store';
import { TavernSecurityServices } from '../tavern-agent/tavern-security-services';

export class BreweryServices {
  //
  keyStore: BreweryKeyStore;

  //
  userStore: UserStore;

  //
  sessionStore: SessionStore;

  //
  tavernStore: TavernStore;

  constructor( initUsers?: UserInfo[], initTaverns?: TavernInfo[] ) {
    this.keyStore = new BreweryKeyStore();

    this.userStore = new UserStore( initUsers );

    this.sessionStore = new SessionStore( this.keyStore, this.userStore );

    this.tavernStore = new TavernStore( this.keyStore, initTaverns );
  }

  checkUsers(): boolean {
    let changed = false;

    this.userStore.users.forEach( (user, id) => {
      let pw = user.comments;

      if ( !pw ) {
        pw = user.genPassword( 6 );

        user.comments = pw;

        user.setPassword( pw );

        changed = true;
      }

//      console.log( user.id + ' : ' + user.salt.toString( HEX ) + ' : ' + user.signPublicKey.toString( HEX ) );
    })

    return changed;
  }

  createUser( userID: string, name: string, password?: string ) {
    let user = this.userStore.addUser( {
      id: userID,
      name
    });

    if ( password )
      user.setPassword( password );
    else {
      user.setPassword( user.genPassword( 6 ) );
    }
  }
}
