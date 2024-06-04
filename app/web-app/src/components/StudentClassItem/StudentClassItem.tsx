import { Checkbox, Image } from "@mantine/core";
import { FC, useEffect, useState } from "react";
import { AppButton } from "../Button/Button";
import styles from "../StudentClassItem/StudentClassItem.module.scss";

import { useForm } from "@mantine/form";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useDeleteStudentClassMutation, useUpdateStudentClassMutation } from "../../app/api/student";
import { useGetStudentPresenceQuery, useGetTeachersQuery, useMarkPresenceMutation, useUnmarkPresenceMutation } from "../../app/api/teacher";
import { Classes } from "../../app/types/classesTypes";
import { Teacher } from "../../app/types/teacherTypes";
import locationIcon from "../../assets/icons/location24.svg";
import minusIcon from "../../assets/icons/minus.svg";
import teacherIcon from "../../assets/icons/teacher.svg";
import { Notification } from "../Notification/notification";
import { NotificationWithOptions } from "../NotificationWithOptions/notificationWithOptions";
import { AppSelect } from "../Select/Select";

interface FormValues {
  teacherId: string;
}

interface Props {
  classData: Classes;
  studentId?: string;
}

export const StudentClassItem: FC<Props> = ({ classData, studentId }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const [deleteStudentClass] = useDeleteStudentClassMutation();
  const [updateStudentClass] = useUpdateStudentClassMutation();

  const [unmark] = useUnmarkPresenceMutation();
  const [mark] = useMarkPresenceMutation();
  const { data: presence } = useGetStudentPresenceQuery({ studentId: studentId ? studentId : "", classId: classData._id });

  const [isClassDeleted, setIsClassDeleted] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const { data: teachersList } = useGetTeachersQuery({});

  useEffect(() => {
    form.setValues((prev) => ({
      ...prev,
      teacherId: classData?.teacher._id,
    }));
  }, [classData?.teacher._id]);

  const form = useForm({
    initialValues: {
      teacherId: "",
    } as FormValues,
    validate: {},
  });

  const updateClassHandler = async () => {
    await updateStudentClass({
      id: classData._id,
      teacherId: form.values.teacherId,
    }).unwrap();
  };

  const deleteClassHandler = async () => {
    try {
      await deleteStudentClass({
        id: classData._id,
      }).unwrap();

      setShowNotification(false);
      setIsClassDeleted(true);
    } catch (error) {
    } finally {
      setTimeout(() => {
        setIsClassDeleted(false);
      }, 3000);
    }
  };

  return (
    <>
      {showNotification && (
        <NotificationWithOptions
          action={deleteClassHandler}
          text={`${t("studentClassItem.notification.goingDeleteClassNotification")} ${classData.name}`}
          onClose={() => setShowNotification(false)}
        />
      )}

      {isClassDeleted && <Notification text={t("studentClassItem.notification.classRemoved")} />}
      <div key={classData._id} className={styles.classWrapper}>
        <div className={`${styles.class} ${isOpen ? `${styles.open}` : ""}`}>
          <div className={styles.classTop} onClick={() => setIsOpen(!isOpen)}>
            <AppButton
              variant={"outline"}
              title={t("general.actions.remove")}
              leftIcon={<Image src={minusIcon} />}
              onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                setShowNotification(true);
              }}
            />
            <div className={styles.infoBlock}>
              <div className={styles.className}>{classData.name}</div>
              <div className={styles.classClassesWrap}>
                <span className={styles.classClasses}>{dayjs(classData.startDate).format("DD.MM.YYYY")}</span>
                <div>
                  <div className={styles.iconBlock}>
                    <Image src={teacherIcon} className={styles.icon} />
                    <span className={styles.classClasses}>{classData.teacher.fullName}</span>
                  </div>
                  <div className={styles.iconBlock}>
                    <Image src={locationIcon} className={styles.icon} />
                    <span className={styles.classClasses}>{classData.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isOpen && (
            <div className={styles.classBottom}>
              <div className={styles.infoBlock}>
                <div className={styles.infoBlockTitle}>{t("studentClassItem.additionalInformation")}</div>
                <div className={styles.infoBlockBody}>
                  <div className={styles.infoCheckboxes}>
                    <Checkbox
                      checked={presence}
                      labelPosition="left"
                      label={t("studentClassItem.arrived")}
                      color="dark"
                      radius="xs"
                      onChange={() => {
                        if (!presence) {
                          mark({ studentId: studentId ? studentId : "", classId: classData._id });
                        } else {
                          unmark({ studentId: studentId ? studentId : "", classId: classData._id });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.infoBlock}>
                <div className={styles.infoBlockTitle}>{t("studentClassItem.chooseAnotherTeacher")}</div>
                <div className={styles.infoBlockBody}>
                  <form onSubmit={form.onSubmit(updateClassHandler)} className={styles.infoBlockTeachers}>
                    {teachersList && (
                      <AppSelect
                        data={teachersList.map((teacher: Teacher) => ({ value: teacher._id, label: teacher.fullName }))}
                        placeholder={t("components.classesTable.form.teacherIdPlaceholder")}
                        {...form.getInputProps("teacherId")}
                      />
                    )}
                    <AppButton variant={"filled"} title={t("general.actions.apply")} type={"submit"} />
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={styles.classRight}>
          <div>{dayjs(classData.startDate).format("HH:mm")}</div>
          <div>{dayjs(classData.endDate).format("HH:mm")}</div>
        </div>
      </div>
    </>
  );
};
