import React, { useState } from 'react';

import Link from 'next/link';

import { Button } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';;


import { config } from '../../config/initialConfig';
import AssociationItem from "./AssociationItem";

const AssociationBoard = ({
                         associations,
                         associationType,
                         setAssociationType,
                     }) => {

    return (
        <div className="event_board">
            <div className="board_header">
                <div className="board_header_left">
                    <h2>{`Associations`}</h2>
                </div>
                <div className="board_header_center"></div>
                <div className="board_header_right"></div>
            </div>
            <div className="filter">
                <div className="choices">
                    <div
                        className={`all${associationType === "" ? " active" : ""}`}
                        onClick={() => setAssociationType('')}
                    >
                        <span>All</span>
                        <div className="arrow-up">
                        </div>

                    </div>
                    {
                        Object.keys(config.ASSOCIATION_TYPE).map((key, i) => {
                            var value = config.ASSOCIATION_TYPE[key]
                            return (
                                <div
                                    key={i}
                                    className={`key ${associationType === key ? " active" : ""}`}
                                    onClick={() => setAssociationType(key)}
                                >
                                    <span>{value}</span>
                                    <div className="arrow-up">
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className="body_container">

                <table className="board_body">
                    <tbody>

                    <tr className="date_header">
                        <td colSpan="3">
                            {
                                associations.length
                                    ? `Total (${associations.length}) is found`
                                    : "No association is found"
                            }
                        </td>
                    </tr>
                    {
                        associations.map(run => {
                            return (
                                <AssociationItem
                                    run={run}
                                />
                            )
                        })
                    }

                    </tbody>
                </table>
            </div>

        </div>
    );
}



export default AssociationBoard;