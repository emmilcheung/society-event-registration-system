from flask import  request, jsonify
from flask_cors import CORS, cross_origin
from Module import app, mysql
from Utilities import auths
from Module.Association import association
from Module import venue
from Module import crawler
from Module.Notification import notification

from datetime import datetime
import uuid

class Event():
    def __init__(self, data):
        if not 'title' in data:
            raise ValueError("Title is required")
        if not 'associationId' in data:
            raise ValueError("Event must be created by association")
        if not 'profileImage' in data:
            raise ValueError("Profile image is required")
        self.title = data['title']
        self.association_id = data['associationId']
        self.description = data['description'] if 'description' in data else None
        self.is_public = data['isPublic'] if 'isPublic' in data else False
        self.profile_image = data['profileImage'] 
        self.category = data['category']
        self.form = data['form']
        self.is_notify = data['isNotify'] if 'isNotify' in data else True
class Run():
    def __init__(self, data):
        if not 'startTime' in data:
            raise ValueError("Start time is required")
        if not 'endTime' in data:
            raise ValueError("End time is required")
        self.run_id = data['runId'] if 'runId' in data else uuid.uuid4()
        self.start_time = datetime.fromtimestamp(data['startTime']).strftime('%Y-%m-%d %H:%M:%S')
        self.end_time= datetime.fromtimestamp(data['endTime']).strftime('%Y-%m-%d %H:%M:%S')
        self.allday = data['allday'] if 'allday' in data else False
        self.repeat = data['repeat'] if 'repeat' in data else False
        self.repeat_style = 'repeatStyle' in data if data['repeatStyle'] else ""
        self.online= data['online'] if 'online' in data else False
        self.venue_id = data['venue']['venueId']


def validate_association(cur, association_id):
    query_string = "select association_id from association where association_id=%s and approved=1;"
    res = cur.execute(query_string, (association_id,))
    if res > 0 :
        return True
    return False

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

def insert_approve_request(cur, association_id, event_id):
    query_string = "INSERT INTO approve_request ( \
                    `association_id`, \
                    `request_type`, \
                    `event_id` \
                    ) \
                    VALUES (%s, %s, %s)"
    cur.execute(query_string, (association_id, 'association', event_id))

def insert_event(cur, event):
    new_event = Event(event)
    query_string = "INSERT INTO event ( \
                    `title`, \
                    `association_id`, \
                    `description`, \
                    `is_public`, \
                    `profile_image`, \
                    `category`, \
                    `form` \
                    ) \
                    VALUES (%s, %s, %s, %s, %s, %s, %s)"
    result = cur.execute(query_string, (new_event.title, 
                                        new_event.association_id,
                                        new_event.description,
                                        new_event.is_public,
                                        new_event.profile_image,
                                        new_event.category,
                                        new_event.form,
    ))
    return cur.lastrowid

def insert_runs(cur, runs, event_id):
    new_runs = [ Run(run) for run in runs]
    new_run_ids = []
    for new_run in new_runs:
        query_string = "INSERT INTO run ( \
                        `run_id`, \
                        `event_id`, \
                        `start_time`, \
                        `end_time`, \
                        `all_day`, \
                        `repeat`, \
                        `repeat_style`, \
                        `online`, \
                        `venue_id` \
                        ) \
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
        print(new_run.start_time)
        result = cur.execute(query_string, (new_run.run_id,
                                            event_id, 
                                            new_run.start_time,
                                            new_run.end_time,
                                            new_run.allday,
                                            new_run.repeat,
                                            new_run.repeat_style,
                                            new_run.online,
                                            new_run.venue_id
        ))
        new_run_ids.append(cur.lastrowid)
    return new_run_ids
    


def create_event(current_user):
    try:
        data = request.get_json()
        cur = mysql.connection.cursor()
        user = auths.get_user(current_user)
        association_role = get_manager_role(cur, user['sid'], data['associationId'])
        if not validate_association(cur, data['associationId']) or not association_role:
            return jsonify({"error": 'Not validate association' }), 403

        # TODO : data validation

        for i,run in enumerate(data['runs']):
            venue_id = run['venue']['venueId']
            if not venue_id and not run['online']:
                if 'ditto' in data['runs'][i] and data['runs'][i]['ditto']:
                    # if ditto copy the first venue id
                    data['runs'][i]['venue']['venueId'] = data['runs'][0]['venue']['venueId']
                else:
                    data['runs'][i]['venue']['venueId'] = venue.insert_venue(cur, run['venue'])
        
        event_id = insert_event(cur, data)
        runs_id = insert_runs(cur, data['runs'], event_id)
        insert_approve_request(cur, data['associationId'], event_id)

        members = []
        query_string = "SELECT * FROM `member` WHERE association_id=%s"
        res = cur.execute(query_string, (data['associationId'], ))
        if res > 0 :
            for member in cur.fetchall():
                members.append(member['sid'])
        mysql.connection.commit()
        cur.close()
        print(f"Event {event_id} is created")
        return jsonify({'event_id': event_id}), 201
    except ValueError as err:
        return jsonify({"inputError": str(err) }), 401
    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500

# route function
def get_event(event_id):
    try:
        data = {}
            # default set user as guest
        data['user'] = 'Guest'
        # find if there is event with this id
        cur = mysql.connection.cursor()

        query_string = "select event.*, association.title as association_title, \
                            association.profile_image as association_profile_image \
                        from event left join association \
                            ON event.association_id=association.association_Id  \
                        where event_id=%s"
        result = cur.execute(query_string, (event_id,))
        # if no such event, return 404
        if result <= 0:
            return jsonify({"message": "Event not found"}), 404

        data['event'] = cur.fetchone()
        public = data['event']['is_public']
        data['event']['runs'] = []
        query_string2 = "select run.*, venue.* \
                            from run left join venue ON run.venue_id=venue.venue_id \
                            where run.event_id=%s \
                            order by start_time asc"
        result2 = cur.execute(query_string2, (event_id,))
        if result2 > 0:
            runs = cur.fetchall()
            for run in runs:
                run['passed'] = 0 if run['end_time'] > datetime.now() else 1
                for key in run.keys():
                    # string the datetime for client javascript import
                    if isinstance(run[key], datetime):
                        run[key] = run[key].__str__()
                data['event']['runs'].append(run)
        user = auths.get_user_from_headers()
        if not user:
            #if the event is not public
            if public == 0:
                return jsonify({"message": "Event not found"}), 404
            return jsonify(data)

        # check if user is a manager of the association of the event
        query_string3 = "select role \
                            from association_role left join user_private \
                            on association_role.sid=user_private.sid \
                            where association_id=%s \
                            and user_private.sid=%s"
        result3 = cur.execute(query_string3, (data['event']['association_id'], user['sid']))
        # if not public event and user is not a manager
        if public == 0 and result3 <= 0 :
            return {"message": "Event not found"}, 404
        elif result3:
            role = cur.fetchone()
            data['user'] = role['role']
        cur.close()
        return jsonify(data), 200
    except Exception as err:
        print(err)
        return jsonify({'message' : str(err)}), 500

# route function
def get_events_by_user(user_public_uid):
    try:
        cur = mysql.connection.cursor()
        data = {}
        data['future_events'] = []
        data['past_events'] = []
        if cur.execute("select sid \
                        from user_private \
                        where public_uid=%s \
                        limit 1",
                        (user_public_uid,)
        ) <= 0:
            return jsonify({"message": "user not found"}), 403
        sid = cur.fetchone()['sid']
         # default set user as guest
        data['user'] = 'Guest'
        # get user role
        user = auths.get_user_from_headers()
        if user:
            if user['public_uid'] == user_public_uid:
                data['user'] = 'Editor'

        # (run left join venue) left join event, filter application
        # meta data will be return only
        query_string = "select event.title as title, \
                            event.event_id as event_id, \
                            event.profile_image as event_profile_image, \
                            event.association_title as association_title, \
                            event.association_image as association_profile_image, \
                            event.category as category, \
                            event.form as form, \
                            run.run_id as run_id, \
                            run.online as online, \
                            run.venue as venue,  \
                            run.address as address, \
                            run.start_time as start_time, \
                            run.end_time as end_time \
                        from \
                            (select run.*, venue.title as venue, venue.address as address\
                             from run left join venue ON run.venue_id=venue.venue_id \
                            )\
                            as run left join \
                            (select event.*, association.title as association_title, \
                                association.profile_image as association_image \
                             from event left join association \
                                ON event.association_id=association.association_id \
                            ) as event \
                        on run.event_id=event.event_id    \
                        where run.run_id in \
                            (select run_id \
                            from application \
                            where sid=%s)"
        if cur.execute(query_string, (sid,)) > 0:
            runs = cur.fetchall()
            for run in runs:
                past = True
                if past and run['end_time'] > datetime.now():
                    past = False
                for key in run.keys():
                    # string the dateimefor client javascript import
                    if isinstance(run[key], datetime):
                        run[key] = run[key].__str__()
                if past:
                    data['past_events'].append(run)
                else:
                    data['future_events'].append(run)
        cur.close()
        return jsonify(data), 200
    except Exception as err:
        print(err)
        return jsonify({'message' : str(err)}), 500

# route function
def get_events_by_association(association_id):
    try:
        cur = mysql.connection.cursor()
        data = {}
        data['future_events'] = []
        data['past_events'] = []
         # default set user as guest
        data['user'] = 'Guest'
        # find if there is event with this id
        # get user role
        user = auths.get_user_from_headers()
        if user:
            role = association.get_manage_role(cur, association_id, user['sid'])
            if role:
                data['user'] = role

        query_string = "select event.*, \
                               association.title as association_title, \
                               association.profile_image as association_profile_image \
                        from event left join association \
                            on event.association_id=association.association_id\
                        where event.association_id=%s"
        result = cur.execute(query_string, (association_id,))
        # if no such event, return 404
        if result > 0:
            events = cur.fetchall()
            for event in events:
                public = event['is_public']
                # user is guest and not a public event, skip this event
                if data['user'] == 'Guest' and not public:
                    continue
                event['runs'] = []
                query_string2 = "select run.*, venue.* \
                                    from run left join venue ON run.venue_id=venue.venue_id \
                                    where run.event_id=%s"
                result2 = cur.execute(query_string2, (event['event_id'],))
                if result2 > 0:
                    runs = cur.fetchall()
                    for run in runs:
                        past = True
                        if past and run['end_time'] > datetime.now():
                            past = False
                        for key in run.keys():
                            # string the dateime for client javascript import
                            if isinstance(run[key], datetime):
                                run[key] = run[key].__str__()
                        event['runs'].append(run)
                    if past:
                        data['past_events'].append(event)
                    else:
                        data['future_events'].append(event)
        cur.close()
        return jsonify(data), 200
    except Exception as err:
        print(err)
        return jsonify({'message' : str(err)}), 500

# route function
def edit_event(current_user, event_id):
    try:
        data = request.get_json()
        cur = mysql.connection.cursor()
        user = auths.get_user(current_user)
        association_role = get_manager_role(cur, user['sid'], data['associationId'])
        if not validate_association(cur, data['associationId']) or not association_role:
            return jsonify({"error": 'Not validate association' }), 403
        new_event = Event(data)
        query_string = "UPDATE event SET \
                        title=%s, \
                        description=%s, \
                        profile_image=%s, \
                        category=%s, \
                        form=%s WHERE \
                        event_id=%s"
        result = cur.execute(query_string, (new_event.title, 
                                            new_event.description,
                                            new_event.profile_image,
                                            new_event.category,
                                            new_event.form,
                                            event_id,
        ))

        # Handle venue changes
        for i, run in enumerate(data['runs']):
            venue_id = run['venue']['venueId']
            place_id = run['venue']['placeId']
            venue_title = run['venue']['title']
            venue_desc = run['venue']['description']
            
            # Insert new venue if venue id does not exist (New run)
            if not venue_id and not run['online']:
                data['runs'][i]['venue']['venueId'] = venue.insert_venue(cur, run['venue'])
            # Check if venue data has been changed (Old run)
            elif venue_id:
                venue_result = cur.execute("SELECT * \
                                            FROM venue \
                                            WHERE venue_id=%s", (venue_id,))
                if venue_result > 0:
                    venue_infos = cur.fetchall()
                    for venue_info in venue_infos:
                        # Insert new venue if venue data has been changed
                        # Update venue id of run
                        if venue_info['place_id'] != place_id or venue_info['title'] != venue_title or venue_info['description'] != venue_desc:
                            data['runs'][i]['venue']['venueId'] = venue.insert_venue(cur, run['venue'])
            
        # Update runs
        for run in data['runs']:
            if 'runId' in run:
                # Update existing runs
                new_run = Run(run)
                run_query = "UPDATE run SET \
                            `start_time`=%s, \
                            `end_time`=%s, \
                            `all_day`=%s, \
                            `repeat`=%s, \
                            `repeat_style`=%s, \
                            `online`=%s, \
                            `venue_id`=%s WHERE \
                            `run_id`=%s"
                result1 = cur.execute(run_query, (new_run.start_time,
                                                    new_run.end_time,
                                                    new_run.allday,
                                                    new_run.repeat,
                                                    new_run.repeat_style,
                                                    new_run.online,
                                                    new_run.venue_id,
                                                    new_run.run_id))
            else:
                # Insert new runs
                new_run = Run(run)
                print("New Run ID:",new_run.run_id)
                run_query = "INSERT INTO run ( \
                            `run_id`, \
                            `event_id`, \
                            `start_time`, \
                            `end_time`, \
                            `all_day`, \
                            `repeat`, \
                            `repeat_style`, \
                            `online`, \
                            `venue_id` \
                            ) \
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
                result2 = cur.execute(run_query, (new_run.run_id,
                                                    event_id, 
                                                    new_run.start_time,
                                                    new_run.end_time,
                                                    new_run.allday,
                                                    new_run.repeat,
                                                    new_run.repeat_style,
                                                    new_run.online,
                                                    new_run.venue_id))
        participants = []
        query_string = "select application.*, \
                               attendance.check_in \
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
                        where application_form.event_id=%s"
        result = cur.execute(query_string, (event_id,))
        if result > 0:
            for participant in cur.fetchall():
                print(participant)
                participants.append(participant['sid'])
        mysql.connection.commit()
        cur.close()
        print(f"Event {event_id} is updated")
        participants = list(set(participants))
        print(participants)
        print("Notify?\t", new_event.is_notify)
        if new_event.is_notify:
            notificationObj = notification.Notification({
                'title': "Event Update",
                'body': new_event.title + " has updated",
                'redirect_url': "/event/"+str(event_id),
                'image_url': "http://192.168.0.100:5000/img/" + new_event.profile_image,
                'type': "event",
                'event_id': event_id,
            })
            if len(participants) > 0:
                notification.send_notification(participants, 'admin', notificationObj)
        return jsonify({'event_id': event_id}), 201
    except ValueError as err:
        return jsonify({"inputError": str(err) }), 401
    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500

# route function
def get_recommendation(user_public_uid):
    try:
        cur = mysql.connection.cursor()
        data = {}
        future_runs = []
        data['past_events'] = []
        if cur.execute("select sid \
                        from user_private \
                        where public_uid=%s \
                        limit 1",
                        (user_public_uid,)
        ) <= 0:
            return jsonify({"message": "user not found"}), 403
        sid = cur.fetchone()['sid']
         # default set user as guest
        data['user'] = 'Guest'
        # get user role
        user = auths.get_user_from_headers()
        if user:
            if user['public_uid'] == user_public_uid:
                data['user'] = 'Editor'

        recommendation = []
        # (run left join venue) left join event, filter application
        # meta data will be return only
        query_string = "select event.title as title, \
                            event.event_id as event_id, \
                            event.profile_image as event_profile_image, \
                            event.association_id as association_id, \
                            event.association_title as association_title, \
                            event.association_image as association_profile_image, \
                            event.category as category, \
                            event.form as form, \
                            run.run_id as run_id, \
                            run.online as online, \
                            run.venue as venue,  \
                            run.address as address, \
                            run.start_time as start_time, \
                            run.end_time as end_time \
                        from \
                            (select run.*, venue.title as venue, venue.address as address\
                             from run left join venue ON run.venue_id=venue.venue_id \
                            )\
                            as run left join \
                            (select event.*, association.title as association_title, \
                                association.profile_image as association_image \
                             from event left join association \
                                ON event.association_id=association.association_id \
                            ) as event \
                        on run.event_id=event.event_id    \
                        where run.run_id in \
                            (select run_id \
                            from application \
                            where sid=%s)"
        if cur.execute(query_string, (sid,)) > 0:
            runs = cur.fetchall()
            for run in runs:
                past = True
                if past and run['end_time'] > datetime.now():
                    past = False
                for key in run.keys():
                    # string the dateimefor client javascript import
                    if isinstance(run[key], datetime):
                        run[key] = run[key].__str__()
                if past:
                    data['past_events'].append(run)
                else:
                    future_runs.append(run['run_id'])
        
            # Find the most participated category and form
            category_count = {}
            form_count = {}
            association_count = {}
            print(future_runs)
            for past_event in data['past_events']:
                if past_event['category'] not in category_count:
                    category_count[past_event['category']] = 1
                else:
                    category_count[past_event['category']] += 1
                if past_event['form'] not in form_count:
                    form_count[past_event['form']] = 1
                else:
                    form_count[past_event['form']] += 1
                if past_event['association_id'] not in association_count:
                    association_count[past_event['association_id']] = 1
                else:
                    association_count[past_event['association_id']] += 1
            if(category_count):
                max_category = max(category_count, key=category_count.get)
                max_form = max(form_count, key=form_count.get)
                max_association = max(association_count, key=association_count.get)
                print(max_category, max_form, max_association)
                query_string = "select event.title as title, \
                                    event.event_id as event_id, \
                                    event.profile_image as event_profile_image, \
                                    event.association_title as association_title, \
                                    event.association_image as association_profile_image, \
                                    event.category as category, \
                                    event.form as form, \
                                    run.run_id as run_id, \
                                    run.online as online, \
                                    run.venue as venue,  \
                                    run.address as address, \
                                    run.start_time as start_time, \
                                    run.end_time as end_time \
                                from \
                                    (select run.*, venue.title as venue, venue.address as address\
                                    from run left join venue ON run.venue_id=venue.venue_id \
                                    )\
                                    as run left join \
                                    (select event.*, association.title as association_title, \
                                        association.profile_image as association_image \
                                    from event left join association \
                                        ON event.association_id=association.association_id \
                                    ) as event \
                                on run.event_id=event.event_id    \
                                where event.category=%s or event.form=%s or event.association_id=%s"
                if cur.execute(query_string, (max_category, max_form, max_association,)) > 0:
                    for run in cur.fetchall():
                        past = True
                        if past and run['end_time'] > datetime.now():
                            past = False
                        for key in run.keys():
                            # string the dateimefor client javascript import
                            if isinstance(run[key], datetime):
                                run[key] = run[key].__str__()
                        if not past and run['run_id'] not in future_runs:
                            recommendation.append(run)
            cur.close()
        return jsonify(recommendation), 200
    except Exception as err:
        print(err)
        return jsonify({'message' : str(err)}), 500

# route function 
def send_event_notification(current_user):
    try:
        data = request.get_json()
        cur = mysql.connection.cursor()
        event_id = data['eventId']
        run_id = data['runId']
        participants = []
        profile_image = '';
        query_string = "select application.*, \
                               attendance.check_in, \
                                event.profile_image \
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
                                on event.event_id=application_form.event_id \
                        where application_form.event_id=%s \
                            and application_form.run_id=%s"
        result = cur.execute(query_string, (event_id, run_id))
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
            'title': "Event is comming soon",
            'body': "Kindly reminder",
            'redirect_url': "/event/"+str(event_id),
            'image_url': "http://192.168.0.100:5000/img/" + profile_image,
            'type': "event",
            'event_id': event_id,
        })
        if len(participants) > 0:
            notification.send_notification(participants, 'admin', notificationObj)
        return jsonify({'event_id': event_id}), 201
    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500

# route function
def get_ras_event():
    try:
        url = request.args.get('u')
        print(app.link_password)
        data = crawler.get_ras_event(url, app.link_email, app.link_password)
        return jsonify(data), 200
    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500

