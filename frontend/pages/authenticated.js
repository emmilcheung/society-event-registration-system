import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../components/authProvider';
import cookie from 'js-cookie';

import firebaseClient from "../config/firebaseClient";
import firebase from "firebase/app";
import "firebase/auth";

const temp = '<p>Loading</p>'

firebaseClient();

const authenticated = ({ session }) => {
    const router = useRouter();
    const { user } = useAuth();
    const elem = useRef();
    console.log(user)
    if (user) {
        return (<>
            Authenticated {user}
            <Link href="/">
                <a>
                    <button>Back to login
                            </button>
                </a>
            </Link>
            <button onClick={async () => {
                await firebase.auth().signOut().then(() => {
                    console.log("log out");
                    cookie.remove('jwt-token');
                    router.push('/');

                });
            }}>sign out</button>
        </>);
    }
    else {
        return (<div ref={elem}>
        </div>)
    }
}


// export const getServerSideProps = async (context) => {
//     try {
//         const cookies = {};
//         context.req.headers.cookie?.split(";")
//             .forEach(cookie => {
//                 var pair = cookie.split("=");
//                 cookies[pair[0]] = pair[1];
//             })
//         const SERVER_BASE = "http://localhost:5000"
//         const res = await fetch(`${SERVER_BASE}/api/authenticated`, {
//             headers: {
//                 "x-access-token": cookies["jwt-token"],
//             }
//         })
//         if (res.status === 401 || res.status === 403) {
//             context.res.writeHead(302, { Location: '/login' })
//             context.res.end();
//             return;
//         }
//         const data = await res.json();
//         return {
//             props: {
//                 session: data
//             }
//         }
//     }
//     catch (err) {
//         return {
//             props: {
//                 session: null
//             }
//         }
//     }
// }

export default authenticated;