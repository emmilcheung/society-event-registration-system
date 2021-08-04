import React, { useState } from 'react';

import Link from 'next/link';

import { Button } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';;


import { config } from '../../config/initialConfig'

var months = ["Janary", "Febrary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const today = new Date();

const EventItem = ({ run }) => {

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

    // return (
    //     <>
    //         <td>
    //             <Link href={`/event/${run.event_id}?r=${run.run_id}`}>
    //                 <div
    //                     style={{
    //                         backgroundImage:
    //                             run.event_profile_image
    //                                 ? `url(${config.SERVER_BASE}/img/${run.event_profile_image})`
    //                                 : "url(/img/events-placeholder.png)",
    //                         backgroundSize: "auto 100%",
    //                         backgroundRepeat: "no-repeat",
    //                         backgroundPosition: "center",
    //                         backgroundAttachment: "scroll",
    //                         width: "250px",
    //                         height: "175px",
    //                         cursor: "pointer"
    //                     }}
    //                 ></div>
    //             </Link>
    //         </td>
    //         <td className="details" colSpan="2">
    //             <Link href={`/event/${run.event_id}?r=${run.run_id}`}>
    //                 <a>
    //                     <div className="details_flex">
    //                         <div className="title">
    //                             <span>{run.title}</span>

    //                         </div>
    //                         <br />
    //                         <div className="other">
    //                             <span>{getRunDateString(run)}</span>
    //                             {
    //                                 run.online === 0
    //                                     ? <span>{`${run.venue} (${run.address})`}</span>
    //                                     : <span>{`Online`}</span>
    //                             }
    //                             <span>{`${run.association_title}`}</span>
    //                         </div>
    //                     </div>
    //                     {
    //                         run.category &&
    //                         <span>Category: {` ${run.category}`}</span>
    //                     }
    //                 </a>
    //             </Link>
    //         </td>
    //     </>
    // )

    return (
        <>
            <tr className="table_item pc">
                <td>
                    <Link href={`/event/${run.event_id}?r=${run.run_id}`}>
                        <div
                            style={{
                                backgroundImage:
                                    run.event_profile_image
                                        ? `url(${config.SERVER_BASE}/img/${run.event_profile_image})`
                                        : "url(/img/events-placeholder.png)",
                                backgroundSize: "auto 100%",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "center",
                                backgroundAttachment: "scroll",
                                width: "250px",
                                height: "175px",
                                cursor: "pointer"
                            }}
                        ></div>
                    </Link>
                </td>
                <td className="details" colSpan="2">
                    <Link href={`/event/${run.event_id}?r=${run.run_id}`}>
                        <a>
                            <div className="details_flex">
                                <div className="title">
                                    <span>{run.title}</span>

                                </div>
                                <br />
                                <div className="other">
                                    <span>{getRunDateString(run)}</span>
                                    {
                                        run.online === 0
                                            ? <span>{`${run.venue} (${run.address})`}</span>
                                            : <span>{`Online`}</span>
                                    }
                                    <span>{`${run.association_title}`}</span>
                                </div>
                            </div>
                            {
                                run.category &&
                                <span>Category: {` ${run.category}`}</span>
                            }
                        </a>
                    </Link>
                </td>
            </tr>
            <tr className="table_item mobile">
                <td colSpan="3">
                    <Link href={`/event/${run.event_id}?r=${run.run_id}`}>
                        <div
                            style={{
                                backgroundImage:
                                    run.event_profile_image
                                        ? `url(${config.SERVER_BASE}/img/${run.event_profile_image})`
                                        : "url(/img/events-placeholder.png)",
                                backgroundSize: "cover",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "top",
                                backgroundAttachment: "scroll",
                                width: "100vw",
                                height: "calc(100vw * 250 / 375)",
                                cursor: "pointer"
                            }}
                        ></div>
                    </Link>
                </td>
            </tr>
            <tr className="table_item mobile">
                <td className="details" colSpan="3">
                    <Link href={`/event/${run.event_id}?r=${run.run_id}`}>
                        <a>
                            <div className="details_flex">
                                <div className="title">
                                    <span>{run.title}</span>
                                </div>
                                <div className="other">
                                    <span>{getRunDateString(run)}</span>
                                    {
                                        run.online === 0
                                            ? <span>{`${run.venue}`}</span>
                                            : <span>{`Online`}</span>
                                    }
                                    <span>{`${run.association_title}`}</span>
                                </div>
                            </div>
                        </a>
                    </Link>
                </td>
            </tr>
        </>
    )
}

export default EventItem;