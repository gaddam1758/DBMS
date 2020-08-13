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
router.get('/login', (req, res) => res.render('login', { select: 'faculty_advisor', }));
router.get('/profile', async (req, res) => {
    sql_query = 'select * from  ticket where faculty_advisor_id=$1 and status=0';
    let r = await pool.query(sql_query, [req.session.f_id]);

    res.render('advisor_profile', { datas: r.rows });
});
router.post('/login', (req, res, next) => {
    email = req.body.email;
    // console.log(email);
    req.session.email = email;
    sql_query = `select password ,f_id from faculty_advisor where email=$1`
    pool.query(sql_query, [email], (err, r) => {
        if (r.rowCount == 0) {
            //console.log(1);
            req.flash('error_msg', 'invalid email')
            res.redirect('/faculty_advisor/login');
        }
        else if (r.rows[0].password != req.body.password) {
            //  console.log(2);
            req.flash('error_msg', 'invalid password')
            res.redirect('/faculty_advisor/login');
        }
        else {

            req.session.f_id = r.rows[0].f_id;
            console.log(req.session.entry_no);
            res.redirect('/faculty_advisor/profile');
        }
    });
});
//ticket handling
router.get('/ticket', async (req, res) => {
    ticket_id = req.query.ticket_id;
    status = req.query.status;
    sql_query = 'select * from  ticket where ticket_id=$1';
    let r = await pool.query(sql_query, [ticket_id]);
    if(status=='1')
    {
        sql_query ='SELECT credit from courses where id=$1';
        credit=1;
        pool.query(sql_query,[r.rows[0].course_id],(err,r2)=>{
            if(err)
            console.log(err);
            else{
                credit=r2.rows[0].credit;
            }
        });
        sql_query = 'INSERT INTO course_registrations values($1,$2,$3,$4,$5)';
        values=[r.rows[0].student_id,r.rows[0].course_id,null,r.rows[0].instructor_id,credit];
        let r1 = pool.query(sql_query,values)
        sql_query=`update ticket set status=1 where ticket_id=$1`;
        let r4 = await pool.query(sql_query,[ticket_id]);
        res.redirect('/faculty_advisor/profile');
    }
    else
    {
        sql_query=`update ticket set status=-1 where ticket_id=$1`;
        let r4 = await pool.query(sql_query,[ticket_id]);
        res.redirect('/faculty_advisor/profile');
    }
});
// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    req.session.destroy()
    res.redirect('/');
});
module.exports = router;