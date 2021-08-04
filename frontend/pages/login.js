
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import cookie from 'js-cookie';
import { useAuth } from '../components/authProvider';

//firebase
import firebaseClient from "../config/firebaseClient";
import firebase from 'firebase/app';
import "firebase/auth";

firebaseClient();
const provider = new firebase.auth.OAuthProvider('microsoft.com');
// provider.setCustomParameters({
//     tenant: '176e9668-753b-4ccd-8926-871456d0ec4b'
// });

const Yeah = () => {

    const router = useRouter();
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const signIn = () => {
        setLoading(true);
        firebase
            .auth()
            .signInWithPopup(provider)
            .then(async (res) => {
                var now = new Date();
                var time = now.getTime();
                time += 3600 * 1000;
                const idToken = await res.user.getIdToken();
                cookie.set('jwt-token', idToken, { path: "/", expires: 1 / 24 },)
                // var response = getUser(idToken);
                setLoading(false)
            })
    }

    const logout = () => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                cookie.remove('jwt-token');
                setUser(null);
            })
    }

    if (loading) {
        return <div>Loading</div>
    }

    return (<div>
        {
            !user &&
            <>
                <button onClick={signIn}>Microcoft</button>
                <br />
                <input type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <br />
                <input type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <br />
                <button
                    onClick={() => {
                        firebase
                            .auth()
                            .createUserWithEmailAndPassword(email, password)
                            .then(async res => {
                                var now = new Date();
                                var time = now.getTime();
                                time += 3600 * 1000;
                                const idToken = await res.user.getIdToken();
                                cookie.set('jwt-token', idToken, { path: "/", expires: 1 / 24 },)
                                // var response = getUser(idToken);
                                setLoading(false)
                            })
                    }}
                >
                    {"Register (Demo)"}
                </button>
                <br />
                <button
                    onClick={() => {
                        firebase.auth().signInWithEmailAndPassword(email, password)
                            .then(async (res) => {
                                console.log(res)
                                var now = new Date();
                                var time = now.getTime();
                                time += 3600 * 1000;
                                const idToken = await res.user.getIdToken();
                                console.log(idToken)
                                cookie.set('jwt-token', idToken, { path: "/", expires: 1 / 24 },)
                                // var response = getUser(idToken);
                                setLoading(false)
                            })
                    }}
                >
                    {"Login (Demo)"}
                </button>
            </>

        }
        {
            user && <>
                <p>welcome {user.email}</p>
                <Link href="/authenticated">
                    <a>
                        <button>Authenticated</button>
                    </a>
                </Link>
                <Link href={`/event/14`}>
                    <a>
                        <button>Event example</button>
                    </a>
                </Link>
                <button onClick={logout}>sign out</button>
            </>
        }
    </div>);
}

const getUser = async (idToken) => {
    const SERVER_BASE = "http://localhost:5000"
    const respone = await fetch(`${SERVER_BASE}/api/login`, {
        headers: {
            "x-access-token": idToken,
        }
    });
    const data = await respone.json();
    print(data)
    return data;

}

// export const getServerSideProps = async (context) => {
//     try {
//         var cookies = {};
//         context.req.headers.cookie?.split(";")
//             .forEach(cookie => {
//                 var pair = cookie.split("=");
//                 cookies[pair[0]] = pair[1];
//             })
//         var data = await getUser(cookies['jwt-token']);
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

export default Yeah;