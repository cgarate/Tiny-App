

const express = require('express');
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const methodOverride = require('method-override')

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["supercalifragilisticoespialidoso","madagascar","constantinopla"]
}));

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))

// Using EJS as a template engine
app.set("view engine", "ejs");

// Our data sources for the moment.
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "c1tI2c": "http://www.garatephotography.com",
  "8e3tv1": "http://www.garateca.com",
  "4ttQiE": "http://tamarilana.com"
};

const users = {
  "GxCvqkBqjb": {
    "id": "GxCvqkBqjb",
    "name": "Carlos",
    "email": "cgarate@yahoo.com",
    "password": "$2a$10$wIKnpO0g24PpSHLpkKN04eQsY1exMqZ64Tz.E6x35MI5KuA5tfiSi",
    "shorturls": ["b2xVn2","9sm5xK"]
  },
  "uzkdmiPXse": {
    "id": "uzkdmiPXse",
    "name": "Carlos",
    "email": "carlos.m.garate@gmail.com",
    "password": "$2a$10$fmIWP1ik263MiUv2D0lMku66VWP/1cPL7jL78wBLBmL7ASU/bDiSO",
    "shorturls": ["c1tI2c","8e3tv1"]
  },
  "iYy4FTIhWe": {
    "id": "iYy4FTIhWe",
    "name": "Tamar",
    "email": "tamarilana@gmail.com",
    "password": "$2a$10$/03iiHJRNgKAxf7FaHFz/uh69zxpV9/yxl.UkgkPF.C/p9HkIEcXG",
    "shorturls": ["4ttQiE"]
  }
}

const alphaNum = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateRandomString(length, chars) {
    let result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

function getEmailList(o) {
  let arrayOfUserIDs = Object.keys(o);
  let resArray = [];
  for (let item of arrayOfUserIDs) {
    resArray.push(o[item].email);
  }
  return resArray;
};

function emailExists(o, email) {
  let result = getEmailList(o).some((e) => {return e === email});
  return result;
};

function validEmailPassword(o, email, password) {
  let arrayOfUserIDs = Object.keys(o);
  for (let item of arrayOfUserIDs) {
    if (o[item].email === email && bcrypt.compareSync(password, o[item].password)) {
      return true;
    }
  }
  return false;
};

function getUserID(o, email, password) {
  let arrayOfUserIDs = Object.keys(o);
  for (let item of arrayOfUserIDs) {
    if (o[item].email === email && bcrypt.compareSync(password, o[item].password)) {
      return o[item].id;
    }
  }
  return null;
};

// Redirect / to URLs
app.get("/", (req, res) => {
  res.redirect("/urls");
})

// Serve up a JSON file of our urls data.
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Serve up a JSON file of our users data.
app.get("/users.json", (req, res) => {
  res.json(users);
});

// Render the template to create a new URL
app.get("/urls/new", (req, res) => {
  // Read the cookie and send the user id object to the _header
  let user_id = req.session.user_id;
  if (user_id === undefined) {
    res.redirect("/login");
  } else {
    let templateVars = {
    user_id: users[user_id]
     };
    res.render("urls_new", templateVars);
  }
});

// Renders the index
app.get("/urls", (req, res) => {
  // Read the cookie and send the user id object to the _header
  let user_id = req.session.user_id;
  let templateVars = {
    urls: urlDatabase,
    user_id: users[user_id]
     };
  res.render("urls_index", templateVars);
});

// Inserts a new URL in our object.
// Receives the request to create a new URL, creates a random alphanumeric string to be the new key and updates the JS Data Object.
app.post("/urls", (req, res) => {
  let tempShort = generateRandomString(6, alphaNum);
  urlDatabase[tempShort] = req.body.longURL;
  users[req.session.user_id].shorturls.push(tempShort);
  res.redirect(`/urls/${tempShort}`);
});

// Receives the request to delete a URL. Deletes the key and redirects to home.
app.delete("/urls/:id", (req, res) => {
  let user_id = req.session.user_id;
  // Find the index of the element in the array of shorturls that belong to the user.
  let index = users[user_id].shorturls.findIndex(e => e === req.params.id);

  if (users[user_id].shorturls[index] === req.params.id) {
    delete urlDatabase[req.params.id];
    // Remove the URL from the users' array.
    users[user_id].shorturls.splice(index, 1);
    res.redirect("/urls");
  } else {
    res.status(403).redirect("/errors/403");
    //res.sendStatus(403);
  }

});

// Gets a URL given a key and Redirects to the URL.
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Displays the info and update page of a given URL's key.
app.get("/urls/:id", (req, res) => {
  let user_id = req.session.user_id;
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    user_id: users[user_id]
  };
  res.render("urls_show", templateVars);
});

// Receives the request to update an existing URL, inserts the update and redirects to home.
app.put("/urls/:id", (req, res) => {
  let user_id = req.session.user_id;
  if (user_id === undefined) {
    res.redirect("/urls");
  } else {
    // Find the index of the element in the array of shorturls that belong to the user.
    let index = users[user_id].shorturls.findIndex(e => e === req.params.id);
    if (users[user_id].shorturls[index] === req.params.id) {
      urlDatabase[req.params.id] = req.body.longURL;
      res.redirect("/urls");
    } else {
      res.status(403).redirect("/errors/403");
      //res.sendStatus(403);
    }
  }

});

// Receives the request to login, creates a cookie with the user received and redirects to home.
app.post("/login", (req, res) => {
  // Get password and email from the request body object.
  let reqPassword = req.body.password;
  let reqEmail = req.body.email;
  // Get the user id cookie
  let setCookie = req.session.user_id;
  // validate password and email
  if (emailExists(users, reqEmail) && validEmailPassword(users, reqEmail, reqPassword)) {
      // Password and email exist but there's no cookie.
      // Get the userID as it is in the datasource and use it to set the cookie value.
        req.session.user_id = getUserID(users, reqEmail, reqPassword);
        res.redirect("/urls");

    } else {
      res.status(403).redirect("/errors/403");
    }
  });

// Receives the request to login, creates a cookie with the user received and redirects to home.
app.get("/login", (req, res) => {
  res.render("urls_login");
});

// Renders an error info page.
app.get("/errors/:sc", (req, res) => {
  templateVars = {
    sc: req.params.sc
  }
  res.render("urls_error", templateVars);
});

// Receives the request to delete the userrname cookie, deletes and reirects to home.
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Creates a register endpoint.
app.get("/register", (req, res) => {
  res.render("urls_register");
});

// Inserts a new user
app.post("/register", (req, res) => {
  // get an array of all the emails in the users object.
  // Use some to check if any of them matches the one sent by the user wanting to register.
  let checkEmail = emailExists(users, req.body.email);

  // Don't allow empty email or password to come in.
  if (req.body.email === "" || req.body.password === "") {
    // Bad request!
    res.status(400).redirect("/errors/400");
    //res.sendStatus(400);
  // Send Bad Request if the email exists already.
  } else if (checkEmail) {
    res.status(400).redirect("/errors/400");
    //res.sendStatus(400);
  // if all good generate a new id and create a new key with the new registration info and set a cookie with the ID.
  } else {
    let tempID = generateRandomString(10, alphaNum);

    const password = req.body.password;
    const hashed_password = bcrypt.hashSync(password, 10);
    users[tempID] = {id: tempID, name: req.body.name, email: req.body.email, password: hashed_password, shorturls: []};
    req.session.user_id = tempID;
    res.redirect("/urls");
  }

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
