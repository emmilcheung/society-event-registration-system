package edu.cuhk.csci3310.cuevent;

import androidx.appcompat.app.AppCompatActivity;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.core.content.ContextCompat;

import android.app.ProgressDialog;
import android.content.Intent;
import android.media.Image;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.squareup.picasso.Picasso;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

public class EventActivity extends AppCompatActivity {
    ConstraintLayout eventContainer;
    ImageView associationIconView, eventImageView;
    TextView associationNameView, eventTitleView, timeDescView, placeDescView, typeDescView,
            timeStatusView, eventDetailView;
    Button nfcButtonView, qrButtonView;
    LinearLayout viewCategoryNames;
    private String eventId;
    private String runId, associationId;
    private String userRole = "Guest";
    private LinkedList<String> runIds, dateBtns;
    private JSONObject event;
    private JSONObject formsObj;
    private JSONArray runs;
    private ProgressDialog progressDialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_event);
        eventContainer = findViewById(R.id.eventContainer);
        associationIconView = findViewById(R.id.associationIcon);
        eventImageView = findViewById(R.id.eventImage);

        associationNameView = findViewById(R.id.associationName);
        eventTitleView = findViewById(R.id.eventTitle);
        timeDescView = findViewById(R.id.timeDesc);
        timeStatusView = findViewById(R.id.timeStatus);
        placeDescView = findViewById(R.id.placeDesc);
        typeDescView = findViewById(R.id.typeDesc);
        eventDetailView = findViewById(R.id.eventDetail);
        nfcButtonView = findViewById(R.id.nfc_button);
        qrButtonView = findViewById(R.id.qr_button);

        runIds = new LinkedList<String>();
        dateBtns = new LinkedList<String>();

        progressDialog = new ProgressDialog(this);
        progressDialog.setMessage("Loading");
        progressDialog.show();

        Intent intent = getIntent();
        eventId = intent.getStringExtra("EVENT_ID");
        runId = intent.getStringExtra("RUN_ID");
//        String url = "http://192.168.1.214:5000/api/event/"+eventId;
        String url = MainActivity.SERVER_BASE_URI + "/api/event/" + eventId;


        RequestQueue queue = Volley.newRequestQueue(this);
        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        if (progressDialog != null) {
                            progressDialog.dismiss();
                            progressDialog = null;
                        }
                        eventContainer.setVisibility(View.VISIBLE);
                        try {
                            event = response.getJSONObject("event");
                            associationId = event.getString("association_id");
                            String associationName = event.getString("association_title");
                            String eventTitle = event.getString("title");
                            String eventDesc = event.getString("description");
                            String assoIconPath = event.getString("association_profile_image");
                            String eventImagePath = event.getString("profile_image");
                            int isPublic = event.getInt("is_public");

                            // set user role
                            userRole = response.getString("user");


                            // Set event info
                            associationNameView.setText(associationName);
                            eventTitleView.setText(eventTitle);
                            eventDetailView.setText(eventDesc);
                            if (isPublic == 1) {
                                typeDescView.setText("Public");
                            } else {
                                typeDescView.setText("Private");
                            }
                            // Run
                            runs = event.getJSONArray("runs");
                            if (runId.equals("null")) {
                                setDefaultRun();
                            } else {
                                setDisplayRun(runId);
                            }
                            getApplicationForm();
                            getRunIds(runs);

                            if (!assoIconPath.equals("") && !assoIconPath.equals("null")) {
                                Picasso.get()
                                        .load(MainActivity.SERVER_BASE_URI + "/img/" + assoIconPath)
                                        .into(associationIconView);
//                                LoadImage loadImage = new LoadImage(associationIconView);
//                                loadImage.execute(MainActivity.SERVER_BASE_URI+"/img/"+assoIconPath);
                            }
                            if (!eventImagePath.equals("") && !eventImagePath.equals("null")) {
                                Picasso.get()
                                        .load(MainActivity.SERVER_BASE_URI + "/img/" + eventImagePath)
                                        .into(eventImageView);
//                                LoadImage loadImage = new LoadImage(eventImageView);
//                                loadImage.execute(MainActivity.SERVER_BASE_URI+"/img/"+eventImagePath);
                            }
                            // button
                            viewCategoryNames = (LinearLayout) findViewById(R.id.viewCategoryNames);
                            buildCategoryScroll();
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                if (progressDialog != null) {
                    progressDialog.dismiss();
                    progressDialog = null;
                }
                Log.e("EventActivity", error.toString());
            }
        }) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                Map<String, String> params = new HashMap<String, String>();
                params.put("x-access-token", MainActivity.auth.user.getFirebaseToken());

                return params;
            }
        };
        queue.add(jsonObjectRequest);

        associationIconView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent associationIntent = new Intent(EventActivity.this, AssociationActivity.class);
                associationIntent.putExtra("ASSOCIATION_ID", associationId);
                startActivity(associationIntent);
            }
        });
        associationNameView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent associationIntent = new Intent(EventActivity.this, AssociationActivity.class);
                associationIntent.putExtra("ASSOCIATION_ID", associationId);
                startActivity(associationIntent);
            }
        });

        nfcButtonView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent nfcIntent = new Intent(EventActivity.this, NFCActivity.class);
                nfcIntent.putExtra("RUN_ID", runId);
                startActivity(nfcIntent);
            }
        });
        qrButtonView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent qrIntent = new Intent(EventActivity.this, QRreaderActivity.class);
                qrIntent.putExtra("RUN_ID", runId);
                startActivity(qrIntent);
            }
        });


    }

    private void buildCategoryScroll() {
        LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        layoutParams.setMargins(0, 10, 30, 10);
        for (int i = 0; i < runIds.size(); i++) {
            final Button btCategory = new Button(EventActivity.this);
            String runId = runIds.get(i);
            btCategory.setText(getRunDateButton(dateBtns.get(i)));
            btCategory.setTag(runId);
            btCategory.setTextSize(16f);
            btCategory.setAllCaps(false);
            btCategory.setBackgroundColor(ContextCompat.getColor(this, R.color.purple_200));
            btCategory.setTextColor(ContextCompat.getColor(this, android.R.color.black));
            btCategory.setLayoutParams(layoutParams);

            btCategory.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    setDisplayRun(btCategory.getTag().toString());
                }
            });
            viewCategoryNames.addView(btCategory);

        }
    }

    private void getRunIds(JSONArray runs) {
        try {
            runIds.clear();
            for (int i = 0; i < runs.length(); i++) {
                JSONObject run = runs.getJSONObject(i);
                runIds.add(run.getString("run_id"));
                dateBtns.add(run.getString("start_time"));
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void setDefaultRun() {
        try {
            JSONObject run = runs.getJSONObject(0);
            runId = run.getString("run_id");
            int online = run.getInt("online");
            int passed = run.getInt("passed");
            String eventVenue = run.getString("title");
            String startTime = run.getString("start_time");
            String endTime = run.getString("end_time");
            String latitude = run.getString("lat");
            String longitude = run.getString("lng");
            String[] tmp = endTime.split(" ");
            timeDescView.setText(startTime + " to " + tmp[1]);
            if (online == 0) {
                TextView viewInMap = findViewById(R.id.viewInMap);
                placeDescView.setText(eventVenue);
                viewInMap.setVisibility(View.VISIBLE);
                viewInMap.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        Intent mapIntent = new Intent(EventActivity.this, MapsActivity.class);
                        mapIntent.putExtra("LATITUDE", latitude);
                        mapIntent.putExtra("LONGITUDE", longitude);
                        startActivity(mapIntent);
                    }
                });
                if(userRole.equals("Admin") && formsObj != null && formsObj.has(runId)){
                    nfcButtonView.setVisibility(View.VISIBLE);
                    qrButtonView.setVisibility(View.VISIBLE);
                }
                else{
                    nfcButtonView.setVisibility(View.INVISIBLE);
                    qrButtonView.setVisibility(View.INVISIBLE);
                }
            } else {
                placeDescView.setText("Online");
                findViewById(R.id.viewInMap).setVisibility(View.INVISIBLE);
            }
            if (passed == 0) {
                timeStatusView.setText("Scheduled");
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void setDisplayRun(String runId) {
        try {
            this.runId = runId;
            for (int i = 0; i < runs.length(); i++) {
                JSONObject run = runs.getJSONObject(i);
                if (runId.equals(run.getString("run_id"))) {
                    int online = run.getInt("online");
                    int passed = run.getInt("passed");
                    String eventVenue = run.getString("title");
                    String startTime = run.getString("start_time");
                    String endTime = run.getString("end_time");
                    String latitude = run.getString("lat");
                    String longitude = run.getString("lng");
                    String[] tmp = endTime.split(" ");
                    timeDescView.setText(startTime + " to " + tmp[1]);
                    Log.e("time", startTime + " to " + tmp[1]);
                    if (online == 0) {
                        TextView viewInMap = findViewById(R.id.viewInMap);
                        placeDescView.setText(eventVenue);
                        viewInMap.setVisibility(View.VISIBLE);
                        viewInMap.setOnClickListener(new View.OnClickListener() {
                            @Override
                            public void onClick(View v) {
                                Intent mapIntent = new Intent(EventActivity.this, MapsActivity.class);
                                mapIntent.putExtra("LATITUDE", latitude);
                                mapIntent.putExtra("LONGITUDE", longitude);
                                startActivity(mapIntent);
                            }
                        });
                        // set the admin buttons visable if it has application form
                        if(userRole.equals("Admin") && formsObj != null && formsObj.has(runId)){
                            nfcButtonView.setVisibility(View.VISIBLE);
                            qrButtonView.setVisibility(View.VISIBLE);
                        }
                        else{
                            nfcButtonView.setVisibility(View.INVISIBLE);
                            qrButtonView.setVisibility(View.INVISIBLE);
                        }
                    } else {
                        placeDescView.setText("Online");
                        findViewById(R.id.viewInMap).setVisibility(View.INVISIBLE);
                        nfcButtonView.setVisibility(View.INVISIBLE);
                        qrButtonView.setVisibility(View.INVISIBLE);
                    }
                    if (passed == 0) {
                        timeStatusView.setText("Scheduled");
                    }
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private String getRunDateButton(String startTimeStr) {
        String str = "";
        try {
            String[] month = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
            String[] weekDays = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};
            Calendar startTime = Calendar.getInstance();
            startTime.setTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").parse(startTimeStr));
            // Date date1=new SimpleDateFormat("dd/MM/yyyy").parse(sDate1);
            str = weekDays[startTime.get(Calendar.DAY_OF_WEEK)] + "," + startTime.get(Calendar.DATE) + " " + month[startTime.get(Calendar.MONTH)];
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return str;
    }

    private void getApplicationForm(){
        String url = MainActivity.SERVER_BASE_URI + "/api/application_form/" + eventId;
        RequestQueue queue = Volley.newRequestQueue(this);
        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                          formsObj = response.getJSONObject("forms");
                            if(userRole.equals("Admin") && formsObj.has(runId)){
                                nfcButtonView.setVisibility(View.VISIBLE);
                                qrButtonView.setVisibility(View.VISIBLE);
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error){}
        }) {
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