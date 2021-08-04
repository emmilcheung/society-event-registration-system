
import React, { useState, useEffect, useRef } from "react";

import cookie from 'js-cookie';

import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image';
import Head from 'next/head';

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faClock, faMapMarkerAlt, faUsers, faUsersSlash } from '@fortawesome/free-solid-svg-icons'
import { Button, FormControl, TextField } from '@material-ui/core';

import { config } from '../../config/initialConfig'
import EventList from "./EventList";
import AssociationList from "./AssociationList";
import Statistic from "./Statistic";
import Loading from "../Loading";

// import { useAuth } from './authProvider';

const SelfProfileContainer = ({ profileData, uid, associations, setAssociations }) => {

    const router = useRouter();
    // const [tab, setTab] = useState(router.query.tab ? router.query.tab : config.PROFILE_TAB[0]);
    const tab = router.query.tab
        ? config.PROFILE_TAB.includes(router.query.tab)
            ? router.query.tab
            : config.PROFILE_TAB[0]
        : config.PROFILE_TAB[0]

    const [profileImage, setProfileImage] = useState(profileData.profile.profile_image ? profileData.profile.profile_image : '');
    const inputFile = useRef(null);
    const [userEvent, setUserEvent] = useState(null)
    const [loading, setLoading] = useState(false);
    const [profileDesc, setProfileDesc] = useState(profileData.profile.introduction ? profileData.profile.introduction : "Welcome");
    const [recommendation, setRecommendation] = useState([]);
    useEffect(() => {
        if ((tab === "upcomming" || tab === "past" || tab === "statistic") && !userEvent && uid) {
            loadUserEvents();
        }

        if (tab === "my_association" && !associations)
            loadMyAssociation();
    }, [tab, uid])
    useEffect(() => {
        if (uid) {
            loadRecommendation();
        }
    }, [uid])

    const loadUserEvents = async () => {
        setLoading(true);
        var jwtToken = cookie.get('jwt-token');
        var events = await fetch(`${config.SERVER_BASE}/api/user_events/${uid}`, {
            headers: {
                "x-access-token": jwtToken,
            }
        }).then(res => {
            if (res.status !== 200) return null
            return res.json();
        })
        setUserEvent(events);
        setLoading(false);
    }

    const loadMyAssociation = async () => {
        setLoading(true);
        var jwtToken = cookie.get('jwt-token');
        var associations = await fetch(`${config.SERVER_BASE}/api/my_association`, {
            headers: {
                "x-access-token": jwtToken,
            }
        }).then(res => {
            if (res.status !== 200) return null
            return res.json();
        })
        setAssociations(associations);
        setLoading(false);
    }

    const loadRecommendation = async () => {
        setLoading(true);
        var jwtToken = cookie.get('jwt-token');
        var recommendation = await fetch(`${config.SERVER_BASE}/api/get_recommendation/${uid}`, {
            headers: {
                "x-access-token": jwtToken,
            }
        }).then(res => {
            if (res.status !== 200) return null
            return res.json();
        })
        console.log("RECEIVED RECOMMENDATION!");
        console.log(recommendation);
        if (recommendation.length) {
            shuffle(recommendation);
            if (recommendation.length > 3)
                recommendation.slice(0, 3);
            setRecommendation(recommendation);
        }
        setLoading(false);
    }

    const submitForm = async () => {
        var data = {
            profileDesc: profileDesc
        }
        console.log(data);
        const token = cookie.get('jwt-token')
        var response = await fetch(`${config.SERVER_BASE}/api/edit_profile`, {
            method: "POST",
            headers: {
                "x-access-token": token,
                "content-type": "application/json"
            },
            body: JSON.stringify(data),
        })
        //error handling later
        if (response.status !== 201) return
        data = await response.json();
        console.log(data)
        router.push({
            pathname: `/my_profile`
        })
        document.getElementById("edit_desc").style.display = "none";
        document.getElementById("desc").style.display = "block";
    }

    const imageHandler = async (e) => {
        const token = cookie.get('jwt-token')
        var form = new FormData();
        form.append("file", e.target.files[0]);
        var imageURL = await fetch(`${config.SERVER_BASE}/api/update_profile_image`, {
            method: "POST",
            headers: {
                "x-access-token": token,
            },
            body: form,
        }).then(data => data.json());
        setProfileImage(imageURL.image);
    };

    const onProfileImageClick = () => {
        inputFile.current.click();
    }

    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    return (
        <div className="profile_container">
            <div className="profile_header">
                <div className="header_flex">
                    <div className="profile_image">
                        {
                            (profileImage && profileImage.length)
                                ? <div className="profile_image">
                                    <input type="file" accept="image/*" ref={inputFile} style={{ display: "none" }} onChange={imageHandler} />
                                    <img
                                        src={`${config.SERVER_BASE}/img/${profileImage}`} alt={`${profileData.profile.last_name} ${profileData.profile.first_name}`}
                                        id="profile_img"
                                        onMouseEnter={() => {
                                            document.getElementById("profile_img").style.opacity = "0.5";
                                        }}
                                        onMouseLeave={() => {
                                            document.getElementById("profile_img").style.opacity = "1.0";
                                        }}
                                        onClick={onProfileImageClick}
                                    />
                                </div>
                                : <div className="profile_image">
                                    <input type="file" accept="image/*" ref={inputFile} style={{ display: "none" }} onChange={imageHandler} />
                                    <img
                                        src="/img/user_placeholder.png" alt={`${profileData.profile.last_name} ${profileData.profile.first_name}`}
                                        id="profile_img"
                                        onMouseEnter={() => {
                                            document.getElementById("profile_img").style.opacity = "0.5";
                                        }}
                                        onMouseLeave={() => {
                                            document.getElementById("profile_img").style.opacity = "1.0";
                                        }}
                                        onClick={onProfileImageClick}
                                    />
                                </div>

                        }
                    </div>
                    <div className="profile_info">
                        <div className="name">
                            {`${profileData.profile.last_name} ${profileData.profile.first_name}`}
                        </div>
                        <div className="public_id">
                            {`ID: ${uid ? uid : "..."}`}
                        </div>
                        <div className="major">
                            <img src="/img/hat.png" alt="" width="15px" height="15px" />
                            {`Major: ${profileData.profile.major}`}
                        </div>
                        <div className="college">
                            <img src="/img/house.png" alt="" width="15px" height="15px" />
                            {`College: ${profileData.profile.college}`}
                        </div>
                        <div className="desc" id="desc">
                            {profileData.profile.introduction ? profileData.profile.introduction : "Welcome"}
                            <input type="image" src="/img/edit.png" alt="" width="15px" height="15px" style={{ marginLeft: "20px" }}
                                onClick={() => {
                                    document.getElementById("edit_desc").style.display = "block";
                                    document.getElementById("desc").style.display = "none";
                                }}
                            />
                        </div>
                        <FormControl fullWidth component="fieldset" id="edit_desc" style={{ display: "none" }}>
                            <TextField
                                margin="normal"
                                fullWidth
                                value={profileDesc}
                                onChange={(e) => setProfileDesc(e.target.value)}
                                variant="outlined"
                            />
                            <Button variant="contained" color="primary" onClick={submitForm}>Update</Button>
                            <Button
                                style={{ marginLeft: "10px" }}
                                variant="contained"
                                onClick={() => {
                                    setProfileDesc(profileData.profile.introduction ? profileData.profile.introduction : "Welcome");
                                    document.getElementById("edit_desc").style.display = "none";
                                    document.getElementById("desc").style.display = "block";
                                }}>Cancel
                            </Button>
                        </FormControl>
                    </div>
                </div>
            </div>
            {
                (recommendation.length > 0) &&
                <div className="recommendation">
                    <div className="recommendation_container">
                        <h1>Events you might be interested in</h1>
                        <ul>
                            {
                                recommendation.slice(0, 3).map(recommendEvent => {
                                    return (
                                        <Link href={`/event/${recommendEvent.event_id}`}>
                                            <li className="recommendation_card">
                                                <img src={`${config.SERVER_BASE}/img/${recommendEvent.event_profile_image}`} />
                                                <div className="recommendation_description">
                                                    <div>
                                                        <a className="card-tag">{recommendEvent.category}</a>
                                                        <span style={{ padding: "5px" }} />
                                                        <a className="card-tag">{recommendEvent.form}</a>
                                                    </div>
                                                    <h4><b>{recommendEvent.title}</b></h4>
                                                    <p>{recommendEvent.association_title}</p>
                                                </div>
                                            </li>
                                        </Link>
                                    )
                                })
                            }
                        </ul>
                    </div>
                </div>
            }
            <nav>
                <ul>
                    {
                        ["Upcoming Event", "Past Event", "My association", "Statistic"].map((title, i) => {
                            return (
                                <li>
                                    <a
                                        className={tab === config.PROFILE_TAB[i] ? "profile_active" : ""}
                                        onClick={() => {
                                            router.replace({
                                                pathname: `${router.pathname}`,
                                                query: {
                                                    tab: config.PROFILE_TAB[i]
                                                },
                                            }, undefined, { shallow: true })
                                            // setTab(config.PROFILE_TAB[i])
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
                    (tab === "upcomming" && userEvent) &&
                    <div className="list_container">
                        {
                            userEvent.future_events.length
                                ? <div className="upcomming">
                                    <EventList
                                        type="upcomming"
                                        title="Future Events"
                                        events={userEvent.future_events}
                                    />
                                </div>
                                : <>Event not found</>
                        }
                    </div>
                }
                {
                    //tab = upcomming
                    (tab === "past" && userEvent) &&
                    <div className="list_container">
                        {
                            userEvent.past_events.length
                                ? <div className="past">
                                    <EventList
                                        type="past"
                                        title="Past Events"
                                        events={userEvent.past_events}
                                    />
                                </div>
                                : <>Event not found</>
                        }
                    </div>
                }
                {/* <div className="past">
                </div> */}
                {
                    // tab = my_association
                    tab === "my_association" &&
                    <div className="my_association_container">
                        {
                            loading
                                ? <Loading />
                                : <>
                                    <div className="add_event_btn">
                                        <Button
                                            variant="outlined"
                                            onClick={() => {
                                                router.push({
                                                    pathname: '/create_association'
                                                })
                                            }}
                                        >Register association</Button>
                                    </div>
                                    <div className="headline_headline">
                                        <h1>Total &#40;
                                {
                                                associations
                                                    ? associations.manager.length + associations.member.length
                                                    : 0
                                            }
                                &#41; association
                                </h1>
                                    </div>
                                    {
                                        (associations && associations.manager.length > 0) &&
                                        <AssociationList
                                            title={"Managing"}
                                            associations={associations.manager}
                                        />
                                    }
                                    {
                                        (associations && associations.member.length > 0) &&
                                        <AssociationList
                                            title={"Member"}
                                            associations={associations.member}
                                        />
                                    }
                                </>
                        }
                    </div>
                }
                {
                    (tab === "statistic" && userEvent) &&
                    <div className="statistic_container">
                        {
                            userEvent.past_events.length
                                ? <div className="stat">
                                    <Statistic
                                        events={userEvent.past_events}
                                    />
                                </div>
                                : <>You have not participated events yet</>
                        }
                    </div>
                }
            </div>
        </div>
    )
}

export default SelfProfileContainer;