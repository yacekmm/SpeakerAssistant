import pytest
from audio_processing.processor import AudioProcessor
import pyaudio
import wave
import numpy as np

class TestAudioProcessor:
    @pytest.fixture
    def audio_processor(self):
        return AudioProcessor()

    def test_list_audio_devices_returns_correct_structure(self, audio_processor):
        # when
        devices = audio_processor.list_audio_devices()
        
        # then
        assert "input_devices" in devices
        assert "output_devices" in devices
        assert isinstance(devices["input_devices"], list)
        assert isinstance(devices["output_devices"], list)

    def test_detect_breakout_rooms_identifies_breakout_phrases(self, audio_processor):
        # given
        breakout_phrases = [
            "we're going into breakout rooms now",
            "let's do some group exercises",
            "time for small groups",
            "let's do some group work"
        ]
        
        # when/then
        for phrase in breakout_phrases:
            assert audio_processor.detect_breakout_rooms(phrase) is True

    def test_detect_breakout_rooms_ignores_non_breakout_phrases(self, audio_processor):
        # given
        non_breakout_phrases = [
            "let's continue with the presentation",
            "any questions about the topic?",
            "moving on to the next slide"
        ]
        
        # when/then
        for phrase in non_breakout_phrases:
            assert audio_processor.detect_breakout_rooms(phrase) is False

    def test_reset_metrics_clears_all_counters(self, audio_processor):
        # given
        audio_processor.filler_word_count = 10
        audio_processor.speaking_time = 300
        audio_processor.last_analysis_time = 1000
        
        # when
        audio_processor.reset_metrics()
        
        # then
        assert audio_processor.filler_word_count == 0
        assert audio_processor.speaking_time == 0
        assert audio_processor.last_analysis_time == 0

    def test_analyze_audio_returns_correct_structure(self, audio_processor):
        # given
        audio_data = b"dummy audio data"
        
        # when
        result = audio_processor.analyze_audio(audio_data)
        
        # then
        assert "filler_words" in result
        assert "speaking_time" in result
        assert "engagement_score" in result
        assert "suggested_questions" in result
        assert isinstance(result["suggested_questions"], list) 