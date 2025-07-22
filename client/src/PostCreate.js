import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PostCreate = () => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [inputClass, setInputClass] = useState('form-input');

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
        setInputClass('form-input');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const onSubmit = async (event) => {
    event.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a post title');
      setInputClass('form-input error');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setInputClass('form-input');
    
    try {
      await axios.post('http://localhost:4000/posts', {
        title: title.trim()
      });
      setTitle('');
      setSuccess(true);
      setInputClass('form-input success');
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
      setInputClass('form-input error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-create-container fade-in">
      <h2 className="post-create-title">✨ Create New Post</h2>
      
      {error && (
        <div id="post-title-error" className="error-message" role="alert" aria-live="polite">
          <span>❌</span>
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <span>✅</span>
          Post created successfully!
        </div>
      )}
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="post-title-input" className="form-label">Post Title</label>
          <input
            id="post-title-input"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) {
                setError('');
                setInputClass('form-input');
              }
            }}
            className={inputClass}
            placeholder="What's on your mind?"
            disabled={isSubmitting}
            aria-describedby={error ? 'post-title-error' : undefined}
            aria-invalid={!!error}
          />
        </div>
        <button 
          type="submit" 
          className={`btn ${success ? 'btn-success' : 'btn-primary'}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? '✨ Publishing...' : success ? '✅ Published!' : '🚀 Publish Post'}
        </button>
      </form>
    </div>
  );
};

export default PostCreate;