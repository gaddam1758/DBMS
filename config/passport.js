const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
connectionStringnew = "postgres://postgres:ram@localhost:5432/academics";
dbname = "academics";
pool = new Pool({
  connectionString: connectionStringnew
});
module.exports = function (passport) {
  passport.use('local',
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      pool.connect((err, client) => {
        if (err) {
          //console.log("database not connected in passport");
        }
        else {
          //console.log('entered');
          sql_query = {text: `SELECT id,email, password
                        from faculty
                        where email=$1`,
                        values:[email],
                        rowMode:'array',
        }
          client.query(sql_query, (err, res) => {
            if (err)
              console.log(err);
            else {
              if (res.rows[0] == null) {
                //console.log(res);
                //pool.end();
                return done(null,false,{message:'This email is not reqgistered'});
              } else {
                if (email == res.rows[0][1] && password == res.rows[0][2]) {
                  //console.log('entered1');
                  //  pool.end();
                   return done(null,email);
                }
                else
                {

                  //console.log(password,res.rows[0]);
                  //pool.end();
                  return done(null,false, {message: 'Password is incorrect'});
              }}
            }
          });

        }
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
  
};