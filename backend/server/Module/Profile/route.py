from flask import Blueprint, Flask
import Module.Profile.profile as profile_service
import Module.Event.event as event_service
import Module.Association.association as association_service
from Utilities import auths


profile_route = Blueprint('profile', __name__)
#profile
@profile_route.route('/api/user_profile/<user_public_id>', methods=['GET'])
def get_profile(user_public_id):
    return profile_service.get_profile(user_public_id)
 
@profile_route.route('/api/my_association', methods=['GET'])
@auths.is_auth
def get_my_association(current_user):
    return profile_service.get_my_association(current_user)

@profile_route.route('/api/user_events/<user_public_id>', methods=['GET'])
def get_events_by_user(user_public_id):
    return event_service.get_events_by_user(user_public_id)

@profile_route.route('/api/user_associations', methods=['GET'])
@auths.is_auth
def get_associations_by_user(current_user):
    return association_service.get_associations_by_user(current_user)

@profile_route.route('/api/edit_profile', methods=['POST'])
@auths.is_auth
def edit_profile(current_user):
    return profile_service.edit_profile(current_user)

@profile_route.route('/api/get_recommendation/<user_public_id>', methods=['GET'])
def get_recommendation(user_public_id):
    return event_service.get_recommendation(user_public_id)