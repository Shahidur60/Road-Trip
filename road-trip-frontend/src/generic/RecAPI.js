import axios from "axios";

export const findCities = async (latLngList, skip) => {
  try {
    const cities = [];
    let count = 0;
    for (let i = skip; i < latLngList.length - skip; i += 5) {
      const { data } = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latLngList[i][0]}%2C${latLngList[i][1]}&result_type=locality&key=${process.env.REACT_APP_MAPS_API_KEY}`
      );
      if (data.results.length > 0) {
        //console.log('City: ', data.results[0].formatted_address);
        const tmp = [];
        const arr = data.results[0].formatted_address.split(",");
        if (arr[1].length > 3) {
          i -= 4;
        } else {
          var address = data.results[0].formatted_address;
          var exists = false;

          //console.log('Just found: ', address);
          for (var j = 0; j < cities.length; j++) {
            if (cities[j][2].localeCompare(address) == 0) {
              console.log(cities[j][2], " and ", address, " are the same.");
              exists = true;
            }
          }
          if (!exists) {
            const data2 = await getCityCenter(address);
            tmp[0] = data2.lat;
            tmp[1] = data2.lng;
            tmp[2] = data.results[0].formatted_address;
            cities[count] = tmp;

            count++;
          }
        }
      }
    }

    return cities;
  } catch (error) {
    console.log(error);
  }
};

export async function getCityCenter(address) {
  const a1 = address.replace(/,/g, "");
  const a2 = a1.replace(/\s/g, "%20");
  const { data } = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${a2}&key=${process.env.REACT_APP_MAPS_API_KEY}`
  );

  return data.results[0].geometry.location;
}
