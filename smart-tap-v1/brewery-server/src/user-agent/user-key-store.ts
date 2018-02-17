import * as Sodium from 'sodium-native';
import { PublicKey, SecretKey, KeyPair } from 'sodium-native';
import { HEX, BASE64, UTF8 } from '../common/utils';

export class UserKeyStore {
  breweryUserPublicKey: PublicKey;

  constructor() {
    this.breweryUserPublicKey = Buffer.from('3e2e3ae53d747be56c75f5a969ab4a0be3c2fb7610a7886b934fa9fc8f08426c', HEX);
  }
}
