

const express = require('express');
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Using EJS as a template engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "c1tI2c": "http://www.garatephotography.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
    urls: ["9sm5xK"]
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
    urls: []
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
    if (o[item].email === email && o[item].password === password) {
      return true;
    }
  }
  return false;
};

// Redirect / to URLs
app.get("/", (req, res) => {
  res.redirect("/urls");
})

// Serve up a JSON file of our data.
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Serve up a JSON file of our data.
app.get("/users.json", (req, res) => {
  res.json(users);
});

// Render the template to create a new URL
app.get("/urls/new", (req, res) => {
  // Read the cookie and send the user id object to the _header
  let user_id = req.cookies["user_id"];

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
  let user_id = req.cookies["user_id"];
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
  res.redirect(`/urls/${tempShort}`);
});

// Receives the request to delete a URL. Deletes the key and redirects to home.
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Gets a URL given a key and Redirects to the URL.
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Displays the info and update page of a given URL's key.
app.get("/urls/:id", (req, res) => {
  let user_id = req.cookies["user_id"];
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    user_id: users[user_id]
  };
  res.render("urls_show", templateVars);
});

// Receives the request to update an existing URL, inserts the update and redirects to home.
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

// Receives the request to login, creates a cookie with the user received and redirects to home.
app.post("/login", (req, res) => {
  let reqPassword = req.body.password;
  let reqEmail = req.body.email;
  let setCookie = req.cookies["user_id"];
  if (emailExists(users, reqEmail) && validEmailPassword(users, reqEmail, reqPassword)) {
      res.cookie("user_id", setCookie);
      res.redirect("/urls");
    } else {
      res.sendStatus(403);
    }
  });

// Receives the request to login, creates a cookie with the user received and redirects to home.
app.get("/login", (req, res) => {
  res.render("urls_login");
});

// Receives the request to delete the userrname cookie, deletes and reirects to home.
app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
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
    res.sendStatus(400);
  // Send Bad Request if the email exists already.
  } else if (checkEmail) {
    res.sendStatus(400);
  // if all good generate a new id and create a new key with the new registration info and set a cookie with the ID.
  } else {
    let tempID = generateRandomString(10, alphaNum);
    users[tempID] = {id: tempID, email: req.body.email, password: req.body.password};
    res.cookie("user_id", tempID);
    res.redirect("/urls");
  }

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
