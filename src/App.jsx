import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      setLatitude(pos.coords.latitude);
      setLongitude(pos.coords.longitude);
    });
  }, []);

  const API_URL = import.meta.env.VITE_API_URL;

  const registerUser = async () => {
    if (!name || latitude === null || longitude === null) {
      alert("Missing name or location");
      return;
    }
    const { data } = await axios.post("${API_URL}/api/register", {
      name, latitude, longitude
    });
    setRegistered(true);
    setMyId(data.id);
  };
 
  useEffect(() => {
    const interval = setInterval(() => {
      if (registered) {
        axios.get("${API_URL}/api/nearby-users", {
          params: { latitude, longitude }
        })
        .then(res => setNearbyUsers(res.data));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [registered, latitude, longitude]);

  return (
    <div className="container">
      <h1>HeyYou Nearby</h1>
      {!registered ? (
        <>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
          />
          <button onClick={registerUser}>Join</button>
        </>
      ) : (
        <>
          <h2>Nearby Online Users</h2>
          <ul>
            {nearbyUsers.map(user => (
              <li key={user.id}>
                <span
                  style={{
                    height: '10px',
                    width: '10px',
                    backgroundColor: user.online ? 'green' : 'red',
                    borderRadius: '50%',
                    display: 'inline-block'
                  }}
                />{' '}
                {user.name}{user.id === myId ? ' (you)' : ''} —{' '}
                {user.distance.toFixed(1)} meters
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default App;