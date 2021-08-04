import os
from flask import Flask, flash, request, redirect, url_for, send_from_directory, jsonify
from Module import app, mysql
from werkzeug.utils import secure_filename
from hashlib import sha1
from datetime import datetime
from Utilities import auths

UPLOAD_FOLDER = './img/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

#helper function 

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# @app.route('/upload_image', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        try:
            # check if the post request has the file part
            if 'file' not in request.files:
                flash('No file part')
                return jsonify({'message': 'No file part'}), 401
            file = request.files['file']
            # if user does not select file, browser also
            # submit an empty part without filename
            if file.filename == '':
                flash('No selected file')
                return jsonify({'message': 'No selected file'}), 401
            if file and allowed_file(file.filename):
                # filename = secure_filename(file.filename)
                filename = sha1((f"{file.filename}{datetime.timestamp(datetime.now())}").encode("utf-8")).hexdigest() + "." + file.filename.rsplit('.', 1)[1].lower()
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                return jsonify({'image': filename}), 302
        except Exception as err:
            print(err)
            return jsonify({'message' : str(err)}), 500
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''

# @app.route('/img/<filename>')
def uploaded_file(filename):
    try:
        current_url = os.getcwd()
        return send_from_directory(os.path.join(current_url, "img/"), filename)
    except Exception as err:
        print(err)
        return jsonify({'message' : str(err)}), 500

# @app.route('/api/update_profile_image', methods=['GET', 'POST'])
def update_profile_image(current_user):
    if request.method == 'POST':
        try:
            # check if the post request has the file part
            if 'file' not in request.files:
                flash('No file part')
                return jsonify({'message': 'No file part'}), 401
            file = request.files['file']
            # if user does not select file, browser also
            # submit an empty part without filename
            if file.filename == '':
                flash('No selected file')
                return jsonify({'message': 'No selected file'}), 401
            if file and allowed_file(file.filename):
                # filename = secure_filename(file.filename)
                filename = sha1((f"{file.filename}{datetime.timestamp(datetime.now())}").encode("utf-8")).hexdigest() + "." + file.filename.rsplit('.', 1)[1].lower()
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

                cur = mysql.connection.cursor()
                user = auths.get_user(current_user)
                query_string = "UPDATE user_profile SET \
                                `profile_image`=%s WHERE \
                                sid=%s"
                result = cur.execute(query_string, (filename, user['sid']))
                mysql.connection.commit()
                cur.close()
                print(f"User {user['sid']} has uploaded profile image {filename}")
                return jsonify({'image': filename}), 302
        except Exception as err:
            print(err)
            return jsonify({'message' : str(err)}), 500
    return