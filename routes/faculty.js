const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth')
const { Pool } = require('pg');
//User model
const User = require('../model/User');
//Login Page
//databse connection
connectionStringnew = "postgres://postgres:ram@localhost:5432/academics";
dbname = "academics";
pool = new Pool({
  connectionString: connectionStringnew
});
//
pool.connect();
router.get('/login', (req, res) => res.render('login', { select: 'faculty', }));
router.get('/register', (req, res) => res.render('register'));
router.get('/profile', ensureAuthenticated, (req, res) => {
  sql_query = `select course_id,cgpa_required, time_slot_id
               from  courses_offered 
               where  course_instructor_id=$1`;
  pool.query(sql_query, [req.session.i_id], (err, r) => {
    if (err) {
      console.log(2);
    }
    else {
      console.log(req.session.id);
      res.render('profile', { datas: r.rows });
    }
  });


});
router.get('/profile/float_course', (req, res) => res.render('faculty_float'));
router.get('/profile/add_grade', (req, res) => res.render('faculty_add'));
router.post('/login', (req, res, next) => {
  email = req.body.email;
//  console.log(email);
  req.session.email = email;
  sql_query = `select id from faculty where email=$1`
  pool.query(sql_query, [email], (err, res) => {
    if(res.rowCount)
    req.session.i_id = res.rows[0].id;
  });
  passport.authenticate('local', {
    successRedirect: '/faculty/profile',
    failureRedirect: '/faculty/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  req.session.destroy()
  res.redirect('/');
});
module.exports = router;
//float course handle
router.post('/profile/float_course', (req, res) => {
  c_id = req.body.CourseID;
  cg_limit = req.body.cg_limit;
  time_slot = req.body.time_slot;
  i_id = req.session.i_id;
  sql_query = `INSERT INTO courses_offered
                VALUES ($1,$2,$3,$4)`;
  pool.query(sql_query, [c_id, cg_limit, i_id, time_slot], (err, res) => {
    if (err) {
      req.flash('error_msg', 'something went wrong, course not floated');
     // console.log(err);
    } else
      req.flash('success_msg', 'course floated');
  });
  res.redirect('/faculty/profile');
});
//add grade handle 


router.post('/profile/add_grade',async (req,res)=>{
    c_id=req.body.CourseID;
    grade=req.body.grade;
    student_id=req.body.student_id;
    f_id=req.session.i_id;
    sql_query = `select * from course_registrations where student_entry_no=$1 and course_id=$2 and instructor_id=$3`;
    let r = pool.query(sql_query,[student_id,c_id,f_id]);
    if(r.rowCount==0)
    {
      req.flash('error_msg','error in grade entry');
    }
    else
    {
      sql_query = `update course_registrations set grade=$1 where student_entry_no=$2 and course_id=$3 and instructor_id=$4`;
      grade =parseInt(grade);
      console.log(student_id,c_id,f_id,grade);
      pool.query(sql_query,[grade,student_id,c_id,f_id],(err,res)=>{
        if(err)
        console.log(err)
        else 
          console.log('succes');
      });
    }
    res.redirect('/faculty/profile');
});