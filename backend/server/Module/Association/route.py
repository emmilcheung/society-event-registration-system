from flask import Blueprint, Flask
import Module.Association.association as association_service
import Module.Event.event as event_service
from Utilities import auths

association_route = Blueprint('association', __name__)
@association_route.route('/api/association', methods=['POST'])
@auths.is_auth
def create_association(current_user):
    return association_service.create_association(current_user)

@association_route.route('/api/association/<association_id>', methods=['GET'])
def get_association(association_id):
    return association_service.get_association(association_id)

@association_route.route('/api/edit_association/<association_id>', methods=['POST'])
@auths.is_auth
def edit_association(current_user, association_id):
    return association_service.edit_association(current_user, association_id)

@association_route.route('/api/add_member', methods=['POST'])
@auths.is_auth
def add_member(current_user):
    return association_service.add_member(current_user)

@association_route.route('/api/add_manager', methods=['POST'])
@auths.is_auth
def add_manager(current_user):
    return association_service.add_manager(current_user)

@association_route.route('/api/association_events/<association_id>', methods=['GET'])
def get_events_by_association(association_id):
    return event_service.get_events_by_association(association_id)