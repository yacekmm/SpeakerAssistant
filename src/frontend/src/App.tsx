import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AudioDevice {
  id: number;
  name: string;
  channels: number;
}

interface AnalysisData {
  filler_words: number;
  speaking_time: number;
  engagement_score: number;
  suggested_questions: string[];
}

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputDevices, setInputDevices] = useState<AudioDevice[]>([]);
  const [outputDevices, setOutputDevices] = useState<AudioDevice[]>([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState<number | ''>('');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<number | ''>('');
  const [analysisData, setAnalysisData] = useState<AnalysisData>({
    filler_words: 0,
    speaking_time: 0,
    engagement_score: 0,
    suggested_questions: []
  });
  const [fillerWordHistory, setFillerWordHistory] = useState<number[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Fetch audio devices
    const fetchDevices = async () => {
      try {
        const response = await axios.get('http://localhost:8000/devices');
        setInputDevices(response.data.input_devices);
        setOutputDevices(response.data.output_devices);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch audio devices');
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  useEffect(() => {
    // Initialize WebSocket connection
    const websocket = new WebSocket('ws://localhost:8000/ws');
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'analysis') {
        setAnalysisData(data.data);
        setFillerWordHistory(prev => [...prev, data.data.filler_words].slice(-10));
      }
    };

    websocket.onerror = () => {
      setError('WebSocket connection error');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const handleDeviceChange = (type: 'input' | 'output', deviceId: number) => {
    if (ws) {
      ws.send(JSON.stringify({
        type: 'device_change',
        device_type: type,
        device_id: deviceId
      }));
    }
  };

  const chartData = {
    labels: Array.from({ length: fillerWordHistory.length }, (_, i) => `${i + 1}m`),
    datasets: [
      {
        label: 'Filler Words',
        data: fillerWordHistory,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Speaker Assistant
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Audio Device Selection */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Audio Devices
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Input Device</InputLabel>
                <Select
                  value={selectedInputDevice}
                  label="Input Device"
                  onChange={(e) => {
                    setSelectedInputDevice(e.target.value as number);
                    handleDeviceChange('input', e.target.value as number);
                  }}
                >
                  {inputDevices.map((device) => (
                    <MenuItem key={device.id} value={device.id}>
                      {device.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Output Device</InputLabel>
                <Select
                  value={selectedOutputDevice}
                  label="Output Device"
                  onChange={(e) => {
                    setSelectedOutputDevice(e.target.value as number);
                    handleDeviceChange('output', e.target.value as number);
                  }}
                >
                  {outputDevices.map((device) => (
                    <MenuItem key={device.id} value={device.id}>
                      {device.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          </Grid>

          {/* Speaking Metrics */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Speaking Metrics
              </Typography>
              <Typography>
                Filler Words: {analysisData.filler_words}
              </Typography>
              <Typography>
                Speaking Time: {Math.floor(analysisData.speaking_time / 60)}m {analysisData.speaking_time % 60}s
              </Typography>
              <Typography>
                Engagement Score: {analysisData.engagement_score}%
              </Typography>
            </Paper>
          </Grid>

          {/* Filler Word Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Filler Word Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} />
              </Box>
            </Paper>
          </Grid>

          {/* Suggested Questions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Suggested Questions
              </Typography>
              {analysisData.suggested_questions.length > 0 ? (
                <ul>
                  {analysisData.suggested_questions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              ) : (
                <Typography color="text.secondary">
                  No questions suggested yet
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default App; 