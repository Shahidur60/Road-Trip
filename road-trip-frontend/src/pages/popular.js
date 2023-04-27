import React, { useEffect, useState } from 'react';
import { FormCard, TripCard } from "../generic/Cards";
import { StandardNavButton } from "../generic/Button";
import { loggedOutRedirect, myAxios } from '../util/helper';
import { useSelector } from 'react-redux';
import LoadSpinner from '../generic/LoadSpinner';

require('dotenv').config();

const Home = () => {
    loggedOutRedirect("/");

    const currTraveler = useSelector(state => state.travelerReducer.currTraveler);
    const [isLoading, setIsLoading] = useState(true);
    const [tripData, setTripData] = useState([]);

    useEffect(() => {
        if (!currTraveler) {
            return;
        }

        myAxios.get('/trip/popular-trips').then((res) => {
            const finalRecs = [];
            var count = 0;
            for (var i = 0; i < res.data.length; i++) {
                if (res.data[i].tripUsername !== currTraveler.username) {
                    finalRecs[count] = res.data[i];
                    count++;
                }
            }
            setTripData(finalRecs);
            setIsLoading(false);
        }).catch((err) => console.error(err));

    }, [currTraveler]);

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
                    <h1 className="text-3xl text-center my-6 font-bold">Trending Trips</h1>
                    {(tripData.length > 0) ?
                        <div className="flex flex-wrap justify-center items-center pb-6">
                            <div className="md:w-1/2 w-full space-y-4">
                                {tripData.map((item, i) => (
                                    <div key={i}>
                                        <TripCard item={item} />
                                    </div>
                                ))}
                            </div>
                        </div> : <p className="text-center">No trending trips found today :(</p>}
                </div>
            }
        </div>
    )
}

export default Home;