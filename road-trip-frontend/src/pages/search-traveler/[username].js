import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormCard } from "../../generic/Cards";
import { loggedOutRedirect, myAxios } from "../../util/helper"

const SearchTraveler = () => {
    loggedOutRedirect("/");

    const router = useRouter();
    const qUsername = router.query.username;

    console.log(qUsername);

    const [traveler, setTraveler] = useState(null);

    useEffect(() => {
        if (!router.isReady || qUsername == '') { return; }

        console.log(qUsername);

        // Currently only finding 1 traveler, todo is get a list of matching travelers
        myAxios.get('/traveler/username/' + qUsername)
        .then((res) => {
            setTraveler(res.data);
        })
        .catch((err) => {
            console.error(err)
        });

    }, [router.isReady]);

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl ml-10 mt-5">Search Results</h1>
            <FormCard>
                { (traveler) ? 
                <div>
                    <p className="text-lg">@{traveler.username}</p>
                    <a href={`/profile/${traveler.username}`} className="text-primary-1">View Profile</a>
                </div> : <p>No Travelers Found.</p>}
            </FormCard>
        </div>
    );
}

export default SearchTraveler;