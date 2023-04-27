import { combineReducers } from "@reduxjs/toolkit";

const SET_TRAVELER = 'SET_TRAVELER';
const initialState = {
    currTraveler: null
};

export function updateCurrTraveler(traveler) {
    return {
        type: SET_TRAVELER,
        traveler,
    }
}

function travelerReducer(state = initialState, action) {
    switch (action.type) {
        case SET_TRAVELER:
            return {...state, currTraveler: action.traveler };
        default:
            return state;
    }
}

const currTravelerApp = combineReducers({
    travelerReducer
});

export default currTravelerApp;