import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { loggedOutRedirect, myAxios } from "../../util/helper";
import { HelpStopCard, PlanStopCard, StopCard } from "../../generic/Cards";
import { StandardButton, StopButton } from "../../generic/Button";
import { BasicInputField } from "../../generic/InputField";
import {
  useJsApiLoader,
  GoogleMap,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { findCities, getCityCenter } from "../../generic/RecAPI";
import {
  calculateRoute,
  getDistance,
  getTripLength,
  initMap,
  convertPL,
  getIcon,
  getDefaultImage,
  getSearchPoints,
} from "../../generic/Stops";
import LoadSpinner from "../../generic/LoadSpinner";
import { useSelector } from "react-redux";

require("dotenv").config();

const center = { lat: 31.546034374243163, lng: -97.11813194419332 };
const countries = ["us", "ca"];
const PlanStops = () => {
  loggedOutRedirect("/");

  const router = useRouter();

  //Recommendations
  const [newStop, setNewStop] = useState(true);
  const [type, setType] = useState("lodging");
  const [cityMarker, setCityMarker] = useState(false);
  const [stopMarker, setStopMarker] = useState(false);
  const [city, setCity] = useState([]);
  const [rec, setRec] = useState([]);
  /*0=City, 1=Route, 2=Autocomplete */
  const [recType, setRecType] = useState(-1);
  const [keyword, setKeyword] = useState("");
  const [cityList, setCityList] = useState([]);
  const [cityChosen, setCityChosen] = useState(false);
  const [lastCallTime, setLastCallTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [helpSelected, setHelpSelected] = useState(false);
  const [toggleRecsList, setToggleRecsList] = useState(false);
  const [foundOnMap, setFoundOnMap] = useState(false);

  const { sid } = router.query;

  const curr = useSelector((state) => state.travelerReducer.currTraveler);

  // const [bounds, setBounds] = useState({ne: null, sw: null});

  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [savedSearchPoints, setSavedSearchPoints] = useState([]);
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [allStops, setAllStops] = useState([]);
  const [tripData, setTripData] = useState([]);
  const [distance, setDistance] = useState();
  const [duration, setDuration] = useState();
  const tripId = router.query.sid;
  const [libraries] = useState(["places"]);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_MAPS_API_KEY,
    libraries,
  });
  const [followerStops, setFollowerStops] = useState([]);

  const stopTexts = [
    "Hotels",
    "Restaurants",
    "Gas Stations",
    "Churches",
    "Museums",
    "Parks",
    "Stores",
    "Cafes",
  ];
  const stopTypes = [
    "lodging",
    "restaurant",
    "gas_station",
    "church",
    "museum",
    "park",
    "store",
    "cafe",
  ];

  /** @type React.MutableRefObject<HTMLInputElement> */
  const stopRef = useRef();
  const [currStop, setCurrStop] = useState("");

  const [allRecsList, setAllRecsList] = useState([]);

  useEffect(() => {
    const sorted = [...allRecsList].sort((a, b) => {
      return (
        (b.rating / 5) * (b.reviews / 1000) -
        (a.rating / 5) * (a.reviews / 1000)
      );
    });

    setAllRecsList(sorted);
  }, [allRecsList.length]);

  useEffect(() => {
    if (!router.isReady) return;

    myAxios
      .get("/trip/id/" + tripId)
      .then((res) => {
        setIsLoading(true);
        console.log("Res: ", res.data);
        setStartLocation(res.data.startLocation);
        setEndLocation(res.data.endLocation);

        const sortedStops = res.data.stops.sort((a, b) => {
          return a.stopDistance - b.stopDistance;
        });

        setAllStops(sortedStops);
        setTripData(res.data);
        const arr = res.data.distance.split(" ");
        setDistance(arr[0].replace(/,/g, ""));
        setDuration(getTripLength(res.data.duration));
      })
      .catch((err) => console.error(err));

    myAxios
      .get("/trip/follower-stops/" + tripId)
      .then((res) => {
        console.log("Follower stops:", res.data);
        setFollowerStops(res.data);
        allRecsList.concat(followerStops);
      })
      .catch((err) => console.error(err));
  }, [router.isReady]);

  useEffect(() => {
    setAllRecsList([]);
    setRec([]);
    setIsLoading(true);
    if (type.localeCompare("keyword") != 0) {
      setKeyword("");
    }
    if (type && recType == 0) {
      centerOnCity();
    } else if (type && recType == 1) {
      setIsLoading(true);
      findRouteStops();
    }
  }, [type]);

  useEffect(() => {
    if (isLoaded) {
      displayRoute();
    }
  }, [tripData]);

  useEffect(() => {
    if (!stopMarker) {
      setIsLoading(true);
      if (recType == 0) {
        if (cityList.length > 0) {
          dropCityMarkers();
        } else {
          markCities();
        }
        setToggleRecsList(true);
      } else if (recType == 1) {
        findRouteStops();
        setToggleRecsList(true);
      } else if (recType == 2) {
        setIsLoading(false);
      }
    }
  }, [recType, directionsResponse]);

  useEffect(() => {
    if (rec.length > 0) {
      setStopMarker(true);
    } else {
      setStopMarker(false);
    }
  }, [rec]);

  useEffect(() => {
    if (cityList.length > 0) {
      setAllRecsList([]);
      setCityChosen(false);
      dropCityMarkers();
    }
  }, [cityList.length]);

  //Display the route on the map
  async function displayRoute() {
    setMap(/** @type google.maps.Map */ (null));

    // API's version of stops
    const waypts = [];

    // Get all the trip's existing stops
    for (let i = 0; i < allStops.length; i++) {
      let stopLatLng = new google.maps.LatLng(
        parseFloat(allStops[i].stopLatitude),
        parseFloat(allStops[i].stopLongitude)
      );
      waypts.push({
        location: stopLatLng,
        stopover: false,
      });
    }

    const results = await calculateRoute(waypts, startLocation, endLocation);
    if (!results) {
      return;
    }
    setDirectionsResponse(results);

    if (recType == -1) {
      if (distance > 360) {
        setRecType(0);
      } else {
        setRecType(1);
      }
    }
  }

  //Keyword Searching
  function searchKeyword() {
    setIsLoading(true);
    if (type.localeCompare("keyword") != 0) {
      setType("keyword");
    } else {
      if (recType == 0) {
        centerOnCity();
      } else {
        findRouteStops();
      }
    }
  }

  function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  //By Route functions
  async function findRouteStops() {
    var newSysTime = Date.now();
    if (newSysTime - lastCallTime < 5000) {
      await delay(5000 - (newSysTime - lastCallTime));
    }
    setIsLoading(true);

    let waypts = [];
    var polyline = require("google-polyline");
    let map = initMap();
    var directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setDirections(directionsResponse);
    directionsRenderer.setMap(map);

    waypts = polyline.decode(directionsResponse.routes[0].overview_polyline);

    var searchPts;
    if (savedSearchPoints.length == 0) {
      searchPts = getSearchPoints(waypts, duration);
      setSavedSearchPoints(searchPts);
    } else {
      searchPts = savedSearchPoints;
    }

    var key = keyword;

    if (type.localeCompare("keyword") != 0) {
      key = "";
    }

    let service = new google.maps.places.PlacesService(map);
    for (let j = 0; j < searchPts.length; j++) {
      //await delay(10);
      var request = {
        location: { lat: searchPts[j][0], lng: searchPts[j][1] },
        radius: 5000,
        type: type,
        keyword: key,
      };
      service.nearbySearch(request, callback);

      function callback(results, status) {
        var marker;

        var ic = getIcon(type);
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            if (results[i].plus_code) {
              marker = new google.maps.Marker({
                position: results[i].geometry.location,
                map,
                icon: ic,
              });
              var latlng = results[i].geometry.location
                .toString()
                .replace(/\(|\)/g, "")
                .split(", ");
              const arr = [];
              //console.log('Res = ', results[i]);
              arr[0] = results[i].name;
              arr[1] = results[i].rating;
              arr[2] = results[i].user_ratings_total;
              arr[3] = convertPL(results[i].price_level);
              arr[4] = results[i].website;
              arr[5] = results[i].photos;
              arr[6] = results[i].plus_code;
              arr[7] = latlng[0];
              arr[8] = latlng[1];

              // Add all stops to the list of recommended stops
              if (results[i].rating > 0 && !foundOnMap) {
                setAllRecsList((prevList) => [
                  ...prevList,
                  {
                    name: arr[0],
                    rating: arr[1],
                    reviews: arr[2],
                    price: arr[3],
                    website: arr[4],
                    photo: arr[5],
                    city: arr[6],
                    lat: arr[7],
                    lng: arr[8],
                  },
                ]);
              }

              google.maps.event.addListener(
                marker,
                "click",
                (function (marker) {
                  return function () {
                    console.log("Array of marker: ", arr);
                    setToggleRecsList(false);
                    setStopMarker(true);
                    setRec(arr);
                  };
                })(marker)
              );
            }
          }
        }
      }
    }
    setIsLoading(false);
    if (foundOnMap) {
      setStopMarker(false);
      setToggleRecsList(true);
    }
    setFoundOnMap(false);
    setLastCallTime(Date.now());
  }

  //Add a stop to the map in the proper order
  //This is for searching for a stop
  async function addStop() {
    if (stopRef.current.value === "") {
      return;
    }
    if (
      !(
        stopRef.current.value.includes("USA") ||
        stopRef.current.value.includes("Canada")
      )
    ) {
      console.log("Keyword search instead");
      changeRecType(1);
      return;
    }

    setNewStop(false);
    setIsLoading(true);

    //setMap(/** @type google.maps.Map */(null));
    let map = initMap();
    var directionsRenderer = new google.maps.DirectionsRenderer();
    let loc = stopRef.current.value;
    setCurrStop(loc);

    // API's version of stops
    const waypts = [];
    var newStopPlaced = false;
    let distToStop = parseInt(await getDistance(startLocation, loc));

    // Add stops in order
    for (let i = 0; i < allStops.length; i++) {
      if (allStops[i].stopDistance > distToStop) {
        newStopPlaced = true;
        waypts.push({
          location: loc,
          stopover: false,
        });
      }

      waypts.push({
        location: new google.maps.LatLng(
          parseFloat(allStops[i].stopLatitude),
          parseFloat(allStops[i].stopLongitude)
        ),
        stopover: false,
      });
    }

    // Add new stop if it wasn't added.
    if (!newStopPlaced) {
      waypts.push({
        location: loc,
        stopover: false,
      });
    }

    const results = await calculateRoute(waypts, startLocation, endLocation);
    if (!results) {
      return;
    }
    directionsRenderer.setDirections(results);
    directionsRenderer.setMap(map);
    setIsLoading(false);
  }

  //Center in on a selected stop
  async function centerOnCity(val) {
    setCityMarker(false);
    setCityChosen(true);
    let map = initMap();

    var service = new google.maps.places.PlacesService(map);
    var geocoder = new google.maps.Geocoder();
    var loc;

    if (val) {
      setFoundOnMap(true);
      loc = { lat: parseFloat(val.lat), lng: parseFloat(val.lng) };
    } else {
      loc = { lat: parseFloat(city[0]), lng: parseFloat(city[1]) };
    }

    geocoder.geocode({ location: loc }, function (results, status1) {
      if (status1 === google.maps.GeocoderStatus.OK) {
        service.getDetails(
          {
            placeId: results[1].place_id,
          },
          function (place, status2) {
            if (status2 === google.maps.places.PlacesServiceStatus.OK) {
              map.setZoom(val ? 11 : 13);
              map.setCenter(place.geometry.location);
            }
          }
        );
      }
    });

    if (!val) {
      dropMarkers(map);
    } else {
      const arr = [];
      arr[0] = val.name;
      arr[1] = val.rating;
      arr[2] = val.reviews;
      arr[3] = val.price;
      arr[4] = val.website;
      arr[5] = val.photo;
      arr[6] = val.city;
      arr[7] = val.lat;
      arr[8] = val.lng;
      setRec(arr);

      var ic = getIcon(type);

      var marker = new google.maps.Marker({
        position: loc,
        map,
        icon: ic,
      });

      google.maps.event.addListener(
        marker,
        "click",
        (function (marker) {
          return function () {
            console.log("Array of marker: ", arr);
            setStopMarker(true);
            setRec(arr);
          };
        })(marker)
      );
      setToggleRecsList(false);
    }
  }

  async function dropMarkers(map) {
    var key = keyword;

    if (type.localeCompare("keyword") != 0) {
      key = "";
    }
    let service = new google.maps.places.PlacesService(map);
    var request = {
      location: { lat: parseFloat(city[0]), lng: parseFloat(city[1]) },
      radius: 6000,
      type: type,
      keyword: key,
    };

    service.nearbySearch(request, callback);

    function callback(results, status) {
      var marker;

      var ic = getIcon(type);
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          if (results[i].plus_code) {
            marker = new google.maps.Marker({
              position: results[i].geometry.location,
              map,
              icon: ic,
            });
            var latlng = results[i].geometry.location
              .toString()
              .replace(/\(|\)/g, "")
              .split(", ");
            const arr = [];
            //console.log('Res = ', results[i]);
            arr[0] = results[i].name;
            arr[1] = results[i].rating;
            arr[2] = results[i].user_ratings_total;
            arr[3] = convertPL(results[i].price_level);
            arr[4] = results[i].website;
            arr[5] = results[i].photos;
            arr[6] = results[i].plus_code;
            arr[7] = latlng[0];
            arr[8] = latlng[1];

            // Add all stops to the list of recommended stops
            if (results[i].rating > 0) {
              setAllRecsList((prevList) => [
                ...prevList,
                {
                  name: arr[0],
                  rating: arr[1],
                  reviews: arr[2],
                  price: arr[3],
                  website: arr[4],
                  photo: arr[5],
                  city: arr[6],
                  lat: arr[7],
                  lng: arr[8],
                },
              ]);
            }

            google.maps.event.addListener(
              marker,
              "click",
              (function (marker) {
                return function () {
                  console.log("Array of marker: ", arr);
                  setToggleRecsList(false);
                  setStopMarker(true);
                  setRec(arr);
                };
              })(marker)
            );
          }
        }
      }
    }
    setIsLoading(false);
  }

  function dropCityMarkers() {
    setIsLoading(true);
    if (foundOnMap) {
      setStopMarker(false);
      setToggleRecsList(true);
    }
    setFoundOnMap(false);
    let map = initMap();
    var directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setDirections(directionsResponse);
    directionsRenderer.setMap(map);

    var marker;

    for (var i = 0; i < cityList.length; i++) {
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(cityList[i][0], cityList[i][1]),
        map: map,
        icon: "../../../images/blue_MarkerC.png",
      });

      const currCity = cityList[i];

      google.maps.event.addListener(
        marker,
        "click",
        (function (marker) {
          return function () {
            setCityMarker(true);
            setCity(currCity);
          };
        })(marker)
      );
    }
    setIsLoading(false);
  }

  //Place a marker on every recommended city
  async function markCities() {
    setCityChosen(false);
    setToggleRecsList(false);
    setKeyword("");
    var polyline = require("google-polyline");
    let waypts = polyline.decode(
      directionsResponse.routes[0].overview_polyline
    );

    console.log("Looking for cities...");
    let ptsPerMin = waypts.length / duration;
    let skipDist = 60;

    if (duration / 5 < 60) {
      skipDist = duration / 5;
    }
    ptsPerMin = Math.round(ptsPerMin * skipDist);

    let uniqueCities = await findCities(waypts, ptsPerMin);
    console.log("Unique: ", uniqueCities);
    setCityList(uniqueCities);
  }

  function saveChanges() {
    setStopMarker(false);
    setCityMarker(false);
    router.push("/home");
  }

  function changeRecType(num) {
    setNewStop(true);
    setAllRecsList([]);
    setStopMarker(false);
    setCityMarker(false);
    setCityChosen(false);
    if (!stopRef.current) {
      setKeyword("");
      setType("lodging");
    } else {
      setKeyword(stopRef.current.value);
    }
    setRecType(num);
  }

  /* Create an axios post to add the stop to the trip*/
  async function addRec() {
    console.log("Adding red");
    setStopMarker(false);
    setIsLoading(true);
    var loc,
      city,
      finalCity = "",
      latlng = null;
    if (recType != 2) {
      if (rec[6]) {
        loc = rec[6].compound_code.split(",");
        city = loc[0].split(" ");
        for (var i = 1; i < city.length; i++) {
          finalCity = finalCity.concat(city[i], " ");
        }
        finalCity = finalCity.substring(0, finalCity.length - 1);
        loc = rec[0] + " " + finalCity + "," + loc[1];
      }
    } else {
      loc = currStop;
      latlng = await getCityCenter(currStop);
      console.log("Center is: ", latlng);
    }

    var dist = parseInt(await getDistance(startLocation, loc));
    if (!curr) {
      return;
    }

    const token = localStorage.getItem("traveler-token");

    myAxios
      .post("/stop/save/" + token, {
        stopLatitude: latlng ? latlng.lat : rec[7],
        stopLocation: loc,
        stopLongitude: latlng ? latlng.lng : rec[8],
        stopRating: 0,
        stopDistance: dist,
        stopUsername: curr.username,
      })
      .then((res) => {
        console.log("Save stop SUCCESS", res.data);

        // Then add the stop to the trip
        myAxios
          .put("/trip/" + token + "/add-stop/" + tripId, res.data)
          .then((res2) => {
            console.log("Add stop SUCCESS!", res2.data);
            window.location.reload(false);
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  }

  // Add the recommendation from the list to the trip
  async function addRecFromList(val) {
    const token = localStorage.getItem("traveler-token");

    setStopMarker(false);
    setIsLoading(true);
    var loc,
      city,
      finalCity = "";

    if (val.city) {
      loc = val.city.compound_code.split(",");
      city = loc[0].split(" ");
      for (var i = 1; i < city.length; i++) {
        finalCity = finalCity.concat(city[i], " ");
      }
      finalCity = finalCity.substring(0, finalCity.length - 1);
      loc = val.name + " " + finalCity + "," + loc[1];
    }

    var dist = parseInt(await getDistance(startLocation, loc));

    myAxios
      .post("/stop/save/" + token, {
        stopLatitude: val.lat,
        stopLocation: loc,
        stopLongitude: val.lng,
        stopRating: 0,
        stopDistance: dist,
        stopUsername: curr.username,
      })
      .then((res) => {
        console.log("Save stop SUCCESS", res.data);

        // Then add the stop to the trip
        myAxios
          .put("/trip/" + token + "/add-stop/" + tripId, res.data)
          .then((res2) => {
            console.log("Add stop SUCCESS!", res2.data);
            window.location.reload(false);
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  }

  if (
    sid != 0 &&
    curr &&
    tripData.tripUsername &&
    tripData.tripUsername != curr.username
  ) {
    router.push("/home");
  }

  if (!isLoaded) {
    return <h1 className="text-2xl">Could not load stops</h1>;
  }

  return (
    <div>
      {helpSelected ? (
        <HelpStopCard>
          <StandardButton clickEvent={() => setHelpSelected(false)}>
            <img
              src="/remove.png"
              alt="create"
              className="absolute top-0 right-0 w-6 h-6"
            ></img>
          </StandardButton>
        </HelpStopCard>
      ) : null}
      <div className={`${helpSelected ? "opacity-50" : ""} flex`}>
        <PlanStopCard>
          <StandardButton clickEvent={() => setHelpSelected(true)}>
            <img
              src="/help-icon.svg"
              alt="create"
              className="absolute top-0 right-0 w-5 h-5"
            ></img>
          </StandardButton>
          <div className="space-y-3">
            <h1 className="text-3xl text-center font-bold">Plan Stops</h1>
            <div>
              <h1 className="text-center text-secondary-4 text-base italic">
                {startLocation} -{">"} {endLocation}
              </h1>
            </div>

            <h1 className="text-lg text-center">Get Stops By:</h1>
            <div className="relative flex flex-col justify-center items-center space-y-3">
              <div className="flex flex-row space-x-4">
                <button
                  className={`${
                    recType == 0 ? "bg-sky-700" : "bg-primary-1"
                  } hover:bg-sky-700 text-white p-2 px-4 rounded-lg`}
                  onClick={() => changeRecType(0)}
                  type="button"
                >
                  City
                </button>
                <button
                  className={`${
                    recType == 1 ? "bg-sky-700" : "bg-primary-1"
                  } hover:bg-sky-700 text-white p-2 px-4 rounded-lg`}
                  onClick={() => changeRecType(1)}
                  type="button"
                >
                  Route
                </button>
                <button
                  className={`${
                    recType == 2 ? "bg-sky-700" : "bg-primary-1"
                  } hover:bg-sky-700 text-white p-2 px-4 rounded-lg`}
                  onClick={() => changeRecType(2)}
                  type="button"
                >
                  Add your own!
                </button>
              </div>
            </div>

            <div className="flex flex-row space-x-1 mt-4 justify-center">
              {recType == 2 ? (
                <div>
                  {newStop ? (
                    <div className="flex flex-row space-x-1">
                      <Autocomplete
                        options={{
                          componentRestrictions: { country: countries },
                        }}
                      >
                        <input
                          className="border border-secondary-1 p-2 text-secondary-4 rounded rounded-3
                                    focus:ring focus:outline-none focus:border-primary-1 mb-3 text-base"
                          type="text"
                          placeholder="Enter Stop"
                          ref={stopRef}
                        />
                      </Autocomplete>
                      <div>
                        <button
                          className="bg-primary-1 hover:bg-sky-700 text-secondary-3 font-bold py-2 px-4 rounded-full"
                          onClick={addStop}
                        >
                          Find
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex inline-flex">
                        <button
                          onClick={addRec}
                          className="bg-primary-1 hover:bg-sky-700 text-secondary-3 font-bold py-2 px-4 rounded-l"
                        >
                          Confirm?
                        </button>
                        <button
                          onClick={() => setNewStop(true)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
                        >
                          Search Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            {recType == 1 || cityChosen ? (
              <div>
                <div className="flex flex-col justify-center items-center mt-2">
                  <button
                    onClick={() => setToggleRecsList(!toggleRecsList)}
                    className="bg-secondary-1 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
                  >
                    {allRecsList.length} Recommendations
                  </button>
                  <div>
                    {recType == 0 ? (
                      <div>
                        <br></br>
                        <button
                          onClick={dropCityMarkers}
                          className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full self-center"
                        >
                          Reset View
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="block border-2 border-primary-1 rounded-md">
                    {stopTypes.map((type, i) => (
                      <StopButton key={i} onclick={() => setType(type)}>
                        {stopTexts[i]}
                      </StopButton>
                    ))}
                  </div>
                  <br></br>
                  <div className="inline-flex space-x-1">
                    <br></br>
                    <BasicInputField
                      value={keyword}
                      placeholder="Keyword..."
                      onChangeFunc={(e) => setKeyword(e.target.value)}
                    />
                    <button
                      onClick={searchKeyword}
                      className="bg-primary-1 hover:bg-sky-700 text-secondary-3 font-bold py-2 px-4 rounded-lg"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col justify-center items-center mt-2">
            <h1 className="text-2xl">Current Stops</h1>
            {allStops.length > 0 ? (
              <div className="flex flex-wrap justify-center items-center">
                <div className="space-y-2">
                  {allStops.map((val, key) => {
                    return (
                      <div key={key}>
                        <StopCard item={val}></StopCard>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center">No stops found, add one!</p>
            )}
          </div>

          <br />
          <StandardButton filled={true} clickEvent={saveChanges}>
            Done
          </StandardButton>
        </PlanStopCard>

        <div
          className={`${
            isLoading ? "opacity-75" : ""
          } relative h-screen w-screen mr-2 mt-4 border-2 border-secondary-2 rounded-md`}
        >
          <div
            className={`${
              toggleRecsList ? "visible" : "hidden"
            } absolute right-0 top-0 mt-2 z-40 w-1/4 h-2/3 overflow-y-scroll`}
          >
            {allRecsList.length > 0 ? (
              <div className="flex flex-col space-y-2">
                {allRecsList.map((val, key) => {
                  return (
                    <div
                      id={key}
                      className="text-sm p-2 bg-white border-2 border-gray-300 rounded-md flex-shrink-0 items-center"
                    >
                      <p className="text-center">
                        {val.name} ({val.rating})
                      </p>
                      <div className="inline-flex space-x-2">
                        <button
                          onClick={() => addRecFromList(val)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
                        >
                          Add to Trip
                        </button>
                        <button
                          onClick={() => centerOnCity(val)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
                        >
                          Find on Map
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
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
            id="map-canvas"
          >
            {directionsResponse && (
              <DirectionsRenderer directions={directionsResponse} />
            )}
          </GoogleMap>
          <div>
            {isLoading ? (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <LoadSpinner></LoadSpinner>
              </div>
            ) : null}
          </div>
          <div>
            {stopMarker ? (
              <div className="absolute top-0 right-0 h-48 w-96 border-4 bg-white">
                <h1 className="text-2xl">{rec[0]}</h1>
                {rec[1] ? (
                  <h2>
                    Rating: {rec[1]} ({rec[2]})
                  </h2>
                ) : null}
                {rec[3] ? <h2>Price Level: {rec[3]}</h2> : null}
                {rec[4] ? (
                  <h3>
                    View their website{" "}
                    <a
                      className="text-primary-1 hover:text-primary-2"
                      href={rec[4]}
                    >
                      here
                    </a>
                  </h3>
                ) : null}
                <img
                  src={rec[5] ? rec[5][0].getUrl() : getDefaultImage(type)}
                  height="192"
                  width="384"
                ></img>
                {foundOnMap ? (
                  <div className="inline-flex">
                    <button
                      onClick={addRec}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
                    >
                      Add to Trip
                    </button>
                    <button
                      onClick={recType == 0 ? dropCityMarkers : findRouteStops}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
                    >
                      Return
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex">
                    <button
                      onClick={addRec}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
                    >
                      Add to Trip
                    </button>
                    <button
                      onClick={() => setStopMarker(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
                    >
                      Hide Box
                    </button>
                  </div>
                )}
              </div>
            ) : null}
            {cityMarker ? (
              <div className="absolute top-0 right-0 h-20 w-64 border-4 bg-white">
                <h1>City: {city[2]}</h1>
                <div className="inline-flex">
                  <button
                    onClick={() => setCityMarker(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
                  >
                    Hide Box
                  </button>
                  <button
                    onClick={centerOnCity(undefined)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
                  >
                    Center on City
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanStops;
