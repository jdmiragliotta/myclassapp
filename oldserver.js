
// // STUDENT REGISTER
// app.post('/register', function(req,res){
//   var username = req.body.username; //get the username from the username in the registration form
//   var password = sha256('noonelikesawhileloop' + req.body.password); // adds sha256 in front of the enter password to make it more sercure
//   Student.create({username: username, password: password}).then(function(student){ //creates new user and password in DB according to user input
//       req.session.authenticated = student; // Authenticates a approved user
//       res.redirect('/student'); // sends user message that they have successfully logged in after registering
//    }).catch(function(err){ // throws error message if user made an error
//       console.log(err);
//       res.redirect('/register');
//    });
// });


// // INSTRUCTOR  REGISTER
// app.post('/instructor_registration', function(req,res){
//   var username = req.body.username; //get the username from the username in the registration form
//   var password = sha256('noonelikesawhileloop' + req.body.password); // adds sha256 in front of the enter password to make it more sercure
//   Instructor.create({username: username, password: password}).then(function(instructor){ //creates new user and password in DB according to user input
//       req.session.authenticated = instructor; // Authenticates a approved user
//       res.redirect('/instructor'); // sends user message that they have successfully logged in after registering
//    }).catch(function(err){ // throws error message if user made an error
//       console.log(err);
//       res.redirect('/register');
//    });
// });

// //STUDENT LOGIN
// app.post('/student_login', function(req, res){
//   var username = req.body.username; //get the student_username from the student_username in the login form to verify username
//   var password = sha256('noonelikesawhileloop' + req.body.password); // adds sha256 in front of the password in the login fomr to verify password

//   Student.findOne({ //access the User table in the DB to find a User where the username = the entered username and the password = the entered password
//     where:{
//       username: username,
//       password: password
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

// //INSTRUCTOR LOGIN
// app.post('/instructor_login', function(req, res){
//   var instructor_username = req.body.instructor_username; //get the instructor_username from the instructor_username in the login form to verify username
//   var instructor_password = sha256('noonelikesawhileloop' + req.body.instructor_password); // adds sha256 in front of the password in the login fomr to verify password

//   Instructor.findOne({ //access the User table in the DB to find a User where the username = the entered username and the password = the entered password
//     where:{
//       username: username,
//       password: password
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

// app.post('/student_login',
//   passport.authenticate('local', {
//     successRedirect: '/student',
//     failureRedirect: '/login'}));
