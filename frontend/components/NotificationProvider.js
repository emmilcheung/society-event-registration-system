import React, { useState, useEffect, useContext, createContext } from 'react';
import cookie from 'js-cookie';

// firebase
import firebase from "firebase/app";
import "firebase/messaging";

import { config } from '../config/initialConfig';
import { useAuth } from '../components/authProvider'

const NotificationContext = createContext({});
export const NotificationProvider = ({ children }) => {


    
    const { user, firebaseToken } = useAuth();
    const [messageToken, setMessageToken] = useState('');
    const [notificationArray, setNotificationArray] = useState([]);
    const [notificationOffset, setNotificationOffset] = useState(0);

    useEffect(async () => {
        // message
        if(user){
            const messaging = firebase.messaging();
            messaging.getToken().then((token) => {
                console.log(token);
                setMessageToken(token);
            });
            messaging.onMessage((payload) => {
                console.log("onMessage", payload);
                var notification = JSON.parse(payload.data.notification);
                setNotificationArray(prevState => [notification, ...prevState]);
            })
        }
            
    }, [firebaseToken])

    useEffect(async () => {
        if (messageToken.length) {
            await registerNotification();
            await loadNotification();
        }
    }, [messageToken]);

    const registerNotification = async () => {
        const body = {
            'token': messageToken,
            'device': "web",
        }
        console.log(firebaseToken, body)
        const res = await fetch(`${config.SERVER_BASE}/api/notification/registration`, {
            method: "POST",
            headers: {
                'x-access-token': firebaseToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });
    }

    const loadNotification = async () => {
        console.log("load notification");
        const jwtToken = cookie.get('jwt-token');
        const res = await fetch(`${config.SERVER_BASE}/api/notification/${notificationOffset}`, {
            headers: {
                'x-access-token': jwtToken,
            }
        });
        const data = await res.json();
        console.log(data.notifications_page)
        setNotificationArray(prev => {
            var ids = prev.map(notification => notification.id);
            var temp = [...prev];
            data?.notifications_page.forEach(notification => {
                if (!ids.includes(notification.id)) {
                    temp.push(notification);
                }
            })
            return temp;
        })
    }

    const postRead = () => {
        const jwtToken = cookie.get('jwt-token');
        const res = fetch(`${config.SERVER_BASE}/api/notification_read`, {
            method: "POST",
            headers: {
                'x-access-token': jwtToken,
            }
        });
    }

    const read = () => {
        setNotificationArray(prev => {
            return prev.map(notification => {
                notification.read = true;
                return notification;
            })
        })
    }

    return (
        <NotificationContext.Provider value={{
           notificationArray,
           loadNotification,
           postRead,
           read
        }}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotification = () => useContext(NotificationContext);