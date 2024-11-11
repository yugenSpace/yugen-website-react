// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Chat from './pages/Chat';
import ProtectedRoute from './components/Auth/ProtectedRoute';

const App = () => {
  const clientId = "349396859011-p98eqcggr5qjque7v1bc16d7gpeft9b8.apps.googleusercontent.com"; 

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;