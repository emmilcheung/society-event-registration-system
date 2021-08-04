package edu.cuhk.csci3310.cuevent;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.android.volley.AuthFailureError;
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

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

public class ProfileDataFragment extends Fragment {
    private String dataType, uid;
    private RecyclerView mRecyclerView;
    private EventListAdapter mEventAdapter;
    private AssociationListAdapter mAssociationAdapter;
    private ProgressBar progressBar;
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_profile_data, container, false);
        mRecyclerView = view.findViewById(R.id.profileDataRecyclerView);
        progressBar = view.findViewById(R.id.progressBar);
        dataType = getArguments().getString("DATA");
        uid = getArguments().getString("UID");
        RequestQueue queue = Volley.newRequestQueue(view.getContext());
        if (dataType.equals("UPCOMING_EVENT") || dataType.equals("PAST_EVENT")) {
            LinkedList<HomeEventItem> mEventItemsList = new LinkedList<>();
            String url = MainActivity.SERVER_BASE_URI + "/api/user_events/" + uid;
            JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                    new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            progressBar.setVisibility(View.INVISIBLE);
                            mRecyclerView.setVisibility(View.VISIBLE);
                            try {
                                //Log.d("Profile Data Activity", response.toString());
                                JSONArray events;
                                if (dataType.equals("UPCOMING_EVENT")) {
                                    events = response.getJSONArray("future_events");
                                } else {
                                    events = response.getJSONArray("past_events");
                                }
                                for (int i=0; i<events.length(); i++) {
                                    JSONObject run = events.getJSONObject(i);
                                    int eventId = run.getInt("event_id");
                                    String eventTitle = run.getString("title");
                                    String eventHost = run.getString("association_title");
                                    String eventStartTime = run.getString("start_time");
                                    String eventImagePath = run.getString("event_profile_image");
                                    String eventVenue = run.getString("venue");
                                    String runId = run.getString("run_id");
                                    int online = run.getInt("online");
                                    mEventItemsList.addLast(new HomeEventItem(eventId, eventTitle, eventHost,
                                            eventVenue, eventImagePath, eventStartTime, online, runId));
                                }
                                mEventAdapter = new EventListAdapter(view.getContext(), mEventItemsList, dataType.equals("UPCOMING_EVENT"));
                                mRecyclerView.setAdapter(mEventAdapter);
                                mRecyclerView.setLayoutManager(new LinearLayoutManager(view.getContext()));
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }
                        }
                    }, new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    Log.e("Profile Data Activity", error.toString());
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
        } else if (dataType.equals("MY_ASSOCIATIONS")) {
            LinkedList<HomeAssociationItem> mAssociationItemList = new LinkedList<>();
            String url = MainActivity.SERVER_BASE_URI + "/api/user_associations";
            JsonArrayRequest jsonArrayRequest = new JsonArrayRequest(Request.Method.GET, url, null,
                    new Response.Listener<JSONArray>() {
                        @Override
                        public void onResponse(JSONArray response) {
                            progressBar.setVisibility(View.INVISIBLE);
                            mRecyclerView.setVisibility(View.VISIBLE);
                            try {
                                for (int i=0; i<response.length(); i++){
                                    JSONObject association = response.getJSONObject(i);
                                    String associationId = association.getString("association_id");
                                    String associationTitle = association.getString("title");
                                    String associationWebsite = association.getString("website");
                                    String associationEmail = association.getString("email");
                                    String associationPhone = association.getString("phone_no");
                                    String associationImagePath = association.getString("profile_image");
                                    String associationDesc = association.getString("description");
                                    mAssociationItemList.addLast(new HomeAssociationItem(associationId,
                                            associationTitle, associationWebsite, associationEmail,
                                            associationPhone, associationDesc, associationImagePath));
                                }
                                mAssociationAdapter = new AssociationListAdapter(view.getContext(), mAssociationItemList);
                                mRecyclerView.setAdapter(mAssociationAdapter);
                                mRecyclerView.setLayoutManager(new LinearLayoutManager(view.getContext()));
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }
                        }
                    }, new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    Log.e("Profile Data Activity", error.toString());
                }
            }){
                @Override
                public Map<String, String> getHeaders() throws AuthFailureError {
                    Map<String, String> params = new HashMap<String, String>();
                    params.put("x-access-token", MainActivity.auth.user.getFirebaseToken());

                    return params;
                }
            };
            queue.add(jsonArrayRequest);
        }
        return view;
    }
}
