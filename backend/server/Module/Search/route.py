from flask import Blueprint, Flask
from Module.Search import search_events 
from Utilities import auths

search_route = Blueprint('search-event', __name__)

@search_route.route('/api/search', methods=['GET'])
def search():
    return search_events.search()