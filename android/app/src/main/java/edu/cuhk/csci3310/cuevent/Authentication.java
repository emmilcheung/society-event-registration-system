package edu.cuhk.csci3310.cuevent;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.android.volley.AuthFailureError;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.GetTokenResult;
import com.google.firebase.auth.OAuthProvider;
import com.google.firebase.messaging.FirebaseMessaging;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class Authentication {

    // system
    Context context;
    User user;
    FirebaseAuth firebaseAuth;

    public Authentication(Context context) {
        this.context = context;
        this.user = new User();
        this.firebaseAuth = FirebaseAuth.getInstance();
        this.checkAuth();
    }

    public void checkAuth(){
        FirebaseUser firebaseUser;
        if ((firebaseUser = firebaseAuth.getCurrentUser()) != null) {
            firebaseUser.getIdToken(false).addOnCompleteListener(new OnCompleteListener<GetTokenResult>() {
                @Override
                public void onComplete(@NonNull Task<GetTokenResult> task) {
                    if (task.isSuccessful()) {
                        String token = task.getResult().getToken();
                        Log.d("PendingSuccess", "Token found from thread1 after expiry " + task.getResult().getToken());
                        getUser(token);
                        ((Activity) context).findViewById(R.id.progressBar).setVisibility(View.INVISIBLE);
                    }
                }
            });
        }
    }

    public void login() {
        Log.e("login", "login");
        FirebaseUser firebaseUser;
        if ((firebaseUser = firebaseAuth.getCurrentUser()) != null) {
            firebaseUser.getIdToken(false).addOnCompleteListener(new OnCompleteListener<GetTokenResult>() {
                @Override
                public void onComplete(@NonNull Task<GetTokenResult> task) {
                    if (task.isSuccessful()) {
                        String token = task.getResult().getToken();
                        Log.d("PendingSuccess", "Token found from thread1 after expiry " + task.getResult().getToken());
                        getUser(token);
                    }
                }
            });
        } else {
            OAuthProvider.Builder provider = OAuthProvider.newBuilder("microsoft.com");

            Task<AuthResult> pendingResultTask = firebaseAuth.getPendingAuthResult();
            if (pendingResultTask != null) {
                // There's something already here! Finish the sign-in for your user.
                ((Task) pendingResultTask)
                        .addOnSuccessListener(
                                new OnSuccessListener<AuthResult>() {
                                    @Override
                                    public void onSuccess(AuthResult authResult) {
                                        // User is signed in.
                                        // IdP data available in
                                        // authResult.getAdditionalUserInfo().getProfile().
                                        // The OAuth access token can also be retrieved:
                                        // authResult.getCredential().getAccessToken().
                                        // The OAuth ID token can also be retrieved:
                                        // authResult.getCredential().getIdToken().
                                        Log.w("response", "success");
                                        authResult.getUser().getIdToken(false).addOnCompleteListener(new OnCompleteListener<GetTokenResult>() {
                                            @Override
                                            public void onComplete(@NonNull Task<GetTokenResult> task) {
                                                if (task.isSuccessful()) {
                                                    String token = task.getResult().getToken();
                                                    getUser(token);
                                                    Log.d("PendingSuccess2", "Token found from thread1 after expiry " + token);
                                                }
                                            }
                                        });
                                    }
                                })
                        .addOnFailureListener(
                                new OnFailureListener() {
                                    @Override
                                    public void onFailure(@NonNull Exception e) {
                                        // Handle failure.
                                    }
                                });
            } else {
                // There's no pending result so you need to start the sign-in flow.
                // See below.
                firebaseAuth
                        .startActivityForSignInWithProvider(/* activity= */ (Activity) context, provider.build())
                        .addOnSuccessListener(
                                new OnSuccessListener<AuthResult>() {
                                    @Override
                                    public void onSuccess(AuthResult authResult) {
                                        // User is signed in.
                                        // IdP data available in
                                        // authResult.getAdditionalUserInfo().getProfile().
                                        // The OAuth access token can also be retrieved:
                                        // authResult.getCredential().getAccessToken().
                                        // The OAuth ID token can also be retrieved:
                                        // authResult.getCredential().getIdToken().
                                        Log.w("PendingFail", "success");
                                        authResult.getUser().getIdToken(false).addOnCompleteListener(new OnCompleteListener<GetTokenResult>() {
                                            @Override
                                            public void onComplete(@NonNull Task<GetTokenResult> task) {
                                                if (task.isSuccessful()) {
                                                    Log.d("PendingFailure", "Token found from thread1 after expiry " + task.getResult().getToken());
                                                    String token = task.getResult().getToken();
                                                    getUser(token);
                                                }
                                            }
                                        });
                                    }
                                })
                        .addOnFailureListener(
                                new OnFailureListener() {
                                    @Override
                                    public void onFailure(@NonNull Exception e) {
                                        // Handle failure.
                                        Log.e("efgh", "failure");
                                    }
                                });
            }
        }
    }

    private void refreshIdtoken(){
        FirebaseUser firebaseUser;
        if (user.isLogin() && (firebaseUser = firebaseAuth.getCurrentUser()) != null) {
            firebaseUser.getIdToken(false).addOnCompleteListener(new OnCompleteListener<GetTokenResult>() {
                @Override
                public void onComplete(@NonNull Task<GetTokenResult> task) {
                    if (task.isSuccessful()) {
                        String token = task.getResult().getToken();
                        user.setFirebaseToken(token);
                    }
                }
            });
        }
    }

    private void getUser(String idToken) {
        String url = MainActivity.SERVER_BASE_URI + "/api/login";
        RequestQueue queue = Volley.newRequestQueue(context);
        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            user.setFirebaseToken(idToken);
                            user.setEmail(response.getString("email"));
                            user.setUid(response.getString("user"));
                            user.setLogin(true);
                            sendRegistrationToServer(idToken);
                            loadNotification();
                            Toast.makeText(context, "Login successful, Welcome", Toast.LENGTH_SHORT).show();
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.e("EventActivity", error.toString());
            }

        }) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                Map<String, String> params = new HashMap<String, String>();
                params.put("x-access-token", idToken);

                return params;
            }
        };
//        jsonObjectRequest.setRetryPolicy(new DefaultRetryPolicy(5000,
//                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
//                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        queue.add(jsonObjectRequest);
    }

    private void sendRegistrationToServer(String idToken) {
        // register cloud messaging to backend
        FirebaseMessaging.getInstance().getToken()
                .addOnCompleteListener(new OnCompleteListener<String>() {
                    @Override
                    public void onComplete(@NonNull Task<String> task) {
                        if (!task.isSuccessful()) {
                            return;
                        }

                        // Get new FCM registration token
                        String token = task.getResult();

                        // Log and toast
                        Log.d("messageToken", token);
                        RequestQueue queue = Volley.newRequestQueue(context);
                        String url = MainActivity.SERVER_BASE_URI + "/api/notification/registration";
                        JSONObject data = new JSONObject();
                        try {
                            data.put("token", token);
                            data.put("device", "android");
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                        JsonObjectRequest objectRequest = new JsonObjectRequest(Request.Method.POST, url, data, new Response.Listener<JSONObject>() {
                            @Override
                            public void onResponse(JSONObject response) {
                                Log.i("response", "success\n" + response.toString());
//                Toast.makeText( NFCActivity.this, "success", Toast.LENGTH_SHORT).show();
                            }
                        }, new Response.ErrorListener() {
                            @Override
                            public void onErrorResponse(VolleyError error) {
                                NetworkResponse response = error.networkResponse;
                                if (response != null && response.statusCode == 500) {
                                    Log.e("response", "unsuccessful");
//                    Toast.makeText(NFCActivity.this, "fail", Toast.LENGTH_SHORT).show();
                                }
                                error.printStackTrace();
                            }

                        }) {
                            @Override
                            public Map<String, String> getHeaders() throws AuthFailureError {
                                Map<String, String> params = new HashMap<String, String>();
                                params.put("x-access-token", idToken);

                                return params;
                            }
                        };
//                        objectRequest.setRetryPolicy(new DefaultRetryPolicy(5000,
//                                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
//                                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
                        queue.add(objectRequest);
                    }
                });

    }

    public void loadNotification(){
        // Instantiate the request queue
        RequestQueue queue = Volley.newRequestQueue(context);
//        String url = "http://192.168.1.214:5000/api/search?ca=";
        String url = MainActivity.SERVER_BASE_URI + "/api/notification/0";
        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            JSONArray notificationPage = response.getJSONArray("notifications_page");
//                            response.getInt("offset");
                            // test
                            Log.e("zero", "this is zero");
                            for (int i = notificationPage.length() -1; i >= 0; i--) {
                                JSONObject notification = notificationPage.getJSONObject(i);
                                String id = notification.getString("id");
                                String title = notification.getString("title");
                                String body  = notification.getString("body");
                                String redirectUrl = notification.getString("redirect_url");
                                String imageUrl = notification.getString("image_url");
                                String type = notification.getString("type");
                                String eventId = Integer.toString(notification.getInt("event_id"));
                                user.getNotifications().notificationItems.push(
                                        new NotificationItem(id, title, body, redirectUrl, imageUrl, type, eventId));
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.e("Main Activity (Notification)", error.toString());
            }
        }){
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                Map<String, String> params = new HashMap<String, String>();
                params.put("x-access-token", MainActivity.auth.user.getFirebaseToken());

                return params;
            }
        };

        queue.add(jsonObjectRequest);
    }


}

