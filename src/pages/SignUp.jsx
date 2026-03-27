import React, { useState } from "react";
import "./SignUp.css";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import app from "../firebase/firebaseConfig";

const auth = getAuth(app);

export default function SignUp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSignUp = async () => {
        setError("");

        if (!email || !password) {
            setError("Please enter both email and password")
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Account created successfully!");
            navigate("/events");
        } catch (err) {
            setError("Failed to create account. Please try again.");
        }
    };

    return (
        <div className="container">
            <h2>Sign Up</h2>

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

            <button onClick={handleSignUp}>Sign Up</button>

            {error && <p className="error">{error}</p>}
        </div>
    );
}