import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostList from './PostList';
import axios from 'axios';

const mockedAxios = axios;

// Mock child components
jest.mock('./CommentCreate', () => {
  return function MockCommentCreate({ postId }) {
    return <div data-testid={`comment-create-${postId}`}>Comment Create for Post {postId}</div>;
  };
});

jest.mock('./CommentList', () => {
  return function MockCommentList({ postId }) {
    return <div data-testid={`comment-list-${postId}`}>Comment List for Post {postId}</div>;
  };
});

describe('PostList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders without crashing', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });
      render(<PostList />);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:4000/posts');
    });

    test('makes API call on mount', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });
      render(<PostList />);
      
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:4000/posts');
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    test('shows loading spinner initially', async () => {
      let resolveGet;
      mockedAxios.get.mockReturnValue(new Promise(resolve => {
        resolveGet = resolve;
      }));
      
      render(<PostList />);
      
      expect(screen.getByTestId('loading-container')).toBeInTheDocument();
      expect(screen.getByTestId('loading-container')).toHaveClass('loading');
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      
      // Clean up
      await act(async () => {
        resolveGet({ data: {} });
      });
    });

    test('loading spinner has correct structure', async () => {
      let resolveGet;
      mockedAxios.get.mockReturnValue(new Promise(resolve => {
        resolveGet = resolve;
      }));
      
      render(<PostList />);
      
      const loadingContainer = screen.getByTestId('loading-container');
      expect(loadingContainer).toHaveClass('loading');
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      
      // Clean up
      await act(async () => {
        resolveGet({ data: {} });
      });
    });

    test('hides loading spinner after data loads', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-container')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    test('shows empty state when no posts', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByText('📝 No posts yet')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Be the first to share your thoughts!')).toBeInTheDocument();
      });
    });

    test('empty state has correct structure', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByText('📝 No posts yet')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toHaveClass('empty-state');
      });
    });

    test('shows empty state for empty object', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByText('📝 No posts yet')).toBeInTheDocument();
      });
    });
  });

  describe('Posts Rendering', () => {
    test('renders single post correctly', async () => {
      const mockPosts = {
        '1': { id: '1', title: 'Test Post 1' }
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockPosts });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      });
    });

    test('renders multiple posts correctly', async () => {
      const mockPosts = {
        '1': { id: '1', title: 'Test Post 1' },
        '2': { id: '2', title: 'Test Post 2' },
        '3': { id: '3', title: 'Test Post 3' }
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockPosts });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Test Post 2')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Test Post 3')).toBeInTheDocument();
      });
    });

    test('each post has correct structure', async () => {
      const mockPosts = {
        '1': { id: '1', title: 'Test Post 1' },
        '2': { id: '2', title: 'Test Post 2' }
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockPosts });
      
      render(<PostList />);
      
      await waitFor(() => {
        const postCards = screen.getAllByRole('generic').filter(el => 
          el.className.includes('post-card')
        );
        expect(postCards).toHaveLength(2);
        
        postCards.forEach(card => {
          expect(card).toHaveClass('post-card fade-in');
        });
      });
    });

    test('each post has correct title styling', async () => {
      const mockPosts = {
        '1': { id: '1', title: 'Test Post 1' }
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockPosts });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toHaveClass('post-title');
      });
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: 'Test Post 1' })).toBeInTheDocument();
      });
    });

    test('renders posts grid container', async () => {
      const mockPosts = {
        '1': { id: '1', title: 'Test Post 1' }
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockPosts });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('posts-grid')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('posts-grid')).toHaveClass('posts-grid');
      });
    });
  });

  describe('Comment Components Integration', () => {
    test('renders CommentList for each post', async () => {
      const mockPosts = {
        '1': { id: '1', title: 'Test Post 1' },
        '2': { id: '2', title: 'Test Post 2' }
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockPosts });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByTestId('comment-list-1')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('comment-list-2')).toBeInTheDocument();
      });
    });

    test('renders CommentCreate for each post', async () => {
      const mockPosts = {
        '1': { id: '1', title: 'Test Post 1' },
        '2': { id: '2', title: 'Test Post 2' }
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockPosts });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByTestId('comment-create-1')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('comment-create-2')).toBeInTheDocument();
      });
    });

    test('passes correct postId to comment components', async () => {
      const mockPosts = {
        '123': { id: '123', title: 'Test Post' }
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockPosts });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByTestId('comment-list-123')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('comment-create-123')).toBeInTheDocument();
      });
    });

    test('comment components are wrapped in comments-section', async () => {
      const mockPosts = {
        '1': { id: '1', title: 'Test Post 1' }
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockPosts });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByTestId('comment-list-1')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('comments-section')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('comments-section')).toHaveClass('comments-section');
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('comment-create-1')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles API error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching posts:', expect.any(Error));
      });
      
      // Should show empty state when error occurs
      await waitFor(() => {
        expect(screen.getByText('📝 No posts yet')).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });

    test('stops loading state even when API fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.queryByRole('generic', { name: /loading/i })).not.toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });

    test('handles malformed API response', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: null });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByText('📝 No posts yet')).toBeInTheDocument();
      });
    });

    test('handles posts without required fields', async () => {
      const mockPosts = {
        '1': { id: '1' }, // Missing title
        '2': { title: 'Test Post 2' }, // Missing id
        '3': { id: '3', title: 'Test Post 3' } // Complete
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockPosts });
      
      render(<PostList />);
      
      await waitFor(() => {
        // Should render posts that have the required fields
        expect(screen.getByText('Test Post 3')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        // Should handle missing fields gracefully
        expect(screen.getByText('Test Post 2')).toBeInTheDocument();
      });
    });
  });

  describe('Data Flow', () => {
    test('converts posts object to array correctly', async () => {
      const mockPosts = {
        '3': { id: '3', title: 'Third Post' },
        '1': { id: '1', title: 'First Post' },
        '2': { id: '2', title: 'Second Post' }
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockPosts });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Second Post')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Third Post')).toBeInTheDocument();
      });
    });

    test('handles empty posts object', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByText('📝 No posts yet')).toBeInTheDocument();
      });
    });

    test('handles posts with numeric and string IDs', async () => {
      const mockPosts = {
        '1': { id: 1, title: 'Numeric ID Post' },
        '2': { id: '2', title: 'String ID Post' }
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockPosts });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByText('Numeric ID Post')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('String ID Post')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('comment-list-1')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('comment-list-2')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    test('only makes one API call on mount', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });
      
      render(<PostList />);
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    test('does not make additional API calls on re-render', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });
      
      const { rerender } = render(<PostList />);
      rerender(<PostList />);
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    test('has proper heading structure for empty state', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: '📝 No posts yet' })).toBeInTheDocument();
      });
    });

    test('has proper heading structure for posts', async () => {
      const mockPosts = {
        '1': { id: '1', title: 'Test Post' }
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockPosts });
      
      render(<PostList />);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: 'Test Post' })).toBeInTheDocument();
      });
    });
  });
});