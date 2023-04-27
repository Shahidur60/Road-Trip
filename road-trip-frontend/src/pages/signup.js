import React, { useState } from 'react';
import { SubmitButton } from '../generic/Button';
import { FormCard } from '../generic/Cards';
import { BasicInputField } from '../generic/InputField';
import LoadSpinner from '../generic/LoadSpinner';
import { GenericLabel } from '../generic/TextItems';
import { loggedInRedirect, myAxios } from '../util/helper';

require('dotenv').config();

const SignUp = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");

    const [errorMsg, setErrorMsg] = useState("");
    const [submitting, setSubmitting] = useState(false);

    loggedInRedirect("/home");

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg("");

        if (username == "") {
            setErrorMsg("No username provided");
            setSubmitting(false);
            return;
        }

        if (password != confirmPass) {
            setErrorMsg("Passwords do not match!");
            setSubmitting(false);
            return;
        } else if (password.length < 12) {
            setErrorMsg("Password must be longer (at least 12 characters).");
            setSubmitting(false);
            return;
        }

        if (!email.includes("@")) {
            setErrorMsg("Invalid email provided.");
            setSubmitting(false);
            return;
        }

        const body = {
            'emailAddress': email,
            'password': password,
            'username': username,
        }

        myAxios.post('/traveler/sign-up', body)
            .then((res) => {
                localStorage.setItem('traveler-token', res.data);
                window.location.reload(false);
            })
            .catch((err) => {
                console.error(err);
                setErrorMsg("Invalid username, password, or email.");
                setSubmitting(false);
            });
    }

    return (
        <div className="container mx-auto flex flex-col justify-center items-center">
            <FormCard>
                <h1 className="text-2xl font-bold text-center">Sign Up</h1>

                {(submitting) ? <LoadSpinner /> :
                    <form onSubmit={handleSubmit}>
                        <div className="flex space-x-4 mt-3">
                            <div>
                                <GenericLabel fFor="fName">Username</GenericLabel><br />
                                <BasicInputField value={username} placeholder="Username" type="text"
                                    fFor="username" minLen="3" onChangeFunc={(e) => setUsername(e.target.value)} />
                            </div>
                            <div>
                                <GenericLabel fFor="email">Email</GenericLabel><br />
                                <BasicInputField value={email} placeholder="Your Email..." type="email"
                                    fFor="email" onChangeFunc={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex space-x-4 mb-3 mt-3">
                            <div>
                                <GenericLabel fFor="password">Password</GenericLabel><br />
                                <BasicInputField value={password} placeholder="Password..."
                                    type="password" minLen="12" fFor="password" onChangeFunc={(e) => setPassword(e.target.value)} />
                            </div>  
                            
                            <div>
                                <label htmlFor="confirm">Confirm Password</label><br />
                                <BasicInputField value={confirmPass} placeholder="Confirm Password"
                                    type="password"
                                    fFor="confirm"
                                    onChangeFunc={(e) => setConfirmPass(e.target.value)} />
                            </div>
                        </div>

                        <p className="mb-3">Already have an account? Login
                            <a className="text-primary-1 hover:text-primary-2" href="/login"> here</a>
                        </p>

                        {(errorMsg != "") ? <p className="text-red-600">{errorMsg}</p> : null}

                        <SubmitButton />
                    </form>}
            </FormCard>
        </div>
    )
}

export default SignUp;