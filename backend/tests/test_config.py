import json
import unittest

import pytest
from flask import Flask, jsonify
from unittest.mock import Mock, MagicMock, patch, call

class GetConfigById(unittest.TestCase):
    @pytest.fixture(autouse=True)
    def get_client(self, client):
        self.client = client

    def test_get_invalid_config(self):
        response = self.client.get("/config/bad")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "Failed"})


    def test_get_default_config(self):
        response = self.client.get("/config/kCdv0caJpPwkPlXCF0bc")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data["response"]["name"], "Sewer Base")

    @patch('backend.database.getConfig')
    def test_get_config(self, mocktest):
        mocktest.return_value = "Hi"
        response = self.client.get("/config/q87r32iughwe")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data, {"valid": True, "response": "Hi"})