import React, { useState, useEffect, useContext, createContext } from 'react';


import cookie, { set } from 'js-cookie';
import firebaseClient from '../config/firebaseClient';
import firebase from "firebase/app";
import "firebase/auth";

const AuthContext = createContext({});

const fetcher = (url, idToken) =>
    fetch(url, {
        headers: {
            "x-access-token": idToken,
        }
    }).then(r => r.json())

const provider = new firebase.auth.OAuthProvider('microsoft.com');
// provider.setCustomParameters({
//     tenant: '176e9668-753b-4ccd-8926-871456d0ec4b'
// });




export const AuthProvider = ({ children }) => {
    firebaseClient();
    const [user, setUser] = useState(null);
    const [toggle, setToggle] = useState(true);
    const [firebaseToken, setFirebaseToken] = useState('')
    const [authLoading, setAuthLoading] = useState(true)
    // const { data, error } = useSWR(['http://localhost:5000/api/login', cookie.get('jwt-token')], fetcher)

    useEffect(() => {
        return firebase.auth().onAuthStateChanged(async user => {
            if (!user) {
                setUser(null)
                cookie.remove("jwt-token");
                setAuthLoading(false);
                return
            }
            const idToken = await user.getIdToken();
            const userObj = await getUser(idToken);
            setUser(userObj);
            setFirebaseToken(idToken);
            cookie.set('jwt-token', idToken, { path: "/", expires: 0.5 / 24 },)
            cookie.set('public_uid', userObj.user, { path: "/", expires: 0.5 / 24 },)
            setAuthLoading(false)
        })
    }, [toggle]);

    // force refresh the token every 10 minutes
    useEffect(() => {
        const handle = setInterval(async () => {
            console.log('refreshed token');
            const user = firebase.auth().currentUser;
            if (user) {
                const idToken = await user.getIdToken(true);
                setFirebaseToken(idToken);
                cookie.set('jwt-token', idToken, { path: "/", expires: 0.5 / 24 },)
            }
        }, 10 * 60 * 1000);

        // clean up setInterval
        return () => clearInterval(handle);
    }, []);

    const getUser = async (idToken) => {
        const SERVER_BASE = "http://localhost:5000"
        const respone = await fetch(`${SERVER_BASE}/api/login`, {
            headers: {
                "x-access-token": idToken,
            }
        });
        if (respone.status !== 200) return null
        const data = await respone.json();
        return data;

    }

    const login = () => {
        setAuthLoading(true);
        firebase
            .auth()
            .signInWithPopup(new firebase.auth.OAuthProvider('microsoft.com'))
            .then(async (res) => {
                var now = new Date();
                var time = now.getTime();
                time += 3600 * 1000;
                const idToken = await res.user.getIdToken();
                var userObj = await getUser(idToken);

                if (!userObj) return
                cookie.set('jwt-token', idToken, { path: "/", expires: 1 / 24 },)
                cookie.set('public_uid', userObj.user, { path: "/", expires: 1 / 24 },)
                setUser(userObj);
                setAuthLoading(false);
                window.location.reload()
            })
    }
    const logout = () => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                cookie.remove('jwt-token');
                cookie.remove('public_uid');
                setUser(null);
                window.location.reload()
            })
    }

    const refresh = () => setToggle(prev => !prev);





    return (
        <AuthContext.Provider value={{ user: user, firebaseToken, authLoading, login, setUser, logout, refresh }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);