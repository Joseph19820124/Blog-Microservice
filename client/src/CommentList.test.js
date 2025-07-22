import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommentList from './CommentList';
import axios from 'axios';

const mockedAxios = axios;

describe('CommentList Component', () => {
  const mockPostId = '123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      render(<CommentList postId={mockPostId} />);
      expect(mockedAxios.get).toHaveBeenCalledWith(`http://localhost:4001/posts/${mockPostId}/comments`);
    });

    test('makes API call on mount with correct postId', () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      render(<CommentList postId="456" />);
      
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:4001/posts/456/comments');
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    test('renders comments title with count', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('💬 Comments (0)')).toBeInTheDocument();
      });
    });
  });

  describe('Props Handling', () => {
    test('handles different postId types', () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      render(<CommentList postId={789} />);
      
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:4001/posts/789/comments');
    });

    test('handles missing postId prop gracefully', () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      render(<CommentList />);
      
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:4001/posts/undefined/comments');
    });

    test('re-fetches data when postId changes', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });
      
      const { rerender } = render(<CommentList postId="123" />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:4001/posts/123/comments');
      });
      
      rerender(<CommentList postId="456" />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:4001/posts/456/comments');
      });
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Loading State', () => {
    test('shows loading spinner initially', () => {
      let resolveGet;
      mockedAxios.get.mockReturnValue(new Promise(resolve => {
        resolveGet = resolve;
      }));
      
      render(<CommentList postId={mockPostId} />);
      
      expect(screen.getByText('💬 Comments')).toBeInTheDocument();
      
      const loadingElements = screen.getAllByRole('generic');
      const commentsSection = loadingElements.find(el => el.className.includes('comments-section'));
      const loadingDiv = loadingElements.find(el => el.className.includes('loading'));
      
      expect(commentsSection).toBeInTheDocument();
      expect(loadingDiv).toBeInTheDocument();
      
      // Clean up
      resolveGet({ data: [] });
    });

    test('loading state has correct structure', () => {
      let resolveGet;
      mockedAxios.get.mockReturnValue(new Promise(resolve => {
        resolveGet = resolve;
      }));
      
      render(<CommentList postId={mockPostId} />);
      
      const loadingElements = screen.getAllByRole('generic');
      const commentsSection = loadingElements.find(el => el.className.includes('comments-section'));
      const loadingDiv = loadingElements.find(el => el.className.includes('loading'));
      
      expect(commentsSection).toHaveClass('comments-section');
      expect(loadingDiv).toHaveClass('loading');
      
      // Clean up
      resolveGet({ data: [] });
    });

    test('hides loading spinner after data loads', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.queryByRole('generic', { name: /loading/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    test('shows empty state when no comments', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('💬 Comments (0)')).toBeInTheDocument();
      });
    });

    test('empty state has correct structure', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        const emptyStateElements = screen.getAllByRole('generic');
        const emptyStateElement = emptyStateElements.find(el => el.className.includes('empty-state'));
        expect(emptyStateElement).toHaveClass('empty-state');
      });
    });
  });

  describe('Comments Rendering', () => {
    test('renders single comment correctly', async () => {
      const mockComments = [
        { id: '1', content: 'Test comment 1', status: 'approved' }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockComments });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test comment 1')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('💬 Comments (1)')).toBeInTheDocument();
      });
    });

    test('renders multiple comments correctly', async () => {
      const mockComments = [
        { id: '1', content: 'Test comment 1', status: 'approved' },
        { id: '2', content: 'Test comment 2', status: 'approved' },
        { id: '3', content: 'Test comment 3', status: 'approved' }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockComments });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test comment 1')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Test comment 2')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Test comment 3')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('💬 Comments (3)')).toBeInTheDocument();
      });
    });

    test('each comment has correct structure', async () => {
      const mockComments = [
        { id: '1', content: 'Test comment 1', status: 'approved' },
        { id: '2', content: 'Test comment 2', status: 'pending' }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockComments });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        const commentsList = screen.getByRole('list');
        expect(commentsList).toHaveClass('comments-list');
      });
      
      await waitFor(() => {
        const commentItems = screen.getAllByRole('listitem');
        expect(commentItems).toHaveLength(2);
      });
      
      await waitFor(() => {
        const commentItems = screen.getAllByRole('listitem');
        expect(commentItems[0]).toHaveClass('comment-item approved');
      });
      
      await waitFor(() => {
        const commentItems = screen.getAllByRole('listitem');
        expect(commentItems[1]).toHaveClass('comment-item pending');
      });
    });

    test('updates comment count correctly', async () => {
      const mockComments = [
        { id: '1', content: 'Comment 1', status: 'approved' },
        { id: '2', content: 'Comment 2', status: 'pending' },
        { id: '3', content: 'Comment 3', status: 'rejected' }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockComments });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('💬 Comments (3)')).toBeInTheDocument();
      });
    });
  });

  describe('Comment Status Handling', () => {
    test('shows approved comments correctly', async () => {
      const mockComments = [
        { id: '1', content: 'Approved comment', status: 'approved' }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockComments });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Approved comment')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        const commentItems = screen.getAllByRole('listitem');
        expect(commentItems[0]).toHaveClass('comment-item approved');
      });
    });

    test('shows pending comments with moderation message', async () => {
      const mockComments = [
        { id: '1', content: 'Pending comment', status: 'pending' }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockComments });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('⏳ This comment is awaiting moderation')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        const commentItems = screen.getAllByRole('listitem');
        expect(commentItems[0]).toHaveClass('comment-item pending');
      });
    });

    test('shows rejected comments with rejection message', async () => {
      const mockComments = [
        { id: '1', content: 'Rejected comment', status: 'rejected' }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockComments });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('❌ This comment has been rejected')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        const commentItems = screen.getAllByRole('listitem');
        expect(commentItems[0]).toHaveClass('comment-item rejected');
      });
    });

    test('shows comments with unknown status as content', async () => {
      const mockComments = [
        { id: '1', content: 'Unknown status comment', status: 'unknown' }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockComments });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Unknown status comment')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        const commentItems = screen.getAllByRole('listitem');
        expect(commentItems[0]).toHaveClass('comment-item unknown');
      });
    });

    test('shows comments with no status as content', async () => {
      const mockComments = [
        { id: '1', content: 'No status comment' }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockComments });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('No status comment')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        const commentItems = screen.getAllByRole('listitem');
        expect(commentItems[0]).toHaveClass('comment-item undefined');
      });
    });

    test('handles mixed status comments correctly', async () => {
      const mockComments = [
        { id: '1', content: 'Approved comment', status: 'approved' },
        { id: '2', content: 'Pending comment', status: 'pending' },
        { id: '3', content: 'Rejected comment', status: 'rejected' }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockComments });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Approved comment')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('⏳ This comment is awaiting moderation')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('❌ This comment has been rejected')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles API error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching comments:', expect.any(Error));
      });
      
      // Should show empty state when error occurs
      await waitFor(() => {
        expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('💬 Comments (0)')).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });

    test('stops loading state even when API fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.queryByRole('generic', { name: /loading/i })).not.toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });

    test('handles malformed API response', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: null });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
      });
    });

    test('handles comments without required fields', async () => {
      const mockComments = [
        { id: '1', status: 'approved' }, // Missing content
        { content: 'Test comment' }, // Missing id
        { id: '3', content: 'Complete comment', status: 'approved' } // Complete
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockComments });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Complete comment')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Test comment')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('💬 Comments (3)')).toBeInTheDocument();
      });
    });
  });

  describe('Component Structure', () => {
    test('has correct heading structure', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        const heading = screen.getByText('💬 Comments (0)');
        expect(heading.tagName).toBe('H4');
      });
      
      await waitFor(() => {
        const heading = screen.getByText('💬 Comments (0)');
        expect(heading).toHaveClass('comments-title');
      });
    });

    test('renders comments list with correct structure', async () => {
      const mockComments = [
        { id: '1', content: 'Test comment', status: 'approved' }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockComments });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        const commentsList = screen.getByRole('list');
        expect(commentsList).toHaveClass('comments-list');
      });
      
      await waitFor(() => {
        const commentItems = screen.getAllByRole('listitem');
        expect(commentItems).toHaveLength(1);
      });
      
      await waitFor(() => {
        const commentItems = screen.getAllByRole('listitem');
        expect(commentItems[0]).toHaveClass('comment-item approved');
      });
    });

    test('does not render comments list when empty', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    test('only makes one API call on mount', () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      
      render(<CommentList postId={mockPostId} />);
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    test('uses useCallback for fetchData optimization', () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      
      const { rerender } = render(<CommentList postId={mockPostId} />);
      rerender(<CommentList postId={mockPostId} />);
      
      // Should only call once because postId hasn't changed
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    test('re-fetches when postId changes', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });
      
      const { rerender } = render(<CommentList postId="123" />);
      
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:4001/posts/123/comments');
      
      rerender(<CommentList postId="456" />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:4001/posts/456/comments');
      });
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Accessibility', () => {
    test('uses proper list structure for comments', async () => {
      const mockComments = [
        { id: '1', content: 'Comment 1', status: 'approved' },
        { id: '2', content: 'Comment 2', status: 'pending' }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockComments });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        const commentsList = screen.getByRole('list');
        expect(commentsList).toBeInTheDocument();
      });
      
      await waitFor(() => {
        const commentItems = screen.getAllByRole('listitem');
        expect(commentItems).toHaveLength(2);
      });
    });

    test('has proper heading levels', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 4 });
        expect(heading).toHaveTextContent('💬 Comments (0)');
      });
    });

    test('provides meaningful content for screen readers', async () => {
      const mockComments = [
        { id: '1', content: 'Great post!', status: 'approved' },
        { id: '2', content: 'Waiting for approval', status: 'pending' }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockComments });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Great post!')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('⏳ This comment is awaiting moderation')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles empty string postId', () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      
      render(<CommentList postId="" />);
      
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:4001/posts//comments');
    });

    test('handles very large comment lists', async () => {
      const mockComments = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i + 1}`,
        content: `Comment ${i + 1}`,
        status: 'approved'
      }));
      mockedAxios.get.mockResolvedValueOnce({ data: mockComments });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('💬 Comments (1000)')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Comment 1')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Comment 1000')).toBeInTheDocument();
      });
    });

    test('handles comments with special characters', async () => {
      const mockComments = [
        { id: '1', content: 'Special chars: <>&"\'', status: 'approved' },
        { id: '2', content: 'Emoji comment 😀🎉', status: 'approved' }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockComments });
      
      render(<CommentList postId={mockPostId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Special chars: <>&"\'')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Emoji comment 😀🎉')).toBeInTheDocument();
      });
    });
  });
});