import react, { useState, useEffect, useRef } from 'react';

import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link'

import { config } from '../../config/initialConfig';
import Header from '../../components/Header'
import AssociationContainer from '../../components/association/AssociationContainer'
/*
    
*/


const Association = ({ data }) => {
    const router = useRouter();
    const [association, setAssociation] = useState(data ? data.association : null);
    const [userRole, setUserRole] = useState(data ? data.user : config.ASSOCIATION_USER_ROLE[1]);



    // case of not such event or backend server error
    if (!association) {
        return (<>
            Association not found
        </>)
    }


    return (
        <>
            <Header />
            {/* <h1>{association.title}</h1> */}
            <main>
                <AssociationContainer
                    association={association}
                    userRole={userRole}
                />
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
    const res = await fetch(`${config.SERVER_BASE}/api/association/${context.params.id}`, {
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

export default Association;