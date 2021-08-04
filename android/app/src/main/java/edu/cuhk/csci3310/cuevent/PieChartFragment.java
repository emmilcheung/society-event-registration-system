package edu.cuhk.csci3310.cuevent;

import android.app.ProgressDialog;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RelativeLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.github.mikephil.charting.charts.PieChart;
import com.github.mikephil.charting.components.Legend;
import com.github.mikephil.charting.data.PieData;
import com.github.mikephil.charting.data.PieDataSet;
import com.github.mikephil.charting.data.PieEntry;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

public class PieChartFragment extends Fragment {
    private ProgressDialog progressDialog;
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_piechart, container, false);
        progressDialog = new ProgressDialog(getActivity());
        progressDialog.setMessage("Loading");
        progressDialog.show();
        String dataType = getArguments().getString("TYPE");
        PieChart pieChart = (PieChart) view.findViewById(R.id.pieChart);
        ArrayList<PieEntry> pieEntries = new ArrayList<>();
        RequestQueue queue = Volley.newRequestQueue(view.getContext());
        String uid = MainActivity.auth.user.getUid();
        String url = MainActivity.SERVER_BASE_URI + "/api/user_events/" + uid;
        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        if (progressDialog != null) {
                            progressDialog.dismiss();
                            progressDialog = null;
                        }
                        pieChart.setVisibility(View.VISIBLE);
                        try {
                            Map<String, Integer> typeCount = new HashMap<>();
                            ArrayList<Integer> typeColors = new ArrayList<>();

                            JSONArray past_events = response.getJSONArray("past_events");
                            for (int i=0; i<past_events.length(); i++) {
                                JSONObject run = past_events.getJSONObject(i);
                                String type = "";
                                if (dataType.equals("Category")) {
                                    type = run.getString("category");
                                } else if (dataType.equals("Form")) {
                                    type = run.getString("form");
                                }
                                Integer c = typeCount.get(type);
                                typeCount.put(type, (c == null) ? 1 : c + 1);
                            }
                            for (int i=0; i<typeCount.size(); i++) {
                                typeColors.add(Color.parseColor(getRandomColor()));
                            }
                            for(String t: typeCount.keySet()){
                                pieEntries.add(new PieEntry(typeCount.get(t).floatValue(), t));
                            }
                            // Collecting the entries with label name
                            PieDataSet pieDataSet = new PieDataSet(pieEntries, dataType);
                            // Setting text size of the value
                            pieDataSet.setValueTextSize(20f);
                            // Providing color list for coloring different entries
                            pieDataSet.setColors(typeColors);
                            // Grouping the data set from entry to chart
                            PieData pieData = new PieData(pieDataSet);
                            // Showing the value of the entries, default true if not set
                            pieData.setDrawValues(true);
                            pieChart.setData(pieData);
                            pieChart.setCenterText(dataType);
                            pieChart.setCenterTextColor(Color.BLACK);
                            pieChart.setCenterTextSize(30f);
                            pieChart.setEntryLabelTextSize(20f);
                            pieChart.getDescription().setEnabled(false);
                            pieChart.getLegend().setForm(Legend.LegendForm.CIRCLE);
                            pieChart.invalidate();
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.e("Statistic", error.toString());
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
        return view;
    }

    public String getRandomColor() {
        Random obj = new Random();
        int rand_num = obj.nextInt(0xffffff + 1);
        return String.format("#%06x", rand_num);
    }
}
