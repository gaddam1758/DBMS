const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth')
const { Pool } = require('pg');
//databse connection
connectionStringnew = "postgres://postgres:ram@localhost:5432/academics";
dbname = "academics";
pool = new Pool({
  connectionString: connectionStringnew
});
//z
pool.connect();
router.get('/login', (req, res) => res.render('login', { select: 'student', }));
router.get('/profile/register_course', (req, res) => res.render('student_register_course'));
router.get('/profile', async (req, res) => {
  sql_query = 'select * from course_registrations where student_entry_no=$1';
  let r = await pool.query(sql_query, [req.session.entry_no]);
  res.render('profile_student',{datas:r.rows});
});
router.get('/profile/get_cgpa', async (req, res) => {
  console.log(req.session.entry_no);
  sql_query = `select  grade, credits from course_registrations where student_entry_no=$1 and grade is null`;
  let r = await pool.query(sql_query, [req.session.entry_no]);
  if (r.rowCount != 0) {
    req.flash("error_msg", "all courses grades are not available");
    res.redirect('/student/profile');
  }
  sql_query = `select  grade, credits from course_registrations where student_entry_no=$1 `;
  sum = 0;
  credit_sum = 0;

  let r1 = await pool.query(sql_query, [req.session.entry_no]);
  for (i = 0; i < r1.rowCount; i++) {
    sum = sum + r1.rows[i].grade * r1.rows[i].credits;
    credit_sum = credit_sum + r1.rows[i].credits;
  }
  cgpa = sum / credit_sum;
  console.log(sum, credit_sum, cgpa);
  res.render('student_get_cgpa', { cgpa: "CGPA=" + cgpa.toString(10) });
});
router.post('/login', (req, res, next) => {
  email = req.body.email;
  // console.log(email);
  req.session.email = email;
  sql_query = `select password ,entry_no from students where email=$1`
  pool.query(sql_query, [email], (err, r) => {
    if (r.rowCount == 0) {
      //console.log(1);
      req.flash('error_msg', 'invalid email')
      res.redirect('/student/login');
    }
    else if (r.rows[0].password != req.body.password) {
      //  console.log(2);
      req.flash('error_msg', 'invalid password')
      res.redirect('/student/login');
    }
    else {

      req.session.entry_no = r.rows[0].entry_no;
      console.log(req.session.entry_no);
      res.redirect('/student/profile');
    }
  });
});

router.post('/profile/register_course', async (req, res) => {
  c_id = req.body.CourseID;
  sql_query = `select * from courses_offered where course_id=$1`;
  let r = await pool.query(sql_query, [c_id]);
  // console.log(r.rowCount);
  if (r.rowCount == 0) {
    req.flash('error_msg', 'course is not offered or does not exist');
    res.redirect('/student/profile/register_course');
  }


  //slot check
  sql_query = `select * from isslotfree($1,$2)`;
  let r1 = await pool.query(sql_query, [r.rows[0].course_id, req.session.entry_no])
  if (!r1.rows[0].isslotfree) {
    console.log(0);
    req.flash('error_msg', 'you have regitered for another course in the same slot');
    res.redirect('/student/profile/register_course');
  }

  //prerequisite check
  sql_query = 'select * from prequisitecheck($1,$2)';
  //console.log(req.session.entry_no, r.rows[0].course_id);
  let r2 = await pool.query(sql_query, [req.session.entry_no, r.rows[0].course_id]);
  if (!r2.rows[0].prequisitecheck) {
    console.log(1);
    req.flash('error_msg', 'you have not cleared prerequisite for this course');
    res.redirect('/student/profile/register_course');
  }

  //credit limit check
  sql_query = 'select * from creditlimitandcgcheck ($1,$2,$3)'
  let r3 = await pool.query(sql_query, [r.rows[0].cgpa_required, req.session.entry_no, r.rows[0].course_id]);
  if (!r3.rows[0].creditlimitandcgcheck) {
    console.log(2);
    sql_query = 'select f_id from faculty_advisor, students where entry_no=$1 and faculty_advisor.year=batch_year and dept=dept_name';
    let y1=await pool.query(sql_query,[req.session.entry_no]);
    req.flash('error_msg', 'Raised ticket');
    console.log(2)
    sql_query =`INSERT INTO ticket values($1,$2,$3,$4,$5)`
    values=[req.session.entry_no,r.rows[0].course_instructor_id,y1.rows[0].f_id,0,r.rows[0].course_id];
    let z= await pool.query(sql_query,values)
    res.redirect('/student/profile/register_course');
  }


  let credit = await pool.query('select credit from courses where id=$1 ', [r.rows[0].course_id]);
  credit = credit.rows[0].credit;
 
  if(r1.rows[0].isslotfree&&r2.rows[0].prequisitecheck&&r3.rows[0].creditlimitandcgcheck)
  {
    console.log('susccs');
  sql_query = `insert into course_registrations values ($1,$2,$3,$4,$5)`
  values = [req.session.entry_no, r.rows[0].course_id, null, r.rows[0].course_instructor_id, credit];
  pool.query(sql_query, values, (err, k) => {
    if (err)
      console.log(err)
    else {
      req.flash('success', 'successfully registered for course');
    }
  });
}
  res.redirect('/student/profile');
});
// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  req.session.destroy()
  res.redirect('/');
});
module.exports = router;