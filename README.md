# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

Users can delete urls.

Stats include:

- unique visits tracked with a client side cookie.
- total visits - a simple counter.
- when created.
- short 6 digit url.
- complete url.

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

#Documentation:

The following functions are used in the helpers.js file

- userLookUpByEmail(email, database) | look up user by email
- writeToFile(file, body) | rite to file takes a file and the info you want to write. TODO - Make it write one line at a time so its easier to read.
- urlsForUser(userID, database) | make an object of the URLS for a user.
- userCheckPassword | will check an encrypted password againts the database.
- checkUniqueUser(userID, database, id) | checks to see if a user is unique depending on whether or not their cookie id has been stored.
- generateRandomString(size) Will generate a random string from CAPITAL and small letters as well as numbers. Useful for random ID's.
- readabletime(timestamp) | takes in a computer generated Date.now() and makes it easier to read.
