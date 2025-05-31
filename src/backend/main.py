from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from typing import List, Dict
import json

app = FastAPI(title="Speaker Assistant API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active WebSocket connections
active_connections: List[WebSocket] = []

@app.get("/")
async def root():
    return {"message": "Speaker Assistant API is running"}

@app.get("/audio-devices")
async def get_audio_devices():
    """
    Get list of available audio input and output devices
    """
    # TODO: Implement audio device detection
    return {
        "input_devices": [],
        "output_devices": []
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # TODO: Implement real-time audio processing and analysis
            await websocket.send_json({
                "type": "analysis",
                "data": {
                    "filler_words": 0,
                    "speaking_time": 0,
                    "engagement_score": 0,
                    "suggested_questions": []
                }
            })
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        active_connections.remove(websocket)

@app.get("/stagetimer/status")
async def get_stagetimer_status():
    """
    Get current status from StageTimer.io
    """
    # TODO: Implement StageTimer.io integration
    return {
        "timer_running": False,
        "current_time": 0,
        "block_name": ""
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 