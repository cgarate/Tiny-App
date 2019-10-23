const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");

const methodOverride = require("method-override");
const {
  emailExists,
  deleteURL,
  deleteURLForUser,
  generateRandomString,
  getArrayIndexOfUrl,
  getUserObject,
  hashPassword,
  hasUserVisited,
  insertNewURL,
  insertNewURLForUser,
  insertUniqueVisitCount,
  insertVisitCount,
  insertVisitDetail,
  validEmailPassword,
  updateStore,
} = require("./utils");

// Get the global store object
const store = require("./store");
const {
  URL_DATABASE,
  ANALYTICS,
  USERS,
  PORT,
  COOKIE_KEY_1,
  COOKIE_KEY_2,
  COOKIE_KEY_3,
} = require("./constants");

require("dotenv").config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: [COOKIE_KEY_1, COOKIE_KEY_2, COOKIE_KEY_3],
  }),
);

// override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

// Using EJS as a template engine
app.set("view engine", "ejs");

// Init the updateState helper
const updateState = updateStore(store);

const alphaNum =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Redirect / to URLs
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// Serve up a JSON file of our urls data.
app.get("/urls.json", (req, res) => {
  res.json(store[URL_DATABASE]);
});

// Serve up a JSON file of our analytics data.
app.get("/stats.json", (req, res) => {
  res.json(store[ANALYTICS]);
});

// Serve up a JSON file of our users data.
app.get("/users.json", (req, res) => {
  res.json(store[USERS]);
});

// Render the template to create a new URL
app.get("/urls/new", (req, res) => {
  // Read the cookie and send the user id object to the _header
  const userId = req.session.userId;
  !userId
    ? res.redirect("/login")
    : res.render("urls_new", {
        userId: store[USERS][userId],
      });
});

// Renders the index
app.get("/urls", (req, res) => {
  // Read the cookie and send the user id object to the _header
  const userId = req.session.userId;
  !userId
    ? res.redirect("/login")
    : res.render("urls_index", {
        urls: store[URL_DATABASE],
        userId: store[USERS][userId],
      });
});

// Inserts a new URL in our object.
// Receives the request to create a new URL, creates a random alphanumeric string to be the new key and updates the JS Data Object.
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(10, alphaNum);
  const longURL = req.body.longURL;
  const userId = req.session.userId;
  const newStateURL = insertNewURL(store[URL_DATABASE], {
    [shortURL]: longURL,
  });
  const newStateUser = insertNewURLForUser(store[USERS], userId, shortURL);
  updateState(URL_DATABASE, newStateURL);
  updateState(USERS, newStateUser);
  res.redirect("/urls/");
});

// Receives the request to delete a URL. Deletes the key and redirects to home.
app.delete("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  const urlId = req.params.id;
  // Find the index of the element in the array of shorturls that belong to the user.
  const shortURLIndex = getArrayIndexOfUrl(store[USERS], userId, urlId);
  const newStateUser = deleteURLForUser(store[USERS], userId, urlId);
  updateState(USERS, newStateUser);
  const newStateURL = deleteURL(store[URL_DATABASE], urlId);
  console.log('newStateURL', newStateURL)
  updateState(URL_DATABASE, newStateURL);
  console.log('test',updateState(URL_DATABASE, newStateURL))
  if (shortURLIndex > -1) {
    res.redirect("/urls");
  } else {
    res.status(403).redirect("/errors/403");
  }
});

// Gets a URL given a key and Redirects to the URL.
app.get("/u/:shortURL", (req, res) => {
  // If the request comes from a non-authenticated user create a cookie to track visits.
  req.session.userId = !req.session.userId
    ? generateRandomString(15, alphaNum)
    : req.session.userId;

  const username = !store[USERS][req.session.userId]
    ? "Non-Registered User"
    : store[USERS][req.session.userId].name;

  const longURL = store[URL_DATABASE][req.params.shortURL];

  // Do this FIRST! Check if user has visited the link, if not add 1 visit to the unique visit counter.
  const newStateURL =
    !hasUserVisited(
      req.session.userId,
      req.params.shortURL,
      store[ANALYTICS],
    ) && insertUniqueVisitCount(req.params.shortURL, store[ANALYTICS]);

  if (newStateURL) {
    updateState(ANALYTICS, newStateURL);
  }

  // register this visit after the unique visit.
  updateState(
    ANALYTICS,
    insertVisitCount(req.params.shortURL, store[ANALYTICS]),
  );

  // Create timestamp and object for visit detail.
  let timestamp = new Date();
  let visitDetails = {
    timestamp: timestamp.toUTCString(),
    visitorID: req.session.userId,
    visitorName: username,
  };
  const newStateAnalytics = insertVisitDetail(
    req.params.shortURL,
    visitDetails,
    store[ANALYTICS],
  );
  updateState(ANALYTICS, newStateAnalytics);

  res.redirect(longURL);
});

// Displays the info and update page of a given URL's key.
app.get("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/");
  } else if (getArrayIndexOfUrl(store[USERS], userId, req.params.id) < 0) {
    res.status(403).redirect("/errors/403");
  } else {
    let templateVars = {
      shortURL: req.params.id,
      urls: store[URL_DATABASE],
      stats: store[ANALYTICS],
      userId: store[USERS][userId],
    };
    res.render("urls_show", templateVars);
  }
});

// Receives the request to update an existing URL, inserts the update and redirects to home.
app.put("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  const urlId = req.params.id;
  if (!userId) {
    res.redirect("/urls");
  } else {
    // Find the index of the element in the array of shorturls that belong to the user.
    const shortURLIndex = getArrayIndexOfUrl(store[USERS], userId, urlId);
    if (shortURLIndex > -1) {
      store[URL_DATABASE][urlId] = req.body.longURL;
      res.redirect("/urls");
    } else {
      res.status(403).redirect("/errors/403");
    }
  }
});

// Receives the request to login, creates a cookie with the user received and redirects to home.
app.post("/login", (req, res) => {
  // Get password and email from the request body object.
  let reqPassword = req.body.password;
  let reqEmail = req.body.email;
  // validate password and email
  if (
    emailExists(store[USERS], reqEmail) &&
    validEmailPassword(store[USERS], reqEmail, reqPassword)
  ) {
    // Password and email exist but there's no cookie yet.
    // Get the userID as it is in the datasource and use it to set the cookie value.
    req.session.userId = getUserObject(store[USERS], reqEmail).id;
    res.redirect("/urls");
  } else {
    res.status(403).redirect("/errors/403");
  }
});

// Receives the request to login, creates a cookie with the user received and redirects to home.
app.get("/login", (req, res) => {
  let userId = req.session.userId;
  let templateVars = {
    userId,
  };
  res.render("urls_login", templateVars);
});

// Renders an error info page.
app.get("/errors/:statusCode", (req, res) => {
  templateVars = {
    statusCode: req.params.statusCode,
  };
  res.render("urls_error", templateVars);
});

// Receives the request to delete the username cookie, deletes and redirects to home.
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Creates a register endpoint.
app.get("/register", (req, res) => {
  let userId = req.session.userId;
  let templateVars = {
    userId,
  };
  res.render("urls_register", templateVars);
});

// Inserts a new user
app.post("/register", (req, res) => {
  const checkEmail = emailExists(store[USERS], req.body.email);

  // Don't allow empty email or password to come in.
  if (req.body.email === "" || req.body.password === "") {
    // Bad request!
    res.status(400).redirect("/errors/400");
    // Send Bad Request if the email exists already.
  } else if (checkEmail) {
    res.status(400).redirect("/errors/400");
    //res.sendStatus(400);
    // if all good generate a new id and create a new key with the new registration info and set a cookie with the ID.
  } else {
    let tempID = generateRandomString(15, alphaNum);

    const password = req.body.password;
    const hashed_password = hashPassword(password);
    store[USERS][tempID] = {
      id: tempID,
      name: req.body.name,
      email: req.body.email,
      password: hashed_password,
      shorturls: [],
    };
    req.session.userId = tempID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`HTTP Server is up and listening on port ${PORT}!`);
});
