import Link from 'next/link';

const NotificationItem = ({
    title,
    body,
    img,
    direction,
    type
}) => {
    console.log(direction, type)
    if (type == "survey") {
        return (
            <a href={direction} target="_blank">
                <li className="notification_item_container">
                    <div className="notify_icon">
                        <img className="icon" src={img} />
                    </div>
                    <div className="notify_data">
                        <div className="title">
                            {title}
                        </div>
                        <div className="sub_title">
                            {body}
                        </div>
                    </div>
                    <div className="notify_status">
                        <p>Success</p>
                    </div>
                </li>
            </a>)
    }

    return (
        <a href={direction ? direction : '/'}>
                <li className="notification_item_container">
                    <div className="notify_icon">
                        <img className="icon" src={img} />
                    </div>
                    <div className="notify_data">
                        <div className="title">
                            {title}
                        </div>
                        <div className="sub_title">
                            {body}
                        </div>
                    </div>
                    <div className="notify_status">
                        <p>Success</p>
                    </div>
                </li>
        </a>
    )
}

export default NotificationItem;