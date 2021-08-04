from flask import Blueprint, Flask
import Module.Participation.application as application_service
import Module.Participation.attendance as attendance_service
from Utilities import auths

participation_route = Blueprint('participation', __name__)
# application
@participation_route.route('/api/application_form', methods=['POST'])
@auths.is_auth
def create_application_form(current_user):
    return application_service.create_application_form(current_user)

@participation_route.route('/api/application_form', methods=['PUT'])
@auths.is_auth
def edit_application_form(current_user):
    return application_service.edit_application_form(current_user)

@participation_route.route('/api/application_form/<event_id>', methods=['GET'])
def get_application_forms(event_id):
    return application_service.get_application_forms(event_id)

@participation_route.route('/api/application', methods=['POST'])
@auths.is_auth
def create_application(current_user):
    return application_service.create_application(current_user)

@participation_route.route('/api/participants/<event_id>', methods=['GET'])
@auths.is_auth
def get_participants(current_user,event_id):
    return application_service.get_participants(current_user, event_id)

@participation_route.route('/api/ticket/<run_id>', methods=['GET'])
@auths.is_auth
def get_ticket(current_user, run_id):
    return application_service.get_ticket(current_user, run_id)

# attendance
@participation_route.route('/api/attendance/nfc', methods=['GET'])
def get_participants_by_cid():
    return attendance_service.get_participants_by_cid()

@participation_route.route('/api/attendance/nfc', methods=['POST'])
def attend_by_nfc():
    return attendance_service.attend_by_nfc()

@participation_route.route('/api/attendance/ticket', methods=['POST'])
def attend_by_ticket():
    return attendance_service.attend_by_ticket()
    
@participation_route.route('/api/attendance', methods=['PUT'])
@auths.is_auth
def update_attendance(current_user):
    return attendance_service.set_attendance_by_organizer(current_user)
    
@participation_route.route('/api/online_attendance', methods=['POST'])
@auths.is_auth
def post_online_attendance(current_user):
    return attendance_service.post_online_attendance(current_user)