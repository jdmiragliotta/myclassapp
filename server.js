// Inports all packages
var express           = require('express');
var expressHandlebars = require('express-handlebars');
var session           = require('express-session');
var Sequelize         = require('sequelize');
var app               = express();
var PORT = process.env.PORT || 8080;

// Connects to database
var sequelize = new Sequelize('class_db', 'root');


/*-------------------------------------------------
  PASSPORT
  -------------------------------------------------*/

// Creates a Secret for user login
var passport          = require('passport');
var passportLocal     = require('passport-local');
app.use(session({
  secret: 'shh if I tell you its not a secret',
  cookie:{
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 14
  },
  saveUninitialized: true,
  resave: true
}));
  app.use(passport.initialize());
  app.use(passport.session());

//passport use methed as callback when being authenticated

//STUDENT PASSPORT
passport.use(new passportLocal.Strategy(
  function(username, password, done) {
      //Check passwood in DB
      Student.findOne({
        where:{
          username: username
        }
      }).then(function(user){
        //check password against hash
        if(user){
          bcrypt.compare(password, user.dataValues.password, function(err, user){
            if(user){
              //if password is correcnt authenticate the user with cookie
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

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    done(null, { id: id, username: id })
  });

// //INSTRUCTOR PASSPORT
passport.use(new passportLocal.Strategy(
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

// bodyParser to read info from HTML
var bcrypt            = require('bcryptjs');
var bodyParser        = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

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

  app.use(express.static(__dirname + '/public'));
// setting default layout to main.handlebars
  app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}));
  app.set('view engine','handlebars');



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

//STUDENT REGISTRATION - FOR PASSPORT
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
    res.redirect('/instructor', {instructor});
   // sends student to student page after successfully logged in after registering
 }).catch(function(err){ // throws error message if student made an error
    console.log(err);
    res.redirect('/fail');
  });
});


app.get('/student', function(req,res){
  res.render('student',{
    user: req.user,
    isAuthenticated: req.isAuthenticated()
  });
});


app.post('/instructor_login',
  passport.authenticate('local', {
    successRedirect: '/instructor',
    failureRedirect: '/login'}));


app.get('/instructor', function(req,res){
  res.render('instructor',{
    username: req.username,
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


