import EventListItem from './EventListItem';
import { config } from '../../config/initialConfig'

// The container of the event list of an association in the page
// string of type, string of title and an array of event object is passed as props
const EventList = ({ type, title, events }) => {

    // sort the event list date
    // the order depends on the type of the event list conatiner
    const getNearestRun = (runs) => {
        if (type === "upcomming") {
            return runs.sort((a, b) => {
                if (a.start_time > b.start_time) return -1
                else return 1
            })[0];
        }
        else if (type === "past") {
            return runs.sort((a, b) => {
                if (a.start_time < b.start_time) return -1
                else return 1
            })[0];
        }
    }

    // Display manipulation 
    // construct the date of the event by taking information of the run
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
                    // loop for each event and return a list of EventListItem JSX component
                    events.map(event => {
                        var nearestRun = getNearestRun(event.runs);
                        return (
                            <EventListItem
                                id={event.event_id}
                                future={type === "upcomming" ? true : false}
                                date={type === "upcomming" ? getRunDateString(nearestRun) : "Closed"}
                                title={event.title}
                                venue={
                                    nearestRun.online === 1 
                                    ? `online`
                                    : `${nearestRun.title} (${nearestRun.address})`
                                }
                                // host object {name, image}
                                host={{
                                    name: event.association_title,
                                    // get the association profile image link or else put a placeholder
                                    img: event.association_profile_image
                                        ? `${config.SERVER_BASE}/img/${event.association_profile_image}`
                                        : "/img/association.jpg"
                                }}
                                profileImage={`${config.SERVER_BASE}/img/${event.profile_image}`}
                                isPublic={event.is_public ? true : false}
                            />
                        )
                    })
                }
            </ul>
        </>
    );
}

export default EventList;