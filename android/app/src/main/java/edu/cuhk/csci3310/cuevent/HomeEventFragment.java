package edu.cuhk.csci3310.cuevent;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.ProgressBar;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.LinkedList;

public class HomeEventFragment extends Fragment {
    private LinearLayout eventContainer;
    private RecyclerView mRecyclerView;
    private EventListAdapter mAdapter;
    private ProgressBar progressBar;

    private LinkedList<HomeEventItem> mEventItemsList = new LinkedList<>();

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        progressBar = view.findViewById(R.id.progressBar);
        mRecyclerView = view.findViewById(R.id.homeEventRecyclerView);
        // Instantiate the request queue
        RequestQueue queue = Volley.newRequestQueue(view.getContext());
//        String url = "http://192.168.1.214:5000/api/search?ca=";
        String url =  MainActivity.SERVER_BASE_URI + "/api/search?ca=";
        JsonArrayRequest jsonArrayRequest = new JsonArrayRequest(Request.Method.GET, url, null,
            new Response.Listener<JSONArray>() {
                @Override
                public void onResponse(JSONArray response) {
                    progressBar.setVisibility(View.INVISIBLE);
                    mRecyclerView.setVisibility(View.VISIBLE);
                    try {
                        for (int i=0; i<response.length(); i++) {
                            JSONObject event = response.getJSONObject(i);
                            int eventId = event.getInt("event_id");
                            String eventTitle = event.getString("title");
                            String eventHost = event.getString("association_title");
                            String eventStartTime = event.getString("start_time");
                            String eventImagePath = event.getString("event_profile_image");
                            String eventVenue = event.getString("venue");
                            String runId = event.getString("run_id");
                            int online = event.getInt("online");
                            mEventItemsList.addLast(new HomeEventItem(eventId, eventTitle, eventHost,
                                    eventVenue, eventImagePath, eventStartTime, online, runId));
                            mAdapter = new EventListAdapter(view.getContext(), mEventItemsList, false);
                            mRecyclerView.setAdapter(mAdapter);
                            mRecyclerView.setLayoutManager(new LinearLayoutManager(view.getContext()));
                        }
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.e("Main Activity (HomeEventFragment)", error.toString());
            }
        });

        queue.add(jsonArrayRequest);
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_home_event, container, false);
    }
}
