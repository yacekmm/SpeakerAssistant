# Speaker Assistant

A real-time AI-powered training session assistant that helps presenters maintain participant engagement and improve presentation quality.

## Features

### Core Functionality
- Real-time speech analysis and coaching
- Participant engagement monitoring
- Filler word detection and counting
- Breakout room detection
- StageTimer.io integration
- Multi-device audio support

### Technical Requirements
- Docker-based deployment
- Web-based UI
- Real-time audio processing
- Speaker diarization
- Natural Language Processing for content analysis
- Integration with StageTimer.io

## Architecture

### Components
1. **Audio Processing Service**
   - Real-time audio capture from selected microphone
   - Speaker diarization
   - Speech-to-text conversion
   - Audio output to selected speaker

2. **Analysis Service**
   - Speech content analysis
   - Engagement metrics calculation
   - Filler word detection
   - Breakout room detection
   - Question suggestion generation

3. **Web UI**
   - Modern, responsive design
   - Real-time metrics display
   - Device selection interface
   - Coaching tips display
   - Filler word counter with visual indicators
   - StageTimer.io integration

### Technical Stack
- Frontend: React with TypeScript
- Backend: Python with FastAPI
- Audio Processing: PyAudio, SpeechRecognition
- NLP: spaCy, Transformers
- Containerization: Docker & Docker Compose
- Real-time Communication: WebSocket

## Setup and Configuration

### Prerequisites
- Docker and Docker Compose
- Windows 10/11 with multiple audio devices
- Web browser with WebRTC support

### Environment Variables
- `AUDIO_INPUT_DEVICE`: Selected microphone
- `AUDIO_OUTPUT_DEVICE`: Selected speaker
- `WEB_UI_PORT`: Port for web interface
- `STAGETIMER_API_KEY`: StageTimer.io API key

### Filler Word Thresholds
- Normal (Green): < 20 filler words per 10 minutes
- Warning (Yellow): 20-30 filler words per 10 minutes
- Critical (Red): > 30 filler words per 10 minutes

## Development Status
🚧 Project in initial setup phase

## Getting Started
1. Clone this repository
2. Configure environment variables
3. Run `docker-compose up`
4. Access the web UI at `http://localhost:${WEB_UI_PORT}`

### Development Mode
The project supports hot reloading in development mode:
- Frontend changes are automatically reflected without container restart
- Backend changes require container restart
- WebSocket connection is maintained during frontend updates
- Environment variables are configured for optimal development experience

## Project Structure
```
speaker-assistant/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── src/
│   ├── frontend/          # React TypeScript application
│   ├── backend/           # Python FastAPI application
│   └── audio_processing/  # Audio capture and processing
├── tests/                 # Test suite
└── docs/                  # Documentation
``` 