# Dungeon Map Generator

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Frontend Setup

Dependencies:
- `Node.js/npm`
   - Download [here](https://nodejs.org/en/download/)

In the `frontend` directory, run `npm install` to install the dependencies.

### Firebase Certificates
Download `key.json` from Team Google Drive.\
In the `frontend/src` directory, create a directory named `certs` and add `firestore_key.json` to this folder.

To start the react app, run

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Backend Setup

Dependencies:
- `python3`
- `pipenv`
   - Run `sudo apt install pipenv` on Ubuntu to install

In the `backend` directory, run `pipenv install` to install the project dependencies.

### Firebase Certificates
Download `key.json` from Team Google Drive.\
In the `backend` directory, create a directory named `certs` and add `key.json` to this folder.

To start the server, run

#### `pipenv run flask run`

## Adding dependencies

To add frontend dependencies, add them to the `package.json`.

To add backend dependencies, add them to `Pipfile` and run `pipenv install` to install them.

## Learn More

Application created following [these](https://blog.miguelgrinberg.com/post/how-to-create-a-react--flask-project) instructions.

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
