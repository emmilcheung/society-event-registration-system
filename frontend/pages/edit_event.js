import react, { useState, useEffect, useRef } from 'react';
import cookie from 'js-cookie';
import moment from 'moment';
//material-ui
import { Button, FormControl } from '@material-ui/core'
import { TextField } from '@material-ui/core'
import { FormControlLabel } from '@material-ui/core';
import { Radio } from '@material-ui/core'
import { RadioGroup } from '@material-ui/core';
import { InputLabel } from '@material-ui/core/';
import { MenuItem } from '@material-ui/core/';
import { Select } from '@material-ui/core/';
import { Checkbox } from '@material-ui/core/';



import { useRouter } from 'next/router';

import { useAuth } from '../components/authProvider';
import Header from '../components/Header';
import MapContainer from '../components/MapContainer'
import CreateEventModal from '../components/modals/createEventModal';
import { config } from '../config/initialConfig'


const edit_event = ({ associations }) => {

    const router = useRouter();

    const [profileImage, setProfileImage] = useState('');
    const [associationMeta, setAssociationMeta] = useState(associations.length
        ? {
            id: associations[0].association_id,
            name: associations[0].title,
        } : {});
    const [title, setTitle] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [desc, setDesc] = useState("");
    const [category, setCategory] = useState("");
    const [form, setForm] = useState("");
    const [runs, setRuns] = useState([])
    const [isNotify, setIsNotify] = useState(true);

    useEffect(() => {
        if (Object.keys(router.query).length) {
            loadEvent(router.query.e)
        }
    }, [router])

    const loadEvent = async (event_id) => {
        var jwtToken = cookie.get('jwt-token');
        var event = await fetch(`${config.SERVER_BASE}/api/event/${event_id}`, {
            headers: {
                "x-access-token": jwtToken,
            }
        }).then(res => {
            if (res.status !== 200) return null
            return res.json();
        })
        console.log(event);
        setTitle(event.event.title);
        setDesc(event.event.description);
        setCategory(event.event.category);
        setProfileImage(event.event.profile_image);
        setForm(event.event.form);
        setIsPublic(Boolean(event.event.is_public));
        var i = 0;
        Object.values(event.event.runs).forEach(run => {
            console.log(run);
            if (i === 0) {
                setRuns(prevState => {
                    var newState = [...prevState];
                    newState[i].runId = run.run_id;
                    newState[i].startTime = parseDateToTimestamp(run.start_time);
                    newState[i].endTime = parseDateToTimestamp(run.end_time);
                    newState[i].allday = Boolean(run.all_day);
                    newState[i].repeat = Boolean(run.repeat);
                    newState[i].repeatStyle = run.repeat_style;
                    newState[i].online = Boolean(run.online);
                    if (run.venue_id !== null) {
                        newState[i].venue.venueId = run.venue_id;
                        newState[i].venue.title = run.title;
                        newState[i].venue.lat = run.lat;
                        newState[i].venue.lng = run.lng;
                        newState[i].venue.address = run.address;
                        newState[i].venue.placeId = run.place_id;
                        newState[i].venue.zoom = run.zoom;
                        newState[i].venue.description = run.description;
                    }
                    return newState;
                })
            } else {
                setRuns(prevState => {
                    return [...prevState,
                    {
                        runId: run.run_id,
                        startTime: parseDateToTimestamp(run.start_time),
                        endTime: parseDateToTimestamp(run.end_time),
                        allday: Boolean(run.all_day),
                        repeat: Boolean(run.repeat),
                        repeatStyle: run.repeat_style,
                        online: Boolean(run.online),
                        venue: {
                            venueId: run.venue_id ? run.venue_id : null,
                            title: run.title ? run.title : "",
                            address: run.address ? run.address : "",
                            lat: run.lat ? run.lat : 22.420195,
                            lng: run.lng ? run.lng : 114.207186,
                            placeId: run.place_id ? run.place_id : null,
                            zoom: run.zoom ? run.zoom : 18,
                            description: run.description ? run.description : ""
                        }
                    }]
                })
            }
            i++;
        })
    }

    useEffect(() => {
        setRuns([
            {
                startTime: Math.floor(moment().valueOf() / 1000),
                endTime: Math.floor(moment().valueOf() / 1000),
                allday: false,
                repeat: false,
                repeatStyle: "",
                online: true,
                ditto: false,
                venue: {
                    venueId: null,
                    title: "",
                    address: "",
                    lat: 22.420195,
                    lng: 114.207186,
                    placeId: null,
                    zoom: 18,
                    description: ""
                }
            }
        ])
    }, [])

    const submitForm = async () => {

        var data = {
            title: title,
            associationId: associationMeta.id,
            isPublic: isPublic,
            description: desc,
            profileImage: profileImage,
            category: category,
            form: form,
            runs: runs,
            isNotify: isNotify
        }
        console.log(data)
        if (confirm("Confirm?")) {

            const token = cookie.get('jwt-token')
            var response = await fetch(`${config.SERVER_BASE}/api/edit_event/${router.query.e}`, {
                method: "POST",
                headers: {
                    "x-access-token": token,
                    "content-type": "application/json"
                },
                body: JSON.stringify(data),
            })
            //error handling later
            if (response.status !== 201) return
            var event = await response.json();
            console.log(event.event_id)
            router.push(`/event/${event.event_id}`)
        }

    }

    const setRasEvent = (data, url) => {
        setTitle(data.title);
        setDesc(
            `${data.desc}\n\nAuto generated from ${url}`
        );
        setRuns([{
            startTime: Math.floor(moment(data.start_time).valueOf() / 1000),
            endTime: Math.floor(moment(data.end_time).valueOf() / 1000),
            allday: false,
            repeat: false,
            repeatStyle: "",
            online: data.online,
            ditto: false,
            venue: {
                venueId: null,
                title: data.location,
                address: data.location,
                lat: null,
                lng: null,
                placeId: null,
                zoom: 18,
                description: ""
            }
        }])
    }

    const imageHandler = async (e) => {
        const token = cookie.get('jwt-token')
        var form = new FormData();
        form.append("file", e.target.files[0]);
        var imageURL = await fetch(`${config.SERVER_BASE}/api/upload_image`, {
            method: "POST",
            headers: {
                "x-access-token": token,
            },
            body: form,
        }).then(data => data.json());
        setProfileImage(imageURL.image);
    };

    const removePreview = async () => {
        setProfileImage("");
    }

    const setLocation = (i, { lat, lng, address, name, placeId, zoom }) => {
        setRuns(prevState => {
            var newState = [...prevState]
            newState[i].venue.title = name;
            newState[i].venue.lat = lat;
            newState[i].venue.lng = lng;
            newState[i].venue.address = address;
            newState[i].venue.placeId = placeId;
            newState[i].venue.zoom = zoom;
            return newState;
        })
    }

    const addNewRun = () => {
        setRuns(prevState => {
            return [...prevState,
            {
                startTime: Math.floor(moment().valueOf() / 1000),
                endTime: Math.floor(moment().valueOf() / 1000),
                allday: false,
                repeat: false,
                repeatStyle: "",
                online: true,
                venue: {
                    venueId: null,
                    title: "",
                    address: "",
                    lat: 22.420195,
                    lng: 114.207186,
                    placeId: null,
                    zoom: 18,
                    description: ""
                }
            }]
        })
    }

    const onlineToggle = (i) => {
        setRuns(prevState => {
            var newState = [...prevState];
            newState[i].online = !prevState[i].online;
            return newState;
        })
    }

    const handleAssociationChange = (e) => {
        var name = associations.filter(asso => asso.association_id == e.target.value)[0].title;
        setAssociationMeta({
            id: e.target.value,
            name: name,
        })
    }

    const parseDateToTimestamp = (dateString) => {
        return (Math.floor(new Date(dateString).getTime() / 1000))
    }

    if (!associations.length) {
        return (
            <>
                <main>
                    <div className="margin_adjust_container">
                        Only for association
                    </div>
                </main>
            </>
        )
    }

    return (
        <>
            <Header />
            <main>
                <div className="margin_adjust_container">
                    <div className="form_container">
                        <div className="form_header">
                            <h1>
                                <span>Edit event</span>
                                <FormControl
                                >
                                    <Select
                                        defaultValue={associationMeta.id}
                                        value={associationMeta.id}
                                        onChange={handleAssociationChange}
                                    >
                                        {
                                            associations.map((association, key) => {
                                                return (
                                                    <MenuItem
                                                        key={key}
                                                        value={association.association_id}
                                                    >{association.title}
                                                    </MenuItem>
                                                )
                                            })
                                        }
                                    </Select>
                                </FormControl>
                            </h1>
                            {/* https://webapp.itsc.cuhk.edu.hk/ras/restricted/event?id=42902 */}
                            {/* https://webapp.itsc.cuhk.edu.hk/ras/restricted/event?id=42993 */}
                            <CreateEventModal
                                setRasEvent={setRasEvent}
                            />
                        </div>



                        {
                            (!profileImage || !profileImage?.length) &&
                            <div className="upload_image">
                                <>
                                    <label htmlFor="input" />
                                    <input type="file" accept="image/*" id="input" onChange={imageHandler} />
                                </>
                            </div>
                        }
                        {
                            (profileImage && profileImage.length) &&
                            <div className="preview_image">
                                <input type="file" accept="image/*" id="input" onChange={imageHandler} />
                                <img src={`${config.SERVER_BASE}/img/${profileImage}`} alt="" className="img"
                                    style={{ height: 'auto', width: 'auto' }} />
                                <img src="/img/cross.png" alt="" className="preview_cross"
                                    onClick={removePreview}
                                />
                            </div>

                        }

                        <FormControl
                            fullWidth
                            component="fieldset"
                        >
                            <TextField
                                label="Title"
                                margin="normal"
                                fullWidth
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                variant="outlined"
                            />
                        </FormControl>
                        {/* <FormLabel component="legend">Assign responsibility</FormLabel> */}
                        <FormControl
                            fullWidth
                            component="fieldset"
                        >
                            <TextField
                                label="Description"
                                rowsMax={100}
                                rows={20}
                                multiline
                                variant="outlined"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                            />
                        </FormControl>
                        <div className="form_category">
                            <FormControl variant="outlined" >
                                <InputLabel>Category</InputLabel>
                                <Select
                                    labelId="demo-simple-select-outlined-label"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    label="Category"
                                >
                                    {
                                        Object.keys(config.EVENT_CATEGORY).map((key, i) => {

                                            return <MenuItem value={key} key={i}>
                                                {config.EVENT_CATEGORY[key]}
                                            </MenuItem>
                                        })
                                    }
                                </Select>
                            </FormControl>
                            <FormControl variant="outlined" >
                                <InputLabel >Form</InputLabel>
                                <Select
                                    labelId="demo-simple-select-outlined-label"
                                    value={form}
                                    onChange={(e) => setForm(e.target.value)}
                                    label="Form"
                                >
                                    {
                                        Object.keys(config.EVENT_FORM).map((key, i) => {

                                            return <MenuItem value={key} key={i}>
                                                {config.EVENT_FORM[key]}
                                            </MenuItem>
                                        })
                                    }
                                </Select>
                            </FormControl>
                        </div>
                        <div className="public_btn">
                            <FormControl component="fieldset">
                                <RadioGroup row name="position" defaultValue="public"
                                    onChange={() => setIsPublic(prev => !prev)}
                                >
                                    <FormControlLabel
                                        value="public"
                                        control={<Radio color="primary" />}
                                        label="public"
                                        labelPlacement="top"
                                    />
                                    <FormControlLabel
                                        value="private"
                                        control={<Radio color="secondary" />}
                                        label="private"
                                        labelPlacement="top"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </div>
                        {
                            runs.map((run, i) => {
                                var start_timestamp = moment(run.startTime * 1000).format().slice(0, 16);
                                var end_timestamp = moment(run.endTime * 1000).format().slice(0, 16);
                                return (
                                    <div className="run_container"
                                        key={i}
                                    >
                                        <h2>Time Slot {i + 1}</h2>
                                        <div className="form_dates">
                                            <FormControl
                                                fullWidth
                                                component="fieldset"
                                            >
                                                <TextField
                                                    label="Start time"
                                                    type="datetime-local"
                                                    value={start_timestamp}
                                                    defaultValue={start_timestamp}
                                                    variant="outlined"
                                                    onChange={e => setRuns(prevState => {
                                                        var newState = [...prevState];
                                                        newState[i].startTime = parseDateToTimestamp(e.target.value);
                                                        newState[i].endTime = parseDateToTimestamp(e.target.value);
                                                        return newState;
                                                    })}
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
                                                    label="End time"
                                                    type="datetime-local"
                                                    value={end_timestamp}
                                                    defaultValue={end_timestamp}
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    onChange={e => setRuns(prevState => {
                                                        var newState = [...prevState];
                                                        newState[i].endTime = parseDateToTimestamp(e.target.value);
                                                        return newState;
                                                    })}
                                                />
                                            </FormControl>
                                        </div>
                                        {
                                            run.ditto
                                                ? <></>
                                                : <>
                                                    <FormControl component="fieldset">
                                                        <RadioGroup row name="position"
                                                            defaultValue={run.online ? "online" : "local"}
                                                            value={run.online ? "online" : "local"}
                                                            onChange={() => onlineToggle(i)}
                                                        >
                                                            <FormControlLabel
                                                                value="online"
                                                                control={<Radio color="primary" />}
                                                                label="online"
                                                                labelPlacement="top"
                                                            />
                                                            <FormControlLabel
                                                                value="local"
                                                                control={<Radio color="primary" />}
                                                                label="local"
                                                                labelPlacement="top"
                                                            />
                                                        </RadioGroup>
                                                    </FormControl>
                                                    {
                                                        run.online
                                                            ? <>
                                                                <FormControl
                                                                    fullWidth
                                                                    component="fieldset"
                                                                >
                                                                    <TextField
                                                                        label="Online Link (if any)"
                                                                        margin="normal"
                                                                        fullWidth
                                                                        value={run.venue.title}
                                                                        variant="outlined"
                                                                        onChange={e => setRuns(prevState => {
                                                                            var newState = [...prevState];

                                                                            newState[i].venue.title = e.target.value;
                                                                            return newState;
                                                                        })}
                                                                    />
                                                                </FormControl>
                                                            </>
                                                            : <>
                                                                <FormControl
                                                                    fullWidth
                                                                    component="fieldset"
                                                                >
                                                                    <TextField
                                                                        label="Place"
                                                                        margin="normal"
                                                                        fullWidth
                                                                        variant="outlined"
                                                                        value={run.venue.title}
                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        onChange={e => setRuns(prevState => {
                                                                            var newState = [...prevState];
                                                                            newState[i].venue.title = e.target.value;
                                                                            return newState;
                                                                        })}
                                                                    />
                                                                </FormControl>
                                                                <MapContainer
                                                                    id={i}
                                                                    location={runs[i].venue}
                                                                    setLocation={setLocation}
                                                                />
                                                            </>
                                                    }
                                                </>
                                        }
                                        {
                                            i > 0 &&
                                            <div>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={run.ditto}
                                                            onChange={e => setRuns(prevState => {
                                                                var newState = [...prevState];
                                                                newState[i].ditto = !prevState[i].ditto;
                                                                return newState;
                                                            })}
                                                            name="ditto"
                                                            color="primary"
                                                        />
                                                    }
                                                    label="ditto"
                                                />
                                            </div>
                                        }
                                    </div>)
                            })
                        }
                        <p
                            className="new_run_btn"
                            onClick={addNewRun}
                        >
                            Add new time slot
                        </p>
                        <h4>Notify all participants?</h4><br />
                        <div className="notify_btn">
                            <FormControl component="fieldset">
                                <RadioGroup row name="position" defaultValue="Yes"
                                    onChange={() => setIsNotify(prev => !prev)}
                                >
                                    <FormControlLabel
                                        value="Yes"
                                        control={<Radio color="primary" />}
                                        label="Yes"
                                        labelPlacement="top"
                                    />
                                    <FormControlLabel
                                        value="No"
                                        control={<Radio color="secondary" />}
                                        label="No"
                                        labelPlacement="top"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </div><br />
                        <Button
                            variant="contained" color="primary"
                            onClick={submitForm}
                        >Update</Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                router.push({
                                    pathname: `/event/${router.query.e}`,
                                })
                            }}
                        >Cancel</Button>
                    </div>

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
    var res = await fetch(`${config.SERVER_BASE}/api/my_association`, {
        headers: {
            "x-access-token": cookies['jwt-token'],
        }
    })
    if (res.status !== 200) {
        return {
            redirect: {
                destination: '/404',
                permanent: false,
            },
        }
    }
    var data = await res.json();
    // filter association if there is specific assocation id
    data.manager = data.manager.filter(asso => context?.query.a
        ? asso.association_id === context.query.a
        : true
    )
    return {
        props: {
            associations: data?.manager ? data.manager : []
        }
    }
}

export default edit_event;

