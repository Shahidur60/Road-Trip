import React, { useEffect, useState } from 'react';
import { FormCard, TripCard } from "../generic/Cards";
import { StandardNavButton } from "../generic/Button";
import { loggedOutRedirect, myAxios } from '../util/helper';
import { useSelector } from 'react-redux';
import LoadSpinner from '../generic/LoadSpinner';

require('dotenv').config();

const Home = () => {
    loggedOutRedirect("/");

    const [tripData, setTripData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const traveler = useSelector(state => state.travelerReducer.currTraveler);

    useEffect(() => {
        // console.log("Current Traveler:", traveler);
        if (!traveler) {
            return;
        }

        myAxios.get('/trip/follower-trips/' + traveler.username).then((res) => {
            setTripData(res.data);
            setIsLoading(false);
        }).catch((err) => console.error(err));
    }, [traveler]);

    if (!traveler) {
        return (<LoadSpinner />);
    }

    return (
        <div>
            {(isLoading) ?
                <div className="relative mx-auto h-36 w-screen">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <h1 className="text-lg italic">Loading...</h1>
                        <LoadSpinner></LoadSpinner>
                    </div>
                </div> :
                <div className="container mx-auto bg-img-1 bg-no-repeat bg-cover min-h-screen bg-fixed bg-bottom bottom-0">
                    {(tripData.length == 0) ?
                        <div className="flex flex-col justify-center items-center">
                            {(traveler) ?
                                <div className="text-center m-5">
                                    {(traveler.firstName) ?
                                        <h1 className="text-2xl">
                                            Hi, {traveler.firstName} &#128663;
                                        </h1> :
                                        <h1 className="text-2xl">
                                            Hi, {traveler.username} &#128663;
                                        </h1>}
                                    <span>Where are you going today?</span>
                                </div>
                                : null}
                            <div className="flex flex-row">
                                <FormCard>
                                    <h1 className="text-2xl" style={{ marginBottom: 20 }}>
                                        Create a Trip!
                                    </h1>
                                    <StandardNavButton url="/create-trip/0" filled={true}>
                                        GO
                                    </StandardNavButton>
                                </FormCard>

                                <FormCard>
                                    <h1 className="text-2xl" style={{ marginBottom: 20 }}>
                                        Make a Playlist!
                                    </h1>
                                    <StandardNavButton url="/playlist" filled={true}>
                                        GO
                                    </StandardNavButton>
                                </FormCard>
                            </div>
                        </div> :
                        <div>
                            <h1 className="text-3xl text-center mt-6 font-bold">Trip Feed</h1>
                            <br></br>
                            <div className="flex flex-wrap justify-center items-center">
                                <div className="md:w-1/2 w-full space-y-4">
                                    {tripData.map((item, i) => (
                                        <div key={i}>
                                            <TripCard item={item} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                    
                    <div className="text-white pb-6">
                        <h1 className="text-2xl text-center mt-6">Follow more travelers to fill up your feed!</h1>
                        <h3 className="text-md text-center mt-2 italic">You can find other travelers and trending trips on the explore page!</h3>
                    </div>

                </div>
            }
        </div>
    )
}

export default Home;