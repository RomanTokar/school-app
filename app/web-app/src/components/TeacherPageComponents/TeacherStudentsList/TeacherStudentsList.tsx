import { Image } from "@mantine/core";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { TeacherStudents } from "../../../app/types/teacherTypes";
import styles from "./TeacherStudentsList.module.scss";

interface Props {
  students: TeacherStudents[];
  reviewStudent: (value: string) => void;
}

export const TeacherStudentsList: FC<Props> = ({ students, reviewStudent }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string>(students[0]._id);

  return (
    <div className={styles.students}>
      <div className={styles.title}>{t("components.teacherStudentsList.text.students")}</div>
      <div className={styles.studentsList}>
        {students.map((student) => (
          <div
            onClick={() => {
              setSelected(student._id);
              reviewStudent(student._id);
            }}
            className={`${styles.studentsItem} ${student._id === selected && styles.studentsItemSelected}`}
            key={student._id}
          >
            <Image src={student.avatar} style={{ width: "40px", height: "40px", borderRadius: "100%", overflow: "hidden" }} />
            <div className={styles.studentsName}>{student.fullName}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
