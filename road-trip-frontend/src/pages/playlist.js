import React, { useState, useEffect } from 'react';
import { loginURL, recommendPlaylistEndpoint, recommendPlaylistEndpointPart2 } from "../util/spotify";
import { SpotifyGenreButton, StandardNavButton, StandardButton, SubmitButton } from "../generic/Button";
import { loggedOutRedirect, myAxios } from '../util/helper';
import { DropDown, genres, PopularDropDown, popularLevels, playlistLengths } from "../generic/DropDown"
import { BasicInputField } from '../generic/InputField';

import LoadSpinner from "../generic/LoadSpinner";
import { PlaylistCard } from "../generic/Cards";
import { useSelector } from 'react-redux';
import axios from "axios";

require('dotenv').config();

const Playlist = () => {
    loggedOutRedirect("/");

    const [authenticated, setAuthenticated] = useState(false);
    const [makePlaylist, setMakePlaylist] = useState(false);

    const [optionValue, setOptionValue] = useState("acoustic");
    const [secondaryOptionValue, setSecondaryOptionValue] = useState("acoustic");
    const [playlistLength, setPlaylistLength] = useState(10);
    const [popularValue, setPopularValue] = useState(0);
    const [tripValue, setTripValue] = useState('');

    const [userID, setUserID] = useState('Select Trip');
    const [tripId, setTripId] = useState('-1');

    const [playlistName, setPlaylistName] = useState("");

    const [userTrips, setUserTrips] = useState([]);
    const [playlistData, setPlaylistData] = useState({});

    const traveler = useSelector(state => state.travelerReducer.currTraveler);

    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const aToken = localStorage.getItem("accessToken");

        // No traveler? Return null
        if (!traveler) {
            return;
        }

        // Token already exists? Get info
        if (aToken) {
            setAuthenticated(true);
            getUsername();
            getUserPlaylists();
            getUserTrips();

            return;
        } else if (!window.location.hash) {
            return;
        }

        // Parse spotify access token
        const { access_token, expires_in, token_type } = getSpotifyParams();

        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("tokenType", token_type);
        localStorage.setItem("expires", expires_in);
        setAuthenticated(true);

        // Remove # items in router
        window.history.pushState('', '/', window.location.pathname);

        getUsername();
        getUserPlaylists();
        getUserTrips();
    }, [traveler]);

    const changeGenre = (e) => {
        setOptionValue(e.target.value);
    }
    const changeSecondaryGenre = (e) => {
        setSecondaryOptionValue(e.target.value);
    }

    const changePopularityLevel = (e) => {
        setPopularValue(e.target.value);
    }

    const changePlaylistLength = (e) => {
        setPlaylistLength(e.target.value);
    }

    const changeSelectedTrip = (e) => {
        setTripValue(e.target.selectedOptions[0].text);
        setTripId(e.target.value);
    }

    const getUserTrips = () => {
        myAxios.get('/trip/your-trips/' + traveler.username)
            .then((res) => {
                setUserTrips(res.data);
            }).catch((err) => console.error(err));
    }

    const resetCreatePlaylist = () => {
        setMakePlaylist(false);
        setErrorMsg('');
        setPlaylistName('');
    }

    const submitPlaylist = () => {
        if (playlistName == '') {
            setErrorMsg("Playlist name must be at least 1 character.");
            return;
        } else if (tripId == '-1') {
            setErrorMsg("Must have a trip selected.");
            return;
        }

        setErrorMsg('');

        axios.get(recommendPlaylistEndpoint + playlistLength + recommendPlaylistEndpointPart2 + "&seed_genres=" + optionValue + "," + secondaryOptionValue + "&target_popularity=" + popularValue, {
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + localStorage.getItem("accessToken"),
                'Content-Type': 'application/json',
            }
        }).then((response) => {
            console.log("Successfully retrieved recommended playlist.");
            console.log(response.data);

            let track_uris = []
            response.data.tracks.forEach(track => {
                track_uris.push(track.uri);
            });

            let description = "A " + optionValue + " and " + secondaryOptionValue + " playlist made for your trip from " + tripValue;

            axios.post("https://api.spotify.com/v1/users/" + userID + "/playlists", {
                "name": playlistName,
                "public": false,
                "description": description
            }, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("accessToken")
                }
            }).then((res) => {
                let playlist_id = res.data.id;

                axios.post("https://api.spotify.com/v1/playlists/" + playlist_id + "/tracks", {
                    "uris": track_uris
                }, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem("accessToken")
                    }
                }).then((res) => {
                    const playlistBody = {
                        'playlistName': playlistName,
                        'tripId': tripId,
                        'tripName': tripValue,
                        'spotifyId': playlist_id,
                        'playlistUsername': traveler.username
                    }
            
                    const token = localStorage.getItem("traveler-token");
            
                    // Save playlist to the backend
                    myAxios.post("/playlist/save/" + token, playlistBody)
                        .then((res) => {
                            window.location.reload(false);
                        })
                        .catch((err) => console.error(err));
            
                    setMakePlaylist(false);
                })
            }).catch((error) => console.log(error));
        }).catch((error) => console.log(error));
    };

    const getSpotifyParams = () => {
        let hash = window.location.hash;
        const string_after_tag = hash.substring(1).split("&").reduce((current, currentValue) => {
            const [key, value] = currentValue.split("=");
            current[key] = value;
            return current;
        }, {});

        console.log(string_after_tag);
        return string_after_tag;
    }

    const getUsername = () => {
        axios.get("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("accessToken"),
            },
        }).then((response) => {
            setUserID(response.data.id);
        }).catch((error) => {
            console.error(error);
            localStorage.removeItem("accessToken");
            setAuthenticated(false);
        });
    }

    const getUserPlaylists = () => {
        myAxios.get("/playlist/user/" + traveler.username)
            .then((res) => {
                setPlaylistData(res.data);
                console.log(playlistData);
            }).catch((err) => console.error(err));
    };

    if (!traveler) {
        return (<LoadSpinner />);
    }

    return (
        <div className="flex flex-wrap justify-center items-center bg-img-1 bg-no-repeat bg-cover min-h-screen bg-fixed bg-bottom bottom-0">
            {(authenticated) ?
                <div className="flex flex-col justify-center items-center text-center p-10 border-2 border-primary-1 bg-white rounded-md mt-3">
                    <div className="flex flex-col justify-center items-center">
                        <h1 className='text-3xl text-center m-2 flex-wrap'>
                            Road Trip Playlists
                        </h1>

                        <StandardButton filled={true} clickEvent={() => setMakePlaylist(true)}>
                            Create Playlist
                        </StandardButton>

                        {(playlistData.length > 0) ?
                            <div className="space-y-2">
                                <h2 className='text-2xl text-center m-2 flex-wrap'>
                                    Your Playlists
                                </h2>

                                { playlistData.map((item) => <PlaylistCard item={item} />) }
                            </div> : <p className="italic mt-2">No road trip playlists yet! Create one!</p>}
                    </div>

                    {(makePlaylist) ?
                        <div className="absolute top-0 mt-32 flex flex-col justify-left items-left text-left bg-white border-2 border-primary-1 drop-shadow-md p-6 rounded-lg">
                            <h1 className='text-3xl text-center m-2 flex-col'>
                                Create Playlist
                            </h1>

                            <div className="flex flex-col justify-left items-left">
                                <div className="flex flex-col">
                                    <p className="text-left">Playlist Name</p>
                                    <BasicInputField placeholder="Playlist Name..." value={playlistName} onChangeFunc={(e) => setPlaylistName(e.target.value)} />
                                </div>
                                
                                <div className="flex flex-row space-x-4 text-left">
                                    <div className="flex flex-col">
                                        <p className="mt-2">Select Genre:</p>
                                        <select onChange={changeGenre} value={optionValue} className="border-2 border-primary-1 rounded-md p-1">
                                            {genres.map((ge) => <option value={ge.value}>{ge.label}</option>)}
                                        </select>
                                    </div>

                                    <div className="flex flex-col">
                                        <p className="mt-2">Select Secondary Genre:</p>
                                        <select onChange={changeSecondaryGenre} value={secondaryOptionValue} className="border-2 border-primary-1 rounded-md p-1">
                                            {genres.map((ge) => <option value={ge.value}>{ge.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <p className="mt-2">Select Song Popularity Level:</p>
                                <select onChange={changePopularityLevel} value={popularValue} className="border-2 border-primary-1 rounded-md p-1">
                                    {popularLevels.map((p) => <option value={p.value}>{p.label}</option>)}
                                </select>


                                <p className="mt-2">Select Playlist Length:</p>
                                <select onChange={changePlaylistLength} value={playlistLength} className="border-2 border-primary-1 rounded-md p-1">
                                    {playlistLengths.map((p) => <option value={p.value}>{p.label}</option>)}
                                </select>


                                <p className="mt-2">Assign Trip:</p>
                                <select onChange={changeSelectedTrip} value={tripId} className="border-2 border-primary-1 rounded-md p-1">
                                    <option value="-1">
                                        Select Trip
                                    </option>

                                    {userTrips.map((trip) =>
                                        <option key={trip.id} value={trip.id}>
                                            {trip.startLocation} to {trip.endLocation}
                                        </option>
                                    )}
                                </select>
                            </div>

                            {(errorMsg != '') ? <p className="text-red-500">{errorMsg}</p> : null}

                            <div className="flex flex-row space-x-4 m-2 mt-4">
                                <StandardButton filled={true} clickEvent={submitPlaylist}>
                                    Submit
                                </StandardButton>
                                <button className="bg-secondary-1 hover:bg-gray-400 text-secondary-4 rounded-lg p-2"
                                    onClick={resetCreatePlaylist}>
                                    Cancel
                                </button>
                            </div>
                        </div> : null}
                </div> :
                <div className="flex flex-col justify-center items-center text-center p-10 border-2 border-primary-1 bg-white rounded-md mt-3">
                    <h1 className='text-3xl m-3'>Create a Playlist</h1>

                    <p className="italic w-1/2 mb-2">
                        After connecting to Spotify, create a playlist for your road trip and tie it to your trip!
                    </p>

                    <StandardNavButton url={loginURL} filled={true}>
                        Login to Spotify
                    </StandardNavButton>
                </div>
            }
        </div>
    );
}

export default Playlist;