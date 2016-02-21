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

//Set Up For Student Table in class_db
var Student = sequelize.define('Student',{
  student_username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate:{
      len:[1, 30]
    }
  },
  student_password:{
    type: Sequelize.STRING,
  }
});

var Instructor = sequelize.define('Instructor',{
  instructor_username: {
    type: Sequelize.STRING,
    unique: true,
    validate:{
      len:[1, 30]
    }
  },
  instructor_password:{
    type: Sequelize.STRING,
  }
});

var TA = sequelize.define('TA',{
  ta_username: {
    type: Sequelize.STRING,
    unique: true,
    validate:{
      len:[1, 30]
    }
  },
  ta_password:{
    type: Sequelize.STRING,
  }
});

// Creates a join for Instructors to student and TA to student
Instructor.hasMany(Student);
TA.hasMany(Student);

app.use(express.static('public'));

// Creates a Secret for user login
app.use(session({
  secret: 'shh if I tell you its not a secret',
  cookie:{
    maxAge: 1000 * 60 * 60 * 24 * 14
  },
  saveUninitialized: true,
  resave: false
}));

//takes user to homepage  on page load
app.get('/', function(req, res){
  res.render('home'); //show home.handlebars
});

//takes student to login page if login in button is clicked
app.get('/login', function(req, res){
  res.render('login'); //show login.handlebars
});

//takes student to registration page if registration button is clicked
app.get('/register', function(req, res){
  res.render('register'); //show register.handlebars
});

//STUDENT REGISTRATION
// Post information from form to register the student and enter into the database - this must match method=POST and action=/register in form
app.post('/register', function(req,res){
  var student_username = req.body.student_username; //get the student_username from the student_username in the registration form
 //USE HOOK FROM CLASS
  var password = sha256('noonelikesawhileloop' + req.body.student_password); // adds sha256 in front of the enter student_password to make it more secure
  Student.create({student_username: student_username, student_password: student_password}).then(function(student){ //creates new student and password in DB according to user input
    req.session.authenticated = student; // Authenticates an approved student
    res.redirect('/student'); // sends student to student page after successfully logged in after registering
 }).catch(function(err){ // throws error message if student made an error
  console.log(err);
  res.redirct('/fail');
});
});

//STUDENT LOGIN
app.post('/login', function(req, res){
  var student_username = req.body.student_username; //get the student_username from the student_username in the login form to verify username
  var student_password = sha256('noonelikesawhileloop' + req.body.student_password); // adds sha256 in front of the password in the login fomr to verify password

  Student.findOne({ //access the User table in the DB to find a User where the username = the entered username and the password = the entered password
    where:{
      student_username: student_username,
      student_password: student_password
    }
  }).then(function(student){
    if(student){ // if the user is a valid user, send the login successful message
      req.session.authenticated = student;
      res.redirct('/student');
    }else { // if the user is not a valid user, send the login failed message
      res.redirect('/fail');
    }
  }).catch(function(err){
    throw err;
  });
});

//INSTRUCTOR LOGIN
app.post('/login', function(req, res){
  var instructor_username = req.body.instructor_username; //get the instructor_username from the instructor_username in the login form to verify username
  var instructor_password = sha256('noonelikesawhileloop' + req.body.instructor_password); // adds sha256 in front of the password in the login fomr to verify password

  Instructor.findOne({ //access the User table in the DB to find a User where the username = the entered username and the password = the entered password
    where:{
      instructor_username: instructor_username,
      instructor_password: instructor_password
    }
  }).then(function(instructor){
    if(instructor){ // if the user is a valid user, send the login successful message
      req.session.authenticated = instructor;
      res.redirct('/instructor');
    }else { // if the user is not a valid user, send the login failed message
      res.redirect('/fail');
    }
  }).catch(function(err){
    throw err;
  });
});

app.get('/student', function(req,res){
  if(req.session.authenticated){
    res.render('student');
  }else{
    res.render('fail');
  }
});

app.get('/instructor', function(req,res){
  if(req.session.authenticated){
    res.render('instructor');
  }else{
    res.render('fail');
  }
});

app.get('/logout', function(req,res){
  req.session.authenticated = false;
  res.redirect('/');
});

sequelize.sync().then(function(){
  app.listen(PORT, function(){
    console.log("Boom");
  });
});


