import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from '@reduxjs/toolkit';

import Head from 'next/head';
import Navbar from '../generic/Navbar';
import currTravelerApp from '../store/currTraveler';

import "../index.css"

let store = createStore(currTravelerApp);

const RoadTripApp = ({ Component, pageProps }) => {
    React.useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles);
        }
    }, []);

    return (
        <Provider store={ store }>
            <Head>
                <title>Triphala</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
            </Head>
            
            <div className="bg-stone-100 h-full min-h-screen">
                <Navbar />
                <Component {...pageProps} />
            </div>
        </Provider>
    )
};

export default RoadTripApp;