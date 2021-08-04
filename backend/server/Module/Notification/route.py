from flask import Blueprint, Flask
from Module.Notification import notification
from Utilities import auths

notification_route = Blueprint('notification', __name__)

@notification_route.route('/api/notification/registration', methods=['POST'])
@auths.is_auth
def register_client(current_user):
    return notification.register_client(current_user)

@notification_route.route('/api/notification/<offset>', methods=['GET'])
@auths.is_auth
def get_user_notification(current_user, offset):
    return notification.get_user_notification(current_user, offset)

@notification_route.route('/api/notification_read', methods=['POST'])
@auths.is_auth
def post_notification_read(current_user):
    return notification.post_notification_read(current_user)