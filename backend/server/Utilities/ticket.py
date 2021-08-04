from Module import app, mysql

import jwt

TICKET_STATUS_AVALIABLE = 0
TICKET_STATUS_USED = 1
TICKET_STATUS_PASSED = -1

class Ticket():

    def __init__(self, data):
        self.application_id = data['applicationId']
        self.token = data['ticketToken']
        self.status = TICKET_STATUS_AVALIABLE

def generate_ticket(user, data, application_id):
    token = jwt.encode({
        'applicationId': application_id,
        'runId' : data['runId'],
        'sid' : user['sid']
    }, app.secret_key, algorithm='HS256')
    return "CUEV:" + token.decode("utf-8")

def insert_ticket(cur, user, data, application_id):
    ticket_token = generate_ticket(user, data, application_id)
    new_ticket = Ticket({
        "applicationId" : application_id,
        "ticketToken" : ticket_token
    })
    query_string = "INSERT INTO ticket( \
                    `application_id`, \
                    `token`, \
                    `status` \
                    ) \
                    VALUES (%s, %s, %s)"
    result = cur.execute(query_string, (
                                        new_ticket.application_id,
                                        new_ticket.token,
                                        new_ticket.status
                                        ))
    return cur.lastrowid

def use_ticket(cur, ticket):

    query_string = "UPDATE ticket \
                    SET status=%s \
                    WHERE token=%s"
    result = cur.execute(query_string, (TICKET_STATUS_USED,
                                        ticket
    ))