var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require("cookie-parser")
const bcrypt = require("bcrypt");

app.use(cookieParser())
app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

var urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca"},
  "9sm5xK": {longURL: "http://www.google.com"}
};


app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n")
});

app.get("/urls", (req, res) => {
  let arr = Object.entries(urlDatabase);
  let templateVars = { urls: arr, users: users, urlDatabase: urlDatabase, user_id: req.cookies["user_id"] };
  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = { user_id: req.cookies["user_id"], users: users };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/urls")
  }
});

//DELETE URL
app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[key].userID === req.cookies["user_id"]) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(403).send("Forbidden")
  }
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL, user_id: req.cookies["user_id"], users: users };
  res.render("urls_show", templateVars);
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//MAKES NEW SHORT URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  let urlObj = {
    longURL: longURL,
    userID: req.cookies["user_id"]
  }
  if (longURL) {
    urlDatabase[shortURL] = urlObj;
    res.redirect("/urls");
  } else {
    res.status(403).send("No Link entered")
  }
});

function generateRandomString() {
  var rand = Math.random().toString(36).substring(2, 8);
  return rand;
}

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[key].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  if (urlDatabase[key].userID === req.cookies["user_id"]) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(403).send("Forbidden")
  }
})

app.post("/login", (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    res.status(403).send("Enter required fields...");
  } else {
    let foundEmail = Object.values(users).find(user => user.email === email);
    if (!foundEmail || !bcrypt.compareSync(password, foundEmail.password)) {
      res.status(403).send("Email or password invalid...")
    } else {
      res.cookie("user_id", foundEmail.id);
      res.redirect("/urls");
    }
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.user_id)
  res.redirect("/urls")
})

app.get("/register", (req,res) => {
  let templateVars = { user_id: req.cookies["user_id"], users: users };
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
    if (!foundEmail) {
      users[rand] = users.id;
      users[rand] = {
        id: rand,
        email: req.body.email,
        password: hashedPassword
      }
      res.cookie("user_id", rand)
      res.redirect("/urls")
      console.log(users)
    } else {
      res.status(400).send("Email already registered!")
    }
  }
})

app.get("/login", (req, res) => {
  res.render("urls_login")
})















