// src/components/Auth/LoginButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';

const LoginButton = ({ className, children }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        });

        const userInfo = await userInfoResponse.json();
        
        login({
          ...userInfo,
          access_token: response.access_token,
        });

        navigate('/chat');
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    },
    onError: () => {
      console.log('Login Failed');
    },
  });

  return (
    <button
      onClick={() => googleLogin()}
      className={className}
    >
      {children}
    </button>
  );
};

export default LoginButton;