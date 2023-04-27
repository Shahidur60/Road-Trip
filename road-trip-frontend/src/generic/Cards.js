import { StandardButton, StandardNavButton } from "./Button";
import StarRating from "./StarRating";
import { myAxios } from "../util/helper";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";

export const FormCard = ({ children }) => {
  return (
    <div className="mt-12 flex flex-col justify-center items-center mx-12 w-fit p-10 border-2 border-primary-1 bg-white rounded-md">
      {children}
    </div>
  );
};

export const PlanStopCard = ({ children }) => {
  return (
    <div className="mt-6 flex flex-col relative justify-center items-center mx-12 w-1/3 p-10 border-2 border-primary-1 bg-white rounded-md">
      {children}
    </div>
  );
};

export const HelpStopCard = ({ children }) => {
  return (
    <div className="flex">
      <div className="absolute m-12 px-10 z-40 border-1 border-gray-400 bg-gray-50 rounded-md drop-shadow-md w-4/5">
        {children}
        <h1 className="text-4xl font-bold text-center">Help</h1> <br />
        <div className="px-4">
          <p className="text-xl underline text-primary-2">
            Get Stop Types Explained:
          </p>
          <br />
          <div className="flex flex-row">
            <p className="text-lg">1.</p>
            <p className="text-lg font-bold text-primary-1">&nbsp;City&nbsp;</p>
            <p className="text-lg">
              finds and lists cities along the route. You can click on city
              markers and zoom in on them to find recommendations in the city.
              We recommend using this for longer trips.
            </p>
          </div>
          <br />
          <div className="flex flex-row">
            <p className="text-lg">2.</p>
            <p className="text-lg font-bold text-primary-1">
              &nbsp;Route&nbsp;
            </p>
            <p className="text-lg">
              finds stops along your route. You can filter by type and search
              for keywords. We recommend using this feature for shorter trips.
            </p>
          </div>
          <br />
          <div className="flex flex-row">
            <p className="text-lg">3.</p>
            <p className="text-lg font-bold text-primary-1">
              &nbsp;Add your own&nbsp;
            </p>
            <p className="text-lg">
              is for addresses that you want to import yourself. If you want to
              find keywords along your route, we recommend using the keyword
              feature in the routes.
            </p>
          </div>
          <br />
          <p className="text-xl underline text-primary-2">Markers:</p> <br />
          <div className="space-y-2">
            <div className="flex flex-row space-x-3">
              <img src="/images/green_MarkerI.png" alt="interests"></img>
              <p className="text-lg">Points of interest.</p>
              <img src="/images/darkgreen_MarkerS.png" alt="interests"></img>
              <p className="text-lg">Your current stops.</p>
              <img src="/images/yellow_MarkerH.png" alt="interests"></img>
              <p className="text-lg">Hotels.</p>
              <img src="/images/paleblue_MarkerM.png" alt="interests"></img>
              <p className="text-lg">Museums.</p>
            </div>
            <div className="flex flex-row space-x-4">
              <img src="/images/blue_MarkerC.png" alt="interests"></img>
              <p className="text-lg">Cities.</p>
              <img src="/images/red_MarkerR.png" alt="interests"></img>
              <p className="text-lg">Restaurants.</p>
              <img src="/images/darkgreen_MarkerP.png" alt="interests"></img>
              <p className="text-lg">Parks.</p>
              <img src="/images/orange_MarkerG.png" alt="interests"></img>
              <p className="text-lg">Gas stations.</p>
            </div>
            <div className="flex flex-row space-x-4">
              <img src="/images/blue_MarkerK.png" alt="interests"></img>
              <p className="text-lg">Keywords.</p>
              <img src="/images/purple_MarkerC.png" alt="interests"></img>
              <p className="text-lg">Cafes.</p>
              <img src="/images/pink_MarkerS.png" alt="interests"></img>
              <p className="text-lg">Stores.</p>
              <img src="/images/brown_MarkerC.png" alt="interests"></img>
              <p className="text-lg">Churches.</p>
            </div>
          </div>
          <br />
        </div>
      </div>
    </div>
  );
};

export const StopCard = ({ item }) => {
  const deleteStop = () => {
    const token = localStorage.getItem("traveler-token");

    myAxios
      .delete("/stop/delete/" + token + "/" + item.id)
      .then((res) => {
        console.log("Stop DELETE Success");
        window.location.reload(false);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="p-5 border-2 border-secondary-2 rounded-md bg-white">
      <p className="text-lg">{item.stopLocation}</p>
      <div className="relative flex flex-row">
        <StarRating
          id={item.id}
          isStop={true}
          prevRating={item.stopRating}
          clickable={true}
        />
        <button className="absolute right-0 w-8" onClick={deleteStop}>
          <img src="/images/trash.png" alt="Delete" />
        </button>
      </div>
    </div>
  );
};

export const TripCard = ({ item }) => {
  const thisDate = new Date(item.date);
  const currTraveler = useSelector(
    (state) => state.travelerReducer.currTraveler
  );
  const [currUsername, setCurrUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [selectedDropdown, selectDropdown] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);

  // var s = item.startLocation;
  // s = s.substring(0, s.length - 5);
  // var e = item.endLocation;
  // e = e.substring(0, e.length - 5);

  const deleteTrip = () => {
    const token = localStorage.getItem("traveler-token");

    myAxios
      .delete("/trip/delete/" + token + "/" + item.id)
      .then((res) => {
        console.log("Trip DELETE Success");
        window.location.reload(false);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (currTraveler) {
      setCurrUsername(currTraveler.username);
      setIsAdmin(currTraveler.isAdmin == "Y");
    }
  }, [currTraveler]);

  return (
    <div className="p-2 md:p-10 border-2 border-primary-1 rounded-md bg-white min-h-full">
      <div className="flex flex-row space-x-32 justify-between">
        <div className="flex flex-col justify-start items-start">
          <p className="text-lg">
            {item.startLocation} -{">"} {item.endLocation}
          </p>

          <p className="text-md">Drive Time: {item.duration}</p>
          <p className="text-md">Distance: {item.distance}</p>

          {item.stops.length > 0 ? (
            <div>
              <p>Stops:</p>
              <div className="">
                {item.stops.map((stop, i) => (
                  <p key={i}>- {stop.stopLocation}</p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col mt-6">
            <p className="font-bold">
              {thisDate.getMonth() + 1}/{thisDate.getDate()}/
              {thisDate.getFullYear()}
            </p>

            {item.tripUsername == currUsername || isAdmin ? (
              <div>
                <button
                  className="bottom-0 text-lg text-primary-2 rounded-md"
                  onClick={() => selectDropdown(!selectedDropdown)}
                >
                  •••
                </button>

                <div
                  className={`${
                    selectedDropdown ? "visible" : "hidden"
                  } absolute border-1 border-gray-400 bg-gray-50 rounded-md drop-shadow-md`}
                >
                  <StandardNavButton url={`/create-trip/${item.id}`}>
                    Edit Trip
                  </StandardNavButton>
                  <StandardButton clickEvent={deleteTrip}>
                    <p className="text-red-700 hover:text-red-500">
                      Delete Trip
                    </p>
                  </StandardButton>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col min-w-fit items-end justify-top">
          <a
            href={`/profile/${item.tripUsername}`}
            className="text-md text-primary-2 mb-2"
          >
            @{item.tripUsername}
          </a>

          {item.playlists.length > 0 ? (
            <div className="bg-primary-1 text-white rounded-md my-2">
              <button
                className="bg-primary-2 hover:bg-primary-1 rounded-md px-3 py-1 text-lg font-bold w-full"
                onClick={() => setShowPlaylists(!showPlaylists)}
              >
                Playlists
              </button>

              {showPlaylists ? (
                <div className="rounded-md p-3">
                  {item.playlists.map((playlist, i) => (
                    <a
                      key={i}
                      className="underline"
                      target="_blank"
                      href={
                        "https://open.spotify.com/playlist/" +
                        playlist.spotifyId
                      }
                    >
                      {playlist.playlistName}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {item.tripUsername == currUsername || isAdmin ? (
            <div className="flex flex-col justify-center items-center space-y-2">
              <StandardNavButton url={`/plan-stops/${item.id}`} filled={true}>
                Plan Stops
              </StandardNavButton>
              {item.playlists.length == 0 ? (
                <a
                  className="text-primary-1 hover:text-primary-2"
                  href="/playlist"
                >
                  Add Playlist
                </a>
              ) : null}
            </div>
          ) : null}

          <StarRating
            id={item.id}
            isStop={false}
            prevRating={item.tripRating}
            clickable={item.tripUsername == currUsername}
          />
        </div>
      </div>
    </div>
  );
};

export const NotificationCard = ({ item }) => {
  const thisDate = new Date(item.date);
  const formattedDate =
    thisDate.getMonth() +
    1 +
    "/" +
    thisDate.getDate() +
    "/" +
    thisDate.getFullYear();

  return (
    <div className="border-2 border-secondary-2 rounded-md p-2">
      <div className="flex flex-row space-x-4">
        <span>{item.notifMsg}</span>
        <span className="text-xs">{formattedDate}</span>
      </div>
    </div>
  );
};

export const PlaylistCard = ({ item }) => {
  const [songData, setSongData] = useState([]);
  const [showSongs, setShowSongs] = useState(false);

  const displaySongs = (playlistId) => {
    // Get songs with spotify playlist ID
    axios
      .get("https://api.spotify.com/v1/playlists/" + playlistId + "/tracks", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
        },
      })
      .then((res) => {
        // Set song data to response items
        setSongData(res.data.items);
        setShowSongs(true);
      })
      .catch((err) => console.error(err));

    setShowSongs(false);
  };

  const deletePlaylist = () => {
    const token = localStorage.getItem("traveler-token");

    myAxios
      .delete("/playlist/delete/" + token + "/id/" + item.id)
      .then((res) => {
        console.log(res.data);
        window.location.reload(false);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="bg-primary-1 w-full text-left p-3 flex flex-col justify-center items-center text-white space-x-12 rounded-md">
      {showSongs ? (
        <div className="absolute top-0 mt-32 flex flex-col justify-center items-center bg-white border-2 border-primary-1 drop-shadow-md p-6 rounded-lg">
          <h3 className="text-secondary-4 text-lg">
            Songs from {item.playlistName}
          </h3>

          {songData.map((song) => (
            <div className="text-secondary-4 border-2 border-primary-1 rounded-md w-full p-1 my-1">
              <p>
                {song.track.name} by {song.track.artists[0].name}
              </p>
            </div>
          ))}

          <div className="flex flex-row space-x-4 m-2">
            <button
              className="bg-secondary-1 hover:bg-gray-400 text-secondary-4 rounded-lg p-2"
              onClick={() => setShowSongs(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-row justify-center items-center space-x-12">
        <p className="float-left font-bold text-lg">{item.playlistName}</p>

        <div className="float-right">
          <div className="flex flex-row space-x-4">
            <button
              className="bg-secondary-3 hover:bg-secondary-2 rounded-lg text-secondary-4 p-3"
              onClick={() => displaySongs(item.spotifyId)}
            >
              View Songs
            </button>
            <button className="m-0 p-0 w-8" onClick={deletePlaylist}>
              <img src="/images/trash.png" alt="Delete" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
