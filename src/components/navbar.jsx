import { Link } from "react-router-dom";


function Navbar() {
    const isLoggedIn = false;

    return (
        <nav className="navbar">
            <Link to="/" className="logo">
                <h1>Astrya's Events</h1>
            </Link>
            
            <div className="nav-links">
                
                {isLoggedIn ? (
                    <>
                    <Link to="/events">
                        <button>Events</button>
                    </Link>
                    <Link to="/profile">
                        <button>Profile</button>
                    </Link>
                    </>
                ) : (
                    <>
                    <Link to="/signup">
                        <button>Create Account</button>
                    </Link>
                    <Link to="/login">
                        <button>Login</button>
                    </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;