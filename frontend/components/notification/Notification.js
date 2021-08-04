import { useState, useEffect } from 'react';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import NotificationItem from "./NotificationItem";

import { config } from '../../config/initialConfig';
import { useNotification } from '../NotificationProvider';

// firebase
// import firebase from "firebase/app";
// import "firebase/messaging";

import cookie from 'js-cookie';
import { useAuth } from '../../components/authProvider'

const Notification = () => {

    const { notificationArray, loadNotification, postRead, read} = useNotification();

    // const { firebaseToken } = useAuth();
    // const [messageToken, setMessageToken] = useState('');
    // const [notificationArray, setNotificationArray] = useState([]);
    // const [notificationOffset, setNotificationOffset] = useState(0);

    const [visible, setVisibility] = useState(false);
    async function toggle() {
        var prevVisibility = visible;
        setVisibility(!visible);
        if (!prevVisibility) {
            await loadNotification()
            await postRead();
        }
        else {
            read();
        }
        // setNotificationArray([]);
    }

    const unreadCount = notificationArray.filter(noti => !noti.read).length;


    return (
        <div className="header_notification">
            <div onClick={toggle}>
                <NotificationsActiveIcon onClick={toggle} />
                {
                    unreadCount > 0 &&
                    <NotificationCount
                        num={unreadCount}
                    />
                }
            </div>
            <div className="notification_dd"
                style={{ visibility: visible ? "visible" : "hidden", opacity: visible ? 1 : 0 }}>
                <ul className="notification_ul">
                    {
                        unreadCount > 0 &&
                        <>
                            <li className="top">
                                <p>New Notifications</p>
                            </li>
                            {
                                notificationArray
                                    .filter(message => !message.read)
                                    .map(message => {
                                        return (
                                            <NotificationItem
                                                title={message.title}
                                                body={message.body}
                                                img={message.image_url}
                                                direction={message.redirect_url}
                                                type={message.type}
                                            />
                                        )
                                    })
                            }
                        </>
                    }
                    <li className="top">
                        <p>Old Notifications</p>
                    </li>
                    {
                        notificationArray
                            .filter(message => message.read)
                            .map(message => {
                                return (
                                    <NotificationItem
                                        title={message.title}
                                        body={message.body}
                                        img={message.image_url}
                                        direction={message.redirect_url}
                                        type={message.type}
                                    />
                                )
                            })
                    }
                    <li className="show_all">
                        <p className="link">Show All Notifications</p>
                    </li>
                </ul>
            </div>
        </div>
    );
}

const NotificationCount = ({ num }) => {
    return (
        <div className="notification_count">
            {num}
        </div>
    )
}

export default Notification;