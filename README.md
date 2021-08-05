# CU Event 

##### A web based event registration platform prototype for societies in CUHK 
(Final year Project that supervised by Prof. Chan Siu On)

------------

#### Abstract
Campus is a place where college students can study and interact with each other as well as joining various events organised by different departments and associations. Most of them meet their new friends from joining activities and exchange their interests. However, there is no such an official platform for students to search for and register upcoming events acrossing different organizations. In 2020, the pandemic has further separated students from their campus life while they are facing new difficulties under a remote learning environment. Most of the society can only advertise their events through their own social media or mail. It is hard for non-member students to realize their opening of events. 

In the view of this situation, this project aims to provide an official web based platform with services for societies to organise events, open registration, record attendance, notify updates and collect feedback afterward. 
This project presents a mobile responsive web application with search engine optimization, an android appliation and an API based backend. The system is assumed to be hosted and managed by an official group of CUHK and has the right to manipulate students' information. 

#### Main Feature
 - Login with CUHK OnePass (Single Sign On & 2FA verification)
 - Register association (Department/Organization/Society)
 - Association Profile
 - Create Event
 - Event Registration
 - Event Attendance
 - Survey/Feedback
 - Searching
 - Student Profile (History, Statistic, Recomendation)
 - Notification

#### Web
Source code located in `frontend/`

Next.js is used as the main framework for building the web application. 

#### Mobile
Source code located in `android/`

Java(Android) is used as the main framework for building the mobile application. 

#### Backend 
Source code located in `backend/server`

Flask is used as the main framework for building the backend API server and MySQL and Cloud Firestore is used as the database.
