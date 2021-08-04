package edu.cuhk.csci3310.cuevent;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import android.content.Intent;
import android.content.DialogInterface;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.os.PersistableBundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.Toast;


import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.gson.Gson;

import java.util.HashMap;
import java.util.Map;

public class MainActivity extends AppCompatActivity {

    //    public static final String SERVER_BASE_URI = "http://192.168.1.214:5000";
    public static final String SERVER_BASE_URI = "http://192.168.1.110:5000";
    public static final String WEB_PAGE_URI = "http://192.168.0.100:3000";

    // firebase auth
    public static Authentication auth;
    private ProgressBar progressBar;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        progressBar = findViewById(R.id.progressBar);

        // Firebase Auth + user
        auth = new Authentication(this);
        Log.e("main", "onCreate");


        // direct to
        Intent intent = getIntent();
        String type = intent.getStringExtra("TYPE");
        String eventId = intent.getStringExtra("EVENT_ID");
        String runId = intent.getStringExtra("RUN_ID");

        if (type != null && true) {
            Intent eventIntent = new Intent(MainActivity.this, EventActivity.class);
            eventIntent.putExtra("EVENT_ID", eventId);
            eventIntent.putExtra("RUN_ID", runId);
            startActivity(eventIntent);
        }
        BottomNavigationView bottomNav = findViewById(R.id.bottom_navigation);
        bottomNav.setOnNavigationItemSelectedListener(navListener);
        getSupportFragmentManager().beginTransaction().replace(R.id.fragment_container, new HomeFragment()).commit();
    }

    @Override
    public void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        Gson gson = new Gson();
        String json = gson.toJson(auth.user);
        outState.putString("user", json);
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.option_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        switch (item.getItemId()) {
            case R.id.logout_opt:
                AlertDialog.Builder alert = new AlertDialog.Builder(this);
                alert.setTitle("Logout");
                alert.setMessage("Are you sure you want to logout?");
                alert.setNegativeButton("No", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.dismiss();
                    }
                });
                alert.setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        // Todo: Logout process
                        dialog.dismiss();
                        auth.firebaseAuth.signOut();
                        auth.user = new User();
                        Intent intent = new Intent(MainActivity.this, SplashScreenActivity.class);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        startActivity(intent);
                    }
                });

                alert.show();
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    private BottomNavigationView.OnNavigationItemSelectedListener navListener =
            new BottomNavigationView.OnNavigationItemSelectedListener() {
                @Override
                public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                    Fragment selectedFragment = null;
                    switch (item.getItemId()) {
                        case R.id.nav_home:
                            selectedFragment = new HomeFragment();
                            break;
                        case R.id.nav_profile:
                            if (auth.user.isLogin()) {
                                selectedFragment = new ProfileFragment();
                            } else {
                                selectedFragment = new HomeLoginFragment();
                            }
                            break;
                        case R.id.nav_notification:
                            if (auth.user.isLogin()) {
                                selectedFragment = new NotificationFragment();
                            } else {
                                selectedFragment = new HomeLoginFragment();
                            }
                    }
                    getSupportFragmentManager().beginTransaction().replace(R.id.fragment_container, selectedFragment).commit();
                    return true;
                }
            };
}