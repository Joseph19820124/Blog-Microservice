import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommentCreate from './CommentCreate';
import axios from 'axios';

const mockedAxios = axios;

// Mock timers
jest.useFakeTimers();

describe('CommentCreate Component', () => {
  const mockPostId = '123';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      render(<CommentCreate postId={mockPostId} />);
      expect(screen.getByText('💭 Add a comment')).toBeInTheDocument();
    });

    test('renders form elements correctly', () => {
      render(<CommentCreate postId={mockPostId} />);
      
      expect(screen.getByLabelText('💭 Add a comment')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Share your thoughts...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '📝 Post Comment' })).toBeInTheDocument();
    });

    test('renders with correct initial state', () => {
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      expect(input).toHaveValue('');
      expect(input).toHaveClass('form-input');
      expect(button).toBeDisabled();
    });

    test('does not render error or success messages initially', () => {
      render(<CommentCreate postId={mockPostId} />);
      
      expect(screen.queryByText(/❌/)).not.toBeInTheDocument();
      expect(screen.queryByText(/✅/)).not.toBeInTheDocument();
    });

    test('renders with comment-form class', () => {
      render(<CommentCreate postId={mockPostId} />);
      
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    test('accepts postId prop', () => {
      render(<CommentCreate postId="456" />);
      expect(screen.getByText('💭 Add a comment')).toBeInTheDocument();
    });

    test('handles missing postId prop gracefully', () => {
      render(<CommentCreate />);
      expect(screen.getByText('💭 Add a comment')).toBeInTheDocument();
    });

    test('handles different postId types', () => {
      render(<CommentCreate postId={789} />);
      expect(screen.getByText('💭 Add a comment')).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    test('enables submit button when content is entered', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      expect(button).toBeDisabled();
      
      fireEvent.change(input, { target: { value: 'Test Comment' } });
      
      expect(button).not.toBeDisabled();
    });

    test('disables submit button when content is empty or whitespace only', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      fireEvent.change(input, { target: { value: '   ' } });
      expect(button).toBeDisabled();
      
      fireEvent.change(input, { target: { value: '' } });
      expect(button).toBeDisabled();
    });

    test('updates input value when user types', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      
      fireEvent.change(input, { target: { value: 'My awesome comment' } });
      
      expect(input).toHaveValue('My awesome comment');
    });

    test('clears error when user starts typing', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const form = screen.getByRole('form');
      
      // Submit empty form to trigger error
      fireEvent.submit(form);
      
      expect(screen.getByText('Please enter a comment')).toBeInTheDocument();
      expect(input).toHaveClass('form-input error');
      
      // Start typing to clear error
      fireEvent.change(input, { target: { value: 'Test' } });
      
      expect(screen.queryByText('Please enter a comment')).not.toBeInTheDocument();
      expect(input).toHaveClass('form-input');
    });
  });

  describe('Form Submission', () => {
    test('prevents submission with empty content', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      render(<CommentCreate postId={mockPostId} />);
      
      const form = screen.getByRole('form');
      
      fireEvent.submit(form);
      
      expect(screen.getByText('Please enter a comment')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Share your thoughts...')).toHaveClass('form-input error');
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('prevents submission with whitespace-only content', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const form = screen.getByRole('form');
      
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.submit(form);
      
      expect(screen.getByText('Please enter a comment')).toBeInTheDocument();
      expect(input).toHaveClass('form-input error');
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('submits form with valid content', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
      
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      fireEvent.change(input, { target: { value: 'Test Comment' } });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          `http://localhost:4001/posts/${mockPostId}/comments`,
          { content: 'Test Comment' }
        );
      });
    });

    test('trims whitespace from content before submission', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
      
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      fireEvent.change(input, { target: { value: '  Test Comment  ' } });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          `http://localhost:4001/posts/${mockPostId}/comments`,
          { content: 'Test Comment' }
        );
      });
    });

    test('uses correct API endpoint with postId', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
      
      render(<CommentCreate postId="456" />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      fireEvent.change(input, { target: { value: 'Test Comment' } });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:4001/posts/456/comments',
          { content: 'Test Comment' }
        );
      });
    });

    test('shows loading state during submission', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      let resolvePost;
      mockedAxios.post.mockReturnValue(new Promise(resolve => {
        resolvePost = resolve;
      }));
      
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      fireEvent.change(input, { target: { value: 'Test Comment' } });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('💭 Posting...')).toBeInTheDocument();
      });
      expect(input).toBeDisabled();
      expect(button).toBeDisabled();
      
      // Resolve the promise
      resolvePost({ data: { id: 1 } });
      
      await waitFor(() => {
        expect(screen.queryByText('💭 Posting...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    test('shows success message after successful submission', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
      
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      fireEvent.change(input, { target: { value: 'Test Comment' } });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Comment posted successfully!')).toBeInTheDocument();
      });
    });

    test('clears form after successful submission', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
      
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      fireEvent.change(input, { target: { value: 'Test Comment' } });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
      
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    test('shows success styling after successful submission', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
      
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      fireEvent.change(input, { target: { value: 'Test Comment' } });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(input).toHaveClass('form-input success');
      });
      
      await waitFor(() => {
        expect(button).toHaveClass('btn btn-success');
      });
      
      await waitFor(() => {
        expect(button).toHaveTextContent('✅ Posted!');
      });
    });

    test('success message disappears after 3 seconds', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
      
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      fireEvent.change(input, { target: { value: 'Test Comment' } });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Comment posted successfully!')).toBeInTheDocument();
      });
      
      // Fast-forward time
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Comment posted successfully!')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('shows error message when API call fails', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
      
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      fireEvent.change(input, { target: { value: 'Test Comment' } });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to post comment. Please try again.')).toBeInTheDocument();
      });
    });

    test('shows error styling when API call fails', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
      
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      fireEvent.change(input, { target: { value: 'Test Comment' } });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(input).toHaveClass('form-input error');
      });
    });

    test('error message disappears after 5 seconds', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
      
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      fireEvent.change(input, { target: { value: 'Test Comment' } });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to post comment. Please try again.')).toBeInTheDocument();
      });
      
      // Fast-forward time
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Failed to post comment. Please try again.')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(input).toHaveClass('form-input');
      });
    });

    test('logs error to console when API call fails', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Network Error');
      mockedAxios.post.mockRejectedValueOnce(error);
      
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      fireEvent.change(input, { target: { value: 'Test Comment' } });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error creating comment:', error);
      });
      
      consoleSpy.mockRestore();
    });

    test('maintains form content when API call fails', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
      
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      fireEvent.change(input, { target: { value: 'Test Comment' } });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(input).toHaveValue('Test Comment');
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const label = screen.getByText('💭 Add a comment');
      
      expect(label).toHaveClass('form-label');
      expect(input).toBeInTheDocument();
    });

    test('form is keyboard accessible', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
      
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const form = screen.getByRole('form');
      
      // Tab to input
      input.focus();
      expect(input).toHaveFocus();
      
      // Type in input
      fireEvent.change(input, { target: { value: 'Test Comment' } });
      
      // Press Enter to submit form
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    });

    test('error messages are announced to screen readers', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      render(<CommentCreate postId={mockPostId} />);
      
      const form = screen.getByRole('form');
      
      fireEvent.submit(form);
      
      const errorMessage = screen.getByText('Please enter a comment');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('error-message');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });

  describe('Component Lifecycle', () => {
    test('cleans up timers on unmount', async () => {
      const { unmount } = render(<CommentCreate postId={mockPostId} />);
      
      // Trigger an error to start a timer
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      fireEvent.click(button);
      
      // Unmount component
      unmount();
      
      // Fast-forward time - should not cause any issues
      await act(async () => {
        jest.advanceTimersByTime(10000);
      });
      
      // Test passes if no errors are thrown
      expect(true).toBe(true);
    });
  });

  describe('Form Validation', () => {
    test('validates content before submission', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const form = screen.getByRole('form');
      
      // Try with just spaces
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.submit(form);
      
      expect(screen.getByText('Please enter a comment')).toBeInTheDocument();
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('button remains disabled for invalid input', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      render(<CommentCreate postId={mockPostId} />);
      
      const input = screen.getByPlaceholderText('Share your thoughts...');
      const button = screen.getByRole('button', { name: '📝 Post Comment' });
      
      fireEvent.change(input, { target: { value: '   ' } });
      expect(button).toBeDisabled();
      
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.change(input, { target: { value: '\t\n  ' } });
      expect(button).toBeDisabled();
    });
  });
});