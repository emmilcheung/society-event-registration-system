import React from 'react';
// import { makeStyles } from '@material-ui/core/styles';
import { Modal } from '@material-ui/core';
import { Button, FormControl } from '@material-ui/core'
import { TextField } from '@material-ui/core'
import { FormControlLabel } from '@material-ui/core';
import { Radio } from '@material-ui/core'
import { RadioGroup } from '@material-ui/core';
import { InputLabel } from '@material-ui/core/';
import { MenuItem } from '@material-ui/core/';
import { Select } from '@material-ui/core/';
import { Checkbox } from '@material-ui/core/'

export default function ApplyModal({ 
    open,
    setOpen,
    email,
    handleClick
}) {
    const [phone, setPhone] = React.useState("")

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const body = (<div
        style={{
            position: 'absolute',
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
        <h1>Application</h1>
        <FormControl
            fullWidth
            component="fieldset"
        >
            <TextField
                label="Email"
                margin="normal"
                disabled
                fullWidth
                value={email}
                variant="outlined"
            />
        </FormControl>
        <FormControl
            fullWidth
            component="fieldset"
        >
            <TextField
                label="Contact No"
                margin="normal"
                required
                fullWidth
                value={phone}
                onChange={e => setPhone(e.target.value)}
                variant="outlined"
            />
        </FormControl>
        <div>
            <Button
                variant="contained" color="primary"
                onClick={() => {
                    handleClick(email, phone)}
                }
            >
                Submit
                    </Button>
        </div>
        <small>I understand and agree 
            <a href="http://www.cuhk.edu.hk/policy/pdo/en/"
                target="_blank"
                style={{ color: "blue" }}
            >
                {" my personal information "}
                </a>
                will be used for the above purpose(s).
        </small>
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