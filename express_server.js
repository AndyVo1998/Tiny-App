const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require("cookie-parser")
const bcrypt = require("bcrypt");
const cookieSession = require('cookie-session')

app.use(cookieSession({
  name: "session",
  maxAge: 24 * 60 * 60 * 1000,
  keys: ["SOMESTRING"]
}))
app.set("view engine", "ejs");

const users = {};

let urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca"},
  "9sm5xK": {longURL: "http://www.google.com"}
};

//If a user is not logged in, redirect to login page
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login")
  } else {
    res.redirect("/urls")
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n")
});

//Home page
app.get("/urls", (req, res) => {
  let arr = Object.entries(urlDatabase);
  let templateVars = { urls: arr, users: users, urlDatabase: urlDatabase, user_id: req.session.user_id };
  if (req.session.user_id) {
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send("403 Please log in to continue.")
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Can only create a new link if user is logged in
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = { user_id: req.session["user_id"], users: users };
    res.render("urls_new", templateVars);
  } else {
    res.status(403).send("Forbidden")
  }
});

//DELETE URL
app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[key].userID === req.session["user_id"]) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(403).send("Forbidden")
  }
});

//Edit URL page
app.get("/urls/:id", (req, res) => {
  if (urlDatabase[key].userID === req.session.user_id) {
    let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL, user_id: req.session.user_id, users: users };
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send("Forbidden")
  }
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//MAKES NEW SHORT URL
app.post("/urls", (req, res) => {
  let userId = req.session.user_id;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  //urlObj contains the new longURL and the current users ID that is then pushed to the database
  let urlObj = {
    longURL: longURL,
    userID: userId
  }
  if (longURL) {
    urlDatabase[shortURL] = urlObj;
    res.redirect("/urls");
  } else {
    res.status(403).send("No Link entered")
  }
});

function generateRandomString() {
  let rand = Math.random().toString(36).substring(2, 8);
  return rand;
}

//redirects to A website that correlates to the shortURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[key].longURL;
  res.redirect(longURL);
});

//Users can only access the edit page for their own links
app.post("/urls/:id", (req, res) => {
  if (urlDatabase[key].userID === req.session.user_id) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(403).send("Forbidden")
  }
})

app.post("/login", (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    //Error if no email or password are entered
    res.status(403).send("Enter required fields...");
  } else {
    let foundEmail = Object.values(users).find(user => user.email === email);
    //if the email that is entered is not registered in the database, return error
    if (!foundEmail || !bcrypt.compareSync(password, foundEmail.password)) {
      res.status(403).send("Email or password invalid...")
    } else {
      req.session.user_id = foundEmail.id
      res.redirect("/urls");
    }
  }
})

app.post("/logout", (req, res) => {
  req.session = null;
  //clears cookie session
  res.redirect("/login")
})

app.get("/register", (req,res) => {
  let templateVars = { users: users };
  res.render("urls_register", templateVars)
})

app.post("/register", (req, res) => {
  let rand = Math.random().toString(36).substring(2, 8);
  let { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Email and Password fields required...")
  } else {
    let foundEmail = Object.values(users).find(user => user.email === email);
    //Checks if email is already in database
    if (!foundEmail) {
      users[rand] = {
        id: rand,
        email: req.body.email,
        password: hashedPassword
      }
      //assigns a random 6 character string as the users ID
      req.session[rand] = "user_id"
      res.redirect("/login")
    } else {
      res.status(400).send("Email already registered!")
    }
  }
})

app.get("/login", (req, res) => {
  res.render("urls_login")
})















