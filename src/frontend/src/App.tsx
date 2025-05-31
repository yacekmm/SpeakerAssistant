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
  CircularProgress
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
  const [inputDevices, setInputDevices] = useState<AudioDevice[]>([]);
  const [outputDevices, setOutputDevices] = useState<AudioDevice[]>([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState<string>('');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<AnalysisData>({
    filler_words: 0,
    speaking_time: 0,
    engagement_score: 0,
    suggested_questions: []
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch audio devices
    fetch('http://localhost:8000/audio-devices')
      .then(response => response.json())
      .then(data => {
        setInputDevices(data.input_devices);
        setOutputDevices(data.output_devices);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching audio devices:', error);
        setIsLoading(false);
      });

    // Connect to WebSocket
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'analysis') {
        setAnalysisData(data.data);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const fillerWordData = {
    labels: Array.from({ length: 10 }, (_, i) => `${i + 1}m`),
    datasets: [
      {
        label: 'Filler Words',
        data: Array(10).fill(0),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Speaker Assistant
        </Typography>

        <Grid container spacing={3}>
          {/* Device Selection */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Audio Devices
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Input Device</InputLabel>
                <Select
                  value={selectedInputDevice}
                  onChange={(e) => setSelectedInputDevice(e.target.value)}
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
                  onChange={(e) => setSelectedOutputDevice(e.target.value)}
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

          {/* Metrics */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Speaking Metrics
              </Typography>
              <Typography>
                Filler Words (10min): {analysisData.filler_words}
              </Typography>
              <Typography>
                Speaking Time: {Math.round(analysisData.speaking_time / 60)} minutes
              </Typography>
              <Typography>
                Engagement Score: {analysisData.engagement_score}%
              </Typography>
            </Paper>
          </Grid>

          {/* Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Filler Words Over Time
              </Typography>
              <Line data={fillerWordData} />
            </Paper>
          </Grid>

          {/* Suggested Questions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Suggested Questions
              </Typography>
              {analysisData.suggested_questions.map((question, index) => (
                <Typography key={index} sx={{ mb: 1 }}>
                  • {question}
                </Typography>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default App; 