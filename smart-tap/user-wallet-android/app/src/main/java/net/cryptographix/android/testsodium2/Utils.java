package net.cryptographix.android.testsodium2;

import android.util.Base64;

/**
 * Created by sean on 19/02/18.
 */

public class Utils {
  static byte[] bufferFromHex( String hex ) {
    hex = hex.replace(" ", "")
            .replace("\t", "")
            .replace("\r", "")
            .replace("\n", "");

    int len = hex.length() / 2;
    byte buffer[] = new byte[len];

    for (int i = 0; i < len; ++i) {
      buffer[i] = (byte) (Integer.parseInt(hex.substring(2 * i, 2 * i + 2), 16) & 0xff);
    }

    return buffer;
  }

  static byte[] bufferFromBase64( String base64 ) {
    return Base64.decode( base64, Base64.NO_WRAP );

  }

  static String bufferToBase64( byte[] buffer ) {
    return Base64.encodeToString( buffer, Base64.NO_WRAP );

  }

  static String kvToJSON( String attr, String value ) {
    String quoteChar = "\"";

    return quoteChar + attr + quoteChar + ": " + quoteChar + value + quoteChar;
  }


}
