// express setup
const express = require("express");
const app = express();
const PORT = 8080;

// file-system Setup
const fs = require('fs');

////////////////////////////////////////////////////
// Database
////////////////////////////////////////////////////

const urlDatabase = require("./data/urlDataBase.json");
console.log(urlDatabase);

const writeToFile = (fileLocation, body) => {
  fs.writeFile(fileLocation, body, error => {
    if (error) {
      console.error(error);
    }
    console.log(`Downloaded and saved ${body.length} bytes to ${fileLocation}`);
  });
};


// use ejs
app.set("view engine", "ejs");

// parse data in buffer to make it readable.
app.use(express.urlencoded({ extended: true }));

////////////////////////////////////////////////////
// Routes
////////////////////////////////////////////////////

app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// All Urls List
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render('urls_index', templateVars);
});

// New URL Form SHOW
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Submit new URL
app.post("/urls", (req, res) => {
  console.log(req.body);

  const shortUrl = generateRandomString(6);
  urlDatabase[shortUrl] = req.body.longURL;
  
  // Write database to File. TODO - Do it one line at a time. Move into helper function.
  
  const jsonString = JSON.stringify(urlDatabase);
  
  fs.writeFile('./data/urlDataBase.json', jsonString, err => {
    if (err) {
      console.log('Error writing file', err);
    } else {
      console.log('Successfully wrote file');
    }
  });

  res.redirect(303, `/urls/${shortUrl}`);

});

// Show Url by ID
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.render('urls_noID');
  } else {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
  }
});

// Redirect to Long URL
app.get("/u/:id", (req, res) => {
  const longURL = (urlDatabase[req.params.id]);
  if (longURL === undefined) {
    res.render('urls_noID');
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