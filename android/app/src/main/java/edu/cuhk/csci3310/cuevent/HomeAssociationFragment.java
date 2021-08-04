package edu.cuhk.csci3310.cuevent;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.android.volley.DefaultRetryPolicy;
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

public class HomeAssociationFragment extends Fragment {
    private LinearLayout associationContainer;
    private RecyclerView mRecyclerView;
    private AssociationListAdapter mAdapter;

    private LinkedList<HomeAssociationItem> mAssociationItemList = new LinkedList<>();

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        // Instantiate the request queue
        RequestQueue queue = Volley.newRequestQueue(view.getContext());
//        String url = "http://192.168.1.214:5000/api/search?as=";
        String url = MainActivity.SERVER_BASE_URI + "/api/search?as=";
        JsonArrayRequest jsonArrayRequest = new JsonArrayRequest(Request.Method.GET, url, null,
                new Response.Listener<JSONArray>() {
                    @Override
                    public void onResponse(JSONArray response) {
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
                            mRecyclerView = view.findViewById(R.id.homeAssociationRecyclerView);
                            mAdapter = new AssociationListAdapter(view.getContext(), mAssociationItemList);
                            mRecyclerView.setAdapter(mAdapter);
                            mRecyclerView.setLayoutManager(new LinearLayoutManager(view.getContext()));
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.e("Main Activity(HomeAssociationFragment)", error.toString());
            }
        });
        jsonArrayRequest.setRetryPolicy(new DefaultRetryPolicy(5000,
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        queue.add(jsonArrayRequest);


    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_home_association, container, false);
    }
}
