import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

// Device detection: sets data-device attribute on <html> for CSS targeting
function detectDevice() {
  const w = window.innerWidth;
  let device = 'laptop';
  if (w <= 767) device = 'mobile';
  else if (w <= 1199) device = 'tablet';
  try {
    document.documentElement.setAttribute('data-device', device);
  } catch (e) {
    // ignore in non-browser environments
  }
}

detectDevice();
let __resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(__resizeTimer);
  __resizeTimer = setTimeout(detectDevice, 150);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
