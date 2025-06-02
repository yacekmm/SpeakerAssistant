import pyaudio
from typing import Dict, List

class AudioProcessor:
    def __init__(self):
        self.p = pyaudio.PyAudio()
        self.filler_word_count = 0
        self.speaking_time = 0
        self.last_analysis_time = 0

    def list_audio_devices(self) -> Dict[str, List[Dict]]:
        """
        List all available audio input and output devices
        """
        input_devices = []
        output_devices = []
        
        for i in range(self.p.get_device_count()):
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
        
        return {
            "input_devices": input_devices,
            "output_devices": output_devices
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
        self.p.terminate() 