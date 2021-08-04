import React from 'react';
// import { makeStyles } from '@material-ui/core/styles';
import { Modal } from '@material-ui/core';

function rand() {
    return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

export default function CreateEventModal({ setRasEvent }) {
    const [modalStyle] = React.useState(getModalStyle);
    const [url, setURL] = React.useState("")
    const [open, setOpen] = React.useState(false);

    const handleClick = async () => {
        var res = await fetch(`http://localhost:5000/api/ras_event?u=${encodeURIComponent(url)}`);
        console.log(res);
        if (res.status !== 200) {
            return
        }
        var data = await res.json();
        setRasEvent(data, url);
        setOpen(false);
    }

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const body = (
        <div style={{
            position: 'absolute',
            width: 400,
            backgroundColor: "#FFFFFF",
            border: '2px solid #000',
            boxShadow: "0 1px 2px rgba(0,0,0, 0,2)",
            top: `50%`,
            left: `50%`,
            transform: `translate(-50%, -50%)`,
            padding: "20px 40px",
            // padding: theme.spacing(2, 4, 3),
        }}>
            <input type="text" value={url} onChange={e => setURL(e.target.value)} />
            <button onClick={handleClick}>button</button>
        </div>
    );

    return (
        <div>
            <button type="button" onClick={handleOpen}>
                Open Modal
      </button>
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