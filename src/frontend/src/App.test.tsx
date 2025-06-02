import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock WebSocket
const mockWebSocket = {
  onopen: null,
  onmessage: null,
  onclose: null,
  send: jest.fn(),
  close: jest.fn()
};
global.WebSocket = jest.fn(() => mockWebSocket) as any;

describe('App Component', () => {
  const mockDevices = {
    input_devices: [
      { id: 1, name: 'Microphone 1', channels: 2 },
      { id: 2, name: 'Microphone 2', channels: 2 }
    ],
    output_devices: [
      { id: 1, name: 'Speaker 1', channels: 2 },
      { id: 2, name: 'Speaker 2', channels: 2 }
    ]
  };

  const mockAnalysisData = {
    type: 'analysis',
    data: {
      filler_words: 5,
      speaking_time: 120,
      engagement_score: 85,
      suggested_questions: ['What are your thoughts on this topic?']
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: mockDevices });
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

  it('displays speaking metrics when receiving WebSocket data', async () => {
    render(<App />);
    
    // Simulate WebSocket message
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify(mockAnalysisData)
    });
    mockWebSocket.onmessage(messageEvent);

    await waitFor(() => {
      expect(screen.getByText('Speaking Metrics')).toBeInTheDocument();
      expect(screen.getByText('Filler Words: 5')).toBeInTheDocument();
      expect(screen.getByText('Speaking Time: 2m 0s')).toBeInTheDocument();
      expect(screen.getByText('Engagement Score: 85%')).toBeInTheDocument();
    });
  });

  it('displays suggested questions when available', async () => {
    render(<App />);
    
    // Simulate WebSocket message
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify(mockAnalysisData)
    });
    mockWebSocket.onmessage(messageEvent);

    await waitFor(() => {
      expect(screen.getByText('Suggested Questions')).toBeInTheDocument();
      expect(screen.getByText('What are your thoughts on this topic?')).toBeInTheDocument();
    });
  });

  it('handles device selection changes', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Audio Devices')).toBeInTheDocument();
    });

    const inputSelect = screen.getByLabelText('Input Device');
    fireEvent.change(inputSelect, { target: { value: 1 } });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'device_change',
        device_type: 'input',
        device_id: 1
      })
    );
  });

  it('displays error message when device fetch fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Failed to fetch'));
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch audio devices')).toBeInTheDocument();
    });
  });

  it('displays error message when WebSocket connection fails', async () => {
    render(<App />);
    
    // Simulate WebSocket error
    mockWebSocket.onerror(new Event('error'));

    await waitFor(() => {
      expect(screen.getByText('WebSocket connection error')).toBeInTheDocument();
    });
  });
}); 