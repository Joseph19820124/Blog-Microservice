import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommentCreate = ({ postId }) => {
  const [content, setContent] = useState('');
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
    
    if (!content.trim()) {
      setError('Please enter a comment');
      setInputClass('form-input error');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setInputClass('form-input');
    
    try {
      await axios.post(`http://localhost:4001/posts/${postId}/comments`, {
        content: content.trim()
      });
      setContent('');
      setSuccess(true);
      setInputClass('form-input success');
    } catch (error) {
      console.error('Error creating comment:', error);
      setError('Failed to post comment. Please try again.');
      setInputClass('form-input error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comment-form">
      {error && (
        <div className="error-message" id="error-message" role="alert">
          <span>❌</span>
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <span>✅</span>
          Comment posted successfully!
        </div>
      )}
      
      <form onSubmit={onSubmit} aria-label="Add a comment">
        <div className="form-group">
          <label className="form-label" htmlFor="comment-input">💭 Add a comment</label>
          <input
            id="comment-input"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) {
                setError('');
                setInputClass('form-input');
              }
            }}
            className={inputClass}
            placeholder="Share your thoughts..."
            disabled={isSubmitting}
            aria-describedby={error ? 'error-message' : undefined}
          />
        </div>
        <button 
          type="submit" 
          className={`btn ${success ? 'btn-success' : 'btn-primary'}`}
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? '💭 Posting...' : success ? '✅ Posted!' : '📝 Post Comment'}
        </button>
      </form>
    </div>
  );
};

export default CommentCreate;