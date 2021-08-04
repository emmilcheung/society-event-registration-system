from Module import app, mysql
import datetime
import uuid

class Venue():
    def __init__(self, data):
        self.title = data['title']
        self.address = data['address']
        self.lat = data['lat'] if 'lat' in data else None
        self.lng = data['lng'] if 'lng' in data else None
        self.place_id = data['placeId'] if 'placeId' in data else None
        self.zoom = data['zoom'] if 'zoom' in data else None
        self.description = 'description' in data if data['description'] else None

def insert_venue(cur, venue):
    new_venue = Venue(venue)
    query_string = "INSERT INTO venue ( \
                    title, \
                    address, \
                    lat, \
                    lng, \
                    place_id, \
                    zoom, \
                    description \
                    ) \
                    VALUES (%s, %s, %s, %s, %s, %s, %s)"
    result = cur.execute(query_string, (new_venue.title, 
                                        new_venue.address,
                                        new_venue.lat,
                                        new_venue.lng,
                                        new_venue.place_id,
                                        new_venue.zoom,
                                        new_venue.description,
    ))
    return cur.lastrowid