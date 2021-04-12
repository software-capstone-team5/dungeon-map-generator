from backend import app
import authentication
from flask import request, jsonify
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from flask_cors import CORS, cross_origin

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

def createFolder(access_token, refresh_token, folder_name):
	service = buildService(access_token, refresh_token)
	file_metadata = {
		'name': folder_name,
		'mimeType': 'application/vnd.google-apps.folder'
	}
	file = service.files().create(body=file_metadata,
										fields='id').execute()
	return file


@app.route("/user/<idToken>/tileset", methods=['GET'])
def getTileSet(idToken):
	try:
		requestData = request.get_json()
		user_id = verifyToken(idToken)

		access_token = request.args.get('access_token', '')
		refresh_token = request.args.get('refresh_token', '')
		if type(user_id) == str and access_token != '' and refresh_token != '':
			service = buildService(access_token, refresh_token)

			# TODO: Get Tile Sets Here
			results = service.files().list(pageSize=10, fields="nextPageToken, files(id, name)").execute()
			items = results.get('files', [])
			response = ""
			if not items:
				response += 'No files found.'
			else:
				response += 'Files:'
				for item in items:
					response += (u'{0} ({1})'.format(item['name'], item['id']))

			return jsonify({"valid": True, "response": response}), 200
		else:
			return user_id
	except Exception as e:
		return f"An Error Occured: {e}"