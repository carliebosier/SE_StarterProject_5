import React, { useState, useEffect } from 'react';
import { signInWithGoogle, signOutUser, getCurrentUser, onAuthStateChange } from '../firebase/authService';
import './AuthButton.css';

function AuthButton({ onUserChange }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
    if (onUserChange) {
      onUserChange(currentUser);
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      if (onUserChange) {
        onUserChange(user);
      }
    });

    return () => unsubscribe();
  }, [onUserChange]);

  const handleSignIn = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    if (result.success) {
      setUser(result.user);
      if (onUserChange) {
        onUserChange(result.user);
      }
    } else {
      alert(`Sign in failed: ${result.error}`);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    const result = await signOutUser();
    if (result.success) {
      setUser(null);
      if (onUserChange) {
        onUserChange(null);
      }
    } else {
      alert(`Sign out failed: ${result.error}`);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="auth-button loading">Loading...</div>;
  }

  return (
    <div className="auth-button">
      {user ? (
        <div className="user-info">
          <img 
            src={user.photoURL || '/default-avatar.png'} 
            alt={user.displayName || 'User'} 
            className="user-avatar"
          />
          <span className="user-name">{user.displayName || user.email}</span>
          <button onClick={handleSignOut} className="sign-out-btn">
            Sign Out
          </button>
        </div>
      ) : (
        <button onClick={handleSignIn} className="sign-in-btn">
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: '8px' }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Sign in with Google
        </button>
      )}
    </div>
  );
}

export default AuthButton;

