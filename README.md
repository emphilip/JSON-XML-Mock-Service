# Mock-Service
This project will provide a mock service that simulates any back end

# Installation

## Requirements

* NodeJS
* NPM

## Instructions

* Clone the project
* Inside the the project root run: `npm install`

# Configuration

Places files with .json or .xml extension inside `./test/mock/api`.  You can create a folder structure inside to represent your URI path.  i.e. `./test/mock/api/v1/foo.json` will create a route http://localhost:8080/v1/foo which will return the content of foo.json.

# Running the Service

Run `node server.js` or `npm start` to start the service.
