import os
import io
import base64
from backend import app
from util import *
from flask import request, jsonify, Response
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
from google.oauth2.credentials import Credentials
from flask_cors import CORS, cross_origin
from requests_toolbelt import MultipartEncoder

import json

cors = CORS(app, resources={r'/*': {'origins': '*'}})

scopes = ['https://www.googleapis.com/auth/drive.readonly.metadata', 'https://www.googleapis.com/auth/drive.file']

with open('./certs/google_key.json') as f:
	keyJson = json.load(f)
	client_id = keyJson['client_id']
	token_uri = keyJson['token_uri']
	client_secret = keyJson['client_secret']

def buildService(access_token, refresh_token):
	cred = Credentials(
		token=access_token,
		refresh_token=refresh_token,
		token_uri=token_uri,
		client_id=client_id,
		client_secret=client_secret,
		scopes = scopes
	)
	service = build('drive', 'v3', credentials=cred)
	return service

def findFolder(access_token, refresh_token, folder_name, parent):
	service = buildService(access_token, refresh_token)
	query = "mimeType='application/vnd.google-apps.folder' and trashed = false and name='{}'".format(folder_name)
	if parent is not None:
		query = query + " and '{}' in parents".format(parent)
	results = service.files().list(q=query,
                                         spaces='drive',
                                         fields='nextPageToken, files(id, name)').execute()
	items = results.get('files', [])
	ids = []
	if not items:
		return ids
	else:
		for item in items:
			ids.append(item['id'])
		return ids

def createFolder(access_token, refresh_token, folder_name, parent_ids):
	service = buildService(access_token, refresh_token)
	file_metadata = {
		'name': folder_name,
		'mimeType': 'application/vnd.google-apps.folder',
		'parents': parent_ids
	}
	file = service.files().create(body=file_metadata,
										fields='id').execute()
	return file


@app.route("/user/<idToken>/tilesets", methods=['POST'])
def getTileSets(idToken):
	try:
		user_id = verifyToken(idToken)
		requestData = request.get_json()
		names = requestData['names']
		access_token = request.args.get('access_token', '')
		refresh_token = request.args.get('refresh_token', '')
		if type(user_id) == str and access_token != '' and refresh_token != '':
			service = buildService(access_token, refresh_token)
			dmg_folder = findFolder(access_token, refresh_token, "DMG Tilesets", None)

			for name in names:
				tileset_folder = findFolder(access_token, refresh_token, name, dmg_folder[0])
				# TODO: Get Tile Sets Here
				results = service.files().list(q="'{}' in parents".format(tileset_folder[0]), fields="nextPageToken, files(id, name)").execute()
				fields = {}
				items = results.get('files', [])
				response = ""
				if not items:
					continue
				else:
					for item in items:
						drive_request = service.files().get_media(fileId=item['id'])
						response += item['id'] + " "
						fh = io.BytesIO()
						downloader = MediaIoBaseDownload(fh, drive_request)
						done = False
						while done is False:
							status, done = downloader.next_chunk()
						fh.seek(0)
						temp = fh.read()
						with open(item['name'], 'wb') as f:
							f.write(temp)
							f.close()
						file_bytes = base64.b64encode(temp)
						fields[item['name']] = (item['name'], file_bytes, 'image/png')

			# mpencoder = MultipartEncoder(fields)
			# Response(mpencoder.to_string(), mimetype=mpencoder.content_type)
			return jsonify({"valid": True, "response": response}), 200
		else:
			return user_id
	except Exception as e:
		return f"An Error Occured: {e}"

@app.route("/user/<idToken>/tileset", methods=['POST'])
def saveTileSet(idToken):
	try:
		user_id = verifyToken(idToken)
		images = request.files.getlist("images")
		name = request.form.get('name')
		access_token = request.args.get('access_token', '')
		refresh_token = request.args.get('refresh_token', '')
		if type(user_id) == str and access_token != '' and refresh_token != '':
			service = buildService(access_token, refresh_token)
			result = saveTileSetDB(user_id, name)
			if not result['valid']:
				return jsonify(result), 400
			dmg_folder = findFolder(access_token, refresh_token, "DMG Tilesets", None)
			# if not dmg_folder:
			# 	createFolder(access_token, refresh_token, "DMG Tilesets", [])
			child_folder = createFolder(access_token, refresh_token, name, dmg_folder).get('id')
			for image in images:
				image.save("temp.jpg")
				# dmg_folder = findFolder(access_token, refresh_token, "DMG Tilesets")
				file_metadata = {
					'name': image.filename,
					'mimeType': 'image/jpeg',
					'parents': [child_folder]
				}
				media = MediaFileUpload('temp.jpg', mimetype = 'image/jpeg')

				file = service.files().create(body=file_metadata,
                                    media_body=media,
                                    fields='id').execute()

				# if os.path.exists("./temp.jpg"):
				# 	os.remove("temp.jpg")

			return jsonify(result), 200
		else:
			return user_id
	except Exception as e:
		return f"An Error Occured: {e}"