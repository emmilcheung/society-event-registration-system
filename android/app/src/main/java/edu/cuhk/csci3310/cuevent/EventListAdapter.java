package edu.cuhk.csci3310.cuevent;

import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.view.ContextMenu;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.recyclerview.widget.RecyclerView;

import com.squareup.picasso.Picasso;

import java.util.LinkedList;

public class EventListAdapter extends RecyclerView.Adapter<EventListAdapter.EventViewHolder> {
    private Context context;
    private LayoutInflater mInflater;

    private final LinkedList<HomeEventItem> mEventItemsList;
    private boolean isAttend;

    class EventViewHolder extends RecyclerView.ViewHolder {
        TextView titleTextView, timeTextView, venueTextView, hostTextView;
        ImageView profileImageView;
        ConstraintLayout eventContainer;

        final EventListAdapter mAdapter;

        public EventViewHolder(View itemView, EventListAdapter adapter) {
            super(itemView);
            /* Initialize view */
            eventContainer = itemView.findViewById(R.id.eventContainer);
            titleTextView = itemView.findViewById(R.id.eventTitle);
            timeTextView = itemView.findViewById(R.id.eventTime);
            venueTextView = itemView.findViewById(R.id.eventPlace);
            hostTextView = itemView.findViewById(R.id.eventHost);
            profileImageView = itemView.findViewById(R.id.fragmentEventImage);
            this.mAdapter = adapter;

            eventContainer.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    Intent eventIntent = new Intent(v.getContext(), EventActivity.class);
                    int position = Integer.parseInt(eventContainer.getTag().toString());
                    eventIntent.putExtra("EVENT_ID", Integer.toString(mEventItemsList.get(position).getEventId()));
                    eventIntent.putExtra("RUN_ID", mEventItemsList.get(position).getRunId());
                    v.getContext().startActivity(eventIntent);
                }
            });

            eventContainer.setOnCreateContextMenuListener(new View.OnCreateContextMenuListener() {
                @Override
                public void onCreateContextMenu(ContextMenu menu, View v, ContextMenu.ContextMenuInfo menuInfo) {
                    int position = Integer.parseInt(eventContainer.getTag().toString());
                    if (isAttend && !mEventItemsList.get(position).isOnline()) {
                        menu.add("ticket").setOnMenuItemClickListener(new MenuItem.OnMenuItemClickListener() {
                            @Override
                            public boolean onMenuItemClick(MenuItem item) {
                                Intent ticketIntent = new Intent(v.getContext(), EventTicketActivity.class);
                                ticketIntent.putExtra("EVENT_ID", Integer.toString(mEventItemsList.get(position).getEventId()));
                                ticketIntent.putExtra("RUN_ID", mEventItemsList.get(position).getRunId());
                                v.getContext().startActivity(ticketIntent);
                                return true;
                            }
                        });
                    }
                }
            });
        }

    }

    public EventListAdapter(Context context, LinkedList<HomeEventItem> eventItemList, boolean isAttend) {
        mInflater = LayoutInflater.from(context);
        this.mEventItemsList = eventItemList;
        this.isAttend = isAttend;
    }

    @NonNull
    @Override
    public EventViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        this.context = parent.getContext();
        View mItemView = mInflater.inflate(R.layout.eventlist_item, parent, false);
        return new EventViewHolder(mItemView, this);
    }

    @Override
    public void onBindViewHolder(@NonNull EventViewHolder holder, int position) {
        HomeEventItem eventItem = mEventItemsList.get(position);
        String mTitle = eventItem.getEventTitle();
        String mHost = eventItem.getEventHost();
        String mVenue = eventItem.getEventVenue();
        String mImagePath = eventItem.getEventImagePath();
        String mStartTime = eventItem.getEventStartTime();
//        String imageurl = "http://192.168.1.214:5000/img/"+mImagePath;
        String imageurl = MainActivity.SERVER_BASE_URI + "/img/" + mImagePath;

        holder.eventContainer.setTag(position);
        holder.titleTextView.setText(mTitle);
        holder.hostTextView.setText("Host: " + mHost);
        holder.timeTextView.setText(mStartTime);
        if (eventItem.isOnline()) {
            holder.venueTextView.setText("Online");
        } else {
            holder.venueTextView.setText(mVenue);
        }
        if (!mImagePath.equals("") && !mImagePath.equals("null")) {
            Picasso.get()
                    .load(imageurl)
                    .into(holder.profileImageView);
//            LoadImage loadImage = new LoadImage(holder.profileImageView);
//            loadImage.execute(imageurl);
        }
    }

    @Override
    public long getItemId(int position) {
        return super.getItemId(position);
    }

    @Override
    public int getItemCount() {
        return mEventItemsList.size();
    }
}
