import json
import unittest

import pytest
from flask import Flask, jsonify
from unittest.mock import Mock, MagicMock, patch, call

class TrapTests(unittest.TestCase):
    premade_uid = "6E0pmXEtSmZLWeWt8mDXInGlOJF3"

    @pytest.fixture(autouse=True)
    def get_client(self, client):
        self.client = client
        self.trap_id = "icsGWV9BchU0NDlLuuBj"

    #  TEST START: saveTrap
    @patch.multiple("backend.database",
                verifyToken=MagicMock(return_value=""))
    def test_save_invalid_id_trap(self):
        response = self.client.post("/user/idTokenEmpty/trap", content_type='application/json', json={})
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "Failed"})

    # @patch.multiple("backend.database",
    #                 verifyToken=MagicMock(return_value=premade_uid),
    #                 saveTrapByID=MagicMock(return_value={}))
    # def test_save_valid_trap(self, **mock):
    #     data = {
    #     "description": "Description.",
    #     "difficulty": 15,
    #     "id": "Testing",
    #     "name": "Test",
    #     "premade": True
    #     }
    #     response = self.client.post("/user/idToken/trap", content_type='application/json', json=data)
    #     res_data = json.loads(response.data)
    #     self.assertEqual(response.status_code, 200)
    #     self.assertEqual(res_data['valid'], True)
    #     self.assertEqual(res_data['response'], "Testing")
    #  TEST END: saveTrap

    #  TEST START: getTraps
    def test_get_default_traps(self):
        response = self.client.get("/trap")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data["valid"], True)
        self.assertEqual(res_data["response"][0]["name"], "Pit Trap")

    @patch.multiple("backend.database",
                verifyToken=MagicMock(return_value=""))
    def test_get_invalid_id_traps(self):
        response = self.client.get("/user/idTokenEmpty/trap")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "No ID provided"})

    @patch.multiple("backend.database",
                verifyToken=MagicMock(return_value=premade_uid))
    def test_get_valid_traps(self):
        response = self.client.get("/user/idToken/trap")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data["valid"], True)
        self.assertEqual(res_data["response"][0]["name"], "Pit Trap")
        self.assertEqual(len(res_data["response"]), 4)
