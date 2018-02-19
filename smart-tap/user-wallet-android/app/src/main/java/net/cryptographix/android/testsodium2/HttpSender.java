package net.cryptographix.android.testsodium2;

import android.util.Log;

import org.json.JSONObject;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Created by sean on 19/02/18.
 */

public abstract class HttpSender {

  String serverAddress;

  URL url;

  HttpSender(String serverAddress ) {
    this.serverAddress = serverAddress;

  }

  public void setAddress( String serverAddress ) {
    this.serverAddress = serverAddress;
  }

  synchronized protected void notifyResponse(int status, JSONObject responseJSON) {
    this.onResponse(status, responseJSON);
  }

  protected HttpURLConnection newConnection( String path ) throws java.io.IOException {
    URL url = new URL(serverAddress + path);


    HttpURLConnection conn = (HttpURLConnection) url.openConnection();

    conn.setRequestProperty("Accept", "application/json");
    conn.setDoInput(true);

    return conn;
  }

  protected void doExchange(final HttpURLConnection conn, JSONObject postData) {

    final boolean isPost = (postData != null);
    final String postString =  isPost ? postData.toString() : null;

    try {
      if (isPost) {
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json;charset=UTF-8");
      } else {
        conn.setRequestMethod("GET");
      }
    } catch (Exception e) {
      e.printStackTrace();
    }

    Thread thread = new Thread(new Runnable() {
      @Override
      public void run() {
        try {

          if (postString != null) {
            conn.setDoOutput(true);

            DataOutputStream os = new DataOutputStream(conn.getOutputStream());

            //os.writeBytes(URLEncoder.encode(jsonParam.toString(), "UTF-8"));
            os.writeBytes(postString);

            os.flush();
            os.close();

            Log.i("JSON", postString);
          }


          Log.i("STATUS", String.valueOf(conn.getResponseCode()));
          Log.i("MSG", conn.getResponseMessage());

          JSONObject responseJSON = null;

          if (conn.getResponseCode() == 200) {
            BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line;

            while ((line = rd.readLine()) != null) {
              sb.append(line);
            }

            responseJSON = new JSONObject(sb.toString());
          }

          notifyResponse(conn.getResponseCode(), responseJSON);

          conn.disconnect();
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
    });

    thread.start();
  }


  public void postJSON(String path, JSONObject postParams) {
    try {
      HttpURLConnection conn = newConnection( path );

      doExchange( conn, postParams );

    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public void getJSON( String path ) {
    try {
      HttpURLConnection conn = newConnection( path );

      doExchange( conn, null );

    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  // Override me to get response
  abstract void onResponse(int status, JSONObject responseJSON);

}
