import React, { useState } from 'react';
import { SubmitButton } from '../generic/Button';
import { FormCard } from '../generic/Cards';
import { BasicInputField } from '../generic/InputField';
import { GenericLabel } from '../generic/TextItems';
import { loggedInRedirect, myAxios } from '../util/helper';
import LoadSpinner from "../generic/LoadSpinner";

require('dotenv').config();

const Login = () => {
    loggedInRedirect("/home");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        setError(false);
        setSubmitting(true);

        const body = {
            'emailAddress': email,
            'password': password
        }

        myAxios.post('/traveler/login', body)
            .then((res) => {
                console.log("POST Success", res.data);
                localStorage.setItem('traveler-token', res.data);
                window.location.reload(false);
            })
            .catch((err) => {
                setError(true);
                console.error(err)
                setSubmitting(false);
            });

        setEmail("");
        setPassword("");
    }

    return (
        <div className="container mx-auto flex flex-col justify-center items-center">
            <div className="mt-12 flex flex-col justify-center items-center mx-12 w-fit p-10 border-2 border-primary-1 bg-white rounded-md px-32">
                <h1 className="text-2xl font-bold text-center">Login</h1>

                {(submitting) ?
                    <LoadSpinner /> :
                    <form onSubmit={handleSubmit}>
                        <GenericLabel fFor="user">Email</GenericLabel><br />
                        <div className="w-64">
                        <BasicInputField value={email} placeholder="Email..." type="email" className="md:w-64"
                            fFor="user" onChangeFunc={(e) => setEmail(e.target.value)} readOnly={true} />
                        </div>

                        <div className='mt-3 mb-3'></div>

                        <label htmlFor="user">Password </label><br />
                        <BasicInputField value={password} placeholder="Password..."
                            type="password"
                            fFor="user"
                            onChangeFunc={(e) => setPassword(e.target.value)} 
                            className="md:w-64"/>

                        <div className="mb-3 mt-3">
                            <p>Don't have an account? Sign up <a className="text-primary-1 hover:text-primary-2" href="/signup"> here</a>
                            </p>
                            {/* <p>Sign up
                                <a className="text-primary-1 hover:text-primary-2" href="/signup"> here</a>
                            </p> */}
                        </div>

                        {(error) ? <p className="text-red-600">Invalid Email or Password</p> : null}

                        <SubmitButton />
                    </form>
                }
            </div>
        </div>
    )
}

export default Login;