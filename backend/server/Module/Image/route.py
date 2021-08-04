from flask import Blueprint, Flask
from Module.Image import image as image_service
from Utilities import auths

image_route = Blueprint('image', __name__)

@image_route.route('/api/upload_image', methods=['GET', 'POST'])
@auths.is_auth
def upload_file(current_user):
    return image_service.upload_file()

@image_route.route('/api/update_profile_image', methods=['GET', 'POST'])
@auths.is_auth
def update_profile_image(current_user):
    return image_service.update_profile_image(current_user)

@image_route.route('/img/<filename>')
def uploaded_file(filename):
    return image_service.uploaded_file(filename)