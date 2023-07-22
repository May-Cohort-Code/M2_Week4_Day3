// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

require('./config/session.config')(app);


// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// default value for title local
const capitalize = require("./utils/capitalize");
const projectName = "basic-auth";

app.locals.appTitle = `${capitalize(projectName)} created with IronLauncher`;
app.use((req, res, next) => {
    console.log('Omar')
    app.locals.session = req.session.currentUser 
    // res.locals.session = req.session
    console.log(app.locals)

    next()
})

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/", indexRoutes);

app.use('/',require('./routes/auth.routes'))

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
