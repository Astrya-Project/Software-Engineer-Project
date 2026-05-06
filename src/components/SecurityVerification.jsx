import React, { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function SecurityVerification({ children }) {
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                alert("Access denied. Please log in.");
                navigate("/login");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    return <>{children}</>;
}