package edu.cuhk.csci3310.cuevent;

import android.content.Context;
import android.content.Intent;
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

import java.util.LinkedList;

public class NotificationListAdapter extends RecyclerView.Adapter<NotificationListAdapter.NotificationViewHolder> {
    private Context context;
    private LayoutInflater mInflater;

    private final LinkedList<NotificationItem> mNotificationItemsList;

    class NotificationViewHolder extends RecyclerView.ViewHolder {
        ConstraintLayout notificationContainer;
        ImageView imageView;
        TextView titleTextView, detailsTextView;
        final NotificationListAdapter mAdapter;

        public NotificationViewHolder(View itemView, NotificationListAdapter adapter) {
            super(itemView);
            /* Initialize view */
            // Todo: set onClickListener
            notificationContainer = itemView.findViewById(R.id.notificationContainer);
            titleTextView = itemView.findViewById(R.id.notificationTitle);
            detailsTextView = itemView.findViewById(R.id.notificationDetails);
            imageView = itemView.findViewById(R.id.notificationImage);
            this.mAdapter = adapter;

            notificationContainer.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    int position = Integer.parseInt(notificationContainer.getTag().toString());
                    if(mNotificationItemsList.get(position).getType().equals("event")) {
                        Intent eventIntent = new Intent(v.getContext(), EventActivity.class);
                        eventIntent.putExtra("EVENT_ID", mNotificationItemsList.get(position).getEventId());
                        eventIntent.putExtra("RUN_ID", "null");
                        v.getContext().startActivity(eventIntent);
                    }
                    else if(mNotificationItemsList.get(position).getType().equals("survey")){
                        Intent surveyWebViewIntent = new Intent(v.getContext(), SurveyWebViewActivity.class);
                        surveyWebViewIntent.putExtra("URL", mNotificationItemsList.get(position).getRedirectUrl());
                        v.getContext().startActivity(surveyWebViewIntent);
                    }
                }
            });
        }
    }

    public NotificationListAdapter(Context context, LinkedList<NotificationItem> notificationItemsList) {
        mInflater = LayoutInflater.from(context);
        this.mNotificationItemsList = notificationItemsList;
    }

    @NonNull
    @Override
    public NotificationViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        this.context = parent.getContext();
        View mItemView = mInflater.inflate(R.layout.notificationlist_item, parent, false);
        return new NotificationViewHolder(mItemView, this);
    }

    @Override
    public void onBindViewHolder(@NonNull NotificationViewHolder holder, int position) {
        // Todo: Bind data from notification list
        NotificationItem notificationItem = mNotificationItemsList.get(position);
        String mTitle = notificationItem.getTitle();
        String mDetails = notificationItem.getBody();
        String mImagePath = notificationItem.getImagePath();
        holder.notificationContainer.setTag(position);
        holder.titleTextView.setText(mTitle);
        holder.detailsTextView.setText(mDetails);
//        if(!mImagePath.equals("") && !mImagePath.equals("null")){
            Log.e("imagepath", mImagePath);
            Picasso.get()
                    .load(mImagePath)
                    .into(holder.imageView);
//        }
    }

    @Override
    public long getItemId(int position) {
        return super.getItemId(position);
    }

    @Override
    public int getItemCount() {
        return mNotificationItemsList.size();
    }
}
