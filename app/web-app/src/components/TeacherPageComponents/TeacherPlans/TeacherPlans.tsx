import dayjs from "dayjs";
import { FC, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLazyGetClassesQuery } from "../../../app/api/classes";
import styles from "./TeacherPlans.module.scss";

interface Props {
  teacherId: string | undefined;
  date: Date;
}

export const TeacherPlans: FC<Props> = ({ teacherId, date }) => {
  const { t } = useTranslation();
  const [getClasses, { data: classes }] = useLazyGetClassesQuery();

  useEffect(() => {
    if (teacherId && date) {
      getClasses({
        teacherId,
        startDate: dayjs(date).format("YYYY-MM-DD"),
        endDate: dayjs(date).add(1, "day").format("YYYY-MM-DD"),
      });
    }
  }, [teacherId, date]);

  return (
    <div className={styles.plans}>
      <div className={styles.title}>{t("components.teacherPlans.text.plan")}</div>
      <div className={styles.plansList}>
        <div className={styles.plansItem}>
          <div className={styles.plansNumber}>{classes?.reduce((acc, value) => acc + value.studentsCount, 0) || 0}</div>
          <div className={styles.plansName}>{t("components.teacherPlans.text.numberOfStudents")}</div>
        </div>
        <div className={styles.plansItem}>
          <div className={styles.plansNumber}>{classes?.length || 0}</div>
          <div className={styles.plansName}>{t("components.teacherPlans.text.numberOfClasses")}</div>
        </div>
      </div>
    </div>
  );
};
