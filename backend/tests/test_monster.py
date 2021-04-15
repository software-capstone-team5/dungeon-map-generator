import json
import unittest

import pytest
from flask import Flask, jsonify
from unittest.mock import Mock, MagicMock, patch, call

class MonsterTests(unittest.TestCase):
    premade_uid = "6E0pmXEtSmZLWeWt8mDXInGlOJF3"

    @pytest.fixture(autouse=True)
    def get_client(self, client):
        self.client = client
        self.monster_id = "YOD1ULGcb7YC6qH5I4HF"

    #  TEST START: saveMonster
    @patch.multiple("backend.database",
                verifyToken=MagicMock(return_value=""))
    def test_save_invalid_id_monster(self):
        response = self.client.post("/user/idTokenEmpty/monster", content_type='application/json', json={})
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "Failed"})

    # @patch.multiple("backend.database",
    #                 verifyToken=MagicMock(return_value=premade_uid),
    #                 saveMonsterByID=MagicMock(return_value={
    #         "challenge": 1,
    #         "description": "Testing",
    #         "id": "test_id",
    #         "name": "Test",
    #         "premade": True
    #     }))
    # def test_save_valid_monster(self, **mock):
    #     data = {
    #         "challenge": 1,
    #         "description": "Testing",
    #         "id": "test_id",
    #         "name": "Test",
    #         "premade": True
    #     }
    #     response = self.client.post("/user/idToken/monster", content_type='application/json', json=data)
    #     res_data = json.loads(response.data)
    #     # self.assertEqual(response.status_code, 200)
    #     # self.assertEqual(res_data['valid'], True)
    #  TEST END: saveMonster

    #  TEST START: saveMonsters
    @patch.multiple("backend.database",
                    verifyToken=MagicMock(return_value={}))
    def test_save_invalid_id_monsters(self):
        response = self.client.post("/user/idTokenEmpty/monsters", content_type='application/json', json={})
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "Failed"})

    # @patch.multiple("backend.database",
    #                 verifyToken=MagicMock(return_value=premade_uid),
    #                 saveMonsterByID=MagicMock(return_value={
    #         "challenge": 1,
    #         "description": "Testing",
    #         "id": "test_id",
    #         "name": "Test",
    #         "premade": True
    #     }))
    # def test_save_valid_monsters(self, **mock):
    #     data = {
    #         "challenge": 1,
    #         "description": "Testing",
    #         "id": "test_id",
    #         "name": "Test",
    #         "premade": True
    #     }
    #     response = self.client.post("/user/idToken/monsters", content_type='application/json', json=data)
    #     res_data = json.loads(response.data)
    #     # self.assertEqual(response.status_code, 200)
    #     # self.assertEqual(res_data['valid'], True)
    #  TEST END: saveMonsters

    #  TEST START: getMonsters
    def test_get_default_monsters(self):
        response = self.client.get("/monster")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data["valid"], True)
        self.assertEqual(res_data["response"][0]["name"], "Goblin")

    @patch.multiple("backend.database",
                verifyToken=MagicMock(return_value=""))
    def test_get_invalid_id_monsters(self):
        response = self.client.get("/user/idTokenEmpty/monster")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "No ID provided"})

    @patch.multiple("backend.database",
                verifyToken=MagicMock(return_value=premade_uid))
    def test_get_valid_monsters(self):
        response = self.client.get("/user/idToken/monster")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data["valid"], True)
        self.assertEqual(res_data["response"][0]["name"], "Goblin")
        self.assertEqual(len(res_data["response"]), 6)
