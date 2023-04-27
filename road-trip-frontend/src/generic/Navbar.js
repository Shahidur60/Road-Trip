import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateCurrTraveler } from '../store/currTraveler';
import { myAxios } from '../util/helper';
import { StandardButton, StandardLink, StandardNavButton } from './Button';
import { BasicInputField, HoverField } from './InputField';
import NotificationList from './NotificationList';

require('dotenv').config();

const Navbar = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [username, setUsername] = useState("");
    const [showNotifs, setShowNotifs] = useState(false);
    const [notifs, setNotifs] = useState([]);

    const [pfp, setPfp] = useState(null);
    const [showDrop, setShowDrop] = useState(false);

    const hoverInfos = ["Explore", "Create Trip", "Make Playlist"]
    const [hoverNdx, setHoverNdx] = useState(0);
    const [showHoverInfo, setShowHoverInfo] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem('traveler-token');

        if (token) {
            myAxios.get('/traveler/token/' + token)
            .then((res) => {
                if (res.data) {
                    setLoggedIn(true);
                    setUsername(res.data.username);

                    if (res.data.profilePicture) {
                        setPfp("data:image/png;base64," + res.data.profilePicture);
                    }

                    dispatch(updateCurrTraveler(res.data));
                } else {
                    console.log("Login token invalid/expired.");
                    localStorage.removeItem('traveler-token');
                    dispatch(updateCurrTraveler(null));
                }
            }).catch((err) => {
                localStorage.removeItem('traveler-token');
                dispatch(updateCurrTraveler(null));
                setLoggedIn(false);
            });
        }
    }, []);

    const handleHoverInfo = (ndx) => {
        if (ndx == -1) {
            setShowHoverInfo(false);
            return;
        }

        setHoverNdx(ndx);
        setShowHoverInfo(true);
    }

    useEffect(() => {
        if (username == "") {
            return;
        }

        myAxios.get("/notification/notifications/" + username)
        .then((res) => {
            console.log("Retrieved notifications");
            setNotifs(res.data);
        }).catch((err) => console.error(err));
    }, [username]);

    const signOut = () => {
        if (loggedIn) {
            localStorage.removeItem('traveler-token');
            setLoggedIn(false);
            window.location.reload(false);
        }
    }

    return (<nav className={`${ (!loggedIn) ? 'fixed w-full z-40' : 'from-primary-2 via-primary-2 to-primary-1' } p-2 bg-gradient-to-r drop-shadow-md py-2.5`}>
        <div className="container flex flex-wrap justify-between items-center mx-auto">
            <a href="/" className="flex items-center no-underline">
                <h1 className={`${ (!loggedIn) ? 'text-black' : 'text-white' } no-underline self-center text-xl font-semibold whitespace-nowrap `}>
                    Triphala
                </h1>
            </a>

            <div className="flex flex-row">
                { !loggedIn ?
                    <ul className="flex flex-row space-x-2">
                        <li>
                            <StandardNavButton url="/login">
                                Login
                            </StandardNavButton>
                        </li>
                        <li>
                            <StandardNavButton url="/signup">
                                Sign Up
                            </StandardNavButton>
                        </li>
                    </ul> :
                    <ul className="flex flex-row items-center space-x-4">
                        <li onMouseOver={() => handleHoverInfo(0)} onMouseLeave={() => handleHoverInfo(-1)}>
                            <StandardLink url="/popular">
                                <img src='/explore-icon.svg' alt='explore' className="w-5 hover:opacity-75" />
                            </StandardLink>

                            {(showHoverInfo && hoverNdx == 0) ? <HoverField value={hoverInfos[hoverNdx]} /> : null}
                        </li>
                        <li onMouseOver={() => handleHoverInfo(1)} onMouseLeave={() => handleHoverInfo(-1)}>
                            <StandardLink url="/create-trip/0">
                                <img src='/add-icon.svg' alt='create' className="w-6 hover:opacity-75" />
                            </StandardLink>

                            {(showHoverInfo && hoverNdx == 1) ? <HoverField value={hoverInfos[hoverNdx]} /> : null}
                        </li>
                        <li onMouseOver={() => handleHoverInfo(2)} onMouseLeave={() => handleHoverInfo(-1)}>
                            <StandardLink url="/playlist">
                                <img src='/music-icon.svg' alt='music' className="w-6 hover:opacity-75" />
                            </StandardLink>

                            {(showHoverInfo && hoverNdx == 2) ? <HoverField value={hoverInfos[hoverNdx]} /> : null}
                        </li>
                        <li>
                            <button className='m-0 w-10 border-2 rounded-md p-2 hover:bg-primary-2' onClick={() => setShowNotifs(!showNotifs)}>
                                <img src='/bell-icon.svg' alt='bell' />
                            </button>
                            { (showNotifs) ? 
                                <NotificationList notifications={notifs} /> : null 
                            }
                        </li>
                        <li className="space-x-1">
                            <BasicInputField placeholder="Find Travelers..." value={searchValue} onChangeFunc={(e) => setSearchValue(e.target.value)} />
                            <a href={`/search-traveler/${searchValue}`}>
                                <img src='/search-icon.svg' alt='search' className="inline w-10 bg-primary-1 border-2 border-white p-2 rounded-md hover:opacity-75" />
                            </a>
                        </li>
                        <li>
                            <button onClick={() => setShowDrop(!showDrop)}>
                                <img className="w-12 h-12 object-cover rounded-full hover:opacity-75 bg-white border-2 border-white" 
                                    alt="Profile" src={(pfp) ? pfp : "/images/profile-default.png"} />
                            </button>

                            { (showDrop) ? 
                            <div className="absolute bg-white w-fit text-black right-0 rounded-md">
                                <StandardNavButton url={`/profile/${username}`}>
                                    Profile
                                </StandardNavButton>
                                <StandardButton clickEvent={signOut}>
                                    Sign Out
                                </StandardButton>
                            </div> : null}
                        </li>
                    </ul>}
            </div>
        </div>
    </nav>)
}

export default Navbar;