import pyaudio
from typing import Dict, List
import logging
import os

logger = logging.getLogger(__name__)

class AudioProcessor:
    def __init__(self):
        self.has_audio = False
        self.p = None
        try:
            # Set ALSA environment variables if not set
            if 'ALSA_CARD' not in os.environ:
                os.environ['ALSA_CARD'] = 'Generic'
            if 'ALSA_DEVICE' not in os.environ:
                os.environ['ALSA_DEVICE'] = 'hw:0,0'
            
            self.p = pyaudio.PyAudio()
            # Test if we can actually access audio devices
            device_count = self.p.get_device_count()
            if device_count > 0:
                self.has_audio = True
                logger.info(f"Successfully initialized PyAudio with {device_count} devices")
            else:
                logger.warning("No audio devices found")
        except Exception as e:
            logger.warning(f"Failed to initialize PyAudio: {e}")
        self.filler_word_count = 0
        self.speaking_time = 0
        self.last_analysis_time = 0

    def list_audio_devices(self) -> Dict[str, List[Dict]]:
        """
        List all available audio input and output devices
        Returns mock devices if real devices are not available
        """
        if not self.has_audio or not self.p:
            logger.info("Using mock audio devices")
            return {
                "input_devices": [
                    {"id": 1, "name": "Mock Microphone", "channels": 2, "sample_rate": 44100}
                ],
                "output_devices": [
                    {"id": 1, "name": "Mock Speaker", "channels": 2, "sample_rate": 44100}
                ]
            }

        try:
            input_devices = []
            output_devices = []
            
            for i in range(self.p.get_device_count()):
                try:
                    device_info = self.p.get_device_info_by_index(i)
                    device = {
                        "id": i,
                        "name": device_info["name"],
                        "channels": device_info["maxInputChannels"] if device_info["maxInputChannels"] > 0 else device_info["maxOutputChannels"],
                        "sample_rate": int(device_info["defaultSampleRate"])
                    }
                    
                    if device_info["maxInputChannels"] > 0:
                        input_devices.append(device)
                    if device_info["maxOutputChannels"] > 0:
                        output_devices.append(device)
                except Exception as e:
                    logger.warning(f"Failed to get info for device {i}: {e}")
                    continue
            
            if not input_devices and not output_devices:
                logger.warning("No audio devices found, using mock devices")
                return {
                    "input_devices": [
                        {"id": 1, "name": "Mock Microphone", "channels": 2, "sample_rate": 44100}
                    ],
                    "output_devices": [
                        {"id": 1, "name": "Mock Speaker", "channels": 2, "sample_rate": 44100}
                    ]
                }
            
            return {
                "input_devices": input_devices,
                "output_devices": output_devices
            }
        except Exception as e:
            logger.error(f"Error listing audio devices: {e}")
            return {
                "input_devices": [
                    {"id": 1, "name": "Mock Microphone", "channels": 2, "sample_rate": 44100}
                ],
                "output_devices": [
                    {"id": 1, "name": "Mock Speaker", "channels": 2, "sample_rate": 44100}
                ]
            }

    def detect_breakout_rooms(self, text: str) -> bool:
        """
        Detect if the text indicates a breakout room session
        """
        breakout_phrases = [
            "breakout room",
            "group work",
            "small groups",
            "group exercise"
        ]
        return any(phrase in text.lower() for phrase in breakout_phrases)

    def reset_metrics(self):
        """
        Reset all metrics to zero
        """
        self.filler_word_count = 0
        self.speaking_time = 0
        self.last_analysis_time = 0

    def analyze_audio(self, audio_data: bytes) -> Dict:
        """
        Analyze audio data and return metrics
        """
        # TODO: Implement real audio analysis
        return {
            "filler_words": self.filler_word_count,
            "speaking_time": self.speaking_time,
            "engagement_score": 0,
            "suggested_questions": []
        }

    def __del__(self):
        """
        Clean up PyAudio resources
        """
        if self.p:
            try:
                self.p.terminate()
            except Exception as e:
                logger.error(f"Error terminating PyAudio: {e}") 