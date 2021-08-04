from flask import  request, jsonify
from flask_cors import CORS, cross_origin
from Module import app, mysql
from Utilities import auths
from Module import venue
import datetime
import uuid

class Association():
    def __init__(self, data):
        if not 'title' in data:
            raise ValueError("Title is required")
        if not 'description' in data:
            raise ValueError("Title is required")
        if not 'type' in data:
            raise ValueError("Assoication type is required")
        self.association_id = uuid.uuid4()
        self.title = data['title']
        self.profile_image = data['profileImage'] if 'profileImage' in data else None
        self.description = data['description']
        self.website = data['website'] if 'website' in data else None
        self.email = data['email'] if 'email' in data else None
        self.introduction = data['introduction'] if 'introduction' in data else None
        self.country_code = data['countryCode'] if 'countryCode' in data else None
        self.phone_no = data['phoneNo'] if 'phoneNo' in data else None
        self.type = data['type']
        self.official = False
        self.approved = False
        self.parent_id = data['parentId'] if 'parentId' in data else None

def insert_association(cur, data):
    new_association = Association(data)
    query_string = "INSERT INTO association ( \
                    `association_id`, \
                    `title`, \
                    `description`, \
                    `profile_image`, \
                    `website`, \
                    `email`, \
                    `country_code`, \
                    `phone_no`, \
                    `introduction`, \
                    `type`, \
                    `official`, \
                    `approved`, \
                    `parent_id` \
                    ) \
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
    result = cur.execute(query_string, (new_association.association_id,
                                        new_association.title, 
                                        new_association.description, 
                                        new_association.profile_image, 
                                        new_association.website, 
                                        new_association.email, 
                                        new_association.country_code, 
                                        new_association.phone_no, 
                                        new_association.introduction, 
                                        new_association.type,
                                        new_association.official,
                                        new_association.approved,
                                        new_association.parent_id,
    ))
    return new_association.association_id



def insert_approve_request(cur, association_id):
    query_string = "INSERT INTO approve_request ( \
                    `association_id`, \
                    `request_type` \
                    ) \
                    VALUES (%s, %s)"
    cur.execute(query_string, (association_id, 'association'))

def insert_association_role(cur, current_user, association_id):
    user = auths.get_user(current_user)
    query_string = "INSERT INTO association_role ( \
        `sid`,\
        `association_id`, \
        `role`\
        ) VALUES (%s, %s, %s)"
    cur.execute(query_string, (user['sid'], association_id, "Admin"))

def insert_member(cur, current_user, association_id):
    user = auths.get_user(current_user)
    query_string = "INSERT INTO member( \
        `sid`,\
        `association_id` \
        ) VALUES (%s, %s)"
    cur.execute(query_string, (user['sid'], association_id))

def get_manage_role(cur, association_id, sid):
    query_string = "select role \
                         from association_role left join user_private \
                            on association_role.sid=user_private.sid \
                         where association_id=%s \
                            and user_private.sid=%s"
    result = cur.execute(query_string, (association_id, sid))
    if result <= 0 :
        return None
    return cur.fetchone()

# route function
def create_association(current_user, data):
        cur = mysql.connection.cursor()
        association_id = insert_association(cur, data)
        insert_approve_request(cur, association_id)
        insert_association_role(cur, current_user,association_id)
        insert_member(cur, current_user,association_id)

        if not data['venue']['venueId']:
                data['venue']['venueId'] = venue.insert_venue(cur, data['venue'])

        mysql.connection.commit()
        cur.close()
        return association_id

# route function
def get_association(association_id):
    try:
        data = {}
        # default set user as guest
        data['user'] = 'Guest'

        cur = mysql.connection.cursor()
        # find if there is association with this id
        query_string = "select * \
                        from association \
                        where association_id=%s"
        result = cur.execute(query_string, (association_id,))
        # if no such association, return
        if result <= 0:
            return jsonify({"message": "Association not found"}), 404 
            
        data['association'] = cur.fetchone()
        approved = data['association']['approved']
        # check if client is a user
        user = auths.get_user_from_headers()
        if not user:
            # if the association is not approved
            if approved == 0:
                return jsonify({"message": "Association not found"}), 404
            
            return jsonify(data), 200

        # check if user is a manager of the association
        role = get_manage_role(cur, association_id, user['sid'])
        # if not approved association and user is not a manager
        if approved == 0 and not role :
            return {"message": "Association not found"}, 404
        print(data['association'])        
        cur.close()
        if role:
            data['user'] = role['role']
        return jsonify(data), 200
    except Exception as err:
        print(err)
        return jsonify({'message' : str(err)}), 500

# route function
def get_associations_by_user(current_user):
    return_data = []
    try:
        cur = mysql.connection.cursor()
        user = auths.get_user(current_user)
        query_string = "select * \
                        from member left join association \
                            on association.association_id=member.association_id \
                        where sid=%s and approved=true"
        result = cur.execute(query_string, (user['sid'],))
        if result > 0:
            return_data = cur.fetchall()
        cur.close()
        return jsonify(return_data), 200
    except Exception as err:
        print(err)
        return jsonify({'message' : str(err)}), 500


# route function
def edit_association(current_user, association_id):
    try:
        data = request.get_json()
        cur = mysql.connection.cursor()
        new_association = Association(data)
        query_string = "UPDATE association SET \
                        title=%s, \
                        description=%s, \
                        profile_image=%s, \
                        website=%s, \
                        email=%s, \
                        country_code=%s, \
                        phone_no=%s, \
                        introduction=%s, \
                        type=%s WHERE \
                        association_id=%s"
        result = cur.execute(query_string, (new_association.title, 
                                            new_association.description, 
                                            new_association.profile_image, 
                                            new_association.website, 
                                            new_association.email, 
                                            new_association.country_code, 
                                            new_association.phone_no, 
                                            new_association.introduction, 
                                            new_association.type,
                                            association_id,
        ))
        mysql.connection.commit()
        cur.close()
        return jsonify({'association_id': association_id}), 201
    except ValueError as err:
        return jsonify({"inputError": str(err) }), 400
    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500

# route function
def add_member(current_user):
    try:
        data = request.get_json()
        cur = mysql.connection.cursor()
        user = auths.get_user(current_user)
        success_list = []
        fail_list = []

        # check if user is a manager of this association
        role = get_manage_role(cur, data['associationId'], user['sid'])
        if not role:
            return {"message": "Unauthorized"}, 401
        for sid in data['sIDs']:
            if cur.execute('select * from member where sid=%s and association_id=%s', (user['sid'],data['associationId'])):
                fail_list.append(sid)
            query_string = "insert into member ( \
                            `sid`, \
                            `association_id` \
                            ) \
                            values (%s, %s)"
            cur.execute(query_string, (sid, data['associationId']))
            success_list.append(sid)
        mysql.connection.commit()
        cur.close()

        return jsonify({"success": success_list}), 200

    except Exception as err:
        print(err)
        return jsonify({'message' : str(err)}), 500

# route function
def add_manager(current_user):
    try:
        data = request.get_json()
        cur = mysql.connection.cursor()
        user = auths.get_user(current_user)
        success_list = []
        fail_list = []

        # check if user is a admin of this association
        role = get_manage_role(cur, data['associationId'], user['sid'])
        
        if not role or role['role'] != 'Admin':
            return {"message": "Unauthorized"}, 404
        for user in data['users']:
            # skip if user is already a manager
            if cur.execute('select * from association_role where sid=%s and association_id=%s', (user['sid'],data['associationId'])):
                fail_list.append(user['sid'])
                continue
            query_string = "insert into association_role ( \
                            `sid`, \
                            `association_id`, \
                            `role` \
                            ) \
                            values (%s, %s, %s)"
            cur.execute(query_string, (user['sid'], data['associationId'], user['role']))
            success_list.append(user['sid'])
        mysql.connection.commit()
        cur.close()

        return jsonify({"success": success_list, "fail": fail_list}), 200

    except Exception as err:
        print(err)
        return jsonify({'message' : str(err)}), 500


