import React, { useState, useEffect, useRef } from "react";
// external libraries
import moment from 'moment';
import cookie from 'js-cookie';

// next.js component
import Link from 'next/link';
import { useRouter } from 'next/router';

// material-ui component
import { Button } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faMapMarkerAlt, faUsers, faUsersSlash, faPlus } from '@fortawesome/free-solid-svg-icons'

// config
import { config } from '../../config/initialConfig';

// provider
import { useAuth } from '../authProvider';

// components
import CreateRegistrationModal from '../../components/modals/CreateRegistrationModal';
import ApplyModal from '../../components/modals/ApplyModal';
import ApplicationTag from './ApplicationTag';
import Participants from "./Participants";
import Survey from "./Survey";

// this is the main container of the event page
const EventContainer = ({ event, selectedRun, userRole }) => {

    // next router initialization
    const router = useRouter();

    // provider 
    const { user } = useAuth();

    // get the query params and matching with the local configuration
    const tab = router.query.tab
        ? userRole === config.EVENT_USER_ROLE[0]
            ? config.ADMIN_EVENT_TAB.includes(router.query.tab)
                ? router.query.tab
                : config.ADMIN_EVENT_TAB[0]
            : config.PUBLIC_EVENT_TAB.includes(router.query.tab)
                ? router.query.tab
                : config.PUBLIC_EVENT_TAB[0]
        : config.PUBLIC_EVENT_TAB[0];

    /**
     * variable declairation
     */
    const [tablist, setTablist] = useState(config.PUBLIC_EVENT_TAB);
    // registration state
    const [registrations, setRegistrations] = useState(null);
    const [userStatus, setUserStatus] = useState({});
    const [identity, setIdentity] = useState("Guest")
    //participant state
    const [participants, setParticipants] = useState({});
    //system state
    const [formModal, setFormModal] = useState(false);
    const [applyModal, setApplyModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const online = event.runs.filter(run => run.run_id == selectedRun)[0].online == 1;

    // update user role when user object is change
    useEffect(() => {
        //if user is manager
        if (userRole === config.EVENT_USER_ROLE[0]) {
            setTablist(config.ADMIN_EVENT_TAB);
        }
        loadApplications();

    }, [user])

    // update the identity state when user navigate between runs
    useEffect(() => {
        if(user){
            setIdentity(userStatus[selectedRun] ? "Participant" : "Vistor");
        }

    }, [selectedRun])

    // load application information of the event and update page states
    const loadApplications = async () => {
        setLoading(true);
        var jwtToken = cookie.get('jwt-token');
        var res = await fetch(`${config.SERVER_BASE}/api/application_form/${router.query.id}`, {
            headers: {
                "x-access-token": jwtToken,
            }
        })
        if (res.status !== 200) return
        var obj = await res.json();
        //prevent internal add length to forms undefined
        setRegistrations({
            ...obj.forms,
        });
        setUserStatus(obj.user_status);
        if(user){
            setIdentity(obj.user_status[selectedRun] ? "Participant" : "Vistor");
        }
    }

    // handle submission button on click for create new event registration
    // post the content to the backend API
    const registrationModalClick = async (data) => {
        data.eventId = event.event_id;
        data.runId = selectedRun;
        data.associationId = event.association_id;
        // 
        const token = cookie.get('jwt-token');
        var res = await fetch(`${config.SERVER_BASE}/api/application_form`, {
            method: "POST",
            headers: {
                "x-access-token": token,
                "content-type": "application/json",
            },
            body: JSON.stringify(data),
        })
        if (res.status !== 201) return

        // reload the application status of the event after updated
        await loadApplications();
        
        // close the form modal after finished
        setFormModal(false);
    }

    // handle submission button on click for event application edition
    // post the changed content to the backend API
    const editApplicationForm = async (data) => {
        data.eventId = event.event_id;
        data.runId = selectedRun;
        data.associationId = event.association_id;
        console.log(data);
        const token = cookie.get('jwt-token');
        var res = await fetch(`${config.SERVER_BASE}/api/application_form`, {
            method: "PUT",
            headers: {
                "x-access-token": token,
                "content-type": "application/json",
            },
            body: JSON.stringify(data),
        })
        if (res.status !== 200) return
        var obj = await res.json();
        //prevent internal add length to forms undefined
        setRegistrations({
            ...obj.forms,
        });
        setUserStatus(obj.user_status);
        if(user){
            setIdentity(obj.user_status[selectedRun] ? "Participant" : "Vistor");
        }
        setFormModal(false);
    }

    // handle submission button on click for user to participate
    // post the changed content to the backend API
    const applyModalClick = async (email, phone) => {
        var data = {
            eventId: event.event_id,
            runId: selectedRun,
            email: email,
            phone: phone
        }
        const token = cookie.get('jwt-token');
        var res = await fetch(`${config.SERVER_BASE}/api/application`, {
            method: "POST",
            headers: {
                "x-access-token": token,
                "content-type": "application/json",
            },
            body: JSON.stringify(data),
        })
        if (res.status !== 201) return
        var a = await loadApplications();
        setApplyModal(false);
    }

    // function for ApplicationTag to open the registrationModal in edit mode
    const editRegistrationModal = () => {
        setFormModal(true);
    }

    // Display manipulation 
    // Construct the event run date display string with run details
    const getRunDateString = (run) => {
        var month = ["Janary", "Febrary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var startTime = run.start_time ? new Date(run.start_time) : null;
        var endTime = run.end_time ? new Date(run.end_time) : null;

        var timeString = `${startTime.getDate()} ${month[startTime.getMonth()]} ${startTime.getFullYear()} (${weekDays[startTime.getDay()]})`

        if (!run.all_day) {
            // getTimezoneOffset() positive = behind UTC , so * -1
            var currentTimeZone = -1 * new Date().getTimezoneOffset() / 60;
            // start from 'from' if there is end time
            if (endTime) {
                timeString += ` from ${startTime.getHours() < 10 ? "0" : ""}${startTime.getHours()}:${startTime.getMinutes() < 10 ? "0" : ""}${startTime.getMinutes()}`
                timeString += ` to ${endTime.getHours() < 10 ? "0" : ""}${endTime.getHours()}:${endTime.getMinutes() < 10 ? "0" : ""}${endTime.getMinutes()}`
            }
            // start with at if no end time
            else {
                timeString += ` at ${startTime.getHours() < 10 ? "0" : ""}${startTime.getHours()}:${startTime.getMinutes() < 10 ? "0" : ""}${startTime.getMinutes()}`
            }

        }
        return timeString;
    }

    // construct the text of the run navigation button
    const getRunDateButton = (run) => {
        var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var startTime = run['start_time'] ? new Date(run['start_time']) : null;
        var endTime = run['end_time'] ? new Date(run['end_time']) : null;

        var timeString = `${weekDays[startTime.getDay()]},${startTime.getDate()} ${month[startTime.getMonth()]}`

        return timeString;
    }

    // new line character handle for display
    const parseDescription = (desc) => {
        return String(desc).replace(/(?:\r\n|\r|\n)/g, "<br />")
    }

    // sort the event runs into time order, return array of runs
    const formatRuns = (runs) => {
        if (!runs) return [];

        return runs.slice()
            .sort((a, b) => a.start_time - b.start_time)
            .map(run => {
                return {
                    string: getRunDateButton(run),
                    runId: run.run_id
                }
            })
    }

    // construct the url by google calender format for user to add the event into their calender
    const addtoCalendar = () => {
        //http://kalinka.tardate.com/
        var run = event.runs.filter(run => run.run_id === selectedRun)[0];
        var title = event.title.replace(/\s/g, "+");
        var start = moment(run.start_time).format('YYYYMMDDTHHmmss')
        var end = moment(run.end_time).format('YYYYMMDDTHHmmss')
        var location = run.address ? run.address.replace(/\s/g, "+") : run.title;
        var details = `http%3A%2F%2Flocalhost%3A3000%2Fevent%2F${event.event_id}`
        return `https://calendar.google.com/calendar/u/0/r/eventedit?text=${title}&dates=${start}/${end}&details=${details}&location=${location}&sf=true&output=xml`

    }

    return (
        <div className="event_container">
            <div className="event_header">
                <Link href={`/association/${event.association_id}`}>
                    <a>
                        <img
                            src={event.association_profile_image ? `${config.SERVER_BASE}/img/${event.association_profile_image}` : "/img/association.jpg"}
                        />
                        <h2><span>{`${event.association_title}`}</span></h2>
                    </a>
                </Link>
                <div className="fb-share-button" data-href="https://developers.facebook.com/docs/plugins/" data-layout="button_count" data-size="small">
                    <a target="_blank" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`http://127.0.0.1:3000/event/${event.event_id}`)}`} className="fb-xfbml-parse-ignore">
                        <img src="/img/facebook.jpg" alt="facebook share" width="100px" />
                    </a>
                </div>
            </div>
            {
                //prevent image error
                // <div className="image-container">
                <a href={
                    event.profile_image && event.profile_image.length
                        ? `${config.SERVER_BASE}/img/${event['profile_image']}`
                        : "/img/events-placeholder.png"
                }
                    target="_blank"
                    className="image-container"
                >

                    <img
                        src={
                            event.profile_image && event.profile_image.length
                                ? `${config.SERVER_BASE}/img/${event['profile_image']}`
                                : "/img/events-placeholder.png"
                        }
                        alt={event.title}
                        style={{ height: 'auto', width: 'auto' }}
                    />
                </a>
                // </div>
            }
            <nav className="nav">
                <ul>
                    {
                        //if user is admin
                        userRole === config.EVENT_USER_ROLE[0] &&
                        ['Detail', 'Applicants', 'Survey'].map((title, i) => {
                            return (
                                <li>
                                    <a
                                        className={tab === config.ADMIN_EVENT_TAB[i] ? "event_active" : ""}
                                        onClick={() => router.replace({
                                            pathname: `/event/${event.event_id}`,
                                            query: {
                                                r: selectedRun,
                                                tab: config.ADMIN_EVENT_TAB[i]
                                            },
                                        }, undefined, { shallow: true })
                                        }>
                                        {title}
                                    </a>
                                </li>
                            )
                        })
                    }
                    {
                        // if user is guest
                        userRole === config.EVENT_USER_ROLE[1] &&
                        ['Detail'].map((title, i) => {
                            return (
                                <li>
                                    <a
                                        className={tab === config.PUBLIC_EVENT_TAB[i] ? "event_active" : ""}
                                        onClick={() => router.push({
                                            pathname: `/event/${event.event_id}`,
                                            query: {
                                                r: selectedRun,
                                                tab: config.PUBLIC_EVENT_TAB[i]
                                            },
                                        }, undefined, { shallow: true })
                                        }>
                                        {title}
                                    </a>
                                </li>
                            )
                        })
                    }
                </ul>
            </nav>
            {/* tab = detail */}
            {
                tab === "detail" &&
                <div className="event_content">
                    {
                        event.title &&
                        <div className="event_title">
                            <h1>{event.title}
                                {
                                    (userRole === 'Admin') &&
                                    <Button
                                        style={{ float: 'right' }}
                                        variant="outlined"
                                        onClick={() => {
                                            router.push({
                                                pathname: '/edit_event',
                                                query: {
                                                    e: event.event_id,
                                                    a: event.association_id
                                                }
                                            })
                                        }}
                                    >Edit</Button>
                                }
                            </h1>

                        </div>
                    }

                    {
                        event.runs &&
                        <div className="date_btn">
                            <div className="date_btn_container">
                                {
                                    formatRuns(event.runs).map((content) => {
                                        return (
                                            <div className={`date ${content.runId === selectedRun ? "selected" : ""}`}
                                                onClick={() => {
                                                    router.replace({
                                                        pathname: `/event/${event.event_id}`,
                                                        query: {
                                                            r: content.runId
                                                        },
                                                    }, undefined, { shallow: true })
                                                }}
                                            >
                                                <span>{content.string}</span>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <hr />
                        </div>
                    }
                    <div className="details_container">
                        {
                            event.runs &&
                            event.runs.filter(run => run.run_id === selectedRun)
                                .map((run) => {
                                    return (
                                        <>
                                            {/* this run.title is a bug (venue title) need to fix it later */}
                                            <div className="date">
                                                <div className="icon">
                                                    <FontAwesomeIcon icon={faClock} size="2x" />
                                                </div>
                                                <div className="text">
                                                    <div className="time">
                                                        {getRunDateString(run)}
                                                    </div>
                                                    {
                                                        <div className="status">
                                                            {
                                                                new Date(run.start_time) > new Date()
                                                                    ? "Up comming"
                                                                    : "Passed"
                                                            }
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="venue">
                                                <div className="icon">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} size="2x" />
                                                </div>
                                                <div className="text">
                                                    {
                                                        run.online === 0 &&
                                                        <>
                                                            <div className="name">{`${run.title} (${run.address})`}</div>
                                                            <div className="address">
                                                                <a
                                                                    href={
                                                                        run.place_id
                                                                            ? `https://google.com/maps/place/?q=place_id:${run.place_id}`
                                                                            : `https://google.com/maps/search/${run.address}/@${run.lat},${run.lng},${run.zoom}z`
                                                                    }
                                                                    target="_blank"
                                                                >
                                                                    view in google map
                                                                </a>

                                                            </div>
                                                        </>
                                                    }
                                                    {
                                                        run.online === 1 &&
                                                        <div className="name">{`Online`}</div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="host">
                                                <div className="icon">
                                                    <FontAwesomeIcon icon={
                                                        event['is_public']
                                                            ? faUsers
                                                            : faUsersSlash
                                                    }
                                                        size="2x"
                                                    />
                                                </div>
                                                <div className="text">
                                                    <div className="name">
                                                        <Link href={`/association/${event['association_id']}`}>
                                                            <a>
                                                                <span>
                                                                    {`${event['is_public'] ? "Public" : "Private"} · Created by `}
                                                                    {`${event['association_title']}`}
                                                                </span>
                                                            </a>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="calendar_btn">
                                                <Button variant="outlined">
                                                    <a target="__blank"
                                                        href={addtoCalendar()}>
                                                        add to calendar</a>
                                                </Button>
                                            </div>
                                        </>)
                                })

                        }
                    </div>
                    {/* Description of event */}
                    <div className="desc">
                        <div className="desc_header">

                        </div>
                        <div dangerouslySetInnerHTML={{ __html: `<p>${parseDescription(event.description)}</p>` }} className="dangerous_text" />
                    </div>
                    <div className="event_regisation">
                        {
                            //admin user, loaded registration and not have existing form
                            (userRole === 'Admin' &&
                                registrations && !registrations[selectedRun]) &&
                            <Button
                                variant="outlined"
                                onClick={() => setFormModal(!formModal)}
                                className="create_form"
                            >
                                <div className="plus">
                                    <FontAwesomeIcon icon={faPlus} size="3x" />
                                    <span>New registration</span>
                                </div>
                            </Button>
                        }
                        {
                            // registrations loaded and have existing form
                            (registrations && Object.keys(registrations).includes(selectedRun)) &&
                            <ApplicationTag
                                title={`Apply`}
                                runId={selectedRun}
                                registration={registrations[selectedRun]}
                                identity={identity}
                                online={online}
                                handleClick={() => setApplyModal(true)}
                                setFormModal={editRegistrationModal}
                                userRole={userRole}
                            />
                        }
                    </div>

                </div>
            }
            {/* Participant */}
            {
                (userRole === "Admin" && tab === "participant") &&
                <Participants
                    event={event}
                    registrations={registrations}
                    participants={participants}
                    setParticipants={setParticipants}
                />
            }
            {/* Survey */}
            {
                (userRole === "Admin" && tab === "survey") &&
                <Survey
                    event={event}
                />
            }
            {/* Modals */}
            <CreateRegistrationModal
                open={formModal}
                setOpen={setFormModal}
                formData={registrations ? registrations[selectedRun] : null}
                create={registrationModalClick}
                edit={editApplicationForm}
                online={online}
            />
            <ApplyModal
                open={applyModal}
                setOpen={setApplyModal}
                email={user?.email}
                handleClick={applyModalClick}
            />
        </div>
    );
}

export default EventContainer;