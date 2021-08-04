
import React, { useState, useEffect } from 'react';
import { Map, Marker, InfoWindow, GoogleApiWrapper } from 'google-maps-react';

import Head from 'next/head';

const containerStyle = {
    width: '100vw',
    height: '50vh'
}

const mapStyles = {
    width: '100%',
    height: '100%'
};

const MapContainer = (props) => {
    const [state, setState] = useState({
        showingInfoWindow: false,
        activeMarker: {},
        selectedPlace: {},
    });
    const [query, setQuery] = useState("");
    const [map, setMap] = useState(null);
    const [places, setPlaces] = useState([])

    useEffect(() => {
        if (map) {
            setTimeout(() => {
                if (query.length > 0) {
                    searchPlace();
                    // autoComplete()
                }
            }, 1500)
        }
    }, [query])

    const searchPlace = () => {
        setPlaces([]);
        const request = {
            query: query,
            fields: ["name", "geometry", "place_id"],
        };
        const { google } = props;
        const infowindow = new google.maps.InfoWindow();
        const service = new google.maps.places.PlacesService(map);
        service.findPlaceFromQuery(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log(results)
                for (let i = 0; i < results.length; i++) {
                    setPlaces([...places, {
                        placeId: results[i].place_id,
                        location: results[i].geometry.location,
                        name: results[i].name
                    }]);
                    // console.log(results[i])
                    // console.log(results[i].geometry.location.lat(), results[i].geometry.location.lng())
                }
                // map.setCenter(results[0].geometry.location)

            }
        })
    }

    const choosePlace = (i) => {
        var place = places[i];
        setState({
            ...state,
            activeMarker: place
        })
        map.setCenter(place.location)
        setPlaces([])
    }


    const loadPlace = (props, map) => {
        // console.log(props, map);
        setMap(map);

    }


    const onMapClicked = (props, map, clickEvent) => {
        console.log(clickEvent);
        setState({
            ...state,
            activeMarker: {
                placeId: clickEvent.placeId,
                location: clickEvent.latLng,
                name: clickEvent?.name
            }
        })

    };
    return (
        <div className="google-map">
            <input
                value={query}
                onChange={e => setQuery(e.target.value)}
            />
            {
                places.map((place, i) => {
                    return (
                        <p
                            key={i}
                            onClick={() => choosePlace(i)}
                        >{place.name}</p>
                    )
                })
            }
            <div id="infowindow-content">
                <span id="place-name" className="title"></span><br />
                <strong>Place ID:</strong> <span id="place-id"></span><br />
                <span id="place-address"></span>
            </div>
            <Map
                google={props.google}
                zoom={18}
                containerStyle={containerStyle}
                style={mapStyles}
                streetViewControl={false}
                initialCenter={{
                    lat: 22.419853,
                    lng: 114.206728,
                }}
                clickableIcons
                onReady={loadPlace}
                onClick={onMapClicked}
            >
                {
                    Object.keys(state.activeMarker).length &&
                    <Marker
                        title={state.activeMarker?.name}
                        position={state.activeMarker.location}
                    />
                }

            </Map>
        </div >
    );
}

export default GoogleApiWrapper({
    apiKey: 'AIzaSyCrnAwk3NXEuFZVTebYuPrboxXGg-hNzxk',
    language: "en-US",
})(MapContainer);
