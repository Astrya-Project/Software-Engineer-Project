import React, { useState } from "react";
import "./SignUp.css";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import app from "../firebase/firebaseConfig";
import { COLLECTIONS, createUserDoc } from "../firebase/schema";

const auth = getAuth(app);
const db = getFirestore(app);

export default function SignUp() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSignUp = async () => {
        setError("");

        if (!email || !password || !username || !firstName || !lastName) {
            setError("Please fill in all fields");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Auth success, UID:", user.uid);

            await setDoc(doc(db, COLLECTIONS.USERS, user.uid), createUserDoc({
                firstName,
                lastName,
                username,
                email,
            }));
            console.log("Firestore user doc created");

            navigate("/");
        } catch (err) {
            console.error("SignUp error:", err);
            setError("Failed to create account. Please try again.");
        }
    };

    return (
        <div className="container">
            <h2>Sign Up</h2>

            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
            <input type="email" placeholder="Enter Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Enter Password" value={password} onChange={e => setPassword(e.target.value)} />

            <button onClick={handleSignUp}>Sign Up</button>

            {error && <p className="error">{error}</p>}
        </div>
    );
}