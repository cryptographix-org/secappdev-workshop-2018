package net.cryptographix.android.testsodium2;

import org.json.JSONObject;
import org.libsodium.jni.NaCl;
import org.libsodium.jni.Sodium;
import org.libsodium.jni.SodiumConstants;

/**
 * Created by sean on 19/02/18.
 */

public class UserSecureServices {
  byte breweryUserPublicKey[] = new byte[SodiumConstants.PUBLICKEY_BYTES];

  Sodium sodium = NaCl.sodium();

  UserSecureServices() {
    breweryUserPublicKey = Utils.bufferFromHex("3e2e3ae53d747be56c75f5a969ab4a0be3c2fb7610a7886b934fa9fc8f08426c");
  }

  /*public class TestSodium {
    TestSodium() {
      int i = SodiumConstants.PUBLICKEY_BYTES + SodiumConstants.SECRETKEY_BYTES;

      //Sodium.sodium_init();

      byte[] seed = new Random().randomBytes(SodiumConstants.SECRETKEY_BYTES);
      KeyPair encryptionKeyPair = new KeyPair(seed);
      System.out.println(encryptionKeyPair.getPublicKey());

    }
  }*/

  byte[] buildSealedUserLogin( String userName, String challenge, String password ) throws Exception {
    JSONObject loginInfo = new JSONObject();

    loginInfo.put( "userID", userName);
    loginInfo.put( "challenge", challenge);
    loginInfo.put( "password", password);

    byte[] loginInfoBytes = loginInfo.toString().getBytes();
    int loginInfoLen = loginInfoBytes.length;

    byte out[] = new byte[loginInfoLen + Sodium.crypto_box_sealbytes()];

    int ok = Sodium.crypto_box_seal(out, loginInfoBytes, loginInfoLen, breweryUserPublicKey);

    if ( ok != 0 )
      throw new Exception( "Oh dear" );

    return out;
  }


}

