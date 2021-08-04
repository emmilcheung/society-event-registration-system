package edu.cuhk.csci3310.cuevent;

import androidx.appcompat.app.AppCompatActivity;
import androidx.constraintlayout.widget.ConstraintLayout;

import android.app.ProgressDialog;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.squareup.picasso.Picasso;

import org.json.JSONException;
import org.json.JSONObject;

public class AssociationActivity extends AppCompatActivity {
    ConstraintLayout associationContainer;
    TextView titleTextView, descTextView;
    ImageView profileImageView;
    private String title, description, imagePath;
    private ProgressDialog progressDialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_association);
        Intent intent = getIntent();
        String id = intent.getStringExtra("ASSOCIATION_ID");
//        String url = "http://192.168.1.214:5000/api/association/"+id;
        String url = MainActivity.SERVER_BASE_URI + "/api/association/"+id;

        titleTextView = findViewById(R.id.associationName);
        descTextView = findViewById(R.id.associationDescription);
        profileImageView = findViewById(R.id.associationImage);
        associationContainer = findViewById(R.id.associationContainer);

        progressDialog = new ProgressDialog(this);
        progressDialog.setMessage("Loading");
        progressDialog.show();


        RequestQueue queue = Volley.newRequestQueue(this);
        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        if (progressDialog != null) {
                            progressDialog.dismiss();
                            progressDialog = null;
                        }
                        associationContainer.setVisibility(View.VISIBLE);
                        try {
                            JSONObject association = response.getJSONObject("association");
                            title = association.getString("title");
                            description = association.getString("description");
                            imagePath = association.getString("profile_image");

                            // Set association info
                            titleTextView.setText(title);
                            descTextView.setText(description);
//                            String imageurl = "http://192.168.1.214:5000/img/"+imagePath;
                            String imageurl = MainActivity.SERVER_BASE_URI + "/img/"+imagePath;
                            if (!imagePath.equals("") && !imagePath.equals("null")){
                                Picasso.get()
                                        .load(imageurl)
                                        .into(profileImageView);
//                                LoadImage loadImage = new LoadImage(profileImageView);
//                                loadImage.execute(imageurl);
                            }
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
                Log.e("AssociationActivity", error.toString());
            }
        });
        queue.add(jsonObjectRequest);




    }
}