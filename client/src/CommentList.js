import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:4001/posts/${postId}/comments`);
      // Handle null, undefined, or non-array responses
      const data = response.data;
      if (Array.isArray(data)) {
        setComments(data);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getCommentContent = (comment) => {
    switch (comment.status) {
      case 'approved':
        return comment.content;
      case 'pending':
        return '⏳ This comment is awaiting moderation';
      case 'rejected':
        return '❌ This comment has been rejected';
      default:
        return comment.content;
    }
  };

  const getCommentClass = (status) => {
    return `comment-item ${status}`;
  };

  if (isLoading) {
    return (
      <div className="comments-section">
        <h4 className="comments-title">💬 Comments</h4>
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const renderedComments = comments.map(comment => {
    return (
      <li 
        key={comment.id}
        className={getCommentClass(comment.status)}
      >
        {getCommentContent(comment)}
      </li>
    );
  });

  return (
    <div>
      <h4 className="comments-title">
        💬 Comments ({comments.length})
      </h4>
      {comments.length === 0 ? (
        <div className="empty-state" style={{ padding: '1rem', fontSize: '0.9rem' }}>
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <ul className="comments-list">
          {renderedComments}
        </ul>
      )}
    </div>
  );
};

export default CommentList;