import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setError('Could not connect to backend.'));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '80px', fontFamily: 'sans-serif' }}>
      <h1>SYSTEM WORKING</h1>
      <hr />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {status ? (
        <div>
          <p><strong>Status:</strong> {status.status}</p>
          <p><strong>Message:</strong> {status.message}</p>
        </div>
      ) : (
        !error && <p>Connecting to backend...</p>
      )}
    </div>
  );
}

export default App;