import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Auth from './Auth.jsx'
import './index.css'

function Root() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) return <Auth onLogin={() => setLoggedIn(true)} />;
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
