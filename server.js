// Inports all packages
var express           = require('express');
var expressHandlebars = require('express-handlebars');
var bodyParser        = require('body-parser');
var session           = require('express-session');
var Sequelize         = require('sequelize');
var bcrypt            = require('bcryptjs');
var passport          = require('passport');
var passportLocal     = require('passport-local');
var app               = express();
var PORT = process.env.PORT || 8080;

// Connects to database
var sequelize = new Sequelize('class_db', 'root');

// bodyParser to read info from HTML
app.use(bodyParser.urlencoded({extended: false}));

// Access JS CSS and IMG folders
app.use(express.static(__dirname + '/public'));
// setting default layout to main.handlebars
app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}));
app.set('view engine','handlebars');

// Creates a Secret for user login
app.use(session({
  secret: 'shh if I tell you its not a secret',
  cookie:{
    maxAge: 1000 * 60 * 60 * 24 * 14
  },
  saveUninitialized: true,
  resave: false
}));

/*-------------------------------------------------
  MODELS
  -------------------------------------------------*/
  var Student = sequelize.define('Student',{
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate:{
        len:[1, 30]
      }
    },
    password:{
      type: Sequelize.STRING,
      allowNull: false
    },
    firstname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    teacherID: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    taID: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    taID2: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  } , {
      hooks: {
        beforeCreate: function(input){
          input.password = bcrypt.hashSync(input.password, 10);
         }
      }
    });


  var Instructor = sequelize.define('Instructor',{
    username: {
      type: Sequelize.STRING,
      unique: true,
      validate:{
        len:[1, 30]
      }
    },
    password:{
      type: Sequelize.STRING,
    },
    firstname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    teachOrTA: {
      type: Sequelize.STRING,
      allowNull: false
    },
  }, {
   hooks: {
    beforeCreate: function(input){
      input.password = bcrypt.hashSync(input.password, 10);
    }
  }
});

  // Creates a join for Instructors to student and TA to student
  Instructor.hasMany(Student);

/*-------------------------------------------------
  PASSPORT
  -------------------------------------------------*/
  app.use(passport.initialize());
  app.use(passport.session());

  //change the object used to authenticate to a smaller token, and protects the server from attacks
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    done(null, { id: id, username: id })
  });

//passport use methed as callback when being authenticated

//STUDENT PASSPORT
passport.use(new passportLocal(
  function(username, password, done) {
      //Check passwood in DB
      Student.findOne({
        where:{
          username: username
        }
      }).then(function(user){
        //check password against hash
        if(user){
          bcrypt.compare(password, user.dataValues.password, function(err,user){
            if(user){
              //if password is correcnt authenticat the user with cookie
              done(null, {id: username, username:username});
            }else{
              done(null,null);
            }
          });
        }else {
          done(null, null);
        }
      });
    }));

//INSTRUCTOR PASSPORT
passport.use(new passportLocal(
  function(username, password, done) {
      //Check passwood in DB
      Instructor.findOne({
        where:{
          username: username
        }
      }).then(function(user){
        //check password against hash
        if(user){
          bcrypt.compare(password, user.dataValues.password, function(err,user){
            if(user){
              //if password is correcnt authenticat the user with cookie
              done(null, {id: username, username:username});
            }else{
              done(null,null);
            }
          });
        }else {
          done(null, null);
        }
      });
    }));
/*-------------------------------------------------
  ROUTES
  -------------------------------------------------*/

//takes user to homepage  on page load
app.get('/', function(req, res){
  res.render('home'); //show home.handlebars
});

//takes student to login page if login in button is clicked
app.get('/login', function(req, res){
  res.render('login'); //show login.handlebars
});

//takes student to registration page if registration button is clicked and iterates thru the teacher and ta columns to present in dropdown menu

app.get('/register', function(req, res) {
  var data;
  Instructor.findAll({
    where: {
      teachOrTA:'teacher'
    }
  }).then(function(teacher) {
    data = {
      teacher: teacher
    }
    Instructor.findAll({
      where: {
        teachOrTA: 'ta'
      }
    }).then(function(ta) {
      data.ta = ta;
      res.render('register', data)
    });
  });
});

//STUDENT REGISTRATION
// Post information from form to register the student and enter into the database - this must match method=POST and action=/register in form
app.post('/student_registration', function(req, res){
  Student.create(req.body).then(function(student){ //creates new student and password in DB according to user input
    res.redirect('/student'); // sends student to student page after successfully logged in after registering
 }).catch(function(err){ // throws error message if student made an error
    console.log(err);
    res.redirect('/fail');
  });
});

app.post('/instructor_registration', function(req, res){
  Instructor.create(req.body).then(function(instructor){ //creates new student and password in DB according to user input
    res.redirect('/instructor');
    debugger; // sends student to student page after successfully logged in after registering
 }).catch(function(err){ // throws error message if student made an error
    console.log(err);
    res.redirect('/fail');
  });
});

//STUDENT LOGIN
// app.post('/login', function(req, res){
//   var student_username = req.body.student_username; //get the student_username from the student_username in the login form to verify username
//   var student_password = sha256('noonelikesawhileloop' + req.body.student_password); // adds sha256 in front of the password in the login fomr to verify password

//   Student.findOne({ //access the User table in the DB to find a User where the username = the entered username and the password = the entered password
//     where:{
//       student_username: student_username,
//       student_password: student_password
//     }
//   }).then(function(student){
//     if(student){ // if the user is a valid user, send the login successful message
//       req.session.authenticated = student;
//       res.redirct('/student');
//     }else { // if the user is not a valid user, send the login failed message
//       res.redirect('/fail');
//     }
//   }).catch(function(err){
//     throw err;
//   });
// });

//INSTRUCTOR LOGIN
// app.post('/login', function(req, res){
//   var instructor_username = req.body.instructor_username; //get the instructor_username from the instructor_username in the login form to verify username
//   var instructor_password = sha256('noonelikesawhileloop' + req.body.instructor_password); // adds sha256 in front of the password in the login fomr to verify password

//   Instructor.findOne({ //access the User table in the DB to find a User where the username = the entered username and the password = the entered password
//     where:{
//       instructor_username: instructor_username,
//       instructor_password: instructor_password
//     }
//   }).then(function(instructor){
//     if(instructor){ // if the user is a valid user, send the login successful message
//       req.session.authenticated = instructor;
//       res.redirct('/instructor');
//     }else { // if the user is not a valid user, send the login failed message
//       res.redirect('/fail');
//     }
//   }).catch(function(err){
//     throw err;
//   });
// });

app.post('/student_login',
    passport.authenticate('local', { successRedirect: '/student',
                                     failureRedirect: '/home'}));

app.get('/student', function(req,res){
  res.render('student',{
    user: req.user,
    isAuthenticated: req.isAuthenticated()
  });
});

app.post('/instructor_login',
    passport.authenticate('local', { successRedirect: '/instructor',
                                     failureRedirect: '/home'}));

app.get('/instructor', function(req,res){
  res.render('instructor',{
    user: req.user,
    isAuthenticated: req.isAuthenticated()
  });
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


