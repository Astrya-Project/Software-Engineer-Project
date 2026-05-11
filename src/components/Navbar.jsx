import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { useEffect, useState } from "react";

import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/schema";

import logo from "../assets/Astryas.png";

import "./Navbar.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [userName, setUserName] =
    useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (user) {
            setIsLoggedIn(true);

            try {
              const userDocRef = doc(
                db,
                COLLECTIONS.USERS,
                user.uid
              );

              const userDocSnap =
                await getDoc(userDocRef);

              if (userDocSnap.exists()) {
                const data =
                  userDocSnap.data();

                setUserName(
                  data.firstName ||
                    data.displayName ||
                    data.username ||
                    user.email
                );
              } else {
                setUserName(user.email);
              }
            } catch (error) {
              console.error(error);

              setUserName(user.email);
            }
          } else {
            setIsLoggedIn(false);
            setUserName("");
          }
        }
      );

    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    try {
      const auth = getAuth();

      await signOut(auth);

      navigate("/");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <nav className="navbar">
      {/* LOGO */}
      <Link to="/" className="logo-link">
        <img
          src={logo}
          alt="Astrya's Events"
          className="logo"
        />
      </Link>

      {/* NAVIGATION */}
      <div className="nav-links">
        {isLoggedIn ? (
          <>
            <span className="user-name">
              Hello, {userName}
            </span>

            <Link to="/events">
              Events
            </Link>

            <Link to="/account">
              Account
            </Link>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signup">
              Create Account
            </Link>

            <Link to="/login">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;