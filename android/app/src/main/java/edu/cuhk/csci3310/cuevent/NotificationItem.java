package edu.cuhk.csci3310.cuevent;

public class NotificationItem {
    String id ;
    String title;
    String body;
    String redirectUrl;
    String imagePath;
    String type;
    String eventId;

    public NotificationItem(String id, String title, String body, String redirectUrl, String imagePath, String type, String eventId) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.redirectUrl = redirectUrl;
        this.imagePath = imagePath;
        this.type = type;
        this.eventId = eventId;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }

    public void setRedirectUrl(String redirectUrl) {
        this.redirectUrl = redirectUrl;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }
}
