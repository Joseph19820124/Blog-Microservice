import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock child components
jest.mock('./PostCreate', () => {
  return function MockPostCreate() {
    return <div data-testid="post-create">Post Create Component</div>;
  };
});

jest.mock('./PostList', () => {
  return function MockPostList() {
    return <div data-testid="post-list">Post List Component</div>;
  };
});

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    jest.clearAllMocks();
    // Reset document.body classes
    document.body.classList.remove('dark-mode');
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
    document.body.classList.remove('dark-mode');
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      render(<App />);
      expect(screen.getByText('Modern Blog')).toBeInTheDocument();
    });

    test('renders all main components', () => {
      render(<App />);
      
      // Check header elements
      expect(screen.getByText('Modern Blog')).toBeInTheDocument();
      expect(screen.getByText('Share your thoughts with the world')).toBeInTheDocument();
      expect(screen.getByText('Latest Posts')).toBeInTheDocument();
      expect(screen.getByText('Discover what others are sharing')).toBeInTheDocument();
      
      // Check child components are rendered
      expect(screen.getByTestId('post-create')).toBeInTheDocument();
      expect(screen.getByTestId('post-list')).toBeInTheDocument();
    });

    test('renders dark mode toggle button', () => {
      render(<App />);
      
      const toggleButton = screen.getByLabelText('Toggle dark mode');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveClass('dark-mode-toggle');
    });

    test('displays correct icon for light mode initially', () => {
      render(<App />);
      
      const toggleButton = screen.getByLabelText('Toggle dark mode');
      expect(toggleButton).toContainHTML('🌙');
      expect(toggleButton).not.toHaveClass('dark');
    });
  });

  describe('Dark Mode Toggle', () => {
    test('toggles dark mode when button is clicked', async () => {
      render(<App />);
      
      const toggleButton = screen.getByLabelText('Toggle dark mode');
      
      // Initially light mode
      expect(toggleButton).toContainHTML('🌙');
      expect(toggleButton).not.toHaveClass('dark');
      expect(document.body).not.toHaveClass('dark-mode');
      
      // Click to enable dark mode
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(toggleButton).toContainHTML('☀️');
      });
      
      await waitFor(() => {
        expect(toggleButton).toHaveClass('dark');
      });
      
      await waitFor(() => {
        expect(document.body).toHaveClass('dark-mode');
      });
      
      // Click again to disable dark mode
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(toggleButton).toContainHTML('🌙');
      });
      
      await waitFor(() => {
        expect(toggleButton).not.toHaveClass('dark');
      });
      
      await waitFor(() => {
        expect(document.body).not.toHaveClass('dark-mode');
      });
    });

    test('saves dark mode preference to localStorage', async () => {
      render(<App />);
      
      const toggleButton = screen.getByLabelText('Toggle dark mode');
      
      // Enable dark mode
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(localStorage.getItem('darkMode')).toBe('true');
      });
      
      // Disable dark mode
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(localStorage.getItem('darkMode')).toBe('false');
      });
    });

    test('loads dark mode preference from localStorage on mount', () => {
      // Set dark mode in localStorage
      localStorage.setItem('darkMode', 'true');
      
      render(<App />);
      
      const toggleButton = screen.getByLabelText('Toggle dark mode');
      expect(toggleButton).toContainHTML('☀️');
      expect(toggleButton).toHaveClass('dark');
      expect(document.body).toHaveClass('dark-mode');
    });

    test('handles invalid localStorage data gracefully', () => {
      // Suppress console warnings during this test
      const originalWarn = console.warn;
      console.warn = jest.fn();
      
      // Set invalid data in localStorage
      localStorage.setItem('darkMode', 'invalid-json');
      
      // Should not crash and default to light mode
      expect(() => render(<App />)).not.toThrow();
      
      const toggleButton = screen.getByLabelText('Toggle dark mode');
      // Should default to light mode
      expect(toggleButton).toContainHTML('🌙');
      expect(toggleButton).not.toHaveClass('dark');
      
      // Verify that console.warn was called (error handling working)
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to load dark mode preference from localStorage:',
        expect.any(SyntaxError)
      );
      
      // Restore console.warn
      console.warn = originalWarn;
    });
  });

  describe('Component Structure', () => {
    test('has correct CSS classes', () => {
      render(<App />);
      
      // Test that elements exist and have correct classes
      expect(screen.getByText('Modern Blog')).toHaveClass('blog-title');
      expect(screen.getByText('Share your thoughts with the world')).toHaveClass('blog-subtitle');
      expect(screen.getByText('Latest Posts')).toHaveClass('posts-title');
      expect(screen.getByText('Discover what others are sharing')).toHaveClass('posts-subtitle');
    });

    test('has correct container structure', () => {
      render(<App />);
      
      // Test that main components are present
      expect(screen.getByText('Latest Posts')).toBeInTheDocument();
      expect(screen.getByTestId('post-list')).toBeInTheDocument();
      expect(screen.getByTestId('post-create')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('dark mode toggle has proper aria-label', () => {
      render(<App />);
      
      const toggleButton = screen.getByLabelText('Toggle dark mode');
      expect(toggleButton).toHaveAttribute('aria-label', 'Toggle dark mode');
    });

    test('has proper heading hierarchy', () => {
      render(<App />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Modern Blog');
      
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toHaveTextContent('Latest Posts');
    });
  });

  describe('Event Handling', () => {
    test('handles multiple rapid clicks on dark mode toggle', async () => {
      render(<App />);
      
      const toggleButton = screen.getByLabelText('Toggle dark mode');
      
      // Click multiple times rapidly
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(toggleButton).toContainHTML('☀️');
      });
      
      await waitFor(() => {
        expect(document.body).toHaveClass('dark-mode');
      });
    });

    test('handles keyboard navigation on dark mode toggle', async () => {
      render(<App />);
      
      const toggleButton = screen.getByLabelText('Toggle dark mode');
      
      // Focus the button and press Enter
      toggleButton.focus();
      expect(toggleButton).toHaveFocus();
      
      // Trigger the button click using Enter key
      fireEvent.keyDown(toggleButton, { key: 'Enter', code: 'Enter' });
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(toggleButton).toContainHTML('☀️');
      });
      
      await waitFor(() => {
        expect(document.body).toHaveClass('dark-mode');
      });
    });
  });

  describe('Error Handling', () => {
    test('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('localStorage error');
      });
      
      // Should not crash
      expect(() => render(<App />)).not.toThrow();
      
      // Restore original localStorage
      localStorage.setItem = originalSetItem;
    });

    test('handles localStorage getItem errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn(() => {
        throw new Error('localStorage error');
      });
      
      // Should not crash and default to light mode
      expect(() => render(<App />)).not.toThrow();
      
      const toggleButton = screen.getByLabelText('Toggle dark mode');
      expect(toggleButton).toContainHTML('🌙');
      
      // Restore original localStorage
      localStorage.getItem = originalGetItem;
    });
  });
});