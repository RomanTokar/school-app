import { Container } from "@mantine/core";
import styles from "./teacherDashboard.module.scss";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetClassStudentsQuery } from "../../app/api/classes";
import useAuth from "../../app/hooks/useAuth";
import { Student } from "../../app/types/studentTypes";
import { AppCalendar } from "../../components/Calendar/Calendar";
import { Files } from "../../components/Files/Files";
import { Reminds } from "../../components/Reminds/Reminds";
import { StudentAttendancy } from "../../components/TeacherPageComponents/StudentAttendancy/StudentAttendancy";
import { StudentPresence } from "../../components/TeacherPageComponents/StudentPresence/StudentPrecense";
import { TeacherClasses } from "../../components/TeacherPageComponents/TeacherClasses/TeacherClasses";
import { TeacherNotes } from "../../components/TeacherPageComponents/TeacherNotes/TeacherNotes";
import { TeacherPlans } from "../../components/TeacherPageComponents/TeacherPlans/TeacherPlans";
import { TeacherStudent } from "../../components/TeacherPageComponents/TeacherStudent/TeacherStudent";
import { TeacherStudentsList } from "../../components/TeacherPageComponents/TeacherStudentsList/TeacherStudentsList";
import { TeacherWhatsapp } from "../../components/TeacherPageComponents/TeacherWhatsapp/TeacherWhatsapp";

export const TeacherDashboard = () => {
  const params = useParams();
  const { user } = useAuth();
  const teacherId = user?.role === "teacher" ? user.teacherId : params.teacherId;
  const [classId, setClassId] = useState<string | null>("");
  const [studentId, setStudentId] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const { data: classStudents } = useGetClassStudentsQuery({ classId: classId ? classId : "" }, { skip: !classId });

  useEffect(() => {
    if (classStudents && classStudents.length > 0) {
      setStudentId(classStudents[0]._id);
    }
  }, [classStudents]);

  return (
    <Container size={"xl"}>
      <div className={styles.wrapper}>
        <div className={styles.leftColumn}>
          {classId && classStudents && classStudents.length > 0 && (
            <TeacherStudent student={classStudents.find((obj: Student) => obj._id === studentId)} />
          )}
          {classId && studentId && <StudentPresence classId={classId} studentId={studentId} />}
          {studentId && classId && <StudentAttendancy studentId={studentId} />}
          {teacherId && <TeacherNotes teacherId={teacherId} />}

          <Files />
        </div>
        <div className={styles.centerColumn}>
          <TeacherPlans teacherId={teacherId} date={date} />
          <Reminds date={date} />
          {classId && classStudents && classStudents.length > 0 && (
            <TeacherStudentsList students={classStudents} reviewStudent={(value) => setStudentId(value)} />
          )}
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.section}>
            <AppCalendar onChange={(date) => setDate(date)} />
            <TeacherClasses teacherId={teacherId} getClassId={(id) => setClassId(id)} date={date} />
          </div>
          <TeacherWhatsapp />
        </div>
      </div>
    </Container>
  );
};
