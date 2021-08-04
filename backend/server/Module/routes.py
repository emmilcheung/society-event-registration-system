from flask import  logging, request, jsonify, make_response 
from Module import app, mysql
import datetime

import firebase_admin

# Routes
from Utilities import auths
from Module.Event.route import event_route
from Module.Association.route import association_route
from Module.Participation.route import participation_route
from Module.Profile.route import profile_route 
from Module.Image.route import image_route
from Module.Notification.route import notification_route
from Module.Search.route import search_route
from Module.Survey.route import survey_route

# authenication
@app.route('/api/login')
@auths.is_auth
def login(current_user):
    return make_response(auths.login(current_user))

@app.route('/api/authenticated')
@auths.is_auth
def authenticated(current_user):
    return make_response(jsonify(current_user), 200)


# association
app.register_blueprint(association_route)

# event
app.register_blueprint(event_route)

# participation
app.register_blueprint(participation_route)

# image
app.register_blueprint(image_route)

#profile
app.register_blueprint(profile_route)

# search
app.register_blueprint(search_route)

# survey
app.register_blueprint(survey_route)


# notification
app.register_blueprint(notification_route)


# testing 
# @app.route('/api/testing', methods=['POST'])
# def test():
#     notificationObj = notification.Notification({
#         'title': "Event Updated",
#         'body': "AMONG CS has updated",
#         'redirect_url': "/event/23",
#         'image_url': "http://192.168.0.100:5000/img/" + "4f8010d1acc83383d89cdb203bd3f232f6b6d88c.jpg",
#         'type': "event",
#         'event_id': "23"
#     })
#     notification.send_notification(['1155102444'], 'admin', notificationObj)

#     return {"message": "successful"}, 200