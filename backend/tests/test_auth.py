import json
import unittest

import pytest
from flask import Flask, jsonify
from unittest.mock import Mock, MagicMock, patch, call

class AuthTests(unittest.TestCase):

    @pytest.fixture(autouse=True)
    def get_client(self, client):
        self.client = client
        self.premade_uid = "6E0pmXEtSmZLWeWt8mDXInGlOJF3"

    #  TEST START: login
    @patch("backend.auth.verifyToken")
    def test_invalid_login(self, mocktest):
        mocktest.return_value="bad"
        response = self.client.post("/login", content_type='application/json', json={"idToken": "test"})
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "User does not exist"})

    @patch("backend.auth.verifyToken")
    def test_valid_login(self, mocktest):
        mocktest.return_value=self.premade_uid
        response = self.client.post("/login", content_type='application/json', json={"idToken": "test"})
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data, {"valid": True, "response": "Successful Login"})

