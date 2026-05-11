import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AccountPage from './pages/AccountPage';
import Navbar from './components/Navbar';
import SecurityVerification from './components/SecurityVerification';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import HomePage from './pages/HomePage';
import Events from './pages/Events';
import EventCreation from './pages/EventCreation';
import EventDetails from './pages/EventDetails';
import BudgetTracking from './pages/BudgetTracking';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="events" element={<SecurityVerification> <Events /></SecurityVerification>} />
            <Route path="event-details/:eventId" element={<SecurityVerification> <EventDetails /></SecurityVerification>} />
            <Route path="event-creation" element={<SecurityVerification> <EventCreation /></SecurityVerification>} />
            <Route path="event-creation/:eventId" element={<SecurityVerification> <EventCreation /></SecurityVerification>} />
            <Route path="budget/:eventID" element={<SecurityVerification> <BudgetTracking /></SecurityVerification>} />
            <Route path="account" element={<SecurityVerification> <AccountPage /></SecurityVerification>} />
            <Route path="*" element={<HomePage />} />
          </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
