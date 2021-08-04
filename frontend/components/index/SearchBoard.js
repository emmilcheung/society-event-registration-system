import React, { useState } from 'react';

import Link from 'next/link';

import { Button } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';;


import { config } from '../../config/initialConfig';
import EventItem from './EventItem';

var months = ["Janary", "Febrary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const today = new Date();
// console.log(today.getFullYear());

const SearchBoard = ({
    events,
    category,
    setCategory,
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

    return (
        <div className="event_board">
            <div className="board_header">
                <div className="board_header_left">
                    <h2>{`Categories`}</h2>
                </div>
                <div className="board_header_center"></div>
                <div className="board_header_right"></div>
            </div>
            <div className="filter">
                <div className="choices">
                    <div
                        className={`all${category === "" ? " active" : ""}`}
                        onClick={() => setCategory('')}
                    >
                        <span>All</span>
                        <div className="arrow-up">
                        </div>

                    </div>
                    {
                        Object.keys(config.EVENT_CATEGORY).map((key, i) => {
                            var value = config.EVENT_CATEGORY[key]
                            return (
                                <div
                                    key={i}
                                    className={`key ${category === key ? " active" : ""}`}
                                    onClick={() => setCategory(key)}
                                >
                                    <span>{value}</span>
                                    <div className="arrow-up">
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className="body_container">

                <table className="board_body">
                    <tbody>

                        <tr className="date_header">
                            <td colSpan="3">
                                {
                                    events.length
                                        ? `Total (${events.length}) is found`
                                        : "No event is found"
                                }
                            </td>
                        </tr>
                        {
                            events.map(run => {
                                return (
                                    <EventItem
                                        run={run}
                                    />
                                )
                            })
                        }

                    </tbody>
                </table>
            </div>

        </div>
    );
}



export default SearchBoard;