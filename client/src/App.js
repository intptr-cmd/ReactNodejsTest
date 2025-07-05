import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:4000/api';

function App() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [newMeeting, setNewMeeting] = useState('');
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');

  // Fetch meetings after login
  useEffect(() => {
    if (token) fetchMeetings();
  }, [token]);

  const login = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      setToken(data.token);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const fetchMeetings = async () => {
    const res = await fetch(`${API_URL}/meetings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setMeetings(await res.json());
  };

  const addMeeting = async (e) => {
    e.preventDefault();
    if (!newMeeting) return;
    const res = await fetch(`${API_URL}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title: newMeeting })
    });
    if (res.ok) {
      setNewMeeting('');
      fetchMeetings();
    }
  };

  const startEdit = (id, title) => {
    setEditId(id);
    setEditValue(title);
  };

  const saveEdit = async (id) => {
    const res = await fetch(`${API_URL}/meetings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title: editValue })
    });
    if (res.ok) {
      setEditId(null);
      setEditValue('');
      fetchMeetings();
    }
  };

  const deleteMeeting = async (id) => {
    await fetch(`${API_URL}/meetings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchMeetings();
  };

  if (!token) {
    return (
      <div style={{ maxWidth: 300, margin: '100px auto' }}>
        <h2>Login</h2>
        <form onSubmit={login}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 8 }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 8 }}
          />
          <button type="submit" style={{ width: '100%' }}>Sign In</button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Meetings</h2>
      <form onSubmit={addMeeting} style={{ marginBottom: 16 }}>
        <input
          value={newMeeting}
          onChange={e => setNewMeeting(e.target.value)}
          placeholder="New meeting title"
          style={{ width: '70%', marginRight: 8 }}
        />
        <button type="submit">Add</button>
      </form>
      <ul style={{ padding: 0 }}>
        {meetings.map(m => (
          <li key={m.id} style={{ listStyle: 'none', marginBottom: 8 }}>
            {editId === m.id ? (
              <>
                <input
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  style={{ width: '60%' }}
                />
                <button onClick={() => saveEdit(m.id)} style={{ marginLeft: 4 }}>Save</button>
                <button onClick={() => setEditId(null)} style={{ marginLeft: 4 }}>Cancel</button>
              </>
            ) : (
              <>
                {m.title}
                <button onClick={() => startEdit(m.id, m.title)} style={{ marginLeft: 8 }}>Edit</button>
                <button onClick={() => deleteMeeting(m.id)} style={{ marginLeft: 4 }}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <button onClick={() => setToken('')} style={{ marginTop: 16 }}>Logout</button>
    </div>
  );
}

export default App;
