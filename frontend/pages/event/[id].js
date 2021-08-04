import react, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../components/authProvider';

import Head from 'next/head';
import { useRouter } from 'next/router';

import { config } from '../../config/initialConfig'
import Header from '../../components/Header';
import EventContainer from '../../components/event/EventContainer'


const mapStyles = {
    width: '100%',
    height: '100%'
}



const Event = ({ data }) => {
    const router = useRouter();
    const desc = useRef();
    const {user} = useAuth();
    const [event, setEvent] = useState(data.event ? data.event : null);
    const [selectedRun, setSelectedRun] = useState(data.event ? data.event.runs[0].run_id : "");
    const [userRole, setUserRole] = useState(data.event ? data.user : null);
    useEffect(() => {
        if (data.event) {
            //if there are specify run request
            if (router.query.r) {
                if (data.event.runs.map(run => run.run_id).includes(router.query.r))
                    setSelectedRun(router.query.r);
            }

        }
    })
    const handleChange = () => {
        if (window.navigator.share) {
            alert("yes I am")
            navigator.share({
                title: 'web.dev',
                text: 'CHECK out web.dev',
                url: 'http://localhost:3000/event/27'
            })
                .then(() => console.log("successful share"))
        }
        else {
            alert("no I am not")
        }
    }

    // if (authLoading) {
    //     return (<>
    //         <Head>
    //             <meta name={event ? event.title : "404 Not Found"}></meta>
    //         </Head>
    //         <div>Loading ... </div>
    //     </>)
    // }

    // case of not such event or backend server error
    if (!event) {
        return (<>
            <Head>
                <meta name={event ? event.title : "404 Not Found"}></meta>
            </Head>
            Event not found
        </>)
    }

    return (
        <>
            <Header />
            <Head>
                <meta name={event ? event.title : "404 Not Found"}></meta>
                <title>{event ? event.title : "404 Not Found"}</title>
                <meta property="og:title" content={event ? event.title : "404 Not Found"} />
                {/* <meta property="og:type" content={event ? event.title : "image/jpeg"} /> */}
                <meta property="og:url" content={`http://localhost:3000/event/${event.event_id}`} />
                <meta property="og:image" content={`${config.SERVER_BASE}/img/${event.profile_image}`} />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:site" content="@nytimesbits" />
                <meta name="twitter:creator" content="@nickbilton" />
                <meta property="og:url" content="" />
                <meta property="og:description" content={event.title} />
            </Head>
            {/* <Header /> */}
            <main>
                {/* <div id="fb-root"></div>
                <script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v9.0&appId=843019779849153&autoLogAppEvents=1" nonce="82BHfBgu"></script> */}
                <div className="margin_adjust_container">
                    <EventContainer
                        event={event}
                        selectedRun={selectedRun}
                        userRole={userRole}
                    />
                </div>
            </main>
        </>
    );

}
export const getServerSideProps = async (context) => {

    const cookies = {};
    context.req.headers.cookie?.split(";")
        .forEach(cookie => {
            var pair = cookie.trimLeft(" ").split("=");
            cookies[pair[0]] = pair[1];
        })

    const res = await fetch(`${config.SERVER_BASE}/api/event/${context.params.id}`, {
        headers: {
            "x-access-token": cookies["jwt-token"],
        }
    })

    if (res.status === 401 || res.status === 403 || res.status === 500) {
        return {
            props: {
                data: null
            }
        }
    }
    const data = await res.json();
    return {
        props: {
            data: data
        }
    }
}

export default Event;