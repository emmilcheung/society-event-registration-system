from flask import  request, jsonify
from Module import app, mysql
from Utilities import auths
import datetime

# route function
def get_my_association(current_user):
    try:
        cur = mysql.connection.cursor()
        user = auths.get_user(current_user)
        member_list = []
        manage_list = []
        # find user member list
        query_string = "select association.association_id, \
                               profile_image, \
                               title, \
                               approved \
                        from member left join association \
                            on association.association_id=member.association_id \
                        where sid=%s" 
        result = cur.execute(query_string, (user['sid'],))
        # if membership exist
        if result > 0:
            memberships = cur.fetchall()
            # find if user is manager of some of association
            query_string2 = "select association_id, role \
                             from association_role \
                             where sid=%s"
            result2 = cur.execute(query_string2, (user['sid'],))
            if result2 > 0:
                manageships = cur.fetchall()
                # ids = [data['association_id'] for data in manageships]
                ids = {data['association_id']: data['role']  for data in manageships}
                for association in memberships:
                    if association['association_id'] in ids.keys():
                        association['role'] = ids[association['association_id']]
                        manage_list.append(association)
                    elif association['approved']:
                        association['role'] = 'Member'
                        member_list.append(association)
            cur.close()
        return jsonify({"member": member_list,"manager": manage_list}), 200

    except Exception as err:
        print(err)
        return jsonify({'message' : str(err)}), 500

class UserProfile():
    def __init__(self, data):
        self.sid = data['sid']
        self.public = data['public'] if 'public' in data else True
        self.introduction = data['introduction'] if 'introduction' in data and len(data['introduction']) else None
        self.email = data['email']
        self.profile_image = data['profile_image'] if 'profile_image' in data else None
        self.country_code = data['country_code'] if 'country_code' in data and len(data['country_code']) else None
        self.phone_no = data['phone_no'] if 'phone_no' in data and len(data['phone_no']) else None
        self.major = data['major'] if 'major' in data and len(data['major']) else None
        self.college = data['college'] if 'college' in data and len(data['college']) else None

def get_user_major(cur, sid):
    major = ""
    query_string = "select major.major \
                    from major_of left join major \
                        on major_of.major_id=major.id \
                    where major_of.sid = %s"
    result = cur.execute(query_string, (sid,))
    if result > 0:
        obj = cur.fetchone()
        major = obj['major']
    return major

def get_user_college(cur, sid):
    college = ""
    query_string = "select college \
                    from college \
                    where sid = %s"
    result = cur.execute(query_string, (sid,))
    if result > 0:
        obj = cur.fetchone()
        college = obj['college']
    return college


def create_user_profile(cur, current_user, data):
    major = get_user_major(cur, data['sid'])
    college = get_user_college(cur, data['sid'])
    data['major'] = major
    data['college'] = college
    new_profile = UserProfile(data)
    query_string = "insert into user_profile ( \
                    sid, \
                    public, \
                    introduction, \
                    email, \
                    profile_image, \
                    country_code, \
                    phone_no, \
                    major, \
                    college \
                    ) \
                    VALUES (%s,%s, %s, %s, %s, %s, %s, %s, %s)"
    cur.execute(query_string, (new_profile.sid,
                               new_profile.public,
                               new_profile.introduction,
                               new_profile.email,
                               new_profile.profile_image,
                               new_profile.country_code,
                               new_profile.phone_no,
                               new_profile.major,
                               new_profile.college
    ))
    return

#route function
def get_profile(user_public_uid):
    # try:
    data = {}
    data['user'] = 'Guest'
    data['profile'] = None
    user = auths.get_user_from_headers()
    if user and user['public_uid'] == user_public_uid:
        data['user'] = 'Editor'
    cur = mysql.connection.cursor()

    query_string = "select first_name, last_name, user_profile.* \
                    from user_private left join user_profile \
                        on user_private.sid = user_profile.sid \
                    where user_private.public_uid=%s" 
    result = cur.execute(query_string, (user_public_uid,))
    if result > 0:
        data['profile'] = cur.fetchone()
    return jsonify(data), 200
    # except Exception as err:
    #     print(err)
    #     return jsonify({'message' : str(err)}), 500        

def edit_profile(current_user):
    try:
        data = request.get_json()
        cur = mysql.connection.cursor()
        user = auths.get_user(current_user)
        query_string = "UPDATE user_profile SET \
                        `introduction`=%s WHERE \
                        sid=%s"
        result = cur.execute(query_string, (data['profileDesc'], user['sid']))
        mysql.connection.commit()
        cur.close()
        print(f"User {user['sid']} profile is updated")
        return jsonify({'sid': user['sid']}), 201
    except Exception as err:
        print(err)
        return jsonify({'message' : str(err)}), 500