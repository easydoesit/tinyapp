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
const urlsForUser = function(userID) {
  const usersURLs = {};

  for (let key of Object.keys(urlDatabase)) {
    
    if (urlDatabase[key].userID === userID) {
      usersURLs[key] = {};
      usersURLs[key].longURL = urlDatabase[key].longURL;
    }

  }

  return usersURLs;
};

// check user password
const userCheckPassword = function(password) {
  let passwordCheck = false;

  for (let key of Object.keys(users)) {
    if  (bcrypt.compareSync(password, users[key].password)) {
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


module.exports = { userLookUpByEmail, writeToFile, urlsForUser, userCheckPassword, generateRandomString };