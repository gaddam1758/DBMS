  
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const  app = express();
//conction to database
mongoose.connect('mongodb://localhost/dbms',{useNewUrlParser: true})
.then(()=>console.log('mongodb connected'))
.catch(err=>console.log(err));
// Passport Config
require('./config/passport')(passport);
//EJS
app.use(expressLayouts);
app.set('view engine','ejs');
// Express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );
  
  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Connect flash
  app.use(flash());
  
  // Global variables
  app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');

    next();
  });

//BodyParser
app.use(express.urlencoded({extended: false}));
//Routes
app.use('/',require('./routes/index'));
app.use('/faculty',require('./routes/faculty'));
app.use('/student',require('./routes/student'));
app.use('/faculty_advisor',require('./routes/faculty_advisor'));
app.listen(5000, console.log('server started on port 5000'));