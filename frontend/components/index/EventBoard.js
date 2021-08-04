import React, { useState } from 'react';

import Link from 'next/link';

import { Button } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';;


import { config } from '../../config/initialConfig'
import EventItem from './EventItem'

var months = ["Janary", "Febrary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const today = new Date();
// console.log(today.getFullYear());

const EventBoard = ({
    events,
}) => {


    const [board, setBoard] = useState({
        year: today.getFullYear(),
        month: today.getMonth(),
    });

    const parseEventObj = (events) => {
        var parsedObj = {};
        //suppose event is sorted in accending order in backend 
        events = events.map(event => {
            event.start_time = new Date(event.start_time);
            return event
        })
        events.forEach(event => {
            var year = event.start_time.getFullYear();
            var month = event.start_time.getMonth();
            var day = event.start_time.getDate();
            // check if this is first event in this year
            if (!(year in parsedObj)) {
                parsedObj[year] = { [month]: { [day]: [event] } };
            }
            else {
                //check if this is first event in this year and this month
                if (!(month in parsedObj[year])) {
                    parsedObj[year][month] = { [day]: [event] };
                }
                else {
                    //check if this is first event in this year, this month, this day
                    if (!(day in parsedObj[year][month])) {
                        parsedObj[year][month][day] = [event]
                    }
                    else {
                        parsedObj[year][month][day].push(event)
                    }
                }
            }
        })
        return parsedObj

    }

    const monthAdd = () => {
        setBoard(prev => {
            var month = prev.month + 1;
            var year = prev.year;
            if (month > 11) {
                month = 0;
                year += 1;
            }
            return { month: month, year: year };
        })
    }

    const monthminus = () => {
        setBoard(prev => {
            var month = prev.month - 1;
            var year = prev.year;
            if (month < 0) {
                month = 11;
                year -= 1;
            }
            return { month: month, year: year };
        })
    }


    const parsedEvents = parseEventObj(events);
    // console.log(parsedEvents);
    // console.log(board.year, board.month);

    return (
        <div className="event_board">
            <div className="board_header">
                <div className="board_header_left">
                    <h2>{`Event of ${months[board.month]}, ${board.year}`}</h2>
                </div>
                <div className="board_header_center"></div>
                <div className="board_header_right">
                    {
                        (board.year > today.getFullYear() ||
                            // same year and month greater than today 
                            (board.month > today.getMonth() && board.year == today.getFullYear())
                        )
                        &&
                        <Button onClick={monthminus}>
                            <ArrowBackIosIcon />
                        </Button>
                    }
                    <Button onClick={monthAdd}>
                        <ArrowForwardIosIcon />
                    </Button>
                </div>
            </div>
            <div className="body_container">

                <table className="board_body">
                    <tbody>
                        {
                            parsedEvents[board.year] &&
                            parsedEvents[board.year][board.month] &&
                            Object.entries(parsedEvents[board.year][board.month]).map(([date, dayArray], i) => {
                                return (
                                    <>
                                        <tr className="date_header">
                                            <td colSpan="3">
                                                {
                                                    board.year == today.getFullYear() &&
                                                        board.month == today.getMonth() &&
                                                        date == today.getDate()
                                                        ? <span>
                                                            {`Today ${date}/${board.month + 1}`}
                                                        </span>
                                                        : <span>
                                                            {`${date}/${board.month + 1}`}
                                                        </span>
                                                }
                                            </td>
                                        </tr>
                                        {
                                            dayArray.map(run => {
                                                return (
                                                    <EventItem
                                                        run={run}
                                                    />
                                                )
                                            })
                                        }
                                    </>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>

        </div>
    );
}

// const EventItem = ({ run }) => {

//     const getRunDateString = (run) => {
//         var month = ["Janary", "Febrary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//         var weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//         var startTime = run.start_time ? new Date(run.start_time) : null;
//         var endTime = run.end_time ? new Date(run.end_time) : null;

//         var timeString = `${startTime.getDate()} ${month[startTime.getMonth()]} ${startTime.getFullYear()} (${weekDays[startTime.getDay()]})`

//         if (!run.all_day) {
//             // getTimezoneOffset() positive = behind UTC , so * -1
//             var currentTimeZone = -1 * new Date().getTimezoneOffset() / 60;
//             // start from 'from' if there is end time
//             if (endTime) {
//                 timeString += ` from ${startTime.getHours() < 10 ? "0" : ""}${startTime.getHours()}:${startTime.getMinutes() < 10 ? "0" : ""}${startTime.getMinutes()}`
//                 timeString += ` to ${endTime.getHours() < 10 ? "0" : ""}${endTime.getHours()}:${endTime.getMinutes() < 10 ? "0" : ""}${endTime.getMinutes()}`
//             }
//             // start with at if no end time
//             else {
//                 timeString += ` at ${startTime.getHours() < 10 ? "0" : ""}${startTime.getHours()}:${startTime.getMinutes() < 10 ? "0" : ""}${startTime.getMinutes()}`
//             }

//         }
//         return timeString;
//     }

//     return (
//         <>
//             <td>
//                 <Link href={`/event/${run.event_id}?r=${run.run_id}`}>
//                     <div
//                         style={{
//                             backgroundImage:
//                                 run.event_profile_image
//                                     ? `url(${config.SERVER_BASE}/img/${run.event_profile_image})`
//                                     : "url(/img/events-placeholder.png)",
//                             backgroundSize: "auto 100%",
//                             backgroundRepeat: "no-repeat",
//                             backgroundPosition: "center",
//                             backgroundAttachment: "scroll",
//                             width: "250px",
//                             height: "175px",
//                             cursor: "pointer"
//                         }}
//                     ></div>
//                 </Link>
//             </td>
//             <td className="details" colSpan="2">
//                 <Link href={`/event/${run.event_id}?r=${run.run_id}`}>
//                     <a>
//                         <div className="details_flex">
//                             <div className="title">
//                                 <span>{run.title}</span>

//                             </div>
//                             <br />
//                             <div className="other">
//                                 <span>{getRunDateString(run)}</span>
//                                 {
//                                     run.online === 0
//                                         ? <span>{`${run.venue} (${run.address})`}</span>
//                                         : <span>{`Online`}</span>
//                                 }
//                                 <span>{`${run.association_title}`}</span>
//                             </div>
//                         </div>
//                         {
//                             run.category &&
//                             <span>Category: {` ${run.category}`}</span>
//                         }
//                     </a>
//                 </Link>
//             </td>
//         </>
//     )
// }

export default EventBoard;