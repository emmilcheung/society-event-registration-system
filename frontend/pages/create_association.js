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
import { config } from '../config/initialConfig'

const today = moment().format().slice(0, 16);

const create_association = () => {

    const router = useRouter();

    const [profileImage, setProfileImage] = useState('');
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [website, setWebsite] = useState('');
    const [email, setEmail] = useState('');
    const [country, setCountry] = useState('');
    const [phone, setPhone] = useState('');
    const [intro, setIntro] = useState('');
    const [type, setType] = useState('');
    const [isOffice, setIsOffice] = useState(false)
    const [venue, setVenue] = useState({
        venueId: null,
        title: "",
        address: "",
        lat: 22.420195,
        lng: 114.207186,
        placeId: null,
        zoom: 18,
        description: ""
    })

    const submitForm = async () => {

        var data = {
            profileImage: profileImage,
            title: name,
            description: desc,
            website: website,
            email: email,
            countryCode: country,
            phoneNo: phone,
            introduction: intro,
            type: type,
            isOffice: isOffice,
            venue: venue
        }
        console.log(data);
        const token = cookie.get('jwt-token')
        var response = await fetch(`${config.SERVER_BASE}/api/association`, {
            method: "POST",
            headers: {
                "x-access-token": token,
                "content-type": "application/json"
            },
            body: JSON.stringify(data),
        })
        //error handling later
        if (response.status !== 201) return
        data = await response.json();
        console.log(data)
        router.push({
            pathname: `/association/${data.association_id}`
        })

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
        setVenue(prevState => {
            var newState = { ...prevState }
            newState.title = name;
            newState.lat = lat;
            newState.lng = lng;
            newState.address = address;
            newState.placeId = placeId;
            newState.zoom = zoom;
            return newState;
        })
    }

    return (
        <>
            <Header />
            <main>
                <div className="margin_adjust_container">
                    <div className="form_container">
                        <div className="form_header__assoc">
                            <h1>Register an association</h1>
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
                                <img src={`${config.SERVER_BASE}/img/${profileImage}`} alt="" className="img" />
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
                                label="Name (Required)"
                                margin="normal"
                                fullWidth
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                variant="outlined"
                            />

                        </FormControl>
                        <FormControl
                            fullWidth
                            component="fieldset"
                        >
                            <TextField
                                label="Short Description (Required)"
                                rowsMax={100}
                                rows={5}
                                multiline
                                variant="outlined"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                            />
                        </FormControl>
                        <FormControl
                            fullWidth
                            component="fieldset"
                        >
                            <TextField
                                label="website (If any)"
                                margin="normal"
                                fullWidth
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                variant="outlined"
                            />

                        </FormControl>
                        <FormControl
                            fullWidth
                            component="fieldset"
                        >
                            <TextField
                                label="Email (If any)"
                                margin="normal"
                                type="email"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                variant="outlined"
                            />

                        </FormControl>
                        <div className="phone">
                            <FormControl variant="outlined" >
                                <InputLabel>Country Code</InputLabel>
                                <Select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    label="Country code"
                                >
                                    {
                                        ["852"].map((code, i) => {

                                            return <MenuItem value={code} key={i}>
                                                +{code}
                                            </MenuItem>
                                        })
                                    }
                                </Select>
                            </FormControl>
                            <FormControl>
                                <TextField
                                    label="Phone number"
                                    multiline
                                    variant="outlined"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </FormControl>
                        </div>
                        <div className="asso_intro">

                            <FormControl
                                fullWidth
                                component="fieldset"
                            >
                                <TextField
                                    label="Introduction (if any)"
                                    rowsMax={100}
                                    rows={10}
                                    multiline
                                    variant="outlined"
                                    value={intro}
                                    onChange={(e) => setIntro(e.target.value)}
                                />
                            </FormControl>
                        </div>
                        <div>
                            <FormControl variant="outlined" >
                                <InputLabel>Type</InputLabel>
                                <Select
                                    labelId="demo-simple-select-outlined-label"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    label="Type"
                                >
                                    {
                                        Object.keys(config.ASSOCIATION_TYPE).map((key, i) => {

                                            return <MenuItem value={key} key={i}>
                                                {config.ASSOCIATION_TYPE[key]}
                                            </MenuItem>
                                        })
                                    }
                                </Select>
                            </FormControl>
                        </div>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isOffice}
                                    onChange={() => setIsOffice(!isOffice)}
                                    name="checked"
                                    color="primary"
                                />
                            }
                            label="Add office address"
                        />
                        {
                            isOffice &&
                            <>

                                <FormControl
                                    fullWidth
                                    component="fieldset"
                                >
                                    <TextField
                                        label="Place"
                                        margin="normal"
                                        fullWidth
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        variant="outlined"
                                        onChange={e => setVenue(prevState => {
                                            var newState = {...prevState};
                                            newState.title = e.target.value;
                                            return newState;
                                        })}
                                    />
                                </FormControl>
                                <MapContainer
                                    id={0}
                                    location={venue}
                                    setLocation={setLocation}
                                />
                            </>
                        }
                        <div>
                            <Button
                                variant="contained" color="primary"
                                onClick={submitForm}
                            >Submit</Button>
                        </div>
                    </div>

                </div>
            </main>
        </>
    );
}


export default create_association;

