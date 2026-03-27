import React, { useState } from "react";
import "./Login.css";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { app } from "../firebase/firebaseConfig";

const auth = getAuth(app);

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        //reset error
        setError("");

        if (!email || !password) {
            setError("Please enter both email and password")
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login succesful!");
            //transefer to dashboard page when logged in
            navigate("/events");
        } catch (err) {
            setError("Invalid Email or Password");
        }
    };

    return (
        <div className="container">
            <h2>Login</h2>

            <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>Login</button>

            {error && <p className="error">{error}</p>}
        </div>
    );
}