import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDeleteClassMutation, useLazyGetClassesQuery } from "../../../app/api/classes";
import { AppButton } from "../../Button/Button";
import { TeacherClass } from "../TeacherClass/TeacherClass";
import styles from "./TeacherClasses.module.scss";

interface Props {
  teacherId: string | undefined;
  getClassId: (id: string | null) => void;
  date: Date;
}

export const TeacherClasses: FC<Props> = ({ teacherId, getClassId, date }) => {
  const { t } = useTranslation();
  const [getClasses, { data: classes }] = useLazyGetClassesQuery();
  const [deleteClass] = useDeleteClassMutation();
  const [selected, setSelected] = useState<string>();
  const [deleteStatus, setDeleteStatus] = useState<string>("");
  const [dte, setDte] = useState<string>("");

  const deleteClassHandler = async (value: string) => {
    try {
      await deleteClass({
        id: value,
        deleteType: deleteStatus,
        recurringEndDate: dte ? dte : undefined,
      }).unwrap();

      setSelected("");
      getClassId(null);
    } catch (error) {}
  };

  const deleteAllClassesHandler = async () => {
    if (classes && classes?.length > 1) {
      classes.forEach((classItem) => {
        deleteClassHandler(classItem._id);
      });
    }
  };

  useEffect(() => {
    if (teacherId && date) {
      getClasses({
        teacherId,
        startDate: dayjs(date).toISOString(),
        endDate: dayjs(date).add(1, "day").toISOString(),
      });
    }
  }, [teacherId, date]);

  useEffect(() => {
    if (classes && classes.length > 0) {
      setSelected(classes[0]._id);
      getClassId(classes[0]._id);
    } else {
      setSelected("");
      getClassId(null);
    }
  }, [classes]);

  return (
    <>
      <div className={styles.classes} style={{ display: classes?.length === 0 ? "none" : "block" }}>
        <div className={styles.title}>{t("components.teacherClasses.text.classes")}</div>
        <div className={styles.classesList}>
          {classes?.map((classItem) => (
            <div
              key={classItem._id}
              className={styles.classesItem}
              onClick={() => {
                setSelected(classItem._id);
                getClassId(classItem._id);
              }}
            >
              <TeacherClass
                data={classItem}
                isSelected={classItem._id === selected}
                getClassId={(value) => {
                  setSelected(value ? value : "");
                  getClassId(value);
                }}
              />
            </div>
          ))}
        </div>
        {classes && classes.length > 1 && (
          <div className={styles.classesAction}>
            <AppButton variant={"filled"} title={"components.teacherClasses.actions.cancelAll"} onClick={() => deleteAllClassesHandler()} />
          </div>
        )}
      </div>
    </>
  );
};
