import React, { useState, useEffect } from 'react';
import moment from 'moment';

// import { makeStyles } from '@material-ui/core/styles';
import { Modal } from '@material-ui/core';
import { Button, FormControl } from '@material-ui/core'
import { TextField } from '@material-ui/core'
import { FormControlLabel } from '@material-ui/core';
import { Radio } from '@material-ui/core'
import { RadioGroup } from '@material-ui/core';
import { FormLabel } from '@material-ui/core/';
import { MenuItem } from '@material-ui/core/';
import { Select } from '@material-ui/core/';
import { Checkbox } from '@material-ui/core/'


export default function CreateRegistrationModal({ open, setOpen, formData, create, edit, online }) {
    const [internal, setInternal] = useState(true);
    const [url, setURL] = useState("");
    const [quota, setQuota] = useState(0);
    const [startTime, setStartTime] = useState(moment().format().slice(0, 16))
    const [endTime, setEndTime] = useState(moment().format().slice(0, 16))
    const [remark, setRemark] = useState("");
    // online setting
    const [onlineURL, setOnlineURL] = useState("");
    const [onlineTime, setOnlineTime] = useState(moment().format().slice(0, 16))
    const [loading, setLoading] = useState(false);
    const mode = formData ? "edit" : "create";

    useEffect(() => {
        console.log("useEffect");
        if (formData && formData != null) {
            setInternal(formData.internal == 1 ? true : false);
            setURL(formData.url ? formData.url : "");
            setQuota(formData.quota);
            setStartTime(formData.start_time.replace(" ", "T"));
            setEndTime(formData.end_time.replace(" ", "T"));
            setRemark(formData.remark ? formData.remark : "");
            setOnlineURL(formData.online_url ? formData.online_url: "");
            setOnlineTime(formData.online_time ? formData.online_time.replace(" ", "T"): moment().format().slice(0, 16));
        }
        else {
            setInternal(true);
            setURL("");
            setQuota(0);
            setStartTime(moment().format().slice(0, 16));
            setEndTime(moment().format().slice(0, 16));
            setRemark("");
            setOnlineURL("");
            setOnlineTime(moment().format().slice(0, 16));
        }
    }, [formData])

    const handleClick = async () => {
        var data = {
            internal: internal,
            url: url,
            startTime: Math.floor(moment(startTime, "YYYY-MM-DDTHH-mm-ss").valueOf() / 1000),
            endTime: Math.floor(moment(endTime, "YYYY-MM-DDTHH-mm-ss").valueOf() / 1000),
            quota: parseInt(quota),
            remark: remark,
            onlineURL: onlineURL,
            onlineTime: Math.floor(moment(onlineTime, "YYYY-MM-DDTHH-mm-ss").valueOf() / 1000),
        }
        setLoading(true)
        if (mode == "edit") {
            data.formId = formData.form_id;
            console.log(data);
            edit(data)
        } else {
            create(data);
        }
        setLoading(false)
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
            {
                loading
                    ? <div style={{
                        display: "grid",
                        placeContent: "center",
                    }}>
                        <img src="/img/giphy.gif" alt="" />
                    </div>
                    : <>
                        <h1>Registration</h1>
                        <div className="public_btn">
                            <FormControl component="fieldset">
                                <RadioGroup row name="position" defaultValue="in-app"
                                    onChange={() => setInternal(prev => !prev)}
                                >
                                    <FormControlLabel
                                        value="in-app"
                                        control={<Radio color="primary" />}
                                        label="In-app"
                                        labelPlacement="top"
                                    />
                                    <FormControlLabel
                                        value="external"
                                        control={<Radio color="secondary" />}
                                        label="External"
                                        labelPlacement="top"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </div>
                        {/* external */}
                        {
                            !internal &&
                            <FormControl
                                fullWidth
                                component="fieldset"
                            >
                                <TextField
                                    label="Link"
                                    margin="normal"
                                    fullWidth
                                    value={url}
                                    onChange={(e) => setURL(e.target.value)}
                                    variant="outlined"
                                />

                            </FormControl>
                        }
                        {/* internal */}
                        {
                            internal &&
                            <>
                                <FormControl
                                    fullWidth
                                    component="fieldset"
                                >
                                    <TextField
                                        label="Quota"
                                        margin="normal"
                                        type="number"
                                        fullWidth
                                        value={quota}
                                        onChange={(e) => setQuota(e.target.value)}
                                        variant="outlined"
                                    />

                                </FormControl>
                                <FormLabel component="legend">Application period</FormLabel>
                                <div className="form_dates">
                                    <FormControl
                                        fullWidth
                                        component="fieldset"
                                    >
                                        <TextField
                                            label="Start"
                                            type="datetime-local"
                                            value={startTime}
                                            defaultValue={startTime}
                                            variant="outlined"
                                            onChange={e => setStartTime(e.target.value)}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </FormControl>
                                    <FormControl
                                        fullWidth
                                        component="fieldset"
                                    >
                                        <TextField
                                            label="End"
                                            type="datetime-local"
                                            value={endTime}
                                            defaultValue={endTime}
                                            variant="outlined"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            onChange={e => setEndTime(e.target.value)}
                                        />
                                    </FormControl>
                                </div>
                                <FormControl
                                    fullWidth
                                    component="fieldset"
                                >
                                    <TextField
                                        label="Remarks"
                                        rowsMax={100}
                                        rows={5}
                                        multiline
                                        variant="outlined"
                                        value={remark}
                                        onChange={(e) => setRemark(e.target.value)}
                                    />
                                </FormControl>
                            </>
                        }
                        {/* online */}
                        {
                            online &&
                            <>
                                <h3>Online setting</h3>
                                <FormControl
                                    fullWidth
                                    component="fieldset"
                                >
                                    <TextField
                                        label="Link"
                                        margin="normal"
                                        fullWidth
                                        value={onlineURL}
                                        onChange={(e) => setOnlineURL(e.target.value)}
                                        variant="outlined"
                                    />
                                </FormControl>
                                <FormControl
                                        fullWidth
                                        component="fieldset"
                                    >
                                        <TextField
                                            label="Start"
                                            type="datetime-local"
                                            value={onlineTime}
                                            defaultValue={onlineTime}
                                            variant="outlined"
                                            onChange={e => setOnlineTime(e.target.value)}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </FormControl>
                            </>
                        }
                        <div>
                            <Button
                                variant="contained" color="primary"
                                onClick={handleClick}
                            >Submit</Button>
                        </div>
                    </>
            }
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