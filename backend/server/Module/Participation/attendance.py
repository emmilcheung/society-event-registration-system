from flask import  request, jsonify
from flask_cors import CORS, cross_origin
from Module import app, mysql
from Utilities import auths
from Module.Participation import application
from Utilities import ticket

import re
from datetime import datetime
import jwt

class Attendance():
    def __init__(self, data):
        self.run_id = data['runId']
        self.sid = data['sid']
        self.application_id = data['application_id']


def insert_attendance(cur, sid, application_id, run_id):
    new_attendance = Attendance({
        "runId": run_id,
        "sid": sid,
        "application_id": application_id
    })
    query_string = "INSERT INTO attendance ( \
                    `run_id`, \
                    `sid`, \
                    `application_id` \
                    ) \
                    VALUES (%s, %s, %s)"
    result = cur.execute(query_string, (
                                        new_attendance.run_id,
                                        new_attendance.sid,
                                        new_attendance.application_id
                                        ))
    return cur.lastrowid

# route function
def attend_by_nfc():
    try:
        data = request.get_json()
        print(data)
        cur = mysql.connection.cursor()
        return_data = {}
        query_string = "select application.*, \
                           ticket.token as ticket \
                        from(select application.*, \
                                    user.major, \
                                    user.college, \
                                    user.first_name, \
                                    user.last_name, \
                                    user.cid \
                                from application left join \
                                ( \
                                    select user_profile.sid as sid, \
                                        user_profile.major, \
                                        user_profile.college, \
                                        user_private.first_name, \
                                        user_private.last_name, \
                                        cu_link.cid \
                                    from user_private \
                                    left join user_profile \
                                        on user_private.sid=user_profile.sid \
                                    left join cu_link \
                                        on user_private.sid=cu_link.sid \
                                ) as user \
                                on application.sid=user.sid \
                            ) as application \
                            left join ticket \
                                on ticket.application_id=application.application_id \
                            left join application_form \
                                on application.run_id=application_form.run_id \
                        where application_form.run_id=%s \
                            and cid=%s \
                            and not exists ( \
                                select sid, run_id \
                                from attendance \
                                where application.sid=sid \
                                    and application.run_id=run_id \
                            )"
        result = cur.execute(query_string, (data['runId'], data['cid']))
        if result > 0:
            print(result)
            application = cur.fetchone()
            insert_attendance(cur, application['sid'], application['application_id'], data['runId'])
            ticket.use_ticket(cur, application['ticket'])
            mysql.connection.commit()
            cur.close()
            return jsonify(application), 201
        else:
            return {"message": "error"},  409

    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500

# route function
def get_participants_by_cid():
    queries = request.args.to_dict()
    cur = mysql.connection.cursor()

    return_data = {}
    query_string = "select application.* \
                    from(select application.*, \
                                user.major, \
                                user.college, \
                                user.first_name, \
                                user.last_name, \
                                user.cid \
                            from application left join \
                            ( \
                                select user_profile.sid as sid, \
                                    user_profile.major, \
                                    user_profile.college, \
                                    user_private.first_name, \
                                    user_private.last_name, \
                                    cu_link.cid \
                                from user_private \
                                left join user_profile \
                                    on user_private.sid=user_profile.sid \
                                left join cu_link \
                                    on user_private.sid=cu_link.sid \
                            ) as user \
                            on application.sid=user.sid \
                        ) as application \
                        left join application_form \
                            on application.run_id=application_form.run_id \
                    where application_form.run_id=%s \
                        and cid=%s"
    result = cur.execute(query_string, (queries['run_id'], queries['cid']))
    if result > 0:
        applicant = cur.fetchone()
        return_data['applicant'] = applicant
    cur.close()
    return jsonify(return_data), 200

# route function 
def attend_by_ticket():
    try:
        data = request.get_json()
        print(data)
        error = False
        if(data['ticket'][0:5] != "CUEV:"):
            error = True
        token = re.sub("CUEV:", "", data['ticket'])
        decoded_data = jwt.decode(token, app.secret_key)
        # print(data['ticket'][0:6] ,decoded_data['runId'], data['runId'])

        if(decoded_data['runId'] != data['runId']): 
            error = True
        if(error):
            return {"message": "token not match"}, 409

        cur = mysql.connection.cursor()
        return_data = {}
        query_string = "select application.* \
                        from ticket \
                            left join \
                                (select application.*, \
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
                                        from user_private \
                                        left join user_profile \
                                            on user_private.sid=user_profile.sid \
                                    ) as user \
                                    on application.sid=user.sid \
                                ) as application \
                                on ticket.application_id=application.application_id \
                            left join application_form \
                                on application.run_id=application_form.run_id \
                        where application_form.run_id=%s \
                            and token=%s \
                            and ticket.status=%s \
                            and not exists ( \
                                select sid, run_id \
                                from attendance \
                                where application.sid=sid \
                                    and application.run_id=run_id \
                            )"
        result = cur.execute(query_string, (decoded_data['runId'], 
                                            data['ticket'], 
                                            ticket.TICKET_STATUS_AVALIABLE))
        if result > 0:
            application = cur.fetchone()
            insert_attendance(cur, application['sid'], application['application_id'], data['runId'])
            ticket.use_ticket(cur, data['ticket'])
            mysql.connection.commit()
            cur.close()
            return jsonify(application), 201
        else:
            return {"message": "invalid ticket"},  409

    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500

# route function
def set_attendance_by_organizer(current_user):
    try:
        data = request.get_json()
        sid = data['sid']
        event_id = data['event_id']
        run_id = data['run_id']
        application_id = data['application_id']
        attendance_id = data['attendance_id']
        option = data['option']

        if(option == "reset" and attendance_id):
            cur = mysql.connection.cursor()
            delete_query = """
                           delete from attendance
                           where application_id=%s
                            and sid=%s
                            and run_id=%s;
                           """
            cur.execute(delete_query, (application_id, sid, run_id))

            update_query = """
                           update ticket set
                           status=%s
                           where application_id=%s;
                           """
            cur.execute(update_query, (ticket.TICKET_STATUS_AVALIABLE, application_id))
            mysql.connection.commit()
            cur.close()
        elif(option == "attend"):
            cur = mysql.connection.cursor()
            insert_attendance(cur, sid, application_id, run_id)
            mysql.connection.commit()
            cur.close()
        return application.get_participants(current_user, event_id)
    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500

# route function 
def post_online_attendance(current_user):
    data = request.get_json()
    # event_id = data['event_id']
    run_id = data['runId']

    user = auths.get_user(current_user)
    sid = user['sid']

    cur = mysql.connection.cursor()
    query_string = "select * \
                    from application \
                    where run_id=%s \
                        and sid=%s"
    result = cur.execute(query_string, (run_id, sid))
    if result > 0:
        application_id = cur.fetchone()['application_id']
        query_string2 = "select * from attendance where sid=%s and run_id=%s"
        if(cur.execute(query_string2, (sid, run_id)) <= 0):
            insert_attendance(cur, sid, application_id, run_id)
            mysql.connection.commit()
    cur.close()
    return {'message': 'created'}, 201