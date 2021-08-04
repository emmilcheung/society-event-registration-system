package edu.cuhk.csci3310.cuevent;

public class HomeAssociationItem {
    private String associationId, associationTitle, associationWebsite, associationEmail, associationPhone,
    associationDesc, associationImagePath;

    public HomeAssociationItem (String id, String title, String website, String email, String phone,
                                String desc, String imagePath) {
        this.associationId = id;
        this.associationTitle = title;
        this.associationWebsite = website;
        this.associationEmail = email;
        this.associationPhone = phone;
        this.associationDesc = desc;
        this.associationImagePath = imagePath;
    }

    public String getAssociationDesc() {
        return this.associationDesc;
    }

    public String getAssociationId() {
        return this.associationId;
    }

    public String getAssociationEmail() {
        return this.associationEmail;
    }

    public String getAssociationImagePath() {
        return this.associationImagePath;
    }

    public String getAssociationPhone() {
        return this.associationPhone;
    }

    public String getAssociationTitle() {
        return this.associationTitle;
    }

    public String getAssociationWebsite() {
        return this.associationWebsite;
    }
}
