import json
import unittest

import pytest
from flask import Flask, jsonify
from unittest.mock import Mock, MagicMock, patch, call

class ItemTests(unittest.TestCase):
    premade_uid = "6E0pmXEtSmZLWeWt8mDXInGlOJF3"

    @pytest.fixture(autouse=True)
    def get_client(self, client):
        self.client = client
        self.item_id = "F5HGLMRRByruF12rQClF"

    #  TEST START: saveItem
    @patch.multiple("backend.database",
                verifyToken=MagicMock(return_value=""))
    def test_save_invalid_id_item(self):
        response = self.client.post("/user/idTokenEmpty/item", content_type='application/json', json={})
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "Failed"})

    # @patch.multiple("backend.database",
    #                 verifyToken=MagicMock(return_value=premade_uid),
    #                 saveItemByID=MagicMock(return_value={
    #   "description": "Description",
    #   "id": "Testing",
    #   "name": "Test",
    #   "premade": True,
    #   "value": 200
    # }))
    # def test_save_valid_item(self, **mock):
    #     data = {
            # "description": "Description",
            # "id": "Testing",
            # "name": "Test",
            # "premade": True,
            # "value": 200
    #     }
    #     response = self.client.post("/user/idToken/item", content_type='application/json', json=data)
    #     res_data = json.loads(response.data)
    #     # self.assertEqual(response.status_code, 200)
    #     # self.assertEqual(res_data['valid'], True)
    #  TEST END: saveItem

    #  TEST START: getItems
    def test_get_default_items(self):
        response = self.client.get("/item")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data["valid"], True)
        self.assertEqual(res_data["response"][0]["name"], "Longsword")

    @patch.multiple("backend.database",
                verifyToken=MagicMock(return_value=""))
    def test_get_invalid_id_items(self):
        response = self.client.get("/user/idTokenEmpty/item")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "No ID provided"})

    @patch.multiple("backend.database",
                verifyToken=MagicMock(return_value=premade_uid))
    def test_get_valid_items(self):
        response = self.client.get("/user/idToken/item")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data["valid"], True)
        self.assertEqual(res_data["response"][0]["name"], "Longsword")
        self.assertEqual(len(res_data["response"]), 6)
