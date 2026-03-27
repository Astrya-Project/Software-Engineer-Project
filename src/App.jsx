import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import HomePage from './pages/HomePage';
import Events from './pages/Events';
import EventCreation from './pages/EventCreation';
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
            <Route path="events" element={<Events />} />
            <Route path="event-creation" element={<EventCreation />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
