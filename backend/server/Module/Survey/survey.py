from flask import  request, jsonify
from Module import app, mysql, db
from Utilities import auths
from Module.Event import event
from Module.Notification import notification


import uuid
import json

class SurveyMeta():
    def __init__(self, data):
        print(data)
        self.id = uuid.uuid4()
        self.survey_id = data['survey_id']
        self.event_id = data['event_id']
        self.association_id = data['association_id']
        self.title = data['title']

class Survey():
    def __init__(self, data):
        self.question_json = data['question_json']

class Answer():
    def __init__(self, data):
        self.survey_id = data['survey_id']
        self.document_id = data['document_id']

def insert_survey(cur, question_json):
    newsurvey = Survey({"question_json": question_json })
    query_string = "INSERT INTO survey( \
                    `question_json` \
                    ) \
                    VALUES (%s)"
    cur.execute(query_string, (newsurvey.question_json,))
    return cur.lastrowid

def edit_survey(cur, survey_id, question_json):
    newsurvey = Survey({"question_json": question_json })
    query_string = "Update survey_meta \
                    left join survey \
                    on survey_meta.survey_id=survey.id \
                    set survey.question_json=%s \
                    where survey_meta.id=%s"
    cur.execute(query_string, (newsurvey.question_json, survey_id))

def insert_answer_meta(cur, survey_id, document_id):
    new_answer_meta = Answer({
        'survey_id': survey_id,
        'document_id': document_id
    })
    query_string = "insert into survey_question_meta \
                    (`survey_id`, `document_id`) \
                    values (%s, %s)"
    cur.execute(query_string, (new_answer_meta.survey_id, 
                                new_answer_meta.document_id
                              ))


# route function
def post_survey():
    # try:
        data = request.get_json()
        print(data)
        cur = mysql.connection.cursor()
        survey_id = insert_survey(cur, data['questionJson'])

        surveymeta = SurveyMeta({
            "survey_id": survey_id,
            'event_id': data['eventId'],
            'association_id': data['associationId'],
            'title': data['title']
        })
        query_string = "INSERT INTO survey_meta( \
                `id`, \
                `survey_id`, \
                `event_id`, \
                `association_id`, \
                `title` \
                ) \
                VALUES (%s, %s, %s, %s, %s)"
        result = cur.execute(query_string, (surveymeta.id,
                                            surveymeta.survey_id,
                                            surveymeta.event_id,
                                            surveymeta.association_id,
                                            surveymeta.title
                                            ))
        mysql.connection.commit()
        cur.close()
        return jsonify({"surveyId": surveymeta.id}), 201

    # except Exception as err:
    #     print(err)
    #     return jsonify({'internalError': 'Please try again later'}), 500

# route function
def get_survey(survey_id):
    try:
        cur = mysql.connection.cursor()
        
        query_string = "select * \
                        from survey_meta left join survey \
                            on survey_meta.survey_id=survey.id \
                        where survey_meta.id=%s"
        result = cur.execute(query_string, (survey_id,))
        if result > 0:
            survey = cur.fetchone() 
            json_string = survey['question_json'].encode("utf-8")
            # print(json.loads(survey['question_json']))
            return jsonify({"questionJson": survey['question_json']})
        else:
            return {}, 404
    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500    
    
# route function
def put_survey():
    try:
        data = request.get_json()
        cur = mysql.connection.cursor()
        # print(data['questionJson'])
        edit_survey(cur, data['surveyId'], data['questionJson'])
        update_string = "UPDATE survey_meta \
                         left join survey \
                             on survey_meta.survey_id=survey.id \
                            set `title`=%s \
                             where survey_meta.id=%s"
        result = cur.execute(update_string, (data['title'], data['surveyId']))
        mysql.connection.commit()
        cur.close()
        print("run")
        return {}, 200

    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500   

# route function
def post_answer():
    data = request.get_json() 
    print(data)
    survey_id = data['surveyId']
    doc_ref = db.collection(u'question').document(survey_id).collection(u"answer")
    answer_ref = doc_ref.document()
    answer_ref.set(data['answerJson'])

    cur = mysql.connection.cursor()
    insert_answer_meta(cur, survey_id, answer_ref.id)
    mysql.connection.commit()
    cur.close()

    return jsonify({'status': "successful"}), 201

# route function
def get_survey_list_by_event(event_id):
    try:
        cur = mysql.connection.cursor()
        
        query_string = "select * \
                        from survey_meta \
                        where survey_meta.event_id=%s \
                        order by create_date asc"
        result = cur.execute(query_string, (event_id,))
        if result > 0:
            surveys = cur.fetchall() 
            print(surveys)
            return jsonify(surveys)
        else:
            return jsonify([])
    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500    

# route function
def get_survey_answers(current_user, survey_id): 
    try:
        doc_ref = db.collection(u'question').document(survey_id).collection(u"answer")
        docs = doc_ref.stream()
        a = []
        for doc in docs:
            print(f'{doc.id} => {doc.to_dict()}')
            a.append(doc.to_dict())
        return jsonify(a), 200

    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500    

# route function
def send_survey_notification(current_user):
    try:
        data = request.get_json()
        print(data)
        cur = mysql.connection.cursor()
        user = auths.get_user(current_user)
        association_role = event.get_manager_role(cur, user['sid'], data['associationId'])
        if not event.validate_association(cur, data['associationId']) or not association_role:
            return jsonify({"error": 'Not validate association' }), 403
        participants = []
        profile_image = '';
        query_string = """
                        select application.sid,
                        attendance.check_in,
                        event.profile_image
                        from application
                            left join application_form 
                                on application.run_id=application_form.run_id 
                            left join attendance 
                                on application.application_id=attendance.application_id 
                            left join event
                                on event.event_id = application_form.event_id
                        where application_form.event_id=%s
                            and attendance.check_in IS NOT NULL
                        """
        result = cur.execute(query_string, (data['eventId'],))
        if result > 0:
            for participant in cur.fetchall():
                print(participant)
                participants.append(participant['sid'])
                profile_image = participant['profile_image']
        mysql.connection.commit()
        cur.close()
        participants = list(set(participants))
        print(participants)
        notificationObj = notification.Notification({
            'title': "Survey Invitation",
            'body': data['surveyTitle'] if 'surveyTitle' in data else "Survey",
            'redirect_url': "/survey/" + data['surveyId'],
            'image_url': "http://192.168.0.100:5000/img/" + profile_image,
            'type': "survey",
            'event_id': data['eventId']
        })
        if len(participants) > 0:
            notification.send_notification(participants, 'admin', notificationObj)
        return {'message': "successful"}, 201
    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500