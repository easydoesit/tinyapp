// file-system Setup
const fs = require('fs');

// bcrypt setup
const bcrypt = require("bcryptjs");
const { match } = require('assert');

// look up user by email
const userLookUpByEmail = function(email, database) {
  let userID;
  
  for (let key of Object.keys(database)) {

    if (database[key].email === email) {
      userID = key;
    }
  
  }

  return userID;

};

// write to file takes a file and the info you want to write. TODO - Make it write one line at a time.
const writeToFile = function(file, body) {
  const jsonString = JSON.stringify(body);

  fs.writeFile(file, jsonString, err => {
    if (err) {
      console.log('Error writing file', err);
    } else {
      console.log('Successfully wrote file');
    }

  });
};

// make an object of the URLS for a user.
const urlsForUser = function(userID, database) {
  const usersURLs = {};

  for (let key of Object.keys(database)) {
    
    if (database[key].userID === userID) {
      usersURLs[key] = {};
      usersURLs[key].longURL = database[key].longURL,
      usersURLs[key].count = database[key].count;
    }

  }

  return usersURLs;
};

// check user password
const userCheckPassword = function(password, database) {
  let passwordCheck = false;

  for (let key of Object.keys(database)) {
    if  (bcrypt.compareSync(password, database[key].password)) {
      passwordCheck = true;
    }
  
  }

  return passwordCheck;

};

// generate a random string
const generateRandomString = function(size) {
  let result = "";
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < size; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;

};

const readabletime = function(timestamp) {
  const date = new Date(timestamp);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const day = days[date.getDay()];
  const dOfMonth = date.getDate();
  const hour  = date.getHours();
  const minutes = date.getMinutes();
  //const seconds = date.getSeconds();
  
  const time = `${day}, ${month} ${dOfMonth} at ${hour}:${minutes} GMT`;
  return time;
};

module.exports = { userLookUpByEmail, writeToFile, urlsForUser, userCheckPassword, generateRandomString, readabletime };