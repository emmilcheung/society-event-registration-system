import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import cookie, { set } from 'js-cookie';
import { useAuth } from '../components/authProvider';

//firebase
import firebaseClient from "../config/firebaseClient";
import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/messaging";

import Header from '../components/Header'
import EventBoard from '../components/index/EventBoard';
import SearchBoard from '../components/index/SearchBoard';
import AssociationBoard from '../components/index/AssociationBoard'

import { config } from '../config/initialConfig';
import { Category, Message } from '@material-ui/icons';

// firebaseClient();
// const provider = new firebase.auth.OAuthProvider('microsoft.com');
// provider.setCustomParameters({
//     tenant: '176e9668-753b-4ccd-8926-871456d0ec4b'
// });

const Index = ({ data }) => {

    const router = useRouter();
    const { user, setUser } = useAuth();
    const [categoryEvents, setCategoryEvents] = useState([]);
    const [category, setCategory] = useState('');
    const [association, setAssociation] = useState([]);
    const [associationType, setAssociationType] = useState('');
    const [loading, setLoading] = useState(false);

    const tab = router.query.tab;

    useEffect(() => {
        loadCategoryEvent();
    }, [category])
    useEffect(() => {
        loadAssociation()
    }, [associationType])

    const signIn = () => {
        setLoading(true);
        firebase
            .auth()
            .signInWithPopup(provider)
            .then(async (res) => {
                // console.log(res)
                var now = new Date();
                var time = now.getTime();
                time += 3600 * 1000;
                const idToken = await res.user.getIdToken();
                cookie.set('jwt-token', idToken, { path: "/", expires: 1 / 24 },)
                // var response = getUser(idToken);
                setLoading(false)
            })
    }



    const loadCategoryEvent = async () => {
        var res = await fetch(`${config.SERVER_BASE}/api/search?ca=${category}`)
        if (res.status !== 200) return
        var data = await res.json();
        setCategoryEvents(data);
    }

    const loadAssociation = async () => {
        var res = await fetch(`${config.SERVER_BASE}/api/search?as=${associationType}`)
        if (res.status !== 200) return
        var data = await res.json();
        setAssociation(data);
    }

    // if (loading) {
    //     return <div>Loading</div>
    // }

    // return (<div>
    //     {
    //         !user && <button onClick={signIn}>Microcoft</button>
    //     }
    //     {
    //         user && <>
    //             <p>welcome {user.email}</p>
    //             <Link href="/authenticated">
    //                 <a>
    //                     <button>Authenticated</button>
    //                 </a>
    //             </Link>
    //             <Link href={`/event/14`}>
    //                 <a>
    //                     <button>Event example</button>
    //                         </a>
    //             </Link>
    //             <button onClick={logout}>sign out</button>
    //         </>
    //     }
    // </div>);
    return (
        <>
            <Header />
            <header className="header">
                <div className="self-intro">
                    <h1>Welcome to CU Event</h1>
                </div>
            </header>
            <div className="hero-nav-content_container__3C3mK">
                <nav>
                    <ul>
                        <li>
                            <a className={!tab ? "hero-nav-content_active__3G2k7" : ""}
                                onClick={() => router.push({
                                    pathname: `/`,
                                }, undefined, { shallow: true })}
                            >
                                Date
                            </a>
                        </li>
                        <li>
                            <a className={tab == "category" ? "hero-nav-content_active__3G2k7" : ""}
                                onClick={() => router.push({
                                    pathname: `/`,
                                    query: {
                                        tab: "category",
                                    },
                                }, undefined, { shallow: true })}
                            >
                                Category
                            </a>
                        </li>
                        <li>
                            <a className={tab == "my_association" ? "hero-nav-content_active__3G2k7" : ""}
                                onClick={() => router.push({
                                    pathname: `/`,
                                    query: {
                                        tab: "my_association",
                                    },
                                }, undefined, { shallow: true })}
                            >
                                Associations
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
            <main>
                <div className="margin_adjust_container">
                    {
                        !tab &&
                        <EventBoard
                            events={data}
                        />
                    }
                    {
                        (tab && tab == "category") &&
                        <SearchBoard
                            events={categoryEvents}
                            category={category}
                            setCategory={setCategory}
                        />
                    }
                    {
                        (tab && tab == "my_association") &&
                        <AssociationBoard
                            associations={association}
                            associationType={associationType}
                            setAssociationType={setAssociationType}
                        />
                    }
                </div>

            </main>
        </>
    )
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

export const getServerSideProps = async (context) => {
    try {
        var cookies = {};
        context.req.headers.cookie?.split(";")
            .forEach(cookie => {
                var pair = cookie.split("=");
                cookies[pair[0]] = pair[1];
            })
        var data = await fetch(`${config.SERVER_BASE}/api/search`).then((d) => d.json())
        return {
            props: {
                data: data,
            }
        }
    }
    catch (err) {
        return {
            props: {
                session: null
            }
        }
    }
}

export default Index;