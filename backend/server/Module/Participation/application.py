from flask import  request, jsonify
from flask_cors import CORS, cross_origin
from Module import app, mysql
from Utilities import auths
from Utilities import ticket

import jwt
from datetime import datetime

class ApplicationForm():
    def __init__(self, data):
        self.event_id = data['eventId']
        self.run_id = data['runId']
        self.internal = data['internal']
        self.url = data['url'] if 'url' in data else None
        self.start_time = datetime.fromtimestamp(data['startTime']).strftime('%Y-%m-%d %H:%M:%S')
        self.end_time = datetime.fromtimestamp(data['endTime']).strftime('%Y-%m-%d %H:%M:%S')
        self.quota = data['quota'] if 'quota' in data else None
        self.remark = data['remark'] if 'remark' in data else None
        self.online_url = data['onlineURL'] if 'onlineURL' in data else None
        self.online_time = datetime.fromtimestamp(data['onlineTime']).strftime('%Y-%m-%d %H:%M:%S')

class Application():
    def __init__(self, data):
        self.run_id = data['runId']
        self.sid = data['sid']
        self.email = data['email']
        self.phone = data['phone']
        self.status = data['status']

def get_manager_role(cur, sid, association_id):
    query_string = "select role \
                    from association_role \
                    where association_id=%s \
                          and sid=%s ;"
    print(sid, association_id)
    res = cur.execute(query_string, (association_id, sid))
    if res > 0 :
        return cur.fetchone()
    return None

def validate_association(cur, association_id):
    query_string = "select association_id from association where association_id=%s and approved=1;"
    res = cur.execute(query_string, (association_id,))
    if res > 0 :
        return True
    return False

def insert_application_form(cur, data):
    new_form = ApplicationForm(data)
    query_string = "INSERT INTO application_form ( \
                    `event_id`, \
                    `run_id`, \
                    `start_time`, \
                    `end_time`, \
                    `internal`, \
                    `quota`, \
                    `remark`, \
                    `online_url`, \
                    `online_time` \
                    ) \
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
    result = cur.execute(query_string, (
                                        new_form.event_id,
                                        new_form.run_id,
                                        new_form.start_time,
                                        new_form.end_time,
                                        new_form.internal,
                                        new_form.quota,
                                        new_form.remark,
                                        new_form.online_url,
                                        new_form.online_time
                                        ))
    return cur.lastrowid

def update_application_form(cur, data):
    new_form = ApplicationForm(data)
    query_string = "UPDATE application_form SET \
                    `start_time`=%s, \
                    `end_time`=%s, \
                    `internal`=%s, \
                    `quota`=%s, \
                    `remark`=%s, \
                    `online_url`=%s, \
                    `online_time`=%s \
                    WHERE application_form.form_id=%s"
    result = cur.execute(query_string, (
                                        new_form.start_time,
                                        new_form.end_time,
                                        new_form.internal,
                                        new_form.quota,
                                        new_form.remark,
                                        new_form.online_url,
                                        new_form.online_time,
                                        data['formId']
                                        ))
    return

def insert_application(cur, user, data):

    new_form = Application({
        "runId": data['runId'],
        "sid": user['sid'],
        "email": data['email'],
        "phone": data['phone'],
        "status": "success"
    })
    query_string = "INSERT INTO application ( \
                    `run_id`, \
                    `sid`, \
                    `email`, \
                    `phone`, \
                    `status` \
                    ) \
                    VALUES (%s, %s, %s, %s, %s)"
    result = cur.execute(query_string, (
                                        new_form.run_id,
                                        new_form.sid,
                                        new_form.email,
                                        new_form.phone,
                                        new_form.status
                                        ))
    return cur.lastrowid


# route function 
def create_application_form(current_user):
    try:
        data = request.get_json()
        cur = mysql.connection.cursor()
        user = auths.get_user(current_user)
        association_role = get_manager_role(cur, user['sid'], data['associationId'])
        if not validate_association(cur, data['associationId']) or not association_role:
            return jsonify({"error": 'Unauthorized' }), 403
        
        form_id = insert_application_form(cur, data)
        return_data = {}
        query_string = "select application_form.*, count(application.application_id) as participants \
                            from application_form left join application \
                                on application_form.run_id=application.run_id \
                            where application_form.event_id=%s \
                            group by application_form.form_id"
        result = cur.execute(query_string, (data['eventId'],))
        if result > 0:
            forms = cur.fetchall()
            for form in forms:
                return_data[form['run_id']] = form
        mysql.connection.commit()
        cur.close()
        return jsonify(return_data), 201
    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500

# route function 
def edit_application_form(current_user):
    try:
        data = request.get_json()
        print(data)
        cur = mysql.connection.cursor()
        user = auths.get_user(current_user)
        association_role = get_manager_role(cur, user['sid'], data['associationId'])
        if not validate_association(cur, data['associationId']) or not association_role:
            return jsonify({"error": 'Unauthorized' }), 403
        
        update_application_form(cur, data)
        mysql.connection.commit()

        return_data = {}
        query_string = "select application_form.*, count(application.application_id) as participants \
                            from application_form left join application \
                                on application_form.run_id=application.run_id \
                            where application_form.event_id=%s \
                            group by application_form.form_id"
        result = cur.execute(query_string, (data['eventId'],))
        if result > 0:
            forms = cur.fetchall()
            for form in forms:
                return_data[form['run_id']] = form
        mysql.connection.commit()
        cur.close()
        # return jsonify(return_data), 204
        return get_application_forms(data['eventId'])
    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500

# route function
def create_application(current_user):
    try:
        data = request.get_json()
        cur = mysql.connection.cursor()
        user = auths.get_user(current_user)
        if cur.execute("select * \
                     from application \
                     where run_id=%s \
                        and sid=%s",
                        (data['runId'],user['sid'])
            ) > 0:
            return jsonify({'message': "already applied"}), 405
        
        application_id = insert_application(cur, user, data)
        ticket.insert_ticket(cur, user, data, application_id)
        mysql.connection.commit()
        cur.close()
        return jsonify({"message": "successful"}), 201
    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500
        

# route function
def get_application_forms(event_id):
    try:
        cur = mysql.connection.cursor()
        return_data = {}
        return_data['forms'] = {}
        return_data['user'] = "Guest"
        return_data['user_status'] = {}
        
        query_string = "select application_form.*, count(application.application_id) as participants \
                            from application_form left join application \
                                on application_form.run_id=application.run_id \
                            where application_form.event_id=%s \
                            group by application_form.form_id"
        result = cur.execute(query_string, (event_id,))
        if result > 0:
            forms = cur.fetchall()
            for form in forms:
                # string the dateime.datetime for client javascript import
                for key in form.keys():
                    if isinstance(form[key], datetime):
                        form[key] = form[key].__str__()
                return_data['forms'][form['run_id']] = form

            # check request user status
            user = auths.get_user_from_headers()
            ids = []
            if user:
                return_data['user'] = "Vistor"
                query_string2 = "select application_form.run_id as id \
                                from application left join application_form \
                                    on application.run_id=application_form.run_id \
                                where application.sid=%s and application_form.event_id=%s"
                result2 = cur.execute(query_string2, (user['sid'], event_id))
                if result2 > 0:
                    tuples = cur.fetchall()
                    ids = [tuple['id'] for tuple in tuples]
                    return_data['user'] = "Participant"
            for key in return_data['forms'].keys():
                return_data['user_status'][key] = True if key in ids else False
        cur.close()
        return jsonify(return_data), 200
    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500

# route function
def get_participants(current_user, event_id):
    try:
        cur = mysql.connection.cursor()
        return_data = {}
        query_string = "select application.*, \
                               attendance.id as attendance_id, \
                               attendance.check_in, \
                                (CASE \
                                    WHEN member.id IS NOT NULL THEN 'member' \
                                    ELSE 'guest' \
                                END) AS 'role' \
                        from(select application.*, \
                                    user.major, \
                                    user.college, \
                                    user.first_name, \
                                    user.last_name \
                             from application left join \
                                ( \
                                select user_profile.sid as sid, \
                                        user_profile.major, \
                                        user_profile.college, \
                                        user_private.first_name, \
                                        user_private.last_name \
                                    from user_private left join user_profile \
                                        on user_private.sid=user_profile.sid \
                                ) as user \
                                on application.sid=user.sid \
                            ) as application \
                            left join application_form \
                                on application.run_id=application_form.run_id \
                            left join attendance \
                                on application.application_id=attendance.application_id \
                            left join event \
                                on application_form.event_id=event.event_id \
                            left join member \
                                on application.sid=member.sid and event.association_id=member.association_id \
                        where application_form.event_id=%s"
        result = cur.execute(query_string, (event_id,))
        if result > 0:
            forms = cur.fetchall()
            for form in forms:
                if form['run_id'] in return_data.keys():
                    return_data[form['run_id']].append(form)
                else:
                    return_data[form['run_id']] = [form]

            # check request user status
        cur.close()
        return jsonify(return_data), 200
    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500

# route function
def get_ticket(current_user, run_id):
    try:
        cur = mysql.connection.cursor()
        return_data = {}

        user = auths.get_user(current_user)
        query_string = "select token, \
                               t.status as status \
                        from application a left join ticket t \
                            on a.application_id=t.application_id \
                        where sid = %s \
                        and run_id = %s"
        result = cur.execute(query_string, (user['sid'], run_id))
        if result > 0:
            forms = cur.fetchone()
            return_data = forms
            # check request user status
        cur.close()
        return jsonify(return_data), 200
    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500
