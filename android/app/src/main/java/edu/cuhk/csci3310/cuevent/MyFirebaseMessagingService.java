package edu.cuhk.csci3310.cuevent;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.media.RingtoneManager;
import android.net.ConnectivityManager;
import android.net.Uri;
import android.util.Log;
import android.widget.Toast;

import androidx.core.app.NotificationCompat;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.android.volley.AuthFailureError;
import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    private String TAG = "";
    private static int count = 0;

    //    @Override
//    public void onTokenRefesh(){
//        super.onToken
//    }
    @Override
    public void onNewToken(String token) {
        Log.d("TAG", "Refreshed token: " + token);

        // If you want to send messages to this application instance or
        // manage this apps subscriptions on the server side, send the
        // FCM registration token to your app server.
//        sendRegistrationToServer(token);
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        // ...
        // TODO(developer): Handle FCM messages here.
        // Not getting messages here? See why this may be: https://goo.gl/39bRNJ
        Log.d(TAG, "From: " + remoteMessage.getFrom());

        // Check if message contains a data payload.
        if (remoteMessage.getData().size() > 0) {
            Log.d(TAG, "Message data payload: " + remoteMessage.getData());
        }

        // Check if message contains a notification payload.
        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "Message Notification Body: " + remoteMessage.getNotification().getBody());
        }

        // Also if you intend on generating your own notifications as a result of a received FCM
        // message, here is where that should be initiated. See sendNotification method below.
        Map<String, String> data;
        data = remoteMessage.getData();
        String notification = data.get("notification");
        Log.d(TAG, "Message Notification : " + notification);
        if (MainActivity.auth.user.isLogin()) {
            try {
                JSONObject notificationObj = new JSONObject(data.get("notification"));
                String notificationId = notificationObj.getString("id");
                String title = notificationObj.getString("title");
                String body = notificationObj.getString("body");
                String redirectUrl = notificationObj.getString("redirect_url");
                String imageUrl = notificationObj.getString("image_url");
                String type = notificationObj.getString("type");
                String eventId = data.get("EVENT_ID");

                MainActivity.auth.user.getNotifications().notificationItems.push(
                        new NotificationItem(notificationId, title, body, redirectUrl, imageUrl, type, eventId));
                Intent intent = new Intent("notification");
                LocalBroadcastManager.getInstance(getBaseContext()).sendBroadcast(intent);
                Log.d(TAG, "Message Broadcasted:");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

}
