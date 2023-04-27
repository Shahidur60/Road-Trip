import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { loggedOutRedirect, myAxios } from "../../util/helper";
import { FormCard, TripCard } from "../../generic/Cards";
import { SubmitButton } from "../../generic/Button";
import { GenericLabel } from "../../generic/TextItems";
import DatePicker from "react-datepicker";
import { getTripLength } from "../../generic/Stops";
import "react-datepicker/dist/react-datepicker.css";
import {
  useJsApiLoader,
  GoogleMap,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { GenericCheckBox } from "../../generic/InputField";
import { calculateRoute } from "../../generic/Stops";
import { useSelector } from "react-redux";

require("dotenv").config();

const center = { lat: 31.546034374243163, lng: -97.11813194419332 };
const countries = ["us", "ca"];

const CreateTrip = () => {
  loggedOutRedirect("/");

  const router = useRouter();

  const [libraries] = useState(["places"]);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_MAPS_API_KEY,
    libraries,
  });

  const curr = useSelector((state) => state.travelerReducer.currTraveler);

  // Driving options
  const [ferries, setFerries] = useState(true);
  const [highways, setHighways] = useState(true);
  const [tolls, setTolls] = useState(true);
  const [trafficTime, setTrafficTime] = useState(false);

  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [date, setDate] = useState(new Date());
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [tripData, setTripData] = useState([]);
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [recTripData, setRecTripData] = useState([]);
  const { tid } = router.query;

  /** @type React.MutableRefObject<HTMLInputElement> */
  const startRef = useRef();
  /** @type React.MutableRefObject<HTMLInputElement> */
  const endRef = useRef();

  const resetRoute = () => {
    setDistance("");
    setDuration("");
    setMap(null);
  };

  useEffect(() => {
    if (!router.isReady) return;

    if (tid != 0) {
      myAxios
        .get("/trip/id/" + tid)
        .then((res) => {
          console.log(res.data);

          setTripData(res.data);
          setDistance(res.data.distance);
          setDuration(res.data.duration);
          setDate(new Date(res.data.date));
          setStartLocation(res.data.startLocation);
          setEndLocation(res.data.endLocation);
          displayRoute(startLocation, endLocation);
        })
        .catch((err) => console.error(err));
    }
  }, [router.isReady]);

  useEffect(() => {
    if (distance) {
      getTrafficPrediction();
    }
  }, [date]);

  async function getRecTrips(start, end) {
    myAxios.get("/trip/trips/" + start + "/" + end).then((res) => {
      console.log("Rec trips:", res.data);
      const finalRecs = [];
      var count = 0;
      for (var i = 0; i < res.data.length; i++) {
        if (
          res.data[i].tripUsername !== curr.username &&
          res.data[i].tripRating > 2
        ) {
          if (
            res.data[i].startLocation == start &&
            res.data[i].endLocation == end
          ) {
            finalRecs[count] = res.data[i];
            count++;
          }
        }
      }
      setRecTripData(finalRecs);
    });
  }

  async function displayRoute(startLocation, endLocation) {
    setMap(/** @type google.maps.Map */ (null));

    const results = await calculateRoute([], startLocation, endLocation);
    console.log("Results: ", results);
    if (!results) {
      return;
    }
    setDirectionsResponse(results);
  }

  async function getTrafficPrediction() {
    if (startRef.current.value === "" || endRef.current.value === "") {
      return;
    }

    const distanceMatrix = new google.maps.DistanceMatrixService();
    const start = [];
    const end = [];
    start[0] = startRef.current.value;
    end[0] = endRef.current.value;

    const trafficPrediction = await distanceMatrix
      .getDistanceMatrix({
        origins: start,
        destinations: end,
        // eslint-disable-next-line no-undef
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: { departureTime: date },
        avoidFerries: !ferries,
        avoidHighways: !highways,
        avoidTolls: !tolls,
      })
      .catch((err) => {
        console.error(err);
        alert("Departure time must be in the future!");
      });

    if (
      !trafficPrediction ||
      !trafficPrediction.rows[0].elements[0].duration_in_traffic
    ) {
      return;
    }

    console.log(trafficPrediction.rows[0].elements[0]);

    var trafficPred = getTripLength(
      trafficPrediction.rows[0].elements[0].duration_in_traffic.text
    );
    var driveTime = getTripLength(
      trafficPrediction.rows[0].elements[0].duration.text
    );

    if (trafficPred - driveTime >= 0) {
      setTrafficTime("+" + trafficPred - driveTime + " mins");
    } else {
      setTrafficTime(trafficPred - driveTime + " mins");
    }
  }

  async function calRoute() {
    if (startRef.current.value === "" || endRef.current.value === "") {
      return;
    }

    getRecTrips(startRef.current.value, endRef.current.value);

    setMap(/** @type google.maps.Map */ (null));

    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();

    const results = await directionsService
      .route({
        origin: startRef.current.value,
        destination: endRef.current.value,
        // eslint-disable-next-line no-undef
        travelMode: google.maps.TravelMode.DRIVING,
        avoidFerries: !ferries,
        avoidHighways: !highways,
        avoidTolls: !tolls,
      })
      .catch((err) => {
        console.error(err);
        alert("No route found!");
      });

    if (!results) {
      return;
    }

    console.log("Results: ", results);
    setDirectionsResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setDuration(results.routes[0].legs[0].duration.text);

    if (date > new Date()) {
      getTrafficPrediction();
    }
  }

  let handleColor = (time) => {
    return time.getHours() > 12 ? "text-success" : "text-error";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!curr) {
      return;
    }

    const token = localStorage.getItem("traveler-token");

    // This should work assuming body parameters are valid
    if (tid == 0) {
      const body = {
        startLocation: startRef.current.value,
        endLocation: endRef.current.value,
        duration: duration,
        distance: distance,
        date: date,
        traveler: curr,
        tripUsername: curr.username,
      };

      console.log(body);

      myAxios
        .post("/trip/add/" + token, body)
        .then((res) => {
          console.log("POST Success", res.data);
          window.location.reload(false);
        })
        .catch((err) => console.error(err));
    } else {
      const body = {
        id: tid,
        startLocation: startRef.current.value,
        endLocation: endRef.current.value,
        duration: duration,
        distance: distance,
        date: date,
        traveler: curr,
        tripUsername: curr.username,
      };

      console.log(body);

      myAxios
        .put("/trip/update/" + token, body)
        .then((res) => {
          console.log("PUT Success", res.data);
          window.location.reload(false);
        })
        .catch((err) => console.error(err));
    }
    router.push("/home");
  };

  if (!isLoaded) {
    return <h1 className="text-2xl">Sad face</h1>;
  }

  if (
    tid != 0 &&
    curr &&
    tripData.tripUsername &&
    tripData.tripUsername != curr.username
  ) {
    router.push("/home");
  }

  return (
    <div className="flex">
      <FormCard>
        {tid != 0 ? (
          <h1 className="text-4xl font-bold">Edit Trip</h1>
        ) : (
          <h1 className="text-4xl font-bold">Create Trip</h1>
        )}
        <br></br>
        <form onSubmit={handleSubmit} className="px-8">
          <div className="flex flex-col space-y-2.5">
            <h1 className="text-xl">Start Location: </h1>
            <div className="self-center">
              <Autocomplete
                options={{ componentRestrictions: { country: countries } }}
              >
                <input
                  className="border border-secondary-1 p-2 text-secondary-4 rounded rounded-3 
                                    focus:ring focus:outline-none focus:border-primary-1 mb-3 text-base"
                  type="text"
                  placeholder="Enter Location"
                  ref={startRef}
                  onChange={resetRoute}
                  defaultValue={tripData ? tripData.startLocation : ""}
                />
              </Autocomplete>
            </div>
          </div>
          <div className="flex flex-col space-y-2.5">
            <h1 className="text-xl">End Location: </h1>
            <div className="self-center">
              <Autocomplete
                options={{ componentRestrictions: { country: countries } }}
              >
                <input
                  className="border border-secondary-1 p-2 text-secondary-4 rounded rounded-3 
                                    focus:ring focus:outline-none focus:border-primary-1 mb-3 text-base"
                  type="text"
                  placeholder="Enter Location"
                  ref={endRef}
                  onChange={resetRoute}
                  defaultValue={tripData ? tripData.endLocation : ""}
                />
              </Autocomplete>
            </div>
          </div>
          {distance ? (
            <div>
              <div className="mr-3">
                <GenericLabel fFor="dist">Distance: {distance}</GenericLabel>
              </div>
              <div>
                <GenericLabel fFor="dur">Drive Time: {duration}</GenericLabel>
                <br />
              </div>
              {trafficTime ? (
                <div>
                  <GenericLabel fFor="traf">
                    Traffic: {trafficTime}
                  </GenericLabel>
                  <br />
                </div>
              ) : (
                <div>
                  <GenericLabel fFor="noTraf">
                    No Traffic Prediction
                  </GenericLabel>
                  <br />
                </div>
              )}
              <br></br>
            </div>
          ) : null}
          <div>
            <h1 className="text-xl">Date:</h1>
            <DatePicker
              selected={date}
              onChange={(date) => setDate(date)}
              showTimeSelect
              dateFormat="MM/dd/yyyy HH:mm"
              timeClassName={handleColor}
              className="border border-secondary-1 p-2 text-secondary-4 rounded rounded-3
                                focus:ring focus:outline-none focus:border-primary-1 mb-3 text-base"
              minDate={new Date()}
            />
            <br></br>
            <br></br>
          </div>
          {distance ? (
            <div className="flex flex-row space-x-4">
              <SubmitButton />

              <button
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full"
                onClick={resetRoute}
              >
                Reset
              </button>
            </div>
          ) : null}
        </form>
        {!distance ? (
          <div className="flex flex-col justify-between items-center">
            <div className="flex flex-row m-3 space-x-2">
              <div>
                <GenericCheckBox
                  changeEvent={() => setFerries(!ferries)}
                  isChecked={ferries}
                />
                <GenericLabel>Ferries</GenericLabel>
              </div>
              <div>
                <GenericCheckBox
                  changeEvent={() => setHighways(!highways)}
                  isChecked={highways}
                />
                <GenericLabel>Highways</GenericLabel>
              </div>
              <div>
                <GenericCheckBox
                  changeEvent={() => setTolls(!tolls)}
                  isChecked={tolls}
                />
                <GenericLabel>Tolls</GenericLabel>
              </div>
            </div>

            <div>
              <button
                className="bg-primary-1 hover:bg-sky-700 text-secondary-3 font-bold py-2 px-4 rounded-full"
                onClick={calRoute}
              >
                Calculate Route
              </button>
            </div>
          </div>
        ) : null}
      </FormCard>

      <div className="relative h-screen w-screen mr-2 mt-4 border-2 border-secondary-2 rounded-md">
        {/* Google Map Box */}
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={(map) => setMap(map)}
        >
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </div>
      {distance ? (
        <div className="flex">
          {recTripData.length > 0 ? (
            <div>
              <FormCard className>
                <h1 className="text-center text-4xl font-bold">
                  Similar Trips!
                </h1>
                <br></br>
                <div className="flex flex-wrap justify-center items-center pb-6">
                  <div className="w-full space-y-4">
                    {recTripData.map((item, i) => (
                      <div key={i}>
                        <TripCard item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              </FormCard>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default CreateTrip;
