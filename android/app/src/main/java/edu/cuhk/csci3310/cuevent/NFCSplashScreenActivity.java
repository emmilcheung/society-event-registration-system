package edu.cuhk.csci3310.cuevent;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.widget.ImageView;

public class NFCSplashScreenActivity extends AppCompatActivity {

    private static int SPLASH_TIME_OUT = 1000;
    Intent intent;
    ImageView imageView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_nfc_splash_screen);

        Log.d("launch", "launch");
        intent = getIntent();
        Boolean result = intent.getBooleanExtra("RESULT", false);
        imageView = findViewById(R.id.nfc_result_image);
        if(result){
            imageView.setImageResource(R.drawable.green_tick);
        }

        new Handler().postDelayed(new Runnable() {

            @Override
            public void run() {
                finish();
            }
        }, SPLASH_TIME_OUT);


    }
}