package edu.cuhk.csci3310.cuevent;

import android.app.ProgressDialog;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ScrollView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.squareup.picasso.Picasso;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class ProfileFragment extends Fragment {
    ScrollView profileContainer;
    TextView userNameTextView, majorTextTextView, collegeTextTextView, profileIntroductionTextView;
    Button upcomingEventButton, pastEventButton, myAssociationButton, statisticButton;
    ImageView profileImageView;
    ProgressDialog progressDialog;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        getActivity().setTitle("CU Event");
        View view = inflater.inflate(R.layout.fragment_profile, container, false);
        profileContainer = view.findViewById(R.id.profileContainer);
        userNameTextView = view.findViewById(R.id.userName);
        majorTextTextView= view.findViewById(R.id.majorText);
        collegeTextTextView= view.findViewById(R.id.collegeText);
        profileIntroductionTextView= view.findViewById(R.id.profileIntroduction);
        upcomingEventButton = view.findViewById(R.id.upcomingEventButton);
        pastEventButton = view.findViewById(R.id.pastEventButton);
        myAssociationButton = view.findViewById(R.id.myAssociationButton);
        statisticButton = view.findViewById(R.id.statisticButton);
        profileImageView = view.findViewById(R.id.profileImage);
        progressDialog = new ProgressDialog(getActivity());
        progressDialog.setMessage("Loading");
        progressDialog.show();
        getUserProfile((Context) getActivity());
        upcomingEventButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                getActivity().setTitle("Upcoming Event");
                Fragment fragment = new ProfileDataFragment();
                Bundle bundle = new Bundle();
                bundle.putString("DATA", "UPCOMING_EVENT");
                bundle.putString("UID", MainActivity.auth.user.getUid());
                fragment.setArguments(bundle);
                replaceFragment(fragment);
            }
        });

        pastEventButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                getActivity().setTitle("Past Event");
                Fragment fragment = new ProfileDataFragment();
                Bundle bundle = new Bundle();
                bundle.putString("DATA", "PAST_EVENT");
                bundle.putString("UID", MainActivity.auth.user.getUid());
                fragment.setArguments(bundle);
                replaceFragment(fragment);
            }
        });

        myAssociationButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                getActivity().setTitle("My Associations");
                Fragment fragment = new ProfileDataFragment();
                Bundle bundle = new Bundle();
                bundle.putString("DATA", "MY_ASSOCIATIONS");
                bundle.putString("UID", MainActivity.auth.user.getUid());
                fragment.setArguments(bundle);
                replaceFragment(fragment);
            }
        });

        statisticButton.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View v) {
                getActivity().setTitle("Statistic");
                Fragment fragment = new StatisticFragment();
                Bundle bundle = new Bundle();
                bundle.putString("UID", MainActivity.auth.user.getUid());
                fragment.setArguments(bundle);
                replaceFragment(fragment);
            }
        });

        return view;
    }

    public void replaceFragment(Fragment someFragment) {
        FragmentTransaction transaction = getFragmentManager().beginTransaction();
        transaction.replace(R.id.fragment_container, someFragment);
        transaction.addToBackStack(null);
        transaction.commit();
    }

    private void getUserProfile(Context context){
        String url = MainActivity.SERVER_BASE_URI + "/api/user_profile/" + MainActivity.auth.user.getUid();
        RequestQueue queue = Volley.newRequestQueue(context);
        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        if (progressDialog != null) {
                            progressDialog.dismiss();
                            progressDialog = null;
                        }
                        profileContainer.setVisibility(View.VISIBLE);
                        try {
                            JSONObject profileObj = response.getJSONObject("profile");
                            String lastName = profileObj.getString("last_name");
                            String firstName = profileObj.getString("first_name");
                            String major = profileObj.getString("major");
                            String college = profileObj.getString("college");
                            String introduction = profileObj.getString("introduction");
                            String profileImagePath = profileObj.getString("profile_image");
                            userNameTextView.setText(firstName + ", "+ lastName);
                            majorTextTextView.setText("Major: "+major);
                            collegeTextTextView.setText("College: "+college);
                            profileIntroductionTextView.setText(introduction);
                            if (!profileImagePath.equals("") && !profileImagePath.equals("null")) {
                                Picasso.get()
                                        .load(MainActivity.SERVER_BASE_URI + "/img/" + profileImagePath)
                                        .into(profileImageView);
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.e("EventActivity", error.toString());
            }

        }){
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                Map<String, String> params = new HashMap<String, String>();
                params.put("x-access-token", ((MainActivity) context).auth.user.getFirebaseToken());

                return params;
            }
        };
        queue.add(jsonObjectRequest);
    }
}
