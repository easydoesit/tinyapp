// express setup
const express = require("express");
const app = express();
const PORT = 8080;

// use ejs
app.set("view engine", "ejs");

// parse data in buffer to make it readable.
app.use(express.urlencoded({ extended: true }));

// file-system Setup
const fs = require('fs');

////////////////////////////////////////////////////
// Databases
////////////////////////////////////////////////////

const urlDatabase = require("./data/urlDataBase.json");
const users = require("./data/users.json");
//console.log(urlDatabase);

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register.json", (req, res) => {
  res.json(users);
});


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
  res.render("register");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === "" || password === "") {
    console.log("empty string");
    res.send("Error: 400. You must include a name and password.");
  } else if (userLookUpByEmail(email)) {
    console.log("email exists");
    res.send("Error: 400. That email already exists");
  } else {
    const userID = generateRandomString(6);
    users[userID] = {id: userID, email : email, password : password};
    writeToFile('./data/users.json', users);
    res.cookie('userID', userID);
    res.redirect(301, '/urls');
  }
});

// Sign in

app.get("/login", (req, res) =>{
  res.render("login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  res.cookie('userID', req.body);

  res.redirect(303, `/urls`);

});

// Sign Out
app.post("/logout", (req, res) => {
  console.log(req.body);
  res.clearCookie('userID', req.body);

  res.redirect(303, `/urls`);

});

// All Urls List
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["userID"]]
  };
  console.log(templateVars);
  res.render('urls_index', templateVars);

});

// New URL Form SHOW
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["userID"]]};
  console.log(templateVars);
  res.render("urls_new", templateVars);
});

// Submit new URL
app.post("/urls", (req, res) => {
  console.log(req.body);

  const shortUrl = generateRandomString(6);
  urlDatabase[shortUrl] = req.body.longURL;
  
  // Write database to File.
  writeToFile('./data/urlDataBase.json', urlDatabase);

  res.redirect(303, `/urls/${shortUrl}`);

});

// Update an URL
app.post("/urls/:id", (req, res) => {
  //console.log(req.body);
  const shortUrl = [req.params.id];
  //console.log(shortUrl);
  urlDatabase[shortUrl] = req.body.longURL;

  writeToFile('./data/urlDataBase.json', urlDatabase);
  
  res.redirect(303, `/urls/${shortUrl}`);

});

// Delete URL
app.post(`/urls/:id/delete`, (req, res) => {
  delete urlDatabase[req.params.id];
  // Write database to File.
  writeToFile('./data/urlDataBase.json', urlDatabase);
  
  res.redirect(301, '/urls');
});

// Show Url by ID
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    const templateVars = { user: users[req.cookies["userID"]]};
    res.render('urls_noID', templateVars);
  } else {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["userID"]] };
    res.render("urls_show", templateVars);
  }
});

// Redirect to Long URL
app.get("/u/:id", (req, res) => {
  const longURL = (urlDatabase[req.params.id]);
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
  for (let key of Object.keys(users))
    if (users[key].email === email) {
      return true;
    } else return false;
};


