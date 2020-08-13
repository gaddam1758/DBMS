CREATE OR REPLACE FUNCTION isslotfree(c_id varchar(10),student_id varchar(10))
RETURNS boolean
AS
$$
DECLARE
slot varchar;
clashes int;
BEGIN
Select time_slot_id into slot from courses_offered where c_id=course_id;
Select count(*) into clashes from course_registrations,courses_offered where student_entry_no=student_id and courses_offered.course_id=course_registrations.course_id   and time_slot_id=slot;
if clashes=0 then
RETURN true;
else
RETURN FALSE;
end if;
END;
$$
Language 'plpgsql';