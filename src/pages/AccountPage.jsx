import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  onAuthStateChanged,
  signOut,
  verifyBeforeUpdateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser as deleteAuthUser,
} from "firebase/auth";

import { auth } from "../firebase/firebaseConfig";

import {
  getUserById,
  updateUser,
  deleteUserDoc,
} from "../firebase/services/userService";

import "./accountPage.css";

export default function AccountPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);

  //
  // LOAD USER
  //
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (!firebaseUser) {
          navigate("/");
          return;
        }

        setUser(firebaseUser);

        try {
          const profile = await getUserById(
            firebaseUser.uid
          );

          if (profile) {
            setDisplayName(
              profile.displayName || ""
            );

            setBio(profile.bio || "");
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  //
  // REAUTHENTICATION
  //
  async function reauthenticate() {
    const password = prompt(
      "Please re-enter your password:"
    );

    if (!password) {
      throw new Error(
        "Password required for reauthentication."
      );
    }

    const credential =
      EmailAuthProvider.credential(
        user.email,
        password
      );

    await reauthenticateWithCredential(
      user,
      credential
    );
  }

  //
  // SAVE PROFILE
  //
  async function handleSaveProfile() {
    if (!user) return;

    try {
      await updateUser(user.uid, {
        displayName,
        bio,
      });

      alert("Profile updated.");
    } catch (error) {
      console.error(error);

      alert("Failed to update profile.");
    }
  }

  //
  // CHANGE EMAIL
  //
  async function handleChangeEmail() {
    if (!newEmail) return;

    try {
      await verifyBeforeUpdateEmail(
        user,
        newEmail
      );

      alert(
        "Verification email sent. Please verify your new email."
      );

      setNewEmail("");
    } catch (error) {
      console.error(error);

      if (
        error.code ===
        "auth/requires-recent-login"
      ) {
        try {
          await reauthenticate();

          await verifyBeforeUpdateEmail(
            user,
            newEmail
          );

          alert(
            "Verification email sent."
          );

          setNewEmail("");
        } catch (reauthError) {
          console.error(reauthError);

          alert(
            "Failed to update email."
          );
        }
      } else {
        alert("Failed to update email.");
      }
    }
  }

  //
  // CHANGE PASSWORD
  //
  async function handleChangePassword() {
    if (!newPassword) return;

    try {
      await updatePassword(
        user,
        newPassword
      );

      alert("Password updated.");

      setNewPassword("");
    } catch (error) {
      console.error(error);

      if (
        error.code ===
        "auth/requires-recent-login"
      ) {
        try {
          await reauthenticate();

          await updatePassword(
            user,
            newPassword
          );

          alert("Password updated.");

          setNewPassword("");
        } catch (reauthError) {
          console.error(reauthError);

          alert(
            "Failed to update password."
          );
        }
      } else {
        alert(
          "Failed to update password."
        );
      }
    }
  }

  //
  // LOGOUT
  //
  async function handleLogout() {
    try {
      await signOut(auth);

      navigate("/");
    } catch (error) {
      console.error(error);
    }
  }

  //
  // DELETE ACCOUNT
  //
  async function handleDeleteAccount() {
    const confirmed = confirm(
      "Are you sure you want to permanently delete your account?"
    );

    if (!confirmed) return;

    try {
      //
      // DELETE AUTH ACCOUNT
      //
      await deleteAuthUser(user);
      //
      // DELETE FIRESTORE DOC FIRST
      //
      await deleteUserDoc(user.uid);

      alert("Account deleted.");

      navigate("/");
    } catch (error) {
      console.error(error);

      if (
        error.code ===
        "auth/requires-recent-login"
      ) {
        try {
          await reauthenticate();

          await deleteUserDoc(user.uid);

          await deleteAuthUser(user);

          alert("Account deleted.");

          navigate("/");
        } catch (reauthError) {
          console.error(reauthError);

          alert(
            "Failed to delete account."
          );
        }
      } else {
        alert(
          "Failed to delete account."
        );
      }
    }
  }

  //
  // LOADING STATE
  //
  if (loading) {
    return (
      <div className="account-page">
        <p>Loading account...</p>
      </div>
    );
  }

  //
  // PAGE UI
  //
  return (
    <div className="account-page">
      <h1>Account Settings</h1>

      {/* PROFILE SECTION */}
      <div className="account-section">
        <h2>Profile</h2>

        <label>Display Name</label>

        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) =>
            setDisplayName(e.target.value)
          }
        />

        <label>Bio</label>

        <textarea
          placeholder="Tell people about yourself"
          value={bio}
          onChange={(e) =>
            setBio(e.target.value)
          }
        />

        <button
          className="primary-btn"
          onClick={handleSaveProfile}
        >
          Save Profile
        </button>
      </div>

      <hr />

      {/* AUTH SECTION */}
      <div className="account-section">
        <h2>Authentication</h2>

        <p className="account-email">
          Current Email:
          <strong> {user.email}</strong>
        </p>

        <label>New Email</label>

        <input
          type="email"
          placeholder="Enter new email"
          value={newEmail}
          onChange={(e) =>
            setNewEmail(e.target.value)
          }
        />

        <button
          className="primary-btn"
          onClick={handleChangeEmail}
        >
          Change Email
        </button>

        <br />
        <br />

        <label>New Password</label>

        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
        />

        <button
          className="primary-btn"
          onClick={handleChangePassword}
        >
          Change Password
        </button>
      </div>

      <hr />

      {/* ACCOUNT ACTIONS */}
      <div className="account-section">
        <button
          className="secondary-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

        <br />
        <br />

        <button
          className="danger-btn"
          onClick={handleDeleteAccount}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
