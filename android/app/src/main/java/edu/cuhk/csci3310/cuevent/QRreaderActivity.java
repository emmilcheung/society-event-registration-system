package edu.cuhk.csci3310.cuevent;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import android.Manifest;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.util.SparseArray;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.gms.vision.CameraSource;
import com.google.android.gms.vision.Detector;
import com.google.android.gms.vision.barcode.Barcode;
import com.google.android.gms.vision.barcode.BarcodeDetector;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

public class QRreaderActivity extends AppCompatActivity {
    SurfaceView surfaceView;
    TextView textView;
    Button nextBtn;
    CameraSource cameraSource;
    BarcodeDetector barcodeDetector;

    String runId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_qr_reader);

        getPermissionsCamera();

        surfaceView = (SurfaceView) findViewById(R.id.surface_view);
        textView = (TextView) findViewById(R.id.card_id);
        nextBtn = (Button) findViewById(R.id.next_btn);
        Intent intent = getIntent();
        runId = intent.getStringExtra("RUN_ID");

        barcodeDetector = new BarcodeDetector.Builder(this)
                .setBarcodeFormats(Barcode.QR_CODE).build();
        cameraSource = new CameraSource.Builder(this, barcodeDetector).setAutoFocusEnabled(true)
                .setRequestedPreviewSize(320, 320).build();

        nextBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (ActivityCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.CAMERA)
                        != PackageManager.PERMISSION_GRANTED)
                    return;
                try {
                    textView.setText("Please Scan");
                    textView.setTextColor(Color.parseColor("#80BEBE"));
                    cameraSource.start(surfaceView.getHolder());
                } catch (IOException e) {
                    e.printStackTrace();
                }

            }
        });


        surfaceView.getHolder().addCallback(new SurfaceHolder.Callback() {
            @Override
            public void surfaceCreated(@NonNull SurfaceHolder surfaceHolder) {
                if (ActivityCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.CAMERA)
                        != PackageManager.PERMISSION_GRANTED)
                    return;
                try {
                    cameraSource.start(surfaceHolder);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void surfaceChanged(@NonNull SurfaceHolder holder, int format, int width, int height) {

            }

            @Override
            public void surfaceDestroyed(@NonNull SurfaceHolder holder) {
                cameraSource.release();
            }
        });
        barcodeDetector.setProcessor(new Detector.Processor<Barcode>() {

            @Override
            public void release() {

            }

            @Override
            public void receiveDetections(Detector.Detections<Barcode> detections) {
                final SparseArray<Barcode> qrCodes = detections.getDetectedItems();
                if (qrCodes.size() != 0) {
                    textView.post(new Runnable() {
                        @Override
                        public void run() {
                            cameraSource.stop();
                            nextBtn.setVisibility(View.VISIBLE);
//                            try {
//                                Uri notification = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
//                                Ringtone r = RingtoneManager.getRingtone(getApplicationContext(), notification);
//                                r.play();
//                            } catch (Exception e) {
//                                e.printStackTrace();
//                            }
                            String ticket = qrCodes.valueAt(0).displayValue;
                            Log.e("qr content", ticket);
                            postTicket(ticket, runId);
                        }
                    });
                }
            }
        });
    }

    public void getPermissionsCamera() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            if (ActivityCompat.shouldShowRequestPermissionRationale(QRreaderActivity.this, Manifest.permission.CAMERA)) {
                new AlertDialog.Builder(this)
                        .setCancelable(false)
                        .setTitle("Need camera permission")
                        .setMessage("hi?")
                        .setPositiveButton("yes", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                ActivityCompat.requestPermissions(QRreaderActivity.this, new String[]{
                                        Manifest.permission.CAMERA
                                }, 1);
                            }
                        })
                        .show();
            } else {
                ActivityCompat.requestPermissions(QRreaderActivity.this, new String[]{Manifest.permission.CAMERA}, 1);
                Log.e("permit", "permit");
            }

        }
    }

    public void postTicket(String ticket, String runId) {

        RequestQueue queue = Volley.newRequestQueue(this);
        String url = MainActivity.SERVER_BASE_URI + "/api/attendance/ticket";

        JSONObject data = new JSONObject();
        try {
            data.put("runId", runId);
            data.put("ticket", ticket);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        JsonObjectRequest objectRequest = new JsonObjectRequest(Request.Method.POST, url, data, new Response.Listener<JSONObject>() {
            @Override
            public void onResponse(JSONObject response) {
                try{
                    String firstName = response.getString("first_name");
                    String lastName = response.getString("last_name");
                    textView.setText("Welcome " + lastName + " " + firstName);
                    textView.setTextColor(Color.parseColor("#00FF00"));
                } catch (JSONException e){

                }
                Log.i("response", "success\n" + response.toString());
                Toast.makeText( QRreaderActivity.this, "success", Toast.LENGTH_SHORT).show();

            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                NetworkResponse response = error.networkResponse;
                if(response.statusCode == 409) {
                    Log.e("response", "already attend");
                    textView.setText("Invalid ticket");
                    textView.setTextColor(Color.RED);
                    Toast.makeText( QRreaderActivity.this, "fail", Toast.LENGTH_SHORT).show();

                }
                error.printStackTrace();
            }

        });
        queue.add(objectRequest);
    }
}