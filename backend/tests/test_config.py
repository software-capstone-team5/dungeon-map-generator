import json
import unittest

import pytest
from flask import Flask, jsonify
from unittest.mock import Mock, MagicMock, patch, call

class ConfigTests(unittest.TestCase):
    premade_uid = "6E0pmXEtSmZLWeWt8mDXInGlOJF3"

    @pytest.fixture(autouse=True)
    def get_client(self, client):
        self.client = client
        self.config_id = "kCdv0caJpPwkPlXCF0bc"

    #  TEST START: getConfigByID
    def test_get_invalid_config(self):
        response = self.client.get("/config/bad")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "Failed"})


    def test_get_default_config(self):
        response = self.client.get("/config/{}".format(self.config_id))
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data["valid"], True)
        self.assertEqual(res_data["response"]["name"], "Sewer Base")

    @patch.multiple("backend.database",
                    verifyToken=MagicMock(return_value=premade_uid))
    def test_get_valid_config(self, **mocktest):
        response = self.client.get("/user/test/config/{}".format(self.config_id))
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data["valid"], True)
        self.assertEqual(res_data["response"]["name"], "Sewer Base")

    @patch.multiple("backend.database",
                    verifyToken=MagicMock(return_value=""))
    def test_get_invalid_config(self, **mocktest):
        response = self.client.get("/user/test/config/{}".format(self.config_id))
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "No ID provided"})
    # TEST END: getConfigByID

    # TEST START: getConfigs
    def test_get_default_configs(self):
        response = self.client.get("/config")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data["response"][0], {
            "id": "kCdv0caJpPwkPlXCF0bc",
            "name": "Sewer Base",
            "premade": True
        })
  
    def test_get_invalid_id_configs(self):
        response = self.client.get("/user/./config")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "Failed"})

    @patch.multiple("backend.database",
                verifyToken=MagicMock(return_value=""))
    def test_get_empty_id_configs(self):
        response = self.client.get("/user/idToken/config")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "No ID provided"})

    @patch.multiple("backend.database",
                verifyToken=MagicMock(return_value=premade_uid))
    def test_get_valid_configs(self):
        response = self.client.get("/user/idToken/config")
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(res_data["response"][0], {
            "id": "kCdv0caJpPwkPlXCF0bc",
            "name": "Sewer Base",
            "premade": True
        })
        self.assertEqual(len(res_data["response"]), 2)
    # TEST END: getConfigs

    # TEST START: saveConfig
    def test_post_invalid_id_config(self):
        response = self.client.post("/user/idToken/config", json={})
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "Invalid ID"})
    
    @patch.multiple("backend.database",
                verifyToken=MagicMock(return_value=""))
    def test_post_empty_id_configs(self):
        response = self.client.post("/user/idToken/config", json={})
        res_data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(res_data, {"valid": False, "response": "Failed"})

    # WIP
    # @patch.multiple("backend.database",
    #             verifyToken=MagicMock(return_value=premade_uid),
    #             getDBID=MagicMock(return_value=("prev_id",{'id': "prev_id"})),
    #             saveCategoryReferences=MagicMock(return_value=""))
    # def test_post_prev_id_configs(self):
    #     response = self.client.post("/user/idToken/config", content_type='application/json', json={'id': 'prev_id'})
    #     res_data = json.loads(response.data)
    #     self.assertEqual(response.status_code, 200)
    #     # self.assertEqual(res_data, {"valid": True, "response": "prev_id"})

    #  @patch.multiple("backend.database",
    #             verifyToken=MagicMock(return_value=premade_uid),
    #             getDBID=MagicMock(return_value=("prev_id",{'id': "new_id"})),
    #             saveCategoryReferences=MagicMock(return_value=""))
    # def test_post_new_id_configs(self):
    #     response = self.client.post("/user/idToken/config", content_type='application/json', json={'id': ''})
    #     res_data = json.loads(response.data)
    #     self.assertEqual(response.status_code, 200)
    #     # self.assertEqual(res_data, {"valid": True, "response": "new_id"})