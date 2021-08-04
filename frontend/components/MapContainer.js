import React, { useState, useEffect, useRef, useContext, createContext } from 'react';
import { Map, Marker, InfoWindow, GoogleApiWrapper } from 'google-maps-react';
//next
import Head from 'next/head';
//material-ui
import { Button } from '@material-ui/core'
import { FormControl } from '@material-ui/core'
import { TextField } from '@material-ui/core'
import { FormControlLabel } from '@material-ui/core'


const containerStyle = {
    width: "100%",
    height: "100%",
    top: "0",
    left: "0",

}

const mapStyles = {
    width: '100%',
    height: '100%'
};

const MapContainer = (props) => {
    const { id, location, setLocation } = useContext(MapContext);
    const [state, setState] = useState({
        showingInfoWindow: false,
        activeMarker: {},
        selectedPlace: {},
    });
    const [query, setQuery] = useState(location.title? location.title : "");
    const [input, setInput] = useState(location.title? location.title : "");
    const [map, setMap] = useState(null);
    const [places, setPlaces] = useState([]);
    const [zoom, setZoom] = useState(location.zoom);

    const addressRef = useRef();

    useEffect(() => {
        
        const timeoutId = setTimeout(() => searchPlace(query), 1000);
        return () => clearTimeout(timeoutId);
    }, [input]);    

    const searchPlace = (string) => {
        setPlaces([]);
        if (string.length > 0) {
            const request = {
                query: string,
                fields: ["ALL"],
            };
            const { google } = props;
            const infowindow = new google.maps.InfoWindow();
            const service = new google.maps.places.PlacesService(map);
            service.findPlaceFromQuery(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    for (let i = 0; i < results.length; i++) {
                        // setPlaces([...places, {
                        //     placeId: results[i].place_id,
                        //     location: results[i].geometry.location,
                        //     name: results[i].name
                        // }]);
                    }
                    var lat = results[0].geometry.location.lat();
                    var lng = results[0].geometry.location.lng();
                    console.log(results[0])
                    setLocation(id, {
                        lat: lat,
                        lng: lng,
                        name: results[0].name,
                        address: results[0].formatted_address,
                        placeId: results[0].place_id,
                        zoom: zoom,
                    })
                    setQuery(results[0].formatted_address);
                    map.setCenter(results[0].geometry.location)
                }
            })
        }
    }

    const loadMap = (props, map) => {
        // console.log(props, map);
        setMap(map);

    }

    const onInputChange = (e) =>{
        setInput(e.target.value);
        setQuery(e.target.value);
    }

    const onMapClicked = (props, map, clickEvent) => {
        const { google } = props;
        var lat = clickEvent.latLng.lat();
        var lng = clickEvent.latLng.lng();
        var address = "";
        if (Object.keys(clickEvent).includes("placeId")) {
            const request = {
                placeId: clickEvent.placeId,
                fields: ["name", "formatted_address", "place_id", "geometry"],
            };
            const infowindow = new google.maps.InfoWindow();
            const service = new google.maps.places.PlacesService(map);
            service.getDetails(request, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    setLocation(id, {
                        lat: lat,
                        lng: lng,
                        name: clickEvent?.name,
                        address: place.formatted_address,
                        placeId: clickEvent?.placeId,
                        zoom: zoom,
                    })
                    setQuery(place.formatted_address);
                }
            });
        }
        else {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === "OK") {
                    if (results[0]) {
                        setLocation(id, {
                            lat: lat,
                            lng: lng,
                            name: clickEvent?.name,
                            address: results[0].formatted_address,
                            placeId: clickEvent?.place_id,
                            zoom: zoom,
                        })
                        setQuery(results[0].formatted_address);
                    }
                }
            });
        }


    };
    return (
        <div className="google-map_maps__3SzVa">
            <FormControl
                fullWidth
                component="fieldset"
            >
                <TextField
                    ref={addressRef}
                    id=""
                    label="Address"
                    value={query}
                    margin="normal"
                    onChange={onInputChange}
                    fullWidth
                    variant="outlined"
                />
                {/* <Button variant="outlined" onClick={searchPlace}>Default</Button> */}
            </FormControl>
            <div className="map-wrapper">
                <Map
                    google={props.google}
                    zoom={zoom}
                    containerStyle={containerStyle}
                    style={mapStyles}
                    streetViewControl={false}
                    mapTypeControl={false}
                    clickableIcons
                    initialCenter={{
                        lat: 22.419853,
                        lng: 114.206728,
                    }}
                    onReady={loadMap}
                    onClick={onMapClicked}
                    onZoomChanged={(props, map) => setZoom(map.getZoom())}
                >
                    {
                        <Marker
                            title={location.name}
                            position={{ lat: location.lat, lng: location.lng }}
                        />
                    }

                </Map>
            </div>
        </div >
    );
}

const MapContext = createContext({});

export const MapProvider = ({ ...props }) => {
    return (
        <MapContext.Provider value={props}>
            <TempComponent />
        </MapContext.Provider>
    )
}
const TempComponent = GoogleApiWrapper({
    apiKey: 'AIzaSyCrnAwk3NXEuFZVTebYuPrboxXGg-hNzxk',
    language: "en-US"
})(MapContainer)

export default MapProvider;




