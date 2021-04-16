# Dungeon Map Generator

To use this application, both the frontend and the backend need to be running on your local machine. Instructions for setting them up are below.

### Note about Google Drive Auth

Upon registration, our application asks for your permission to access your Google Drive. Because of this, you will see this warning.
<img src="https://user-images.githubusercontent.com/32472572/115068061-fa8d6280-9eae-11eb-95c1-5e70d56e15ba.png" width="300">

Getting an application authorized by Google is a longer process that takes months. We could not complete this process in time.
You need to click `Go to software-capstone-team5.firebaseapp.com (unsafe)` at the bottom. Our application is safe but if you
do not feel comfortable with this, feel free to create another Google account with which to test our application with.

## Frontend Setup

Dependencies:
- `Node.js/npm`
   - Download [here](https://nodejs.org/en/download/)

In the `frontend` directory, run `npm install` to install the dependencies.

### Firebase Certificates
Download `firebase_key.json` from Team Google Drive.\
In the `frontend/src` directory, create a directory named `certs` and add `firebase_key.json` to this folder.

### Running the frontend

To start the react app, run

#### `npm start`

This runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Backend Setup

Dependencies:
- `python3` (v3.9)
- `pipenv`
   - Run `sudo apt install pipenv` on Ubuntu to install

In the `backend` directory, run `pipenv install` to install the project dependencies.

### Firebase Certificates
Download `key.json` and `google_key.json` from Team Google Drive.\
In the `backend` directory, create a directory named `certs` and add both keys to this folder.

### Running the frontend

To start the server, run

#### `pipenv run flask run`

## Adding dependencies as a developer

To add frontend dependencies, add them to the `package.json`.

To add backend dependencies, add them to `Pipfile` and run `pipenv install` to install them.

## Learn More

Application created following [these](https://blog.miguelgrinberg.com/post/how-to-create-a-react--flask-project) instructions.

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
