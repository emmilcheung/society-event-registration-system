package edu.cuhk.csci3310.cuevent;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.AsyncTask;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.recyclerview.widget.RecyclerView;

import com.squareup.picasso.Picasso;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.LinkedList;

public class AssociationListAdapter extends RecyclerView.Adapter<AssociationListAdapter.AssociationViewHolder> {
    private Context context;
    private LayoutInflater mInflater;

    private final LinkedList<HomeAssociationItem> mAssociationList;

    class AssociationViewHolder extends RecyclerView.ViewHolder {
        TextView titleTextView, websiteTextView, emailTextView, phoneTextView;
        ImageView associationImageView;
        ConstraintLayout associationContainer;

        final AssociationListAdapter mAdapter;

        public AssociationViewHolder(View itemView, AssociationListAdapter adapter) {
            super(itemView);
            /* Initialize view*/
            associationContainer = itemView.findViewById(R.id.associationContainer);
            titleTextView = itemView.findViewById(R.id.associationTitle);
            websiteTextView = itemView.findViewById(R.id.associationWebsite);
            emailTextView = itemView.findViewById(R.id.associationEmail);
            phoneTextView = itemView.findViewById(R.id.associationPhone);
            associationImageView = itemView.findViewById(R.id.fragmentAssociationImage);
            this.mAdapter = adapter;

            associationContainer.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    Intent associationIntent = new Intent(v.getContext(), AssociationActivity.class);
                    int position = Integer.parseInt(associationContainer.getTag().toString());
                    associationIntent.putExtra("ASSOCIATION_ID", mAssociationList.get(position).getAssociationId());
                    v.getContext().startActivity(associationIntent);
                }
            });
        }
    }

    public AssociationListAdapter(Context context, LinkedList<HomeAssociationItem> associationList) {
        mInflater = LayoutInflater.from(context);
        this.mAssociationList = associationList;
    }

    @NonNull
    @Override
    public AssociationViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        this.context = parent.getContext();
        View mItemView = mInflater.inflate(R.layout.associationlist_item, parent, false);
        return new AssociationViewHolder(mItemView, this);
    }

    @Override
    public void onBindViewHolder(@NonNull AssociationViewHolder holder, int position) {
        HomeAssociationItem association = mAssociationList.get(position);
        String mTitle = association.getAssociationTitle();
        String mWebsite = association.getAssociationWebsite();
        String mEmail = association.getAssociationEmail();
        String mPhone = association.getAssociationPhone();
        String mImagePath = association.getAssociationImagePath();
//        String imageurl = "http://192.168.1.214:5000/img/"+mImagePath;
        String imageurl = MainActivity.SERVER_BASE_URI + "/img/"+mImagePath;
        holder.titleTextView.setText(mTitle);
        holder.websiteTextView.setText(mWebsite);
        holder.emailTextView.setText(mEmail);
        holder.phoneTextView.setText(mPhone);

        holder.associationContainer.setTag(position);

        if (!mImagePath.equals("") && !mImagePath.equals("null")){
            Picasso.get()
                    .load(imageurl)
                    .into(holder.associationImageView);
//            LoadImage loadImage = new LoadImage(holder.associationImageView);
//            loadImage.execute(imageurl);
        }
    }

    public long getItemId(int position) {
        return position;
    }

    @Override
    public int getItemCount() {
        return mAssociationList.size();
    }

}
