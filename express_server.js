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

// helper functons
const { userLookUpByEmail } = require('./helpers');

////////////////////////////////////////////////////
// Databases
////////////////////////////////////////////////////

const urlDatabase = require("./data/urlDataBase.json");
const users = require("./data/users.json");

////////////////////////////////////////////////////
// session
////////////////////////////////////////////////////

const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ['not sure yet'],

  maxAge: 24 * 60 * 60 * 1000
}));

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
  const userID = req.session.userID;
  if (userID) {
    return res.redirect('/urls');
  }

  const templateVars = { user: users[req.session.userID]};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    const templateVars = { user: users[req.session.userID], noURLID: "Error: 400. You must include a name and password."};

    return res.status(400).render('errors', templateVars);
  
  }
  
  if (userLookUpByEmail(email, users)) {
    const templateVars = { user: users[req.session.userID], noURLID: "Error: 400. That email already exists."};
    return res.status(400).render('errors', templateVars);

  }

  req.session.userID = generateRandomString(6);
  users[req.session.userID] = {id: req.session.userID, email : email, password : hashedPassword};
  writeToFile('./data/users.json', users);
  res.redirect(301, '/urls');

});

// Login Get and Render

app.get("/login", (req, res) =>{
  const userID = req.session.userID;
  if (userID) {
    return res.redirect('/urls');
  }

  const templateVars = { user: users[req.session.userID]};
  res.render("login", templateVars);

});

// Login Post
app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {

    const templateVars = { user: users[req.session.userID], noURLID: "Error: 400. You must include a name and password."};
    return res.status(403).render('errors', templateVars);
  
  }
  
  if (!userLookUpByEmail(email, users)) {
    const templateVars = { user: users[req.session.userID], noURLID: "Error: 403. That email doesnt' exist"};
    return res.status(403).render('errors', templateVars);

  }

  if (!userCheckPassword(password)) {
    const templateVars = { user: users[req.session.userID], noURLID: "Error: 401. That password is wrong"};
    return res.status(401).render('errors', templateVars);
  }

  req.session.userID = userLookUpByEmail(email, users);
  
  res.redirect(303, `/urls`);

});

// Sign Out
app.post("/logout", (req, res) => {

  req.session = null;

  res.redirect(303, `/login`);

});

// All Urls List
app.get("/urls", (req, res) => {
  const userID = req.session.userID;

  if (!userID) {
    const templateVars = { user: users[req.session.userID], noURLID: "Error: 401. You need to log in to see urls"};
    
    return res.status(401).render('errors', templateVars);
  
  }
  
  const templateVars = {
    urls: urlsForUser(userID),
    user: users[req.session.userID]
  };

  res.render('urls_index', templateVars);

});

// New URL Form SHOW
app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    return res.redirect('/login');
  }

  const templateVars = { user: users[req.session.userID]};

  res.render("urls_new", templateVars);

});

// Submit new URL
app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    const templateVars = { user: users[req.session.userID], noURLID: "Error: 401. You must login to shorten an url."};
    return res.status(401).render('errors', templateVars);
  }

  const shortUrl = generateRandomString(6);
 
  urlDatabase[shortUrl] = {
    longURL : req.body.longURL,
    userID : userID
  };
  writeToFile('./data/urlDataBase.json', urlDatabase);

  res.redirect(303, `/urls/${shortUrl}`);

});

// Update an URL
app.post("/urls/:id", (req, res) => {

  const shortUrl = [req.params.id];
  urlDatabase[shortUrl].longURL = req.body.longURL;

  writeToFile('./data/urlDataBase.json', urlDatabase);
  
  res.redirect(303, `/urls/${shortUrl}`);

});

// Delete URL
app.post(`/urls/:id/delete`, (req, res) => {
  const userID = req.session.userID;

  if (!userID) {
    const templateVars = { user: users[req.session.userID], noURLID: "Error: 401. You must login."};
    return res.status(401).render('errors', templateVars);
  }

  if (!urlDatabase[req.params.id]) {
    const templateVars = { user: users[req.session.userID], noURLID: "Im sorry that url doesn't exist"};
    return res.render('errors', templateVars);
  }
  
  if (urlDatabase[req.params.id].userID !== userID) {
    const templateVars = { user: users[req.session.userID], noURLID: "Error: 401. No ShortURl Like that."};
    return res.status(401).render('errors', templateVars);
  }

  delete urlDatabase[req.params.id];

  writeToFile('./data/urlDataBase.json', urlDatabase);
  
  const templateVars = { user: req.session.userID};
  res.redirect('/urls', 301, templateVars);

});

// Show Url by ID
app.get("/urls/:id", (req, res) => {
  const userID = req.session.userID;


  if (!userID) {
    const templateVars = { user: req.session.userID, noURLID: "Error: 401. You must login."};
    return res.status(401).render('errors', templateVars);
  }
 
  if (!urlDatabase[req.params.id]) {
    const templateVars = { user: req.session.userID, noURLID: "Im sorry that url doesn't exist"};
    return res.render('errors', templateVars);
  }

  if (urlDatabase[req.params.id].userID !== userID) {
    const templateVars = { user: req.session.userID, noURLID: "Error: 401. No ShortURl Like that."};
    return res.status(401).render('errors', templateVars);
  }
  
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.userID] };
  res.render("urls_show", templateVars);


});

// Redirect to Long URL
app.get("/u/:id", (req, res) => {
  const longURL = (urlDatabase[req.params.id].longURL);
  const templateVars = { user: users[req.session.userID]};

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
