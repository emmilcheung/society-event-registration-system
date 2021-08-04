package edu.cuhk.csci3310.cuevent;

public class HomeEventItem {
    private int eventId;
    private boolean online;
    private String eventTitle, eventHost, eventStartTime, eventImagePath, eventVenue, runId;

    public HomeEventItem(int eventId, String eventTitle, String eventHost, String eventVenue,
                         String eventImagePath, String eventStartTime, int online, String runId) {
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.eventHost = eventHost;
        this.eventVenue = eventVenue;
        this.eventImagePath = eventImagePath;
        this.eventStartTime = eventStartTime;
        this.online = online == 1;
        this.runId = runId;
    }

    public int getEventId() {return this.eventId;}
    public String getEventTitle() {return this.eventTitle;}
    public String getEventHost() {return this.eventHost;}
    public String getEventVenue() {return this.eventVenue;}
    public String getEventImagePath() {return this.eventImagePath;}
    public String getEventStartTime() {return this.eventStartTime;}
    public boolean isOnline() {return this.online;}
    public String getRunId() {return this.runId;}
}
