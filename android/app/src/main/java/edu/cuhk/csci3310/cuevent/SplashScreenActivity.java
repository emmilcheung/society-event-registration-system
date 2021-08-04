package edu.cuhk.csci3310.cuevent;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;

import androidx.appcompat.app.AppCompatActivity;

import com.google.gson.Gson;

public class SplashScreenActivity extends AppCompatActivity {

    private static int SPLASH_TIME_OUT = 2000;
    Context context;
    Intent intent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.launching);

        Log.d("launch", "launch");
        intent = getIntent();


        new Handler().postDelayed(new Runnable() {

            @Override
            public void run() {
//                if (savedInstanceState != null) {
//                    String json = savedInstanceState.getString("user");
//                    if (!json.isEmpty()) {
//                        Gson gson = new Gson();
//                        MainActivity.auth.user = gson.fromJson(json, User.class);
//                    }
////            Log.e("token", auth.getFirebaseToken());
//                }
                Intent i = new Intent(SplashScreenActivity.this, MainActivity.class);
                // Firebase Auth + user
                if (intent.getStringExtra("TYPE") != null) {
                    String type = intent.getStringExtra("TYPE");
                    Log.e("type", type);
                    if (true) {
                        // Firebase Auth + user
                        i.putExtra("TYPE", type);
                        i.putExtra("EVENT_ID", intent.getStringExtra("EVENT_ID"));
                        i.putExtra("RUN_ID", intent.getStringExtra("RUN_ID"));
                    }
                }
                startActivity(i);

                // close this activity
                finish();
            }
        }, SPLASH_TIME_OUT);

    }
}