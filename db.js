const { Pool } = require('pg');
connectionString = "postgres://postgres:ram@localhost:5432/postgres";
connectionStringnew = "postgres://postgres:ram@localhost:5432/academics";
dbname = "academics";
pool = new Pool({
    connectionString: connectionString
});
pool.connect( (err, client, done) => {
    //connecting to postgres database;
    if (err) {
        console.log("Error while connecting to database");
    }
    //checking whether academics database exists or not
    else {
        client.query("\c academics", async (err, res) => {
            if (err) {
                //creating academics db if not exists
                client.query("CREATE DATABASE academics", async (err, res) => {
                    if (err) {
                        console.log("error");
                    }
                    else {
                        console.log("Database academics created");

                    }
                    client.end();
                });
            }

        });

    }
});


//creating relations in database;
pool = new Pool({
    connectionString: connectionStringnew,
})
pool.connect(async (err, client, done) => {
    if (err) {
        console.log("not connected to database");
    }
    else {
        //creating courses table
        sql_query = `CREATE TABLE  courses ( 
                    id varchar(10) unique not null,
                    name varchar(50) not null,
                    l integer not null, 
                    t integer not null, 
                    p integer not null,
                    PRIMARY KEY (id) )` ;
        client.query(sql_query, (err, res) => {
            if (!err) {
                console.log("relation courses created");
            }
        });


        //creating prerequisite table
        sql_query = `CREATE TABLE  prerequisite (
                    original_couse_id varchar(10),
                    prerequisite_course_id varchar(10),
                    PRIMARY KEY (original_couse_id, prerequisite_course_id))`;
        client.query(sql_query, (err, res) => {
            if (!err) {
                console.log("relation prerequisite created");
            }
        });


        //creating departments table
        sql_query = `CREATE TABLE department (
                    name varchar(20) unique,
                    PRIMARY KEY (name))`;
        client.query(sql_query, (err, res) => {
            if (!err) {
                console.log("relation departments created");
            }
        });

        //creating faculty table
        sql_query = ` CREATE TABLE faculty (
                id varchar(10)  unique not null,
                name varchar(50) not null,
                phone varchar(10) not null,
                password varchar(10) not null,
                email text unique not null,
                department_name varchar(20),
                joining_date date not null,
                leaving_date date ,
                FOREIGN KEY (department_name) REFERENCES department(name),
                PRIMARY KEY (id))`;
        client.query(sql_query, (err, res) => {
            if (!err) {
                console.log("relation faculty created");
            }
        });

        //creating courses offered table
        sql_query = `CREATE TABLE offered_courses (
                course_id varchar(10) not null,
                year integer not null,
                semester varchar(10) not null,
                student_limit integer,
                cgpa_required real,
                course_instructor_id varchar(10),
                time_slot_id char(10) not null,
                PRIMARY KEY (course_id, year, semester),
                FOREIGN KEY (course_id) REFERENCES courses(id),
                FOREIGN KEY (course_instructor_id) REFERENCES faculty(id))`;
        client.query(sql_query, (err, res) => {
            if (!err) {
                console.log("relation offered_courses created");
            }
        });

        //creating table batch
        sql_query = `CREATE TABLE batch (
            year integer,
            advisor_id varchar(10) not null,
            department_name varchar(20),
            FOREIGN KEY (advisor_id)  REFERENCES faculty(id),
            FOREIGN KEY (department_name)  REFERENCES department(name),
            PRIMARY KEY (year, department_name)
            )`;
        client.query(sql_query, (err, res) => {
            if (!err) {
                console.log("relation batch created");
            }
        });

        //creating table batches_allowed
        sql_query = `CREATE TABLE batches_allowed (
            course_offered_id varchar(10) not null,
            year_course integer not null,
            semester_course varchar(10) not null,
            batch_year integer not null,
            batch_dept varchar(20) not null,
            FOREIGN KEY (course_offered_id, year_course, semester_course)  REFERENCES offered_courses(course_id, year, semester),
            FOREIGN KEY (batch_dept, batch_year)  REFERENCES batch(department_name, year),
            PRIMARY KEY (course_offered_id, year_course, semester_course, batch_year, batch_dept)
            )`;
        client.query(sql_query, (err, res) => {
            if (!err) {
                console.log("relation batch_allowed created");
            }
        });


        //creating table students
        sql_query = `CREATE TABLE students (
            entry_no varchar(10),
            name varchar(50) not null,
            password varchar(10) not null,
            phone varchar(15) not null,
            email text not null,
            dob date not null,
            batch_year integer not null,
            dept_name varchar(20) not null,
            FOREIGN KEY (batch_year, dept_name) REFERENCES batch(year, department_name),
            PRIMARY KEY (entry_no)
            )`;

        client.query(sql_query, (err, res) => {
            if (!err) {
                console.log("relation students created");
            }
        });
        //creating course registrations table
        sql_query = `CREATE TABLE course_registrations (
                student_entry_no varchar(10),
                course_offered_id varchar(10) not null,
                year_course integer not null,
                semester_course varchar(10) not null,
                FOREIGN KEY (course_offered_id, year_course, semester_course)  REFERENCES offered_courses(course_id, year, semester),
                PRIMARY KEY (student_entry_no, course_offered_id, year_course, semester_course)
                )`;
        client.query(sql_query, (err, res) => {
            if (!err) {
                console.log("relation course_registration created");
            }
        });

        //creating tickets table
        sql_query = `CREATE TABLE ticket (
            ticket_id varchar(10) not null,
            student_id varchar(10),
            instructor_id varchar(10) not null,
            faculty_advisor_id varchar(10) not null,
            status smallint,
            current_holder varchar(10),
            course_offered_id varchar(10) not null,
            year_course integer not null,
            semester_course varchar(10) not null,
            FOREIGN KEY (course_offered_id, year_course, semester_course)  REFERENCES offered_courses(course_id, year, semester),
            FOREIGN KEY (student_id)  REFERENCES students(entry_no),
            FOREIGN KEY (faculty_advisor_id)  REFERENCES faculty(id),
            FOREIGN KEY (instructor_id)  REFERENCES faculty(id),
            PRIMARY KEY (ticket_id)
          )`;
          client.query(sql_query, (err, res) => {
            if (!err) {
                console.log("relation tickets created");
                client.end();
            }   
            else
            {
                client.end();
            }
        });
        // sql_query = `CREATE TABLE semesters (
        //     year integer not null,
        //     semester varchar(10) not null,
        //     status smallint,
        //     sem_id integer not null serial,
        //     PRIMARY KEY (sem_id)
        //   )`;
        //   client.query(sql_query, (err, res) => {
        //     if (!err) {
        //         console.log("relation semester created");
        //         client.end()
        //     }
        // });
    }
});

pool.end();
