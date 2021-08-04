package edu.cuhk.csci3310.cuevent;

import androidx.appcompat.app.AppCompatActivity;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

public class NFCActivity extends AppCompatActivity {


    NfcAdapter nfcAdapter;
    Context context;

    String runId;

    private int mStatusCode = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_nfc);
        Intent intent = getIntent();
        runId = intent.getStringExtra("RUN_ID");

        nfcAdapter = NfcAdapter.getDefaultAdapter(this);
        if(nfcAdapter!=null && nfcAdapter.isEnabled()){
            Toast.makeText(this, "Nfc available", Toast.LENGTH_LONG).show();
        }
        else{
            Toast.makeText(this, "Nfc not available", Toast.LENGTH_LONG).show();
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
//        Toast toast = Toast.makeText(this, "NFc intent received", Toast.LENGTH_SHORT);
//        toast.show();

        if (intent.getAction().equals(NfcAdapter.ACTION_TAG_DISCOVERED)) {
            String scanNfc = ByteArrayToHexString(intent.getByteArrayExtra(NfcAdapter.EXTRA_ID));
            Log.e("card ID", scanNfc);
            testGetRequest( scanNfc , runId);

            Tag tag = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
            Log.e("tag", tag.getTechList()[1]);

        }
    }

    @Override
    public void onResume() {
        Intent intent = new Intent(this, NFCActivity.class);
        intent.addFlags(Intent.FLAG_RECEIVER_REPLACE_PENDING);

        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, 0);
        IntentFilter[] intentFilters = new IntentFilter[]{};
        if(nfcAdapter!=null && nfcAdapter.isEnabled()){
            nfcAdapter.enableForegroundDispatch(this, pendingIntent, intentFilters, null);
        }
        else{
            finish();
        }

        super.onResume();

    }

    @Override
    protected void onPause(){
        IntentFilter[] intentFilters = new IntentFilter[]{};
        if(nfcAdapter!=null && nfcAdapter.isEnabled()){
            nfcAdapter.disableForegroundDispatch(this);
        }
        super.onPause();
    }

    public static String ByteArrayToHexString(byte[] bytes) {
        final char[] hexArray = {'0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'};
        char[] hexChars = new char[bytes.length * 2]; // Each byte has two hex characters (nibbles)
        int v;
        for (int j = 0; j < bytes.length; j++) {
            v = bytes[j] & 0xFF; // Cast bytes[j] to int, treating as unsigned value
            hexChars[j * 2] = hexArray[v >>> 4]; // Select hex character from upper nibble
            hexChars[j * 2 + 1] = hexArray[v & 0x0F]; // Select hex character from lower nibble
        }
        return new String(hexChars);
    }

    public void testGetRequest(String cid, String runId) {
        RequestQueue queue = Volley.newRequestQueue(this);
        String url = MainActivity.SERVER_BASE_URI + "/api/attendance/nfc";
        JSONObject data = new JSONObject();
        try {
            data.put("runId", runId);
            data.put("cid", cid);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        JsonObjectRequest objectRequest = new JsonObjectRequest(Request.Method.POST, url, data, new Response.Listener<JSONObject>() {
            @Override
            public void onResponse(JSONObject response) {
                Log.i("response", "success\n" + response.toString());
                Toast.makeText(NFCActivity .this, "success", Toast.LENGTH_SHORT).show();
                Intent intent = new Intent(NFCActivity.this, NFCSplashScreenActivity.class);
                intent.putExtra("RESULT", true);
                startActivity(intent);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                NetworkResponse response = error.networkResponse;
                if(response.statusCode == 409) {
                    Log.e("response", "unsuccessful");
                    Toast.makeText(NFCActivity.this, "fail", Toast.LENGTH_SHORT).show();
                    Intent intent = new Intent(NFCActivity.this, NFCSplashScreenActivity.class);
                    intent.putExtra("RESULT", false);
                    startActivity(intent);
                }
                error.printStackTrace();
            }

        });
        queue.add(objectRequest);
    }
}