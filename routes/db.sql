INSERT INTO courses 
VALUES ('1','c1',3,1,2),
        ('2','c2',3,2,4),
        ('3','c3',5,1,4);

INSERT INTO department 
VALUES ('CSE'),
        ('EE'),
        ('ME');

INSERT INTO faculty
VALUES ('1','f1','123413','f1p','f1p@gmail.com','CSE'),
        ('2','f2','123413','f2p','f2p@gmail.com','CSE'),
        ('3','f3','123413','f3p','f3p@gmail.com','ME'),
        ('4','f4','123413','f4p','f4p@gmail.com','EE');

INSERT INTO prerequisite
VALUES ('1','2');

INSERT INTO batch
VALUES (2017,'1','CSE'),
        (2017,'3','ME'),
        (2017,'4','EE');

insert into students
values ('e1','s1','s1p','123','s1@gmail.com','2000-5-14',2017,'CSE',8.3),
        ('e2','s2','s2p','123','s2@gmail.com','2000-5-14',2017,'ME',9.3),
        ('e3','s3','s3p','123','s3@gmail.com','2000-5-14',2017,'EE',7.3),
        ('e4','s4','s4p','123','s4@gmail.com','2000-5-14',2017,'CSE',6.3);

CREATE OR REPLACE PROCEDURE public.can_take(
	student_id character varying,
	c_id character varying,
	INOUT result integer)
LANGUAGE 'plpgsql'

AS $BODY$    DECLARE 
    y integer;
    s varchar(10);
    o1 integer;
    o2 integer;
    o3 integer;
    o4 integer;
    o6 integer;
    o7 integer;
	s1 varchar;
	s2 varchar;
	s3 varchar;
	s4 varchar;
	s5 varchar;
	s6 varchar;
	s7 varchar;
	s8 varchar;
	result1 int;
    course_credits DEC(4,2);
    credit_limit DEC(4,2);
    credit_taken DEC(4,2);
    tot DEC(4,2);
    cg DEC(4,2);
    req_cg DEC(4,2);
    BEGIN
    SELECT year into y from semesters where status=1;
    SELECT semester into s from semesters where status=1;
    
    o1=0;
    s1 = 'call slot_free($1,$2,$3,$4,$5)';
    execute s1 using student_id,c_id,y,s,o1 into o1;
    
    o2=0;
    s2 = 'call comp_preq($1,$2,$3)';
    execute s2 using student_id,c_id,o2 into o2;
    
    course_credits=0;
    s3 = 'call get_total_credits($1,$2)';
    execute s3 using c_id,course_credits into course_credits;
	
    credit_limit=0;
    s4 = 'call creditlimit($1,$2)';
	execute s4 using student_id,credit_limit into credit_limit;
    
	credit_taken=0;
    s5 = 'call credits_taken($1,$2)';
	execute s5 using student_id,credit_taken into credit_taken;
 
    
	tot=credit_taken+course_credits;
    
    if tot<=credit_limit THEN
      o3=1;
    else
      o3=0;
    end if;
    
    cg=0;
    s6 = 'call get_cgpa($1,$2)';
	execute s6 using student_id,cg into cg;
    
    Select cgpa_required into req_cg from offered_courses where course_id=c_id and year=y and semester=s;
    
    
    if req_cg<=cg THEN
       o4=1;
    else
       o4=0;
    end if;
    
    
    
    o6=0;
    s7 = 'call check_student_batch_allowed($1,$2,$3,$4,$5)';
    execute s7 using student_id,c_id,y,s,o6 into o6;
	
	result:=o6;
    
    o7=0;
    s8 = 'call has_passed($1,$2,$3)';
	execute s8 using student_id,c_id,o7 into o7;
    
    if ((o1=1) and (o2=1) and (o3=0) and (o4=1) and (o6=1) and (o7=1)) THEN
       result=2;
    elsif((o1=1) and (o2=1) and (o3=1) and (o4=1) and (o6=1) and (o7=1)) THEN
       result=1;
	else
	   result=0;
    end if;
    
    END 
	$BODY$;



 -- PROCEDURE: public.creditlimit(character varying, numeric)

-- DROP PROCEDURE public.creditlimit(character varying, numeric);

CREATE OR REPLACE PROCEDURE public.creditlimit(
	student_id character varying,
	INOUT credit_lim numeric)
LANGUAGE 'plpgsql'

AS $BODY$
DECLARE
year_last integer;
sem_last varchar(10);
year_seclast integer;
 sem_seclast varchar(10);
 current_id integer;
 tablename varchar(200); 
 s1 varchar;
 s2 varchar;
 tot_credits1 DEC(4,2);
 tot_credits2 DEC(4,2);

BEGIN

SELECT sem_id into current_id from semesters where status=1;

IF current_id>=3 then

    SELECT year into year_last from semesters where sem_id=current_id-1;
    SELECT year into year_seclast from semesters where sem_id=current_id-2;

    SELECT semester into sem_last from semesters where sem_id=current_id-1;
    SELECT semester into sem_seclast from semesters where sem_id=current_id-2;

    credit_lim=0;

    SELECT CONCAT("transcript_",student_id) into tablename;

    s1=CONCAT('select sum(credits)  from ', tablename ,' where grade>4 and course_year= $1 and course_sem=$2');
  	execute s1  using last_year,sem_year into tot_credits1;

    s2=CONCAT('select sum(credits)  from ', tablename ,' where grade>4 and course_year=$1 and course_sem=$2');
	
    execute s2 using year_seclast,sem_seclast into tot_credits2;

    credit_lim=credit_lim+@tot_credits1;
    credit_lim=credit_lim+@tot_credits2;

    credit_lim=credit_lim/2;
    credit_lim=credit_lim*1.25;

else
   credit_lim=24;
END IF;

END
$BODY$;
-- PROCEDURE: public.credits_taken(character varying, numeric)

-- DROP PROCEDURE public.credits_taken(character varying, numeric);

CREATE OR REPLACE PROCEDURE public.credits_taken(
	student_id character varying,
	INOUT tot_credits_taken numeric)
LANGUAGE 'plpgsql'

AS $BODY$    DECLARE 
	 y int; 
	 s varchar(10);
	 s1 varchar;
	 tablename varchar(200);
	 tot DEC(4,2);
    BEGIN
    SELECT year into y from semesters where status=1;
	SELECT semester into s from semesters where status=1;

	SELECT CONCAT('transcript_',student_id) into tablename;

	s1=CONCAT('select sum(credits) from ', tablename ,' where course_year=$1 and course_sem= $2');
	execute s1 using y,s into tot;
	if tot is not null then
	tot_credits_taken:=tot;
	else
	tot_credits_taken=0;
	end if;
	END
$BODY$;

-- PROCEDURE: public.get_total_credits(character varying, numeric)

-- DROP PROCEDURE public.get_total_credits(character varying, numeric);

CREATE OR REPLACE PROCEDURE public.get_total_credits(
	course_id character varying,
	INOUT credits numeric)
LANGUAGE 'plpgsql'

AS $BODY$DECLARE

ll DEC(4,2);
tt DEC(4,2);
pp DEC(4,2);
 
BEGIN

select l INTO ll from courses where courses.id=course_id;
select t INTO tt from courses where courses.id=course_id;
select p INTO pp from courses where courses.id=course_id;

credits:=0.5*pp;
credits:=credits+ll;
credits:=credits+tt;
END
$BODY$;

-- DROP PROCEDURE public.has_passed(character varying, character varying, integer);

CREATE OR REPLACE PROCEDURE public.has_passed(
	student_id character varying,
	c_id character varying,
	INOUT result integer)
LANGUAGE 'plpgsql'

AS $BODY$DECLARE
tablename varchar(200);
s1 varchar;
passed int;
BEGIN
SELECT CONCAT('transcript_',student_id) into tablename;
s1=CONCAT('select count(*)  from ', tablename ,' where course_id=$1 and grade>4');
execute s1 using c_id into passed;

if passed=0 THEN
  result=1;
else
  result=0;
end if;
END
$BODY$;




 -- PROCEDURE: public.get_cgpa(character varying, numeric)

-- DROP PROCEDURE public.get_cgpa(character varying, numeric);

CREATE OR REPLACE PROCEDURE public.get_cgpa(
	student_id character varying,
	INOUT cgpa numeric)
LANGUAGE 'plpgsql'

AS $BODY$

DECLARE
tablename varchar(200);
tot_credits DEC(4,2);
tot DEC(4,2);
s1 varchar;
s2 varchar;
BEGIN
SELECT CONCAT('transcript_',student_id) into tablename;
s1=CONCAT('select sum(credits) from ', tablename ,' where grade>4');
execute s1 into tot_credits;
s2=CONCAT('select sum(grade*credits) from ', tablename ,' where grade>4');
execute s2 into tot;
cgpa:=round(tot/tot_credits,2);
END
$BODY$;