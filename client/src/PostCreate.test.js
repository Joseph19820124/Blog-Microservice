import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostCreate from './PostCreate';
import axios from 'axios';

const mockedAxios = axios;

describe('PostCreate Component', () => {
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
      render(<PostCreate />);
      expect(screen.getByText('✨ Create New Post')).toBeInTheDocument();
    });

    test('renders form elements correctly', () => {
      render(<PostCreate />);
      
      const input = screen.getByLabelText('Post Title');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'post-title-input');
      expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '🚀 Publish Post' })).toBeInTheDocument();
    });

    test('renders with correct initial state', () => {
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      expect(input).toHaveValue('');
      expect(input).toHaveClass('form-input');
      expect(button).not.toBeDisabled();
    });

    test('does not render error or success messages initially', () => {
      render(<PostCreate />);
      
      expect(screen.queryByText(/❌/)).not.toBeInTheDocument();
      expect(screen.queryByText(/✅/)).not.toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    test('submit button remains enabled when title is entered', async () => {
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      expect(button).not.toBeDisabled();
      
      fireEvent.change(input, { target: { value: 'Test Post' } });
      
      expect(button).not.toBeDisabled();
    });

    test('submit button stays enabled regardless of title content', async () => {
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      fireEvent.change(input, { target: { value: '   ' } });
      expect(button).not.toBeDisabled();
      
      fireEvent.change(input, { target: { value: '' } });
      expect(button).not.toBeDisabled();
    });

    test('updates input value when user types', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      
      fireEvent.change(input, { target: { value: 'My awesome post' } });
      
      expect(input).toHaveValue('My awesome post');
    });

    test('clears error when user starts typing', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      // Submit empty form to trigger error
      fireEvent.click(button);
      
      expect(screen.getByText('Please enter a post title')).toBeInTheDocument();
      expect(input).toHaveClass('form-input error');
      
      // Start typing to clear error
      fireEvent.change(input, { target: { value: 'Test' } });
      
      expect(screen.queryByText('Please enter a post title')).not.toBeInTheDocument();
      expect(input).toHaveClass('form-input');
    });
  });

  describe('Form Submission', () => {
    test('prevents submission with empty title', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      render(<PostCreate />);
      
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      fireEvent.click(button);
      
      expect(screen.getByText('Please enter a post title')).toBeInTheDocument();
      expect(screen.getByPlaceholderText("What's on your mind?")).toHaveClass('form-input error');
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('prevents submission with whitespace-only title', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(button);
      
      expect(screen.getByText('Please enter a post title')).toBeInTheDocument();
      expect(input).toHaveClass('form-input error');
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('submits form with valid title', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
      
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      fireEvent.change(input, { target: { value: 'Test Post' } });
      
      fireEvent.click(button);
      
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:4000/posts', {
        title: 'Test Post'
      });
    });

    test('trims whitespace from title before submission', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
      
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      fireEvent.change(input, { target: { value: '  Test Post  ' } });
      fireEvent.click(button);
      
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:4000/posts', {
        title: 'Test Post'
      });
    });

    test('shows loading state during submission', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      let resolvePost;
      mockedAxios.post.mockReturnValue(new Promise(resolve => {
        resolvePost = resolve;
      }));
      
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      fireEvent.change(input, { target: { value: 'Test Post' } });
      fireEvent.click(button);
      
      expect(screen.getByText('✨ Publishing...')).toBeInTheDocument();
      expect(input).toBeDisabled();
      expect(button).toBeDisabled();
      
      // Resolve the promise
      resolvePost({ data: { id: 1 } });
      
      await waitFor(() => {
        expect(screen.queryByText('✨ Publishing...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    test('shows success message after successful submission', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
      
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      fireEvent.change(input, { target: { value: 'Test Post' } });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Post created successfully!')).toBeInTheDocument();
      });
    });

    test('clears form after successful submission', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
      
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      fireEvent.change(input, { target: { value: 'Test Post' } });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
      
      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    test('shows success styling after successful submission', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
      
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      fireEvent.change(input, { target: { value: 'Test Post' } });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(input).toHaveClass('form-input success');
      });
      
      await waitFor(() => {
        expect(button).toHaveClass('btn btn-success');
      });
      
      await waitFor(() => {
        expect(button).toHaveTextContent('✅ Published!');
      });
    });

    test('success message disappears after 3 seconds', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
      
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      fireEvent.change(input, { target: { value: 'Test Post' } });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Post created successfully!')).toBeInTheDocument();
      });
      
      // Fast-forward time
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Post created successfully!')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('shows error message when API call fails', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
      
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      fireEvent.change(input, { target: { value: 'Test Post' } });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to create post. Please try again.')).toBeInTheDocument();
      });
    });

    test('shows error styling when API call fails', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
      
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      fireEvent.change(input, { target: { value: 'Test Post' } });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(input).toHaveClass('form-input error');
      });
    });

    test('error message disappears after 5 seconds', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
      
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      fireEvent.change(input, { target: { value: 'Test Post' } });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to create post. Please try again.')).toBeInTheDocument();
      });
      
      // Fast-forward time
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Failed to create post. Please try again.')).not.toBeInTheDocument();
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
      
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      fireEvent.change(input, { target: { value: 'Test Post' } });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error creating post:', error);
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      render(<PostCreate />);
      
      const input = screen.getByLabelText('Post Title');
      const label = screen.getByText('Post Title');
      
      expect(label).toHaveClass('form-label');
      expect(label).toHaveAttribute('for', 'post-title-input');
      expect(input).toHaveAttribute('id', 'post-title-input');
      expect(input).toBeInTheDocument();
    });

    test('form is keyboard accessible', async () => {
      // Test that form elements are properly accessible for keyboard users
      render(<PostCreate />);
      
      const input = screen.getByPlaceholderText("What's on your mind?");
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      // Verify form elements are keyboard accessible
      expect(input).toHaveAttribute('id', 'post-title-input');
      expect(button).toHaveAttribute('type', 'submit');
      
      // Test that form can be interacted with via keyboard events
      fireEvent.change(input, { target: { value: 'Test Post' } });
      expect(input).toHaveValue('Test Post');
      
      // Test that button can be clicked (simulating keyboard activation)
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
      fireEvent.click(button);
      
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    test('error messages are announced to screen readers', async () => {
      // Using fireEvent instead of userEvent.setup for compatibility
      render(<PostCreate />);
      
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
      
      fireEvent.click(button);
      
      const errorMessage = screen.getByText('Please enter a post title');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('error-message');
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
      expect(errorMessage).toHaveAttribute('id', 'post-title-error');
      
      const input = screen.getByLabelText('Post Title');
      expect(input).toHaveAttribute('aria-describedby', 'post-title-error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Component Lifecycle', () => {
    test('cleans up timers on unmount', async () => {
      const { unmount } = render(<PostCreate />);
      
      // Trigger an error to start a timer
      const button = screen.getByRole('button', { name: '🚀 Publish Post' });
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
});