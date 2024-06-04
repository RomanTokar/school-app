import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Classes } from "../../../app/types/classesTypes";
import styles from "./ClassesPlans.module.scss";

interface Props {
  classData: Classes;
}

export const ClassesPlans: FC<Props> = ({ classData }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.plans}>
      <div className={styles.title}>{t("components.classesPlans.title")}</div>
      <div className={styles.plansList}>
        <div className={styles.plansItem}>
          <div className={styles.plansNumber}>{classData.studentsCount}</div>
          <div className={styles.plansName}>{t("components.classesPlans.studentsCount")}</div>
        </div>
      </div>
    </div>
  );
};
