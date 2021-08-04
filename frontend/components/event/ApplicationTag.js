import React, { useState } from 'react'
// libraries
import cookie from 'js-cookie';
// components
import TicketModal from '../modals/TicketModal';
// material-ui 
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import { Button } from '@material-ui/core'
// provider
import { useAuth } from '../authProvider';
// config
import { config } from '../../config/initialConfig';

const ApplicationTag = ({
    title,
    runId,
    registration,
    identity,
    online,
    handleClick,
    setFormModal,
    userRole,
}) => {

    // variables declairation
    const [ticket, setTicket] = useState({ token: "", status: config.TICKET_STATUS_USED });
    const [ticketOpen, setTicketOpen] = useState(false);
    const { user } = useAuth();

    // online 
    // instant variable to indicate if this run is online 
    // set the url if this is online 
    const onlineURL = online ? registration.online_url : null;
    const onlineTime = online ? new Date(registration.online_time) : null;

    // Display manipulation 
    
    // construct the time string for the tag 
    const getDateString = (form) => {
        var month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        var weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var startTime = form.start_time ? new Date(form.start_time) : null;
        var endTime = form.end_time ? new Date(form.end_time) : null;

        var timeString = `${startTime.getDate()} ${month[startTime.getMonth()]}`
        // getTimezoneOffset() positive = behind UTC , so * -1
        var currentTimeZone = -1 * new Date().getTimezoneOffset() / 60;
        // start from 'from' if there is end time

        timeString += ` ${startTime.getHours() < 10 ? "0" : ""}${startTime.getHours()}:${startTime.getMinutes() < 10 ? "0" : ""}${startTime.getMinutes()} -`
        if (endTime.getDate() !== startTime.getDate() || endTime.getMonth() !== startTime.getMonth()) {
            timeString += ` ${endTime.getDate()} ${month[endTime.getMonth()]}`
        }
        timeString += ` ${endTime.getHours() < 10 ? "0" : ""}${endTime.getHours()}:${endTime.getMinutes() < 10 ? "0" : ""}${endTime.getMinutes()}`

        return timeString;
    }

    // handle on click if a user is participant of the tag
    const participantClick = () => {
        if (online) {
            getLink();
        }
        else {
            getTicket();
        }
    }

    // handle on click if the event is online
    const getLink = () => {
        // disable the link if the entry is not yet opened
        if (onlineTime.getTime() > (new Date()).getTime()) {
            alert("Not open");
        }
        else {
            // start a new window in user browser
            window.open(onlineURL, '_blank');

            // post participant record to the api end point
            var jwtToken = cookie.get('jwt-token');
            fetch(`${config.SERVER_BASE}/api/online_attendance`, {
                method: "POST",
                headers: {
                    "x-access-token": jwtToken,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    runId: runId
                })
            })
        }
    }

    // handle click if user is a participant and this is a on site event
    const getTicket = async () => {
        var jwtToken = cookie.get('jwt-token');
        var res = await fetch(`${config.SERVER_BASE}/api/ticket/${runId}`, {
            headers: {
                "x-access-token": jwtToken,
            }
        })
        if (res.status !== 200) return
        var obj = await res.json();
        //prevent internal add length to forms undefined
        if (obj.token) {
            setTicket(obj);
            setTicketOpen(true);
        }
    };
    return (
        <div className="application_form">
            <h1>{title}</h1>
            <dl>
                <dt>Type</dt>
                <dd>{registration.internal === 1 ? "In-app application" : "External"}</dd>
                <dt>Period</dt>
                <dd>{getDateString(registration)}</dd>
                <dt>Quota</dt>
                <dd>{`${registration.participants} / ${registration.quota}`}</dd>
            </dl>
            <p>
                {registration.remark ? registration.remark : ""}
            </p>
            {
                // if it is an external link
                registration.internal === 0 &&
                <Button variant="outlined">
                    <a href={registration.url} target="_blank">Go to site</a>
                </Button>

            }
            {
                //if it allow in-app application
                registration.internal === 1 &&
                <Button variant="outlined"
                    disabled={(identity === "Guest" || registration.participants >= registration.quota)
                        ? true
                        : false
                    }
                    onClick={
                        identity == "Participant"
                            ? participantClick
                            : handleClick
                    }
                >
                    <span>
                        {
                            // require user login when guest
                            (identity === "Guest") &&
                            "Login is required"
                        }
                        {
                            //visitor (not a applicatant)
                            (identity === "Vistor") &&
                            (registration.participants < registration.quota
                                ? "Apply Now"
                                : "Full"
                            )
                        }
                        {
                            //visitor (not a applicatant)
                            (identity === "Participant") &&
                            (online
                                ? "Open Link"
                                : "Open Ticket")
                        }
                    </span>
                </Button>
            }
            <div style={{
                position: "absolute",
                top: "0",
                right: "0",
            }}>
                {
                    userRole == config.EVENT_USER_ROLE[0] &&
                    <Tooltip title="Edit Tag">
                        <IconButton aria-label="edit mode"
                            onClick={() => setFormModal(prev => !prev)}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                }
            </div>
            <TicketModal
                open={ticketOpen}
                setOpen={setTicketOpen}
                ticket={ticket}
            />
        </div>
    );
}

export default ApplicationTag;