from fastapi.testclient import TestClient
from main import app
import pytest
from unittest.mock import patch

client = TestClient(app)

class TestMainAPI:
    def test_root_endpoint_returns_ok(self):
        # when
        response = client.get("/")
        
        # then
        assert response.status_code == 200
        assert response.json() == {"message": "Speaker Assistant API is running"}

    def test_audio_devices_endpoint_returns_correct_structure(self):
        # when
        response = client.get("/audio-devices")
        
        # then
        assert response.status_code == 200
        data = response.json()
        assert "input_devices" in data
        assert "output_devices" in data
        assert isinstance(data["input_devices"], list)
        assert isinstance(data["output_devices"], list)

    def test_stagetimer_status_endpoint_returns_correct_structure(self):
        # when
        response = client.get("/stagetimer/status")
        
        # then
        assert response.status_code == 200
        data = response.json()
        assert "timer_running" in data
        assert "current_time" in data
        assert "block_name" in data
        assert isinstance(data["timer_running"], bool)
        assert isinstance(data["current_time"], (int, float))
        assert isinstance(data["block_name"], str)

    @pytest.mark.asyncio
    async def test_websocket_connection_accepts_and_sends_data(self):
        # given
        with client.websocket_connect("/ws") as websocket:
            # when
            websocket.send_text("test message")
            response = websocket.receive_json()
            
            # then
            assert response["type"] == "analysis"
            assert "data" in response
            data = response["data"]
            assert "filler_words" in data
            assert "speaking_time" in data
            assert "engagement_score" in data
            assert "suggested_questions" in data 