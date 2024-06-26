const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const routes = require("./server/routes/recipeRoutes.js");
const path = require("path");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');


const app = express();
const port = process.env.PORT || 3000;

require('dotenv').config();

//middlewares
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(expressLayouts);
app.use(cookieParser('CookingBlogSecure'));
app.use(session({
    secret: "CookingBlogSecretSession",
    saveUninitialized: true,
    resave: true,
}));

app.use(flash());
app.use(fileUpload());



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", './layouts/main');


//Routes
app.use(routes);





//Listening on port 3000
app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
})