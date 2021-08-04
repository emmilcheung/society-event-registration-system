from flask import Blueprint, Flask
import Module.Event.event as event_service
from Utilities import auths


event_route = Blueprint('event', __name__)
# event
@event_route.route('/api/event', methods=['POST'])
@auths.is_auth
def create_event(current_user):
    return event_service.create_event(current_user)

@event_route.route('/api/event/<event_id>', methods=['GET'])
def get_event(event_id):
    return event_service.get_event(event_id)

@event_route.route('/api/edit_event/<event_id>', methods=['POST'])
@auths.is_auth
def edit_event(current_user, event_id):
    return event_service.edit_event(current_user, event_id)

@event_route.route('/api/ras_event', methods=['GET'])
def get_ras_event():
    return event_service.get_ras_event()

@event_route.route('/api/event_reminder', methods=['POST'])
@auths.is_auth
def event_reminder(current_user):
    return event_service.send_event_notification(current_user)



