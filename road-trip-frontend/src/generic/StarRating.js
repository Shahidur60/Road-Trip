import { useState } from "react"
import { useSelector } from "react-redux";
import { myAxios } from "../util/helper";

const StarRating = ({ id, isStop, prevRating, clickable }) => {
    const [rating, setRating] = useState(prevRating);
    const [hover, setHover] = useState(0);

    const traveler = useSelector(state => state.travelerReducer.currTraveler);

    const submitRating = (ndx) => {
        if (!clickable || !traveler.username) {
            return;
        }

        setRating(ndx);

        const token = localStorage.getItem("traveler-token");

        if (isStop) {
            myAxios.post('/stop/save/'+token, {
                'id': id,
                'stopRating': ndx,
                'stopUsername': traveler.username
            })
            .then((res) => {
                console.log("Rate stop SUCCESS", res.data);
                window.location.reload(false);
            }).catch((err) => console.error(err));
        } else {
            myAxios.post('/trip/rate/'+token, {
                'id': id,
                'tripRating': ndx
            })
            .then((res) => {
                console.log("Rate trip SUCCESS", res.data);
                window.location.reload(false);
            }).catch((err) => console.error(err));
        }
    }

    return (
        <div>
          {[...Array(5)].map((star, index) => {
            index += 1;
            return (
              <button
                type="button"
                key={index}
                className={`${index <= (hover || rating) ? "text-primary-1" : "text-black"}`}
                onClick={() => submitRating(index)}
                onMouseEnter={() => (clickable)? setHover(index) : setHover(rating)}
                onMouseLeave={() => setHover(rating)}
              >
                <span className="text-2xl">&#9733;</span>
              </button>
            );
          })}
        </div>
      );
}

export default StarRating;