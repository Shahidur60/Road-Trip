import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { loggedOutRedirect, myAxios } from '../../util/helper';
import { FormCard, TripCard } from '../../generic/Cards';
import { useRouter } from 'next/router';

require('dotenv').config();

const Profile = () => {
    loggedOutRedirect("/");

    const router = useRouter();
    const username = router.query.username;

    const [traveler, setTraveler] = useState(null);
    const [curr, setCurr] = useState(null);
    const [isSelf, setSelf] = useState(false);
    const [isFollowing, setFollowing] = useState(false);
    const [trips, setTrips] = useState([]);
    const [img, setImg] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('traveler-token');
        myAxios.get('/traveler/token/'+token).then((res) => {
            setCurr(res.data);
        }).catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        if (!curr) {
            return;
        }

        // Find traveler in DB
        myAxios.get('/traveler/username/' + username)
            .then((res) => {
                setTraveler(res.data);

                if (res.data.profilePicture) {
                    setImg("data:image/png;base64," + res.data.profilePicture);
                }

                if (res.data.emailAddress == curr.emailAddress) {
                    setSelf(true);
                }

                if (curr.isAdmin == 'Y') {
                    setIsAdmin(true);
                }

                setTrips(res.data.trips);
            }).catch((err) => console.error(err));

        if (username) {
            myAxios.get('/traveler/following/' + curr.id + '/' + username)
                .then((res) => {
                    if (res.data) {
                        console.log("Traveler is following", res.data);
                        setFollowing(true);
                    }
                }).catch((err) => console.error(err));
        }

    }, [router.isReady, curr]);

    const followUnfollowUser = () => {
        if (!curr) {
            return;
        }

        const token = localStorage.getItem('traveler-token');

        if (!isFollowing) {
            myAxios.put('/traveler/follow/' + token + '/' + username)
                .then((res) => {
                    setFollowing(true);
                }).catch((err) => console.error(err));
        } else {
            myAxios.put('/traveler/unfollow/' + token + '/' + username)
                .then((res) => {
                    setFollowing(false);
                }).catch((err => console.error(err)));
        }
    }

    const deleteTraveler = () => {
        const token = localStorage.getItem("traveler-token");
        myAxios.delete('/traveler/delete/'+token+'/'+traveler.id)
        .then((res) => {
            window.location.reload(false);
        }).catch((err) => console.error);
    }

    return (
        <div className="container mx-auto bg-secondary-5">
            <FormCard>
                <div className="flex flex-row space-x-4">
                    <div className="flex flex-col">
                        <img className="w-48 h-48 object-cover border-2 border-secondary-1 rounded-md" src={(img) ? img : "../images/profile-default.png"} />
                    </div>

                    {(traveler) ?
                        <div className="flex flex-col">
                            <h1 className="text-2xl">{traveler.firstName} {traveler.lastName}</h1>
                            <p>@{traveler.username}</p>
                            <a href={`mailto:${traveler.email}`} className="text-primary-1">{traveler.email}</a>

                            <p>{traveler.trips.length} Road Trips</p>

                            <div className="flex flex-row space-x-4">
                                <p>{traveler.followers.length} followers</p>
                                <p>{traveler.following.length} following</p>
                            </div>

                            {(traveler.bio) ? <p className="italic">{traveler.bio}</p> : <p className="italic">Bio is empty.</p>}

                            {(isSelf) ?
                                <a href="/editprofile" className="text-primary-1 mt-6">Edit Profile</a> :
                                <div>
                                    {(isFollowing) ?
                                        <button className="p-2 bg-secondary-1 text-secondary-4" onClick={followUnfollowUser}>Unfollow</button> :
                                        <button className="p-2 bg-secondary-1 text-secondary-4" onClick={followUnfollowUser}>Follow</button>
                                    }
                                </div>
                            }

                            {(isAdmin) ? 
                            <div className="mt-2">
                                <button onClick={deleteTraveler} className="p-2 bg-secondary-2 hover:bg-secondary-1 text-red-500 rounded-md">
                                    Delete Traveler
                                </button>
                            </div>
                            : null}
                        </div> : null}
                </div>
            </FormCard>

            <div className="m-5 ml-12 space-y-2">
                <h1 className="font-bold text-xl">Trips</h1>
                {(trips && trips.length > 0) ?
                    <div className="flex flex-wrap">
                        <div className="md:w-1/2 w-full space-y-5">
                            {trips.map((item, i) => (
                                <div key={i}>
                                    <TripCard item={item} />
                                </div>
                            ))}
                        </div>
                    </div> : <p>User has no trips yet.</p>}
            </div>
        </div>
    );
}

export default Profile;