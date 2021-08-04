import React, { useState } from 'react';

import Link from 'next/link';

import { Button } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';;


import { config } from '../../config/initialConfig'


const AssociationItem = ({ run }) => {

    return (
        <>
            <tr className="table_item pc">
                <td>
                    <Link href={`/association/${run.association_id}`}>
                        <div
                            style={{
                                backgroundImage:
                                    run.profile_image
                                        ? `url(${config.SERVER_BASE}/img/${run.profile_image})`
                                        : "url(/img/events-placeholder.png)",
                                backgroundSize: "auto 100%",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "center",
                                backgroundAttachment: "scroll",
                                width: "250px",
                                height: "175px",
                                cursor: "pointer"
                            }}
                        ></div>
                    </Link>
                </td>
                <td className="details" colSpan="2">
                    <Link href={`/association/${run.association_id}`}>
                        <a>
                            <div className="details_flex">
                                <div className="title">
                                    <span>{run.title}</span>

                                </div>
                                <br />
                                <div className="other">
                                    <span>{`${run.website}`}</span>
                                    <span>{`${run.email}`}</span>
                                    <span>{`${run.phone_no}`}</span>
                                </div>
                            </div>
                        </a>
                    </Link>
                </td>
            </tr>
            <tr className="table_item mobile">
                <td colSpan="3">
                    <Link href={`/association/${run.association_id}`}>
                        <div
                            style={{
                                backgroundImage:
                                    run.profile_image
                                        ? `url(${config.SERVER_BASE}/img/${run.profile_image})`
                                        : "url(/img/events-placeholder.png)",
                                backgroundSize: "cover",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "top",
                                backgroundAttachment: "scroll",
                                width: "100vw",
                                height: "calc(100vw * 250 / 375)",
                                cursor: "pointer"
                            }}
                        ></div>
                    </Link>
                </td>
            </tr>
            <tr className="table_item mobile">
                <td className="details" colSpan="3">
                    <Link href={`/association/${run.association_id}`}>
                        <a>
                            <div className="details_flex">
                                <div className="title">
                                    <span>{run.title}</span>
                                </div>
                                <div className="other">
                                    <span>{`${run.website}`}</span>
                                    <span>{`${run.email}`}</span>
                                    <span>{`${run.phone_no}`}</span>
                                </div>
                            </div>
                        </a>
                    </Link>
                </td>
            </tr>
        </>
    )
}

export default AssociationItem;