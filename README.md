# BlueCycle

  

README file for the **BlueCycle** project

---

Application deployed on Render:
- frontend application: https://blue-cycle-f-p2.onrender.com
- backend application: https://blue-cycle-zljn.onrender.com

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

  > concurrently \"npm run serve\" \" cd frontend && http-server -p 8000

  

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

The repository also contains a comprehensive yaml documentation file which specify which endpoints are supported, along with the description of the components that populate the project database.

To easily access the documentation UI, you can use the following endpoint while running the express server:
> http://localhost:3000/api-docs
---
### Dummy machine
Since we currently lack physical machines to test transaction registration and point credit functionality, we developed a simulated machine interface for testing purposes. You can access it here: https://blue-cycle-m.onrender.com/

---
### Registration of a new user
To test the registration feature, you can use the following test accounts. These simulate the CieID authentication system. Here's the list of supported users, also available at:
```
/frontend/Register/CIE_Login_files/CIE_Login_files/nome.json
```
```
[
  {
    "nome": "Alessandro",
    "cognome": "Rossi",
    "email": "alessandro.rossi@example.com",
    "password": "r5T2pQ8zX1yB"
  },
  {
    "nome": "Giulia",
    "cognome": "Bianchi",
    "email": "giulia.bianchi@example.com",
    "password": "m9N6oC3vA4sD"
  },
  {
    "nome": "Matteob",
    "cognome": "Verdi",
    "email": "matteob.verdi@example.com",
    "password": "k7J1lH5dW2eF"
  },
  {
    "nome": "Chiara",
    "cognome": "Gialli",
    "email": "chiara.gialli@example.com",
    "password": "qW3eR8tY1uI7"
  },
  {
    "nome": "Francesco",
    "cognome": "Blu",
    "email": "francesco.blu@example.com",
    "password": "zX5cV7bN2mM3"
  },
  {
    "nome": "Sofia",
    "cognome": "Neri",
    "email": "sofia.neri@example.com",
    "password": "pL2oK9iJ6uY4"
  },
  {
    "nome": "Davide",
    "cognome": "Marroni",
    "email": "davide.marroni@example.com",
    "password": "aS1dF4gH7jK0"
  },
  {
    "nome": "Elena",
    "cognome": "Grigi",
    "email": "elena.grigi@example.com",
    "password": "fD6sA9mW2eR1"
  },
  {
    "nome": "Luca",
    "cognome": "Viola",
    "email": "luca.viola@example.com",
    "password": "gH8jK3lP5oI2"
  },
  {
    "nome": "Martina",
    "cognome": "Arancio",
    "email": "martina.arancio@example.com",
    "password": "cV4bN1mM9nB6"
  },
  {
    "nome": "Simone",
    "cognome": "Rosa",
    "email": "simone.rosa@example.com",
    "password": "xZ7yC2vB5nK8"
  },
  {
    "nome": "Sara",
    "cognome": "Celeste",
    "email": "sara.celeste@example.com",
    "password": "wE9rT1yU4iO0"
  },
  {
    "nome": "Andrea",
    "cognome": "Argento",
    "email": "andrea.argento@example.com",
    "password": "qA3sD6fG9hJ1"
  },
  {
    "nome": "Laura",
    "cognome": "Oro",
    "email": "laura.oro@example.com",
    "password": "bN5mM2nB8vC3"
  },
  {
    "nome": "Federico",
    "cognome": "Rame",
    "email": "federico.rame@example.com",
    "password": "kL1jH4gF7dD9"
  },
  {
    "nome": "Elisa",
    "cognome": "Bronzo",
    "email": "elisa.bronzo@example.com",
    "password": "pO6iU9yT2rE4"
  },
  {
    "nome": "Nicolo",
    "cognome": "Ferro",
    "email": "nicolo.ferro@example.com",
    "password": "vC2xB5nZ8mL1"
  },
  {
    "nome": "Anna",
    "cognome": "Acciaio",
    "email": "anna.acciaio@example.com",
    "password": "mN3bV6cX9zL2"
  },
  {
    "nome": "Giovanni",
    "cognome": "Piombo",
    "email": "giovanni.piombo@example.com",
    "password": "jK4lH7gF1dS3"
  },
  {
    "nome": "Greta",
    "cognome": "Stagno",
    "email": "greta.stagno@example.com",
    "password": "yU5iO8pP2oI7"
  },
  {
    "nome": "Leonardo",
    "cognome": "Zinco",
    "email": "leonardo.zinco@example.com",
    "password": "eR6tY9uI3oP0"
  },
  {
    "nome": "Irene",
    "cognome": "Alluminio",
    "email": "irene.alluminio@example.com",
    "password": "hG7jK0lL3mN4"
  },
  {
    "nome": "Tommaso",
    "cognome": "Ottone",
    "email": "tommaso.ottone@example.com",
    "password": "sD8fG1hJ4kL6"
  },
  {
    "nome": "Giada",
    "cognome": "Rame",
    "email": "giada.rame@example.com",
    "password": "iU9yT2rE5wQ1"
  },
  {
    "nome": "Pietro",
    "cognome": "Argento",
    "email": "pietro.argento@example.com",
    "password": "nB1mM4nB7vC9"
  },
  {
    "nome": "Eleonora",
    "cognome": "Oro",
    "email": "eleonora.oro@example.com",
    "password": "zX0cV3bN6mM8"
  },
  {
    "nome": "Emma",
    "cognome": "Bronzo",
    "email": "emma.bronzo@example.com",
    "password": "qW2eR5tY8uI0"
  },
  {
    "nome": "Riccardo",
    "cognome": "Ferro",
    "email": "riccardo.ferro@example.com",
    "password": "aS4dF7gH0jK2"
  },
  {
    "nome": "Chiara",
    "cognome": "Acciaio",
    "email": "chiara.acciaio@example.com",
    "password": "kL5jH8gF1dS4"
  },
  {
    "nome": "Davide",
    "cognome": "Piombo",
    "email": "davide.piombo@example.com",
    "password": "pO7iU0yT3rE6"
  }
]

```
