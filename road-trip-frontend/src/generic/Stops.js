export async function calculateRoute(waypts, start, end) {
  const directionsService = new google.maps.DirectionsService();
  console.log("Waypts are: ", waypts);
  if (waypts.length > 0) {
    const results = await directionsService
      .route({
        origin: start,
        destination: end,
        // Add stops to the trip's route
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .catch((err) => {
        console.error(err);
        alert("No stop found!");
      });
    return results;
  } else {
    const results = await directionsService
      .route({
        origin: start,
        destination: end,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .catch((err) => {
        console.error(err);
        alert("No stop found!");
      });
    return results;
  }
}

export function initMap() {
  var map = new google.maps.Map(document.getElementById("map-canvas"), {
    zoom: 14,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
  });

  return map;
}

export function getTripLength(duration) {
  const durArray = duration.split(" ");
  var mins = 0;

  for (var i = 1; i < durArray.length; i += 2) {
    if (
      durArray[i].localeCompare("day") == 0 ||
      durArray[i].localeCompare("days") == 0
    ) {
      for (var j = 0; j < durArray[i - 1]; j++) {
        mins += 1440;
      }
    } else if (
      durArray[i].localeCompare("hour") == 0 ||
      durArray[i].localeCompare("hours") == 0
    ) {
      for (var j = 0; j < durArray[i - 1]; j++) {
        mins += 60;
      }
    } else if (
      durArray[i].localeCompare("min") == 0 ||
      durArray[i].localeCompare("mins") == 0
    ) {
      mins += parseInt(durArray[i - 1]);
    }
  }

  return mins;
}

export async function getDistance(loc1, loc2) {
  const directionsService = new google.maps.DirectionsService();

  const results = await directionsService
    .route({
      origin: loc1,
      destination: loc2,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    })
    .catch((err) => {
      console.error(err);
      alert("No route found!");
    });
  console.log("Get distance got:", results);
  const arr = results.routes[0].legs[0].distance.text.split(" ");

  return arr[0].replace(/,/g, "");
}

export function convertPL(num) {
  if (num == 1) {
    return "$";
  } else if (num == 2) {
    return "$$";
  } else if (num == 3) {
    return "$$$";
  } else if (num == 4) {
    return "$$$$";
  }
  return null;
}

export function getIcon(type) {
  if (type) {
    if (type.localeCompare("restaurant") == 0) {
      return "../../../images/red_MarkerR.png";
    } else if (type.localeCompare("lodging") == 0) {
      return "../../../images/yellow_MarkerH.png";
    } else if (type.localeCompare("gas_station") == 0) {
      return "../../../images/orange_MarkerG.png";
    } else if (type.localeCompare("church") == 0) {
      return "../../../images/brown_MarkerC.png";
    } else if (type.localeCompare("museum") == 0) {
      return "../../../images/paleblue_MarkerM.png";
    } else if (type.localeCompare("park") == 0) {
      return "../../../images/darkgreen_MarkerP.png";
    } else if (type.localeCompare("store") == 0) {
      return "../../../images/pink_MarkerS.png";
    } else if (type.localeCompare("cafe") == 0) {
      return "../../../images/purple_MarkerC.png";
    } else if (type.localeCompare("keyword") == 0) {
      return "../../../images/blue_MarkerK.png";
    }
  }
  return "../../../images/green_MarkerI.png";
}

export function getDefaultImage(type) {
  if (type) {
    if (type.localeCompare("restaurant") == 0) {
      return "../../../images/type-defaults/restaurant.png";
    } else if (type.localeCompare("lodging") == 0) {
      return "../../../images/type-defaults/hotel.png";
    } else if (type.localeCompare("gas_station") == 0) {
      return "../../../images/type-defaults/gas.png";
    } else if (type.localeCompare("church") == 0) {
      return "../../../images/type-defaults/church.png";
    } else if (type.localeCompare("museum") == 0) {
      return "../../../images/type-defaults/museum.png";
    } else if (type.localeCompare("park") == 0) {
      return "../../../images/type-defaults/park.png";
    } else if (type.localeCompare("store") == 0) {
      return "../../../images/type-defaults/store.png";
    } else if (type.localeCompare("cafe") == 0) {
      return "../../../images/type-defaults/cafe.png";
    } else if (type.localeCompare("keyword") == 0) {
      return "../../../images/type-defaults/car.png";
    }
  }
  return "../../../images/type-defaults/car.png";
}

export function getSearchPoints(waypts, duration) {
  const searchPts = [];
  var count = 0;
  let ptsPerMin = waypts.length / duration;
  let skipDist = 60;
  if (duration / 5 < 60) {
    skipDist = duration / 5;
  }
  ptsPerMin = Math.round(ptsPerMin * skipDist);

  let incrementor = 10;
  let totalWays = waypts.length - 2 * ptsPerMin;

  while (Math.round(totalWays / incrementor) > 10) {
    incrementor++;
  }

  for (var i = ptsPerMin; i < waypts.length - ptsPerMin; i += incrementor) {
    searchPts[count] = waypts[i];
    count++;
  }

  return searchPts;
}
