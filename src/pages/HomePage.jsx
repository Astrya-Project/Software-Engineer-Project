import "./HomePage.css";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function HomePage() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return () => unsubscribe();
    }, []);

    const isLoggedIn = !!user;
    const userName = user ? user.displayName || user.email : "";


    return (
    <>
        {isLoggedIn ? (
            <div className="welcome-message">
                <h2>
                    Welcome back, {userName}!
                </h2>
            </div>
        ) : (
        <div className="welcome-message">
            <h2>
                Welcome to Astrya's Events!
            </h2>
            <p>
                Discover and manage your events with ease.
            </p>
        </div>
        )}
    </>
    );
}

export default HomePage;
