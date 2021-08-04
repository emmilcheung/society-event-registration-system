import React, { useState, useEffect, useRef } from "react";

// external libraries
import cookie from 'js-cookie';

// next component
import { useRouter } from 'next/router';


import { Button } from '@material-ui/core';
import { config } from '../../config/initialConfig';

import MaterialUITable from './MaterialUITable'

const Participants = ({
    event,
    registrations,
    participants,
    setParticipants
}) => {
    const router = useRouter();

    //modals
    const [tableOpen, setTableOpen] = useState(false);
    // const [tableData, setTableData] = useState(null);
    const [tableTitle, setTableTitle] = useState("");
    const [tableRunId, setTableRunId] = useState("");

    useEffect(() => {
        loadParticipants();
    }, [])

    const loadParticipants = async () => {
        var jwtToken = cookie.get('jwt-token');
        var res = await fetch(`${config.SERVER_BASE}/api/participants/${router.query.id}`, {
            headers: {
                "x-access-token": jwtToken,
            }
        })
        if (res.status !== 200) return
        var obj = await res.json();
        //prevent internal add length to forms undefined
        if (Object.keys(obj).length) {
            setParticipants(obj);
            console.log(obj)
        }
    }

    const sendEventReminder = async () => {
        if (confirm("sent?")) {

            const jwtToken = cookie.get('jwt-token');
            const res = await fetch(`${config.SERVER_BASE}/api/event_reminder`, {
                method: "POST",
                headers: {
                    'x-access-token': jwtToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId: event.event_id,
                    associationId: event.association_id,
                    runId: tableRunId
                })
            });
            if (res.status === 201) {
                alert("sent");
            }
        }
    }

    const onTableRowChange = async (index, rowDataObject) => {
        // change attendance status
        if (rowDataObject.check_in) {
            var newParticipants = await postStatusChange(rowDataObject, "reset");
            setParticipants(newParticipants);
        }
        if (!rowDataObject.check_in || rowDataObject.check_in == null) {
            var newParticipants = await postStatusChange(rowDataObject, "attend");
            setParticipants(newParticipants);
        }
        return;
    }
    const postStatusChange = async (rowDataObject, option) => {
        var jwtToken = cookie.get('jwt-token');
        return await fetch(`${config.SERVER_BASE}/api/attendance`, {
            method: "PUT",
            headers: {
                "x-access-token": jwtToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                application_id: rowDataObject.application_id,
                sid: rowDataObject.sid,
                event_id: event.event_id,
                run_id: tableRunId,
                attendance_id: rowDataObject.attendance_id,
                option: option
            })
        }).then(res => res.json())
    }


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

    const getVenue = (runId) => {
        var run = event.runs.find(run => run.run_id == runId);
        if (run.online == 1) {
            return "Online";
        } else {
            return run.title;
        }

    }

    const openDetails = async (key, dateString) => {
        // setTableData([...participants[key]]);
        await loadParticipants();
        console.log(event);
        setTableTitle(`${dateString} -- ${getVenue(key)}`);
        setTableRunId(key);
        setTimeout(() => { setTableOpen(true) }, 500)
    }


    return (
        <div className="participant_container">
            {
                //if not form is found
                (!registrations || !Object.keys(registrations).length)
                    ? <p>No application is found</p>
                    : Object.keys(registrations).map((key, i) => {
                        if (registrations[key].internal === 0) {
                            return <></>
                        }
                        const dateString = getRunDateString(event.runs.filter(run => run.run_id === key)[0]);
                        return (
                            <div style={{
                                margin: "30px 0",
                                border: "1px solid #ccc",
                                borderRadius: "16px",
                                padding: "16px "
                            }}>
                                <div className="survey_header" style={{ marginBottom: "10px" }}>
                                    <h4>{`Date: ${dateString} -- ${getVenue(key)} `}</h4>
                                </div>
                                <Button
                                    variant="outlined"
                                    onClick={() => openDetails(key, dateString)}
                                >
                                    Open Dashboard
                                </Button>
                            </div>)
                    })
            }
            <MaterialUITable
                open={tableOpen}
                setOpen={setTableOpen}
                dataArray={participants[tableRunId]}
                title={tableTitle}
                onTableRowChange={onTableRowChange}
                sendEventReminder={sendEventReminder}
            />
        </div>
    );
}

export default Participants;