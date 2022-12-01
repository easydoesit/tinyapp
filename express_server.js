// express setup
const express = require("express");
const app = express();
const PORT = 8080;

// bcrypt setup
const bcrypt = require("bcryptjs");

// use ejs
app.set("view engine", "ejs");

// parse data in buffer to make it readable.
app.use(express.urlencoded({ extended: true }));

// file-system Setup
const fs = require('fs');

// middleware set up
const morgan = require("morgan");
app.use(morgan('dev'));

////////////////////////////////////////////////////
// Databases
////////////////////////////////////////////////////

const urlDatabase = require("./data/urlDataBase.json");
const users = require("./data/users.json");

////////////////////////////////////////////////////
// Cookies
////////////////////////////////////////////////////

const cookieParser = require('cookie-parser');
app.use(cookieParser());

////////////////////////////////////////////////////
// Routes
////////////////////////////////////////////////////

app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// register
app.get("/register", (req, res) => {
  const userID = req.cookies.userID;
  if (userID) {
    return res.redirect('/urls');
  }

  const templateVars = { user: users[req.cookies["userID"]]};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    const templateVars = { user: users[req.cookies["userID"]], noURLID: "Error: 400. You must include a name and password."};
    
    return res.status(400).render('errors', templateVars);
  
  }
  
  if (userLookUpByEmail(email)) {
    const templateVars = { user: users[req.cookies["userID"]], noURLID: "Error: 400. That email already exists."};
    return res.status(400).render('errors', templateVars);

  }

  const userID = generateRandomString(6);
  users[userID] = {id: userID, email : email, password : hashedPassword};
  writeToFile('./data/users.json', users);
  res.cookie('userID', userID);
  res.redirect(301, '/urls');

});

// Login Get and Render

app.get("/login", (req, res) =>{
  const userID = req.cookies.userID;
  if (userID) {
    return res.redirect('/urls');
  }

  const templateVars = { user: users[req.cookies["userID"]]};
  res.render("login", templateVars);

});

// Login Post
app.post("/login", (req, res) => {

  const email = req.body.email;
  console.log(email);
  const password = req.body.password;

  if (!email || !password) {

    const templateVars = { user: users[req.cookies["userID"]], noURLID: "Error: 400. You must include a name and password."};
    return res.status(403).render('errors', templateVars);
  
  }
  
  if (!userLookUpByEmail(email)) {
    const templateVars = { user: users[req.cookies["userID"]], noURLID: "Error: 403. That email doesnt' exist"};
    return res.status(403).render('errors', templateVars);

  }

  if (!userCheckPassword(password)) {
    const templateVars = { user: users[req.cookies["userID"]], noURLID: "Error: 401. That password is wrong"};
    return res.status(401).render('errors', templateVars);
  }

  const userID = userLookUpByEmail(email);
  
  res.cookie('userID', userID);

  res.redirect(303, `/urls`);

});

// Sign Out
app.post("/logout", (req, res) => {

  res.clearCookie('userID', req.body);

  res.redirect(303, `/login`);

});

// All Urls List
app.get("/urls", (req, res) => {
  const userID = req.cookies.userID;

  if (!userID) {
    const templateVars = { user: users[req.cookies["userID"]], noURLID: "Error: 401. You need to log in to see urls"};
    
    return res.status(401).render('errors', templateVars);
  
  }
  
  const templateVars = {
    urls: urlsForUser(userID),
    user: users[req.cookies["userID"]]
  };

  res.render('urls_index', templateVars);

});

// New URL Form SHOW
app.get("/urls/new", (req, res) => {
  const userID = req.cookies.userID;
  if (!userID) {
    return res.redirect('/login');
  }

  const templateVars = { user: users[req.cookies["userID"]]};

  res.render("urls_new", templateVars);

});

// Submit new URL
app.post("/urls", (req, res) => {
  const userID = req.cookies.userID;
  if (!userID) {
    const templateVars = { user: users[req.cookies["userID"]], noURLID: "Error: 401. You must login to shorten an url."};
    return res.status(401).render('errors', templateVars);
  }
  console.log(req.body.longURL);
  const shortUrl = generateRandomString(6);
  console.log(shortUrl);
  urlDatabase[shortUrl] = {
    longURL : req.body.longURL,
    userID : userID
  };
  writeToFile('./data/urlDataBase.json', urlDatabase);

  res.redirect(303, `/urls/${shortUrl}`);

});

// Update an URL
app.post("/urls/:id", (req, res) => {
  console.log(req.body);
  const shortUrl = [req.params.id];
  urlDatabase[shortUrl].longURL = req.body.longURL;

  writeToFile('./data/urlDataBase.json', urlDatabase);
  
  res.redirect(303, `/urls/${shortUrl}`);

});

// Delete URL
app.post(`/urls/:id/delete`, (req, res) => {
  const userID = req.cookies.userID;

  if (!userID) {
    const templateVars = { user: users[req.cookies["userID"]], noURLID: "Error: 401. You must login."};
    return res.status(401).render('errors', templateVars);
  }

  if (!urlDatabase[req.params.id]) {
    const templateVars = { user: users[req.cookies["userID"]], noURLID: "Im sorry that url doesn't exist"};
    return res.render('errors', templateVars);
  }
  
  if (urlDatabase[req.params.id].userID !== userID) {
    const templateVars = { user: users[req.cookies["userID"]], noURLID: "Error: 401. No ShortURl Like that."};
    return res.status(401).render('errors', templateVars);
  }

  delete urlDatabase[req.params.id];

  writeToFile('./data/urlDataBase.json', urlDatabase);
  const templateVars = { user: users[req.cookies["userID"]]};
  res.redirect(301, '/urls', templateVars);

});

// Show Url by ID
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies.userID;
  console.log(req.params);

  if (!userID) {
    const templateVars = { user: users[req.cookies["userID"]], noURLID: "Error: 401. You must login."};
    return res.status(401).render('errors', templateVars);
  }
 
  if (!urlDatabase[req.params.id]) {
    const templateVars = { user: users[req.cookies["userID"]], noURLID: "Im sorry that url doesn't exist"};
    return res.render('errors', templateVars);
  }

  if (urlDatabase[req.params.id].userID !== userID) {
    const templateVars = { user: users[req.cookies["userID"]], noURLID: "Error: 401. No ShortURl Like that."};
    return res.status(401).render('errors', templateVars);
  }
  
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.cookies["userID"]] };
  res.render("urls_show", templateVars);


});

// Redirect to Long URL
app.get("/u/:id", (req, res) => {
  const longURL = (urlDatabase[req.params.id].longURL);
  const templateVars = { user: users[req.cookies["userID"]]};

  if (longURL === undefined) {
    res.render('urls_noID', templateVars);
  } else {
    res.redirect(301, longURL);
  }

});


////////////////////////////////////////////////////
// Server Listening...
////////////////////////////////////////////////////

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);

});

// Functions

const generateRandomString = function(size) {
  let result = "";
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < size; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;

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

// look up user by email
const userLookUpByEmail = function(email) {
  let userID;
  
  for (let key of Object.keys(users)) {

    if (users[key].email === email) {
      userID = key;
    }
  
  }

  return userID;

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
