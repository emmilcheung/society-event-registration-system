import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link'
import { useRouter } from 'next/router'

import cookie from 'js-cookie'

import { useAuth } from '../components/authProvider';
import Notification from '../components/notification/Notification';


const Header = () => {

    const { user, authLoading, login, logout } = useAuth();
    const router = useRouter();

    const signIn = () => {
        setLoading(true);
        firebase
            .auth()
            .signInWithPopup(provider)
            .then(async (res) => {
                console.log(res)
                var now = new Date();
                var time = now.getTime();
                time += 3600 * 1000;
                const idToken = await res.user.getIdToken();
                cookie.set('jwt-token', idToken, { path: "/", expires: 1 / 24 },)
                // var response = getUser(idToken);
                setLoading(false)
            })
    }

    const signOut = async () => {
        if (confirm("Logout?")) {
            await logout()
            router.push("/")
        }
    }

    return (
        <header className="header_header">
            <div className='header_container topnav' id="myTopnav">
                <h2>
                    <Link href={'/'}>
                        <a>CU Event</a>
                    </Link>
                </h2>
                <nav className="nav_container">
                    <ul>
                        {/* <li>
                            <Link href="/">
                                <a>Search</a>
                            </Link>
                        </li>
                        <li>
                            <Link href="/">
                                <a>Nothing</a>
                            </Link>
                        </li> */}
                        {
                            user &&
                            <li>
                                <Notification />
                            </li>
                        }
                        <li>
                            {
                                (!user && !authLoading) &&
                                <a
                                    onClick={login}
                                >Login</a>
                            }
                            {
                                (!user && authLoading) &&
                                <Link href="/">
                                    <a>
                                        <img
                                            src="/img/giphy.gif" alt={"loading"}
                                            className="loading"
                                        />
                                        Loading...
                                        </a>
                                </Link>
                            }
                            {
                                user &&
                                <Link href={`/my_profile`}>
                                    <a>
                                        <img
                                            src="/img/user_placeholder.png" alt={user}
                                            className="user_image"
                                        />
                                        <span>My Page</span>
                                    </a>
                                </Link>
                            }
                        </li>
                        {
                            user &&
                            <li>
                                <a
                                    onClick={signOut}
                                    style={{ cursor: "pointer" }}
                                >Logout</a>
                            </li>
                        }
                    </ul>
                </nav>
            </div>

        </header>);
}

export default Header;