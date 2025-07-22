import React, { useState, useEffect } from 'react';
import PostCreate from './PostCreate';
import PostList from './PostList';
import './App.css';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) {
        // Validate that the saved value is a valid JSON boolean
        const parsedMode = JSON.parse(savedMode);
        if (typeof parsedMode === 'boolean') {
          setDarkMode(parsedMode);
        } else {
          // Invalid data type, fall back to default
          console.warn('Invalid dark mode preference type in localStorage:', typeof parsedMode);
          setDarkMode(false);
        }
      }
    } catch (error) {
      // Handle localStorage errors gracefully (JSON parsing errors, access errors, etc.)
      console.warn('Failed to load dark mode preference from localStorage:', error);
      setDarkMode(false);
    }
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
    try {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    } catch (error) {
      // Handle localStorage errors gracefully
      console.warn('Failed to save dark mode preference to localStorage:', error);
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="blog-container">
      <button 
        className={`dark-mode-toggle ${darkMode ? 'dark' : ''}`}
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
      >
        <span className="icon">
          {darkMode ? '☀️' : '🌙'}
        </span>
      </button>

      <div className="blog-header">
        <h1 className="blog-title">Modern Blog</h1>
        <p className="blog-subtitle">Share your thoughts with the world</p>
      </div>
      
      <PostCreate />
      
      <div className="posts-section">
        <div className="posts-header">
          <h2 className="posts-title">Latest Posts</h2>
          <p className="posts-subtitle">Discover what others are sharing</p>
        </div>
        <PostList />
      </div>
    </div>
  );
};

export default App;