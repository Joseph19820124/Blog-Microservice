import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentCreate from './CommentCreate';
import CommentList from './CommentList';

const PostList = () => {
  const [posts, setPosts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:4000/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="loading" data-testid="loading-container" aria-label="Loading">
        <div className="loading-spinner" data-testid="loading-spinner" aria-label="Loading spinner"></div>
      </div>
    );
  }

  const postsArray = Object.values(posts || {});

  if (postsArray.length === 0) {
    return (
      <div className="empty-state" data-testid="empty-state" aria-label="Empty state">
        <h3>📝 No posts yet</h3>
        <p>Be the first to share your thoughts!</p>
      </div>
    );
  }

  const renderedPosts = postsArray.map((post, index) => {
    return (
      <div className="post-card fade-in" key={post.id || `post-${index}`}>
        <h3 className="post-title">{post.title}</h3>
        
        <div className="comments-section" data-testid="comments-section" aria-label="Comments section">
          <CommentList postId={post.id} />
          <CommentCreate postId={post.id} />
        </div>
      </div>
    );
  });

  return (
    <div className="posts-grid" data-testid="posts-grid" aria-label="Posts grid">
      {renderedPosts}
    </div>
  );
};

export default PostList;