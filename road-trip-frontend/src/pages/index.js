import React from 'react';
import { loggedInRedirect } from '../util/helper';

require('dotenv').config();

function HomePage() {
    loggedInRedirect("/home");

    return (
        <div>
            <div className="absolute flex items-center h-screen mb-12 overflow-hidden">
                <div className="relative z-30 p-5 text-2xl text-secondary-4 md:text-white">
                    <h1 className="text-6xl font-bold">Triphala</h1>
                    <p>The Ultimate Roadtripping Experience</p>
                </div>
            </div>
            
            <video autoPlay loop muted className="invisible md:visible absolute z-10 w-auto object-cover aspect-auto">
                <source src="/car-driving.mp4" type="video/mp4" />
            </video>

            <img src="/car-driving.png" className="visible md:invisible absolute z-10 object-cover overflow-hidden bottom-0" />
        </div>
    )
}

export default HomePage;