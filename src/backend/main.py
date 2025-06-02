from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import json
import logging
from audio_processing.processor import AudioProcessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize audio processor
audio_processor = AudioProcessor()

@app.get("/")
async def root():
    """
    Root endpoint to verify the API is running
    """
    return {"status": "ok", "message": "Speaker Assistant API is running"}

@app.get("/audio-devices")
async def get_audio_devices():
    """
    Get list of available audio input and output devices
    """
    try:
        devices = audio_processor.list_audio_devices()
        logger.info(f"Successfully retrieved {len(devices['input_devices'])} input devices and {len(devices['output_devices'])} output devices")
        return devices
    except Exception as e:
        logger.error(f"Error getting audio devices: {e}")
        raise HTTPException(status_code=500, detail="Failed to get audio devices")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time audio processing
    """
    await websocket.accept()
    logger.info("WebSocket connection established")
    
    try:
        while True:
            try:
                # Wait for messages
                data = await websocket.receive_text()
                logger.debug(f"Received WebSocket message: {data[:100]}...")
                
                # Parse the message
                message = json.loads(data)
                
                if message["type"] == "device_change":
                    logger.info(f"Device change requested: {message}")
                    # TODO: Implement device change handling
                    await websocket.send_json({
                        "type": "status",
                        "status": "device_changed",
                        "device_type": message["device_type"],
                        "device_id": message["device_id"]
                    })
                else:
                    logger.warning(f"Unknown message type: {message['type']}")
                    await websocket.send_json({
                        "type": "error",
                        "error": "Unknown message type"
                    })
                    
            except json.JSONDecodeError:
                logger.error("Invalid JSON received")
                await websocket.send_json({
                    "type": "error",
                    "error": "Invalid JSON"
                })
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                await websocket.send_json({
                    "type": "error",
                    "error": str(e)
                })
                
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        logger.info("WebSocket connection closed")

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