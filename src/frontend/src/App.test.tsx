import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock fetch and WebSocket
global.fetch = jest.fn();
global.WebSocket = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        input_devices: [
          { id: 1, name: 'Microphone 1', channels: 2 },
          { id: 2, name: 'Microphone 2', channels: 2 }
        ],
        output_devices: [
          { id: 1, name: 'Speaker 1', channels: 2 },
          { id: 2, name: 'Speaker 2', channels: 2 }
        ]
      })
    });

    // Mock WebSocket
    const mockWebSocket = {
      onopen: null,
      onmessage: null,
      onclose: null,
      send: jest.fn(),
      close: jest.fn()
    };
    (global.WebSocket as jest.Mock).mockImplementation(() => mockWebSocket);
  });

  it('renders loading state initially', () => {
    render(<App />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders audio device selection after loading', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Audio Devices')).toBeInTheDocument();
      expect(screen.getByText('Input Device')).toBeInTheDocument();
      expect(screen.getByText('Output Device')).toBeInTheDocument();
    });
  });

  it('displays speaking metrics', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Speaking Metrics')).toBeInTheDocument();
      expect(screen.getByText(/Filler Words/)).toBeInTheDocument();
      expect(screen.getByText(/Speaking Time/)).toBeInTheDocument();
      expect(screen.getByText(/Engagement Score/)).toBeInTheDocument();
    });
  });

  it('displays filler words chart', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Filler Words Over Time')).toBeInTheDocument();
    });
  });

  it('displays suggested questions section', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Suggested Questions')).toBeInTheDocument();
    });
  });
}); 