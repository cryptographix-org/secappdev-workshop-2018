import { UserKeyStore } from './user-key-store';

export class UserAgent {
  keyStore: UserKeyStore;

  constructor() {
    this.keyStore = new UserKeyStore();
  }

  loginRemote() {

  }
}
