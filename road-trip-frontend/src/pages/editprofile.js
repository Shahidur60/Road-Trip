import React, {useEffect, useState} from 'react';
import {loggedOutRedirect, myAxios} from "../util/helper";
import {FormCard} from "../generic/Cards";
import {GenericLabel} from "../generic/TextItems";
import {BasicInputField, UnmodifiableInputField, BasicTextBox} from "../generic/InputField";
import {SaveButton} from "../generic/Button";

require('dotenv').config();

const EditProfile = () => {
    loggedOutRedirect("/profile");

    const [id, setID] = useState("");
    const [email, setEmail] = useState("");
    //const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [bio, setBio] = useState("");
    const [img, setImg] = useState(null);
    const [imgData, setImgData] = useState(null);
    const [traveler, setTraveler] = useState(null);

    //const [showPassword, setShowPassword] = useState(false);
    //const passwordString = "------------------------------------";

    useEffect(() => {
        const token = localStorage.getItem('traveler-token');

        if (!token) {
            return;
        }

        // Validate token and get traveler information
        myAxios.get('/traveler/token/' + token).then((res) => {
            setTraveler(res.data);

            setID(res.data.id);
            setEmail(res.data.emailAddress);
            //setPassword(res.data.password);
            setBio(res.data.bio);
            setFirstName(res.data.firstName);
            setLastName(res.data.lastName);

            if (res.data.profilePicture) {
                setImg("data:image/png;base64," + res.data.profilePicture);
                setImgData("data:image/png;base64," + res.data.profilePicture);
            }

            console.log("Successful GET of traveler");
        }).catch((err) => console.error(err));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const token = localStorage.getItem('traveler-token');

        const body = {
            'id': id,
            'username': traveler.username,
            'emailAddress': email,
            'password': traveler.password,
            'firstName': firstName,
            'lastName': lastName,
            'bio': bio
        }

        myAxios.put('/traveler/update', body)
            .then((res) => {
                console.log("Traveler successfully updated");

                if (img) {
                    console.log("Uploading...", img);
                    let formData = new FormData();
                    formData.append("file", imgData)

                    myAxios.put('/traveler/upload?token='+token, formData)
                    .then((res) =>{
                        console.log("Upload PFP Success");
                        window.location.reload(false);
                    }).catch((err) => console.log(err));
                } else {
                    window.location.reload(false);
                }
            }).catch((err) => console.error(err));
    }

    const uploadPicture = (e) => {
        e.preventDefault();
        const picture = e.target.files[0];
        
        if (!picture) {
            return;
        }

        setImg(URL.createObjectURL(picture));
        setImgData(picture)
    }

    return (
        <div className="flex justify-center items-center">
            <FormCard>
                <h1 className="text-2xl">Edit Profile</h1>

                <img className="w-32 h-32 object-cover border-4 border-secondary-1 rounded-md" src={(img) ? img : "./images/profile-default.png"} />
                <input type="file" className="border-2 border-secondary-1 p-2 m-2 rounded-md" onChange={uploadPicture} name="image" accept="image/png, image/jpeg" />

                <form onSubmit={handleSubmit} className="grid grid-cols-2">
                    <div>
                        <GenericLabel fFor="user">Email</GenericLabel><br />
                        <UnmodifiableInputField  value={email} type="email"
                                                 fFor="user" onChangeFunc={(e) => setEmail(e.target.value)} /><br />
                        <br />
                        <GenericLabel htmlFor="user">First Name</GenericLabel><br />
                        <BasicInputField    value={firstName}
                                            type="firstName"
                                            fFor="user"
                                            onChangeFunc={(e) => setFirstName(e.target.value)} />
                        <br />

                        <GenericLabel htmlFor="user">Last Name</GenericLabel><br />
                        <BasicInputField    value={lastName}
                                            type="lastName"
                                            fFor="user"
                                            onChangeFunc={(e) => setLastName(e.target.value)} />
                        <br />
                    </div>
                        <div className="justify-self-end">
                            <GenericLabel htmlFor="user">Bio</GenericLabel><br />

                            <BasicTextBox       value={bio}
                                                type="bio"
                                                fFor="user"
                                                onChangeFunc={(e) => setBio(e.target.value)} />
                        </div>

                    <SaveButton />
                </form>
            </FormCard>
            </div>
    )
}

export default EditProfile;