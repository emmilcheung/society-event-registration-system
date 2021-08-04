from flask import  request, jsonify
from Module import app, mysql
from Utilities import auths
from Module.Association import association
from Module import venue

from datetime import datetime
import uuid
from urllib.parse import unquote

# return meta style

query_style = "select event.title as title, \
                            event.event_id as event_id, \
                            event.profile_image as event_profile_image, \
                            event.association_title as association_title, \
                            event.association_image as association_profile_image, \
                            event.category as category, \
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
                    on run.event_id=event.event_id "

# suppose only public event will be return , 27/11,2020
def get_events():
    return_data = []
    cur = mysql.connection.cursor()
    query_string = query_style + "where run.start_time >= CURDATE() \
                                    and event.is_public=true \
                                  order by run.start_time asc"
    if cur.execute(query_string) > 0:
        runs = cur.fetchall()
        if len(runs) > 0:
            for run in runs:
                for key in run.keys():
                    # string the dateime for client javascript import
                    if isinstance(run[key], datetime):
                        run[key] = run[key].__str__()
        return_data = runs
    # return 
    return  return_data

def get_events_by_date(date):
    return_data = []

    cur = mysql.connection.cursor()
    query_string = query_style + "where run.start_time between %s and %s \
                                    and event.is_public=true \
                                  order by run.start_time asc"
    if cur.execute(query_string, (f"{date} 00:00:00", f'{date} 23:59:59')) > 0:
        runs = cur.fetchall()
        if len(runs) > 0:
            for run in runs:
                for key in run.keys():
                    # string the dateime for client javascript import
                    if isinstance(run[key], datetime):
                        run[key] = run[key].__str__()
        return_data = runs
    # return 
    return return_data

def get_events_by_date_range(start, end):
    return_data = []

    cur = mysql.connection.cursor()
    query_string = query_style + "where run.start_time between %s and %s \
                                    and event.is_public=true \
                                  order by run.start_time asc"
    if cur.execute(query_string, (f"{start} 00:00:00", f'{end} 23:59:59')) > 0:
        runs = cur.fetchall()
        if len(runs) > 0:
            for run in runs:
                for key in run.keys():
                    # string the dateime for client javascript import
                    if isinstance(run[key], datetime):
                        run[key] = run[key].__str__()
        return_data = runs
    # return 
    return return_data

def get_events_by_category(category):
    return_data = []

    cur = mysql.connection.cursor()
    if category:
        query_string = query_style + "where event.category=%s \
                                        and run.start_time >= CURDATE() \
                                        and event.is_public=true \
                                    order by run.start_time asc"
        if cur.execute(query_string, (category,)) > 0:
            runs = cur.fetchall()
            if len(runs) > 0:
                for run in runs:
                    for key in run.keys():
                        # string the dateime for client javascript import
                        if isinstance(run[key], datetime):
                            run[key] = run[key].__str__()
            return_data = runs
    else:
        query_string = query_style + "where run.start_time >= CURDATE() \
                                        and event.is_public=true \
                                    order by run.start_time asc"
        if cur.execute(query_string) > 0:
            runs = cur.fetchall()
            if len(runs) > 0:
                for run in runs:
                    for key in run.keys():
                        # string the dateime for client javascript import
                        if isinstance(run[key], datetime):
                            run[key] = run[key].__str__()
            return_data = runs
    # return 
    return return_data

# def get_event_titles(keywords):

#     return_date = []
#     cur = mysql.connection.cursor()

def get_events_by_title(text):
    return_data = []
    unique_events = {}
    cur = mysql.connection.cursor()

    keywords = tuple(list(map(lambda s: f"%{s}%", unquote(text).split(' '))))
    # events title with all keywords
    query_string = (query_style
                    + "where "
                    + " and ".join(["event.title like %s" for _ in range(len(keywords))])
                    + " and event.is_public=true \
                        and run.start_time >= CURDATE() \
                       order by run.start_time asc"
                   )
    if cur.execute(query_string, keywords) > 0:
        print("hello world")
        runs = cur.fetchall()
        if len(runs) > 0:
            print(runs)
            for run in runs:
                for key in run.keys():
                    # string the dateime for client javascript import
                    if isinstance(run[key], datetime):
                        run[key] = run[key].__str__()
                if not run['event_id'] in unique_events:
                    return_data.append(run)
                    unique_events[run['event_id']] = True
    # return 
    return  return_data

def get_associations_by_type(association_type):
    return_data = []
    cur = mysql.connection.cursor()
    if association_type:
        query_string = "select * from association where approved=true and type=%s"
        if cur.execute(query_string, (association_type,)) > 0:
            return_data = cur.fetchall()
    else:
        query_string = "select * from association where approved=true"
        if cur.execute(query_string) > 0:
            return_data = cur.fetchall()
    return return_data

# route function
def search():
    try:
        """
        other condition
        """
        queries = request.args.to_dict()
        # if query is a date
        if 'da' in queries.keys():
            return_data = get_events_by_date(queries['da'])
        # if query is a date range
        elif 'ds' in queries.keys() and 'de' in queries.keys():
            return_data = get_events_by_date_range(queries['ds'], queries['de'])
        
        # if query is a category
        elif 'ca' in queries.keys():
            return_data = get_events_by_category(queries['ca'])

        elif 'kw' in queries.keys():
            return_data = get_events_by_title(queries['kw'])
        elif 'as' in queries.keys():
            return_data = get_associations_by_type(queries['as'])

        else:
            return_data = get_events()
        return jsonify(return_data), 200
    except Exception as err:
        print(err)
        return jsonify({'internalError': 'Please try again later'}), 500


