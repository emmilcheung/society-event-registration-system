import EventListItem from './EventListItem';
import { config } from '../../config/initialConfig'

const EventList = ({ type, title, events }) => {

    // const getNearestRun = (runs) => {
    //     if (type === "upcomming") {
    //         return runs.sort((a, b) => {
    //             if (a.start_time > b.start_time) return -1
    //             else return 1
    //         })[0];
    //     }
    //     else if (type === "past") {
    //         return runs.sort((a, b) => {
    //             if (a.start_time < b.start_time) return -1
    //             else return 1
    //         })[0];
    //     }
    // }

    const getRunDateString = (run) => {
        var month = ["Janary", "Febrary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var startTime = run.start_time ? new Date(run.start_time) : null;
        var endTime = run.end_time ? new Date(run.end_time) : null;
        var timeString = "Scheduled at";
        timeString += ` ${startTime.getDate()} ${month[startTime.getMonth()]} ${startTime.getFullYear()} (${weekDays[startTime.getDay()]})`
        if (!run.all_day) {
            // getTimezoneOffset() positive = behind UTC , so * -1
            var currentTimeZone = -1 * new Date().getTimezoneOffset() / 60;
            // start from 'from' if there is end time
            timeString += ` ${startTime.getHours() < 10 ? "0" : ""}${startTime.getHours()}:${startTime.getMinutes() < 10 ? "0" : ""}${startTime.getMinutes()}`
        }
        return timeString;
    }
    return (
        <>
            <h1>{title}</h1>
            <ul className="event_list">
                {
                    events.map(event => {
                        console.log(event)
                        return (
                            <EventListItem
                                id={event.event_id}
                                future={type === "upcomming" ? true : false}
                                date={type === "upcomming" ? getRunDateString(event) : "Closed"}
                                title={event.title}
                                venue={
                                    event.online === 1
                                        ? `online`
                                        : `${event.venue} (${event.address})`}
                                host={{
                                    name: event.association_title,
                                    img: event.association_profile_image
                                        ? `${config.SERVER_BASE}/img/${event.association_profile_image}`
                                        : "/img/association.jpg"
                                }}
                                profileImage={`${config.SERVER_BASE}/img/${event.event_profile_image}`}
                            />
                        )
                    })
                }
            </ul>
        </>
    );
}

export default EventList;