# BlueCycle

README file for the **BlueCycle** project

---

[![Build Status]()]()

Application deployed on Heroku:
https://blue_cycle.herokuapp.com/

To start the server locally, you can run different npm scripts (listed on the package json file):
- npm run serve
    - > node index.js
- npm run dev
    - > nodemon index.js
- npm run debug
    - > DEBUG=* node index.js
- npm run debugging
    - > DEBUG=* nodemon index.js

It is recommended to run the `debug` or the `debugging` script while testing and debugging 

The listed commands are used for debugging and testing **only** purposes:
each script loads environment variables from the `.env` file on the project directory. 
The variable configured on the `.env` are related to sensitive information that should not be revealed.

---

## API testing

To test the implemented BlueCycle REST API on the IDE you can easily do that by using the `REST Client` Visual Studio Code extension and the `requset.rest` file contained on the project directory

For more information about the suggested extension please look up the dedicated official [VisualStudio Marketplace page](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).
