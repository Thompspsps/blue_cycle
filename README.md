# BlueCycle

  

README file for the **BlueCycle** project

---
[![Build Status]()]()

Application deployed on Heroku:

https://blue_cycle.herokuapp.com/

To start the server locally, you can run different npm scripts, which are listed below (you can also find them on the `package.json` file):

- npm run serve

  > node index.js

- npm run dev

  > nodemon index.js

- npm run debug

  > DEBUG=* node index.js

- npm run debugging

  > DEBUG=* nodemon index.js

- npm run run-all

  > concurrently \"npm run debugging\" \" cd frontend && http-server -p 8000

  

It is recommended to run the `debug` or the `debugging` scripts while testing and debugging the web api.

The `npm run run-all` command allows you to start both the express server hosting the backend application and the http-server needed to run the frontend application.

The listed commands are used for debugging and testing **only** purposes: each script loads environment variables from the `.env` file on the project scripts.

The variable configured on the `.env` file are related to sensitive information that should not be revealed.

## .env file
The content of the .env file used for development and testing is the following:
```

DB_URI="mongodb+srv://thompspsps:mOQLmuSy9rP4C5G5@devcluster.gekf3.mongodb.net/BlueCycle-API?retryWrites=true&w=majority&appName=devCluster"

SERVER_PORT = 3000

SECRET_KEY = "this-is-supposed-to-be-a-secret-key"

MAX_COLLECTED = 15

SALT_ROUNDS = 10

```  

## API testing
In order to test the implemented BlueCycle RESTFUL APIs yourself directly on VS Code we suggest you to use the `REST Client` Visual Studio Code extension and the `request.rest` file contained on the project directory.

For more information about the suggested extension please look up the dedicated official [VisualStudio Marketplace page](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).

However to properly be able to use the API through the `request.rest` file you first need to copy the JWTs returned from the authentication endpoints and copy them on top of the file where are listed some of the users and admins variables(id and token).

It is also recommended to not change any other field other than `atkn`, `u1tkn` and `u2tkn`.

The repository also contains a comprehensive yaml documentation file which specify which endpoints are supported, along with the description of the components(???) that populate the project database.

To easily access the documentation UI, you can use the following endpoint while running the express server:
> http://localhost:3000/api-docs
 
---