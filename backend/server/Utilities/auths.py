from flask import  logging, request, jsonify, make_response, session
from Module import app, mysql
from Module.Profile import profile
import datetime
import uuid
from functools import wraps

datetime.datetime.now().strftime
import firebase_admin


def is_auth(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({'message' : 'Required token information'}), 401
        try:
            decoded_token = firebase_admin.auth.verify_id_token(token, check_revoked=True)
        except Exception as err:
            print(err)
            return jsonify({'message' : str(err)}), 403
        current_user = decoded_token
        return f(current_user, *args, **kwargs)
    return wrap

def get_user_from_headers():
    token = None
    user = None
    if 'x-access-token' in request.headers:
        token = request.headers['x-access-token']
    if not token:
        return user
    try:
        decoded_token = firebase_admin.auth.verify_id_token(token, check_revoked=True)
    except Exception as err:
        return user
    cur = mysql.connection.cursor()
    query_string = "select * from user_private where firebase_uid=%s;"
    res = cur.execute(query_string, (decoded_token['uid'],))
    if res > 0 :
        user = cur.fetchone()
    cur.close()
    return user

def get_user(current_user):
    user = None
    cur = mysql.connection.cursor()
    query_string = "select * from user_private where firebase_uid=%s;"
    res = cur.execute(query_string, (current_user['uid'],))
    if res > 0 :
        user = cur.fetchone()
    cur.close()
    return user

# route function
def login(current_user):
    #create mysql curser and fetch user info for checking
    user = get_user(current_user)
    if not user :
        return create_user(current_user)
        # return jsonify({'user': "new user"}), 200
    return jsonify({'user': user['public_uid'], 'email': user['email']}), 200

class User():
    def __init__(self, data):
        self.firebase_uid = data['firebase_uid'] 
        self.public_uid = str(uuid.uuid4())
        self.sid = data['sid']
        self.email = data['email']
        self.first_name = data['first_name'] 
        self.last_name = data['last_name']


def create_user(current_user):
    firebase_uid = current_user['user_id']
    email = current_user['email']
    sid = email.split('@')[0]
    host = email.split('@')[1]
    not_valid_email = (host != "link.cuhk.edu.hk" and host != "cuhk.edu.hk")
    if not_valid_email:
        firebase_admin.auth.delete_user(firebase_uid)
        return jsonify({'message': "not CUHK email"}), 403
    name = current_user['name']
    last_name = name.split(', ')[0]
    first_name = name.split(', ')[1]
    data = {
        "firebase_uid": firebase_uid,
        "sid": sid,
        "email": email,
        "first_name": first_name,
        "last_name": last_name
    }
    new_user = User(data)
    try:
        cur = mysql.connection.cursor()
        query_string = "INSERT INTO user_private ( \
                        firebase_uid, \
                        public_uid, \
                        sid, \
                        email, \
                        first_name, \
                        last_name \
                        ) \
                        VALUES (%s, %s, %s, %s, %s, %s)"
        result = cur.execute(query_string, (new_user.firebase_uid, 
                                            new_user.public_uid,
                                            new_user.sid,
                                            new_user.email,
                                            new_user.first_name,
                                            new_user.last_name,
        ))
        profile.create_user_profile(cur, current_user, data)
        mysql.connection.commit()
        cur.close()
        return jsonify({'user': new_user.public_uid, 'email': new_user.email}), 200
    except Exception as err:
        print(err)
        return jsonify({'message': "Unsuccessful"}), 500






