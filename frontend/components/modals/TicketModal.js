import React from 'react';
// import { makeStyles } from '@material-ui/core/styles';
import { Modal } from '@material-ui/core';
import QRCode from 'qrcode.react';

import { config } from '../../config/initialConfig';

export default function TicketModal({
    open,
    setOpen,
    ticket,
}) {

    if(ticket.status == config.TICKET_STATUS_AVALIABLE){
        var status = "Valid";
    }
    else if( ticket.status == config.TICKET_STATUS_USED){
        var status = "Used";
    }
    else if(ticket.status == config.TICKET_STATUS_PASSED){
        var status = "Expired";
    }

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const body = (<div
        style={{
            position: 'absolute',
            display: "grid",
            justifyContent: 'center',
            color: "var(--card-text)",
            backgroundColor: "var(--card-bg)",
            borderRadius: "max(0px, min(8px, ((100vw - 4px) - 100%) * 9999)) / 8px",
            boxShadow: "var(--shadow-card)",
            width: "min(700px, 100vw)",
            top: `50%`,
            left: `50%`,
            transform: `translate(-50%, -50%)`,
            padding: "20px 40px",
        }}>
        <h1>Ticket</h1>
        <br />
        <h3>Status: {status}</h3>
        <br />
        <QRCode
            size={128 * 2}
            value={ticket.token}
        />

    </div>
    );

    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                {body}
            </Modal>
        </div>
    );
}
