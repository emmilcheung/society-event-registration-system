import React, { useState, useEffect, useRef } from "react";
import cookie from 'js-cookie';
import { useRouter } from 'next/router'
import { config } from '../../config/initialConfig'
import EventList from './EventList'
import { Button } from '@material-ui/core';

// import { useAuth } from './authProvider';

// The main conatiner of the association page

const AssociationConatiner = ({ association, userRole }) => {

    // router 
    // get params from query string 
    const router = useRouter();
    // const [tab, setTab] = useState(router.query.tab ? router.query.tab : config.ASSOCIATION_TAB[0]);
    const tab = router.query.tab
        ? config.ASSOCIATION_TAB.includes(router.query.tab)
            ? router.query.tab
            : config.ASSOCIATION_TAB[0]
        : config.ASSOCIATION_TAB[0];

    /**
     * variable declairation
     */
    const [associationEvent, setAssociationEvents] = useState(null);
    const [loading, setLoading] = useState(false);

    // load the list of event after page is initialized
    useEffect(() => {
        loadAssociationEvents()
    }, [tab])

    // http request to backend api by the association id
    const loadAssociationEvents = async () => {
        // set the state of load to activate the loading spinner
        setLoading(true);

        // get the firebase token and insert into the header
        // http request to the backend API 
        // expect a json of event list
        var jwtToken = cookie.get('jwt-token');
        var events = await fetch(`${config.SERVER_BASE}/api/association_events/${router.query.id}`, {
            headers: {
                "x-access-token": jwtToken,
            }
        }).then(res => {
            if (res.status !== 200) return null
            return res.json();
        })
        // set the result into state
        setAssociationEvents(events);
        // inactive the spinner 
        setLoading(false);
    }

    return (
        <div className="association_container">
            <div className="association_header">
                {
                    association.approved === 0 &&
                    <div className="unapproved_notice">
                        <div className="notice">
                            <span>Approval processing</span>
                        </div>
                    </div>
                }
                <div className="header_flex">
                    <div className="profile_image">
                        <img
                            src={association.profile_image
                                ? `${config.SERVER_BASE}/img/${association.profile_image}`
                                : '/img/association.jpg'
                            } alt={association.title}
                        />
                    </div>
                    <div className="association_info">
                        <div className="name">
                            {association.title}
                        </div>
                        <div className="desc">
                            {association.description}
                        </div>
                    </div>
                    {
                        // display the edit button if the user is an admin of the assoociation
                        // button to redirect user to the edit_association page with query params
                        (userRole === 'Admin' && association.approved === 1) &&
                        <div className="edit_btn">
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    router.push({
                                        pathname: '/edit_association',
                                        query: {
                                            a: association.association_id
                                        }
                                    })
                                }}
                            >Edit</Button>
                        </div>
                    }
                </div>
            </div>
            <nav>
                <ul>
                    {
                        // dynamic tag to navigate between association informations
                        // on click event to change the query params 
                        // router is use to prevent whole page reload
                        ["Event", "About", "Members"].map((title, i) => {
                            return (
                                <li>
                                    <a
                                        className={tab === config.ASSOCIATION_TAB[i] ? "association_active" : ""}
                                        onClick={() => {
                                            router.replace({
                                                pathname: `/association/${router.query.id}`,
                                                query: {
                                                    tab: config.ASSOCIATION_TAB[i]
                                                },
                                            }, undefined, { shallow: true })
                                        }}
                                    >
                                        {title}
                                    </a>
                                </li>

                            )
                        })
                    }
                </ul>
            </nav>
            <div className="margin_adjust_container">
                {
                    //tab = upcomming
                    // display the event list if the tab is equal "event"
                    (tab === "event" && associationEvent) &&
                    <div className="list_container">
                        {
                            // display the create button if the user is the admin
                            // button to redirect user to the create event (of this association) page
                            // query params of association id to indicate the association 
                            // router to prevent the whole page reload
                            (userRole === 'Admin' && association.approved === 1) &&
                            <div className="add_event_btn">
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        router.push({
                                            pathname: '/create_event',
                                            query: {
                                                a: association.association_id
                                            }
                                        })
                                    }}
                                >Create Event</Button>
                            </div>
                        }
                        
                        {/* Divide the list of event into upcoming or past event */}
                        {
                            // display if there is future event
                            // render the EventList component 
                            associationEvent.future_events.length
                                ? <div className="upcomming">
                                    <EventList
                                        type="upcomming"
                                        title="Future Events"
                                        events={associationEvent.future_events}
                                    />
                                </div>
                                : <></>
                        }
                        {
                            // display if there is past event
                            // render the EventList component 
                            associationEvent.past_events.length
                                ? <div className="past">
                                    <EventList
                                        type="past"
                                        title="Past Events"
                                        events={associationEvent.past_events}
                                    />
                                </div>
                                : <>
                                </>
                        }
                    </div>
                }
                {/* <div className="past">
                </div> */}
            </div>
        </div >
    )
}

export default AssociationConatiner;