import { Image } from "@mantine/core";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { TeacherStudents } from "../../../app/types/teacherTypes";
import whatsappIcon from "../../../assets/icons/whatsapp.svg";
import styles from "./ClassesStudent.module.scss";

interface Props {
  student: TeacherStudents | undefined;
}

export const ClassesStudent: FC<Props> = ({ student }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.student}>
      <div className={styles.title}>{t("components.teacherStudent.text.student")}</div>
      {student && (
        <div className={styles.blockWrapper}>
          <div className={styles.studentInfo}>
            {student.avatar !== null && (
              <Image src={student.avatar} alt={"avatar"} style={{ width: "140px", height: "140px", borderRadius: "100%", overflow: "hidden" }} />
            )}

            <div className={styles.studentContent}>
              <div className={styles.studentContentRow}>
                <span className={styles.studentContentLabel}>{student.fullName}</span>
                <span className={styles.studentContentValue}>{t("components.teacherStudent.text.name")}</span>
              </div>
              <div className={styles.studentContentRow}>
                <span className={styles.studentContentLabel}>{student.ID}</span>
                <span className={styles.studentContentValue}>{t("components.teacherStudent.text.id")}</span>
              </div>
              <div className={styles.studentContentRow}>
                <span className={styles.studentContentLabel}>{student.phoneNumber}</span>
                <span className={styles.studentContentValue}>{t("components.teacherStudent.text.phone")}</span>
              </div>
              <div className={styles.studentContentRow}>
                <span className={styles.studentContentLabel}>{student.email}</span>
                <span className={styles.studentContentValue}>{t("components.teacherStudent.text.email")}</span>
              </div>
              {/* <div className={styles.studentContentRow}>
                <span className={styles.studentContentLabel}>Approved</span>
                <span className={styles.studentContentValue}>Status</span>
              </div> */}
              <div className={styles.studentContentRow}>
                <span className={styles.studentContentLabel} onClick={() => window.open(student.WhatsAppLink, "_blank")}>
                  <Image src={whatsappIcon} />
                </span>
                <span className={styles.studentContentValue}>{t("components.teacherStudent.text.whatsapp")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
