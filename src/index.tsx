import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // Disabling strict mode because it's causing duplicate web players to be
  // registered.
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
