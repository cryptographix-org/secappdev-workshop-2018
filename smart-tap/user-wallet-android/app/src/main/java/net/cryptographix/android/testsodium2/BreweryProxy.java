package net.cryptographix.android.testsodium2;

import android.util.Log;

import org.json.JSONObject;

/**
 * Created by sean on 19/02/18.
 */
import java.net.URL;

public class BreweryProxy {
  String serverAddress;

  BreweryProxy(  )  {
  }

  void setServerAddress( String serverAddress ) {
    this.serverAddress = serverAddress;
  }

  protected OnResponseListener onResponseListener;

  void setOnResponseListener( OnResponseListener listener ) {

    this.onResponseListener = listener;
  }

  void getLoginInfo( String userName ) {

    HttpSender sender = new HttpSender( this.serverAddress ) {
      @Override
      void onResponse(int status, JSONObject responseJSON) {
        Log.i( "server response", "Status: " + Integer.toString(status));

        onResponseListener.onResponse( status, responseJSON );
      }
    };

    try {
      sender.getJSON( "/login/" + userName );
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  void postLoginA( String userName, JSONObject loginMessage ) {
    HttpSender sender = new HttpSender( this.serverAddress ) {
      @Override
      void onResponse(int status, JSONObject responseJSON) {
        Log.i( "server response", "Status: " + Integer.toString(status));

        onResponseListener.onResponse( status, responseJSON );
      }
    };

    try {
      sender.postJSON( "/login/" + userName, loginMessage );
    } catch (Exception e) {
      e.printStackTrace();
    }

  }

  public interface OnResponseListener {
    void onResponse( int status, JSONObject json );
  }
}
