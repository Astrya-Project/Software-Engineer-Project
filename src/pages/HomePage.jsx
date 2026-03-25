import "./HomePage.css";

function HomePage() {
    const isLoggedIn = false;
    const userName = "Tim";

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
