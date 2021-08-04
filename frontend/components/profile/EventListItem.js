import Link from 'next/link';

const EventListItem = ({
    id,
    future,
    date,
    title,
    venue,
    host,
    profileImage
}) => {
    return (
        <li className="list-item_container">
            <Link href={`/event/${id}`}>
                <a>
                    <b className="date" style={{ color: future ? "blue" : "red" }}>{date}</b>
                    <h1>{title}</h1>
                    <h2>{venue}</h2>
                    <div>
                        <img src={host.img} alt="" height="24px" width="24px"></img>
                        <span>Host: {host.name}</span>
                    </div>
                    <img src={profileImage} alt="" height="128px" width="auto"></img>
                </a>
            </Link>
        </li>
    );
}

export default EventListItem;