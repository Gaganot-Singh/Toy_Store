const legoData = require("./modules/legoSets");

const authData = require('./modules/auth-service.js');

const express = require("express");

const clientSessions = require('client-sessions');

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(clientSessions({
  cookieName: 'session',  
  secret: 'Assignment6', 
  duration: 5 * 60 * 1000, 
  activeDuration: 1000 * 60, 
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
  });

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
  });
  

app.get("/lego/sets", async (req, res) => {
  try {
    const selectedFilter = req.query.theme || "All"; 
    console.log(selectedFilter);
    let sets;
    if (selectedFilter === "All") {
      sets = await legoData.getAllSets();
    } else {
      sets = await legoData.getSetsByTheme(selectedFilter);
    }
    if (sets.length === 0) {
      const allSets = await legoData.getAllSets();
      res.render("sets", { sets: allSets, selectedFilter });
    } else {
      res.render("sets", { sets, selectedFilter });
    }
  } catch (error) {
    res
      .status(404)
      .render("404", { message: "No Sets found for a matching theme" });
  }
});


app.get("/lego/sets/:setID", async (req, res) => {
    try {
      const set = await legoData.getSetByNum(req.params.setID);
  
      res.render("set", { set: set });
    } catch (error) {
      res
        .status(404)
        .render("404", { message: "No Sets found for a matching ID" });
    }
  });
  
///////////ADDING
app.get("/lego/addSet", ensureLogin, async(req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render("addSet", { themes: themes });
  } catch {
    res.render("500", { message: "ERROR: Failed to GET themes from Database" });
  }
});

app.post("/lego/addSet", ensureLogin, async(req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch(err) {
    res.render("500", { message: `ERROR: ${err}` });
  }
});



///////////EDITING
app.get("/lego/editSet/:num", ensureLogin, async(req, res) => {
  try {
    const getSet = await legoData.getSetByNum(req.params.num);
    const getThemes = await legoData.getAllThemes();
    res.render("editSet", { themes: getThemes, set: getSet });
  } catch (error) {
    res.status(404).render("404", { message: error });
  }
});

app.post("/lego/editSet", ensureLogin, async(req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect("/lego/sets");
  } catch(err) {
    res.render("500", { message: `ERROR: ${err}` });
  }
});



//////////////////REMOVING
app.get("/lego/deleteSet/:num", ensureLogin, async(req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (error) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
  }
});


function ensureLogin(req, res, next) {
if (!req.session.user) {
res.redirect('/login');
} else {
next();
}
}


/////////////////////USER ROUTES


app.get('/login', (req, res) => {
res.render('login');
});

app.post('/login', (req, res) => {
req.body.userAgent = req.get('User-Agent');

authData.checkUser(req.body)
.then((user) => {
  req.session.user = {
    userName: user.userName, 
    email: user.email, 
    loginHistory: user.loginHistory 
  }

  res.redirect('/lego/sets');
})
.catch((err) => {
  res.render('login', { errorMessage: err, userName: req.body.userName });
});
});

app.get('/register', (req, res) => {
res.render('register');
});

app.post('/register', async (req, res) => {
authData.registerUser(req.body)
.then(() => {
  res.render('register', { successMessage: "User created" });
})
.catch((err) => {
  res.render('register', { errorMessage: err, userName: req.body.userName });
});
});

app.get('/logout', (req, res) => {
req.session.reset();
res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
res.render('userHistory');
});


app.get("/404", (req, res) => {
  res.render("404");
});

app.use((req, res) => {
  res.status(404).render("404", {message: "PAGE NOT FOUND!!!!",});
});


legoData.initialize()
.then(authData.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log(`app listening on:  ${HTTP_PORT}`);
    });
}).catch(function(err){
    console.log(`unable to start server: ${err}`);
});