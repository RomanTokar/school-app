import { Image } from "@mantine/core";
import { FC, useState } from "react";
import { Teacher } from "../../../app/types/teacherTypes";
import { AppButton } from "../../Button/Button";
import styles from "./TeacherItem.module.scss";

import { Link } from "react-router-dom";
import { useDeleteTeacherMutation } from "../../../app/api/teacher";
import listIcon from "../../../assets/icons/list.svg";
import minusIcon from "../../../assets/icons/minus.svg";
import { NotificationWithOptions } from "../../NotificationWithOptions/notificationWithOptions";

import { useTranslation } from "react-i18next";
import { useNotification } from "../../../app/contexts/NotificationContext";

interface TeacherProps extends Teacher {
  updateTeachers: () => void;
}

export const TeacherItem: FC<TeacherProps> = ({ ...props }) => {
  const { t } = useTranslation();
  const { addNotification } = useNotification();
  const [deleteTeacher] = useDeleteTeacherMutation();
  const [showNotification, setShowNotification] = useState<boolean>(false);

  const deleteTeacherHandler = async () => {
    try {
      await deleteTeacher({
        id: props._id,
      }).unwrap();

      setShowNotification(false);
      addNotification("components.teacherItem.deletedNotification");
      setTimeout(() => {
        props.updateTeachers && props.updateTeachers();
      }, 3000);
    } catch (error) {
    } finally {
    }
  };

  return (
    <>
      {showNotification && (
        <NotificationWithOptions
          action={deleteTeacherHandler}
          text={"components.teacherItem.goingDeleteNotification"}
          onClose={() => setShowNotification(false)}
        />
      )}

      <div className={styles.teacher} key={props._id}>
        <AppButton
          variant={"outline"}
          title="general.actions.remove"
          leftIcon={<Image src={minusIcon} />}
          onClick={(event) => {
            event.stopPropagation();
            setShowNotification(true);
          }}
        />
        <Link to={`/teachers/${props._id}`} style={{ flex: "1", display: "flex", justifyContent: "flex-end" }}>
          <div className={styles.teacherRight}>
            <span className={styles.teacherName}>{props.fullName}</span>
            <div className={styles.teacherClassesWrap}>
              <Image src={listIcon} className={styles.listIcon} />
              <span className={styles.teacherClasses}>
                {props.classesCount} {t("components.teacherItem.classes")}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};
