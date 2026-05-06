import "./HomePage.css";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/schema";

function HomePage() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userDocRef = doc(db, COLLECTIONS.USERS, currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUserName(data.firstName || data.username || currentUser.email);
        } else {
          setUserName(currentUser.email);
        }
      } else {
        setUser(null);
        setUserName("");
      }
    });

    return () => unsubscribe();
  }, []);

  const isLoggedIn = !!user;

  return (
    <>
      {isLoggedIn ? (
        <div className="welcome-message">
          <h2>Welcome back, {userName}!</h2>
        </div>
      ) : (
        <div className="welcome-message">
          <h2>Welcome to Astrya's Events!</h2>
          <p>Discover and manage your events with ease.</p>
        </div>
      )}
    </>
  );
}

export default HomePage;