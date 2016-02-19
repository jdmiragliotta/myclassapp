// Inports all packages
var express           = require('express');
var expressHandlebars = require('express-handlebars');
var bodyParser        = require('body-parser');
var session           = require('express-session');
var Sequelize         = require('sequelize');
var sha256            = require('sha256');
var mysql             =require('mysql');
var app               = express();
var PORT = process.env.PORT || 8080;

// Connects to database
var sequelize = new Sequelize('class_db', 'root');

// bodyParser to read info from HTML
app.use(bodyParser.urlencoded({extended: false}));

// setting default layout to main.handlebars
app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}));

// setting view to all handlebar pages
app.set('view engine','handlebars');
