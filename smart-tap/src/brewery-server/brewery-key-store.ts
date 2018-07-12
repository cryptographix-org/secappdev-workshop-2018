import * as Sodium from 'sodium-native';
import { PublicKey, SecretKey, KeyPair } from 'sodium-native';
import { HEX, BASE64, UTF8 } from '../common/utils';

export class BreweryKeyStore {
  breweryUserKeys: KeyPair;
  breweryTavernKeys: KeyPair;

  //
  constructor() {
    // Brewery Keypair for use with User Agents
    this.breweryUserKeys = {
      PublicKey: Buffer.from( '3e2e3ae53d747be56c75f5a969ab4a0be3c2fb7610a7886b934fa9fc8f08426c', HEX ),
      SecretKey: Buffer.from( '95eef920bdd8db6d44c104060557ce3cdd9441f1b125e5667c925fbf3a08d050', HEX )
    };

    // Brewery Keypair for use with Taverns
    this.breweryTavernKeys = {
      PublicKey: Buffer.from( '72a7fa62c82277d694e37c87c1747d4977b6801876c5a5af425691e72976571c', HEX ),
      SecretKey: Buffer.from( '480ee89381eda205ab719d7b008aed267a48c69d313d547915ff1a4b20206823', HEX )
    };
  }
}
