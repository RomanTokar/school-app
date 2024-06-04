import { Image } from "@mantine/core";
import { FC, useState } from "react";
import { Student } from "../../app/types/studentTypes";
import { AppButton } from "../Button/Button";
import styles from "./StudentItem.module.scss";

import { useDeleteStudentMutation } from "../../app/api/student";
import listIcon from "../../assets/icons/list.svg";
import cityIcon from "../../assets/icons/city.svg";
import schoolIcon from "../../assets/icons/school.svg";
import minusIcon from "../../assets/icons/minus.svg";
import { Notification } from "../Notification/notification";
import { NotificationWithOptions } from "../NotificationWithOptions/notificationWithOptions";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface StudentProps extends Student {
  updateStudents: () => void;
}

export const StudentItem: FC<StudentProps> = ({ ...props }) => {
  const { t } = useTranslation();
  const [deleteStudent] = useDeleteStudentMutation();
  const [isStudentDeleted, setIsStudentDeleted] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  const deleteStudentHandler = async () => {
    try {
      await deleteStudent({
        id: props._id,
      }).unwrap();

      setShowNotification(false);
      setIsStudentDeleted(true);
      setTimeout(() => {
        props.updateStudents && props.updateStudents();
      }, 3000);
    } catch (error) {
    } finally {
      setTimeout(() => {
        setIsStudentDeleted(false);
      }, 3000);
    }
  };

  return (
    <>
      {showNotification && (
        <NotificationWithOptions
          action={deleteStudentHandler}
          text={`${t("studentsItem.notification.goingDeleteStudentNotification")} ${props.fullName}`}
          onClose={() => setShowNotification(false)}
        />
      )}

      {isStudentDeleted && <Notification text={t("studentsItem.notification.studentRemoved")} />}
      <Link key={props._id} to={`/students/${props._id}`} className={styles.student}>
        <AppButton
          variant={"outline"}
          title={t("general.actions.remove")}
          leftIcon={<Image src={minusIcon} />}
          onClick={(e: any) => {
            e.preventDefault();
            setShowNotification(true);
          }}
        />
        <div className={styles.infoBlock}>
          <div className={styles.studentName}>{props.fullName}</div>
          <div className={styles.studentClassesWrap}>
            <span className={styles.studentClasses}>{props.matnas}</span>
            <div className={styles.iconBlockTop}>
              <div className={styles.iconBlock}>
                <Image src={listIcon} className={styles.icon} />
                <span className={styles.studentClasses}>
                  {props.classesCount} {props.classesCount === 1 ? "class" : "classes"}
                </span>
              </div>
              <div className={styles.iconBlock}>
                <Image src={schoolIcon} className={styles.icon} />
                <span className={styles.studentClasses}>{props.school}</span>
              </div>
              <div className={styles.iconBlock}>
                <Image src={cityIcon} className={styles.icon} />
                <span className={styles.studentClasses}>{props.city}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
};
