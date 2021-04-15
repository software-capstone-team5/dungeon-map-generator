import json
import unittest

import pytest
from flask import Flask, jsonify
from unittest.mock import Mock, MagicMock, patch, call

class CategoryTests(unittest.TestCase):
    premade_uid = "6E0pmXEtSmZLWeWt8mDXInGlOJF3"

    @pytest.fixture(autouse=True)
    def get_client(self, client):
        self.client = client
        self.corridor_category_id = "7cyYJu5MYui0txZcvjXH"
        self.room_category_id = "1nc2svuO5u0altId5Hsl"

    #  TEST START: getRooms
    def test_get_default_rooms(self):
        response = self.client.get("/room")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data["valid"], True)
        self.assertEqual(res_data["response"][0]["name"], "Empty Room, All Equal")

    @patch.multiple("backend.database",
                verifyToken=MagicMock(return_value=""))
    def test_get_invalid_id_rooms(self):
        response = self.client.get("/user/idTokenEmpty/room")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "No ID provided"})

    @patch.multiple("backend.database",
                verifyToken=MagicMock(return_value=premade_uid))
    def test_get_valid_rooms(self):
        response = self.client.get("/user/idToken/room")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data["valid"], True)
        self.assertEqual(res_data["response"][0]["name"], "Empty Room, All Equal")
        self.assertEqual(len(res_data["response"]), 6)
    #  TEST END: getRooms

    #  TEST START: getCorridors
    def test_get_default_corridors(self):
        response = self.client.get("/corridor")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data["valid"], True)
        self.assertEqual(res_data["response"][0]["name"], "Thin Basic Corridor")

    @patch.multiple("backend.database",
                verifyToken=MagicMock(return_value=""))
    def test_get_invalid_id_corridors(self):
        response = self.client.get("/user/idTokenEmpty/corridor")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "No ID provided"})

    @patch.multiple("backend.database",
                verifyToken=MagicMock(return_value=premade_uid))
    def test_get_valid_corridors(self):
        response = self.client.get("/user/idToken/corridor")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data["valid"], True)
        self.assertEqual(res_data["response"][0]["name"], "Thin Basic Corridor")
        self.assertEqual(len(res_data["response"]), 2)

    #  TEST START: saveRoomCategory WIP
    @patch.multiple("backend.database",
                    verifyToken=MagicMock(return_value="bad"))
    def test_save_invalid_corridor_category(self):
        response = self.client.post("/user/bad/corridor", content_type='application/json', data={'id': "id"})
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "Failed"})
    #  TEST END: saveRoomCategory

    #  TEST START: saveCorridorCategory WIP
    @patch.multiple("backend.database",
                    verifyToken=MagicMock(return_value="bad"))
    def test_save_invalid_room_category(self):
        response = self.client.post("/user/bad/room", content_type='application/json', data={'id': "id"})
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "Failed"})
    #  TEST END: saveCorridorCategory