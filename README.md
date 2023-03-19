# reunion-task


## Installation

Follow these steps to install the application:


- Step 1: Clone the repository

- Step 2: Install dependencies: npm install

- Step 3: Start the server: node server.js

- Step 4: Run Mocha tests: npm test (For better result, execute the command more than two times)

  
## Docker



 - To start cotainers execute: `docker compose up -d`
 - To execute test cases
	 - find the container id of node container using command: `docker ps`
	 - execute command `docker exec -it container_id sh` to enter in cli of node container
	 - execute command `export PORT=8080`
	 - execute `npm test` to execute mocha tests
	 - Press `ctr+C` to exit test cases
	 - type `exit` to exit docker cli
	 - execute command `docker compose down` to stop and remove containers

    
##
**Render Deployment Link** : https://reunion-task-0dou.onrender.com