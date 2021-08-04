from flask import  request, jsonify
from Module import app, mysql
from Utilities import auths
from Module.Association import association

from firebase_admin import messaging

from datetime import datetime, timedelta
import json
import uuid

class Notification():
    def __init__(self, data):
        self.id = uuid.uuid4()
        self.title = data['title']
        self.body = data['body']
        self.redirect_url = data['redirect_url']
        self.image_url = data['image_url']
        self.type = data['type']
        self.event_id = data['event_id'] if 'event_id' in data else ""
        self.association_id = data['association_id'] if 'association_id' in data else ""

def get_registrated_tokens(cur, sids):
    tokens = []
    if len(sids) > 1:
        format_string = ','.join(['%s'] * len(sids))
        num = cur.execute("SELECT token, device_type FROM notification_registration WHERE sid IN (%s)" % format_string, tuple(sids))
    else:
        query_string = "select token, device_type \
                        from notification_registration \
                        where sid in (%s);"
        num = cur.execute(query_string, (sids,))
    if num > 0 :
        results = cur.fetchall()
        for result in results:
            tokens.append(result)
    return tokens

def send_notification(sids,sender_id, notificationObj):
    cur = mysql.connection.cursor()
    token_mapping = get_registrated_tokens(cur,sids)

    # Object style 
    # notificationObj = Notification({
    #     'title': title,
    #     'body': body,
    #     'redirect_url': redirect_url,
    #     'image_url': icon,
    #     'type': notification_type
    # })

    # add a new notification 
    insert_string = """
                    insert into notification 
                    (`id`, `title`, `body`, `redirect_url`, `image_url`, `notification_type`, `event_id`)
                    values (%s, %s, %s, %s, %s, %s, %s);
                    """
    cur.execute(insert_string, (notificationObj.id,
                                notificationObj.title,
                                notificationObj.body,
                                notificationObj.redirect_url,
                                notificationObj.image_url,
                                notificationObj.type,
                                notificationObj.event_id
                                ))
    
    # add to user nofication with metadata
    insert_string2 = """
                     insert into user_notification
                     (`notification_id`, `sid`, `sender_id`)
                     values (%s, %s, %s)
                     """
    for sid in sids:
        cur.execute(insert_string2, (notificationObj.id, sid, sender_id))
        
    web_targets = filter(lambda x : x['device_type'] == 'web', token_mapping)
    mobile_targets = filter(lambda x:x['device_type'] == 'android', token_mapping)

    # web client
    message = messaging.MulticastMessage(
        data={
            "notification": json.dumps({
                "id": str(notificationObj.id),
                "title" : notificationObj.title,
                "body" : notificationObj.body,
                "redirect_url": notificationObj.redirect_url,
                "image_url": notificationObj.image_url,
                "type": notificationObj.type,
                "read": False,
            })
        },
        tokens=list(map(lambda x: x['token'], web_targets))
    )
    response = messaging.send_multicast(message)

    # android client
    if notificationObj.type == 'event' or notificationObj.type == 'survey':
        message = messaging.MulticastMessage(
            data={
                "notification": json.dumps({
                    "id": str(notificationObj.id),
                    "title" : notificationObj.title,
                    "body" : notificationObj.body,
                    "redirect_url": notificationObj.redirect_url,
                    "image_url": notificationObj.image_url,
                    "type": notificationObj.type,
                    "read": False,
                }),
                "TYPE": "event",
                "EVENT_ID": str(notificationObj.event_id),
                "RUN_ID": "null"
            },
            android=messaging.AndroidConfig(
                ttl=timedelta(seconds=3600),
                priority='normal',
                notification=messaging.AndroidNotification(
                    title=notificationObj.title,
                    body=notificationObj.body,
                ),
            ),
            tokens=list(map(lambda x: x['token'], mobile_targets))
        )
    # Send a message to the device corresponding to the provided
    # registration token.
    response = messaging.send_multicast(message)
    mysql.connection.commit()
    cur.close()
    # Response is a message ID string.
    print('Successfully sent message:', response)

    return len(sids)


# route function
def get_user_notification(current_user, offset):
    user = auths.get_user(current_user)
    cur = mysql.connection.cursor()

    query_string = """ 
                    select 
                        notification.id as id,
                        title,
                        body,
                        image_url,
                        redirect_url,
                        send_time,
                        sender_id,
                        notification_type as type,
                        event_id,
                    (case 
                        when last_read is null then 0
                        when send_time > last_read then 0
                        else 1
                    end) as 'read'
                    from user_notification 
                    left join notification
                        on user_notification.notification_id = notification.id
                    left join notification_read
                        on user_notification.sid=notification_read.sid
                    where user_notification.sid=%s
                    order by send_time desc
                    limit 10 offset %s;
                    """
    notification_result = cur.execute(query_string, (user['sid'], int(offset)))
    if notification_result > 0:
        notification_list = cur.fetchall()
        for i in range(len(notification_list)):
            notification_list[i]['read'] = True if notification_list[i]['read'] == 1 else False
        cur.close()
        return jsonify({
            'notifications_page': notification_list ,
            'offset': int(offset) + len(notification_list)
        }), 200

    return jsonify({
            'notifications_page': [] ,
            'offset': int(offset)
        }), 200

# route function
def post_notification_read(current_user):
    user = auths.get_user(current_user)
    cur = mysql.connection.cursor()

    query_string = """
                   select * 
                   from notification_read 
                   where sid=%s
                   """
    exist = cur.execute(query_string, (user['sid'],))
    if exist:
        update_string = """
                        update notification_read 
                        set `last_read`=CURRENT_TIMESTAMP
                        where sid=%s
                        """
        update_result = cur.execute(update_string, (user['sid'],))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'updated'})
    else:
        insert_string = """
                        insert into notification_read
                        (`sid`) values (%s)
                        """
        insert_result = cur.execute(insert_string, (user['sid'],))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'create'})
    
# route function
def register_client(current_user):
    try:
        data = request.get_json()
        # print(data)
        cur = mysql.connection.cursor()
        user = auths.get_user(current_user)
        token = data['token']
        device = data['device']

        # check registration exist
        query_string = "select * \
                        from notification_registration \
                            where token=%s;"
        register_result = cur.execute(query_string, (token,))
        # return 
        if register_result > 0:
            update_string = "update notification_registration \
                             set sid=%s, \
                             device_type=%s \
                             where token=%s \
                            "
            cur.execute(update_string, (user['sid'], device, token))
            mysql.connection.commit()
            cur.close()
            return jsonify({'message': 'updated'}), 204
        else:
            insert_string = "insert into notification_registration \
                            (`sid`, `token`, `device_type`) \
                            values (%s, %s, %s)"
            cur.execute(insert_string, (user['sid'], token, device))
            mysql.connection.commit()
            cur.close()
            return jsonify({'message': 'created'}), 201

    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500

