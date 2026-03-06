import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { supabase } from './supabaseClient.js'
import App from './App.jsx'
import Auth from './Auth.jsx'
import './index.css'

function Root() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    supabase.auth.getSession().then(function (res) {
      setSession(res.data.session);
      setLoading(false);
    });
    var { data: listener } = supabase.auth.onAuthStateChange(function (_event, session) {
      setSession(session);
    });
    return function () { listener.subscription.unsubscribe(); };
  }, []);

  if (loading) {
    return (
      <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#666" }}>
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#fafafa", padding: 20 }}>
        <Auth onLogin={function (s) { setSession(s); }} />
      </div>
    );
  }

  return <App session={session} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
