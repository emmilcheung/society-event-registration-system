from flask import Blueprint, Flask
from Module.Survey import survey
from Utilities import auths

survey_route = Blueprint('survey', __name__)

@survey_route.route('/api/survey', methods=['POST'])
def post_survey():
    return survey.post_survey()

@survey_route.route('/api/survey/<survey_id>', methods=['GET'])
def get_survey(survey_id):
    return survey.get_survey(survey_id)

@survey_route.route('/api/survey', methods=['PUT'])
def put_survey():
    return survey.put_survey()

@survey_route.route('/api/survey_answer', methods=['POST'])
def post_survey_answer():
    return survey.post_answer()

@survey_route.route('/api/survey_answers/<survey_id>', methods=['GET'])
@auths.is_auth
def get_survey_answers(current_user, survey_id):
    return survey.get_survey_answers(current_user, survey_id)

@survey_route.route('/api/survey_list/<event_id>', methods=['GET'])
def get_survey_list_by_event(event_id):
    return survey.get_survey_list_by_event(event_id)

@survey_route.route('/api/survey_notification', methods=['POST'])
@auths.is_auth
def send_survey_notification(current_user):
    return survey.send_survey_notification(current_user)