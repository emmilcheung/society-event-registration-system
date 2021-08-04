import react, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/authProvider';

import Head from 'next/head';
import { useRouter } from 'next/router';

import SelfProfileContainer from '../components/profile/SelfProfileContainer'
import Header from '../components/Header';
import { config } from '../config/initialConfig'

const testData = {
    public: true,
    info: {
        fullName: "Student",
        profileImage: null,
        publicId: "12345",
        major: "Computer Science",
        college: "Unitied College",
        description: "2020年11月15日からGameHintを利用しています。よろしくお願いします。"
    }

}


const myProfile = ({ data }) => {
    const router = useRouter();
    const { user, setUser } = useAuth();
    const [associations, setAssociations] = useState(null);

    if (!data || !data.profile) {
        return (
            <>User not found</>
        )
    }

    return (
        <>
            <Head></Head>
            <Header />
            <main>
                <SelfProfileContainer
                    profileData={data}
                    uid={user?.user}
                    associations={associations}
                    setAssociations={setAssociations}
                />
            </main>
        </>
    )
}

const getProfile = async (idToken, uid) => {
    const SERVER_BASE = "http://localhost:5000"
    const respone = await fetch(`${SERVER_BASE}/api/user_profile/${uid}`, {
        headers: {
            "x-access-token": idToken,
        }
    });
    const data = await respone.json();
    return data;

}

export const getServerSideProps = async (context) => {
    try {
        var cookies = {};
        context.req.headers.cookie?.split(";")
            .forEach(cookie => {
                var pair = cookie.trimLeft(" ").split("=");
                cookies[pair[0]] = pair[1];
            })
        var data = await getProfile(cookies['jwt-token'], cookies['public_uid']);
        return {
            props: {
                data: data
            }
        }
    }
    catch (err) {
        return {
            props: {
                data: null
            }
        }
    }
}

export default myProfile;