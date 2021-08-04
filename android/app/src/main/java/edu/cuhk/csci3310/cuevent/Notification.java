package edu.cuhk.csci3310.cuevent;

import java.util.LinkedList;

public class Notification {

    public LinkedList<NotificationItem> notificationItems;
    private int offset = 0;

    public Notification(){
        this.notificationItems = new LinkedList<NotificationItem>();
    }

    public LinkedList<NotificationItem> getNotificationItems() {
        return notificationItems;
    }

    public void setNotificationItems(LinkedList<NotificationItem> notificationItems) {
        this.notificationItems = notificationItems;
    }

    public int getOffset() {
        return offset;
    }

    public void setOffset(int offset) {
        this.offset = offset;
    }
}
