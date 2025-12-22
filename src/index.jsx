import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import the global styles
import App from './app.jsx'; // Import the main App component

// Find the root element in public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component into the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
