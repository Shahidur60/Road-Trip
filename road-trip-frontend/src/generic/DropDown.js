import React, {useState} from 'react';


export const genres = [
    {label: "acoustic", value: "acoustic"},
    {label: "alternative", value: "alternative",},
    {label: "ambient", value: "ambient",},
    {label: "black-metal", value: "black-metal",},
    {label: "blues", value: "blues",},
    {label: "chill", value: "chill",},
    {label: "classical", value: "classical",},
    {label: "country", value: "country",},
    {label: "dance", value: "dance",},
    {label: "deep-house", value: "deep-house",},
    {label: "funk", value: "funk",},
    {label: "grunge", value: "grunge",},
    {label: "hip-hop", value: "hip-hop",},
    {label: "jazz", value: "jazz",},
    {label: "metal", value: "metal",},
    {label: "pop", value: "pop",},
    {label: "punk", value: "punk",},
    {label: "r-n-b", value: "r-n-b",},
    {label: "rock", value: "rock",},
    {label: "soul", value: "soul",},
]

export const popularLevels = [
    {label: "Certified Underground", value: 0},
    {label: "Something Fresh", value: 35},
    {label: "Something Familiar", value: 65},
    {label: "Certified Classic", value: 100},
]

export const playlistLengths = [
    {label: "10 Tracks", value: 10},
    {label: "50 Tracks", value: 50},
    {label: "100 Tracks", value: 100},
]

export const GenreDropDown = () => {
    return (
        <div>
            <select>
               {genres.map((ge) => <option value={ge.value}>{ge.label}</option>)}
            </select>
        </div>
    );
};

export const PopularDropDown = () => {
    return (
        <select>
            {popularLevels.map((ge) => <option value={ge.value}>{ge.label}</option>)}
        </select>
    )
}

