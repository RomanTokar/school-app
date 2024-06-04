import { Image } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useParams } from "react-router-dom";
import {
  useDeleteStudentFromClassMutation,
  useGetClassQuery,
  useGetClassStudentsQuery,
  usePutStudentIntoClassMutation,
} from "../../../app/api/classes";
import { useGetStudentsQuery } from "../../../app/api/student";
import { Student } from "../../../app/types/studentTypes";
import { AppButton } from "../../Button/Button";
import { AppInput } from "../../Input/Input";
import { AppModal } from "../../Modal/Modal";
import { AppSelect } from "../../Select/Select";
import styles from "./ClassesStudents.module.scss";

import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import closeIcon from "../../../assets/icons/close-menu.svg";
import { AppDatePicker } from "../../Datepicker/Datepicker";

interface Props {
  reviewStudent: (value: string) => void;
}

interface FormValues {
  studentId: string;
  classId: string;
  updateType: string;
  date: string;
}

export const ClassesStudents: FC<Props> = ({ reviewStudent }) => {
  const { t } = useTranslation();
  const params = useParams();
  const { data: students } = useGetStudentsQuery({});
  const { data: classData } = useGetClassQuery({ id: params.classId ? params.classId : "" }, { skip: !params.classId });
  const [putStudents] = usePutStudentIntoClassMutation();
  const [deleteStudent] = useDeleteStudentFromClassMutation();
  const { data: classStudents } = useGetClassStudentsQuery({ classId: params.classId ? params.classId : "" });
  const [opened, { open, close }] = useDisclosure();
  const [selected, setSelected] = useState<string>();
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [typeModalOpened, { open: openTypeModal, close: closeTypeModal }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [studentToDeleteId, setStudentToDeleteId] = useState<string>("");

  const form = useForm({
    initialValues: {
      studentId: "",
      classId: params.classId ? params.classId : "",
      updateType: "",
      date: "",
    } as FormValues,
    validate: {
      studentId: (value) => {
        if (value === null) {
          return "Choose student";
        }
      },
    },
  });

  const putStudentIntoClassHandler = async () => {
    try {
      await putStudents({
        classId: form.values.classId,
        studentId: form.values.studentId,
        updateType: classData?.isRecurring ? form.values.updateType : undefined,
        recurringEndDate: form.values.updateType === "following" ? dayjs(form.values.date).toISOString() : undefined,
      }).unwrap();

      form.reset();
      close();
    } catch (error) {}
  };

  const deleteStudentHandler = async (studentId: string) => {
    if (classData?.isRecurring) {
      try {
        await deleteStudent({ classId: params.classId ? params.classId : "", studentId, deleteType: form.values.updateType }).unwrap();

        closeDeleteModal();
      } catch (error) {}
    } else {
      try {
        await deleteStudent({ classId: params.classId ? params.classId : "", studentId }).unwrap();

        closeDeleteModal();
      } catch (error) {}
    }
  };

  const filter = (value: string) => {
    if (value === "" && classStudents && classStudents.length > 0) {
      setFilteredStudents(classStudents);
      return;
    }

    const array = [...filteredStudents];

    const filtered = array.filter((student: Student) => {
      return student.fullName.toLowerCase().includes(value.toLowerCase());
    });

    setFilteredStudents(filtered);
  };

  useEffect(() => {
    setFilteredStudents([]);
    if (classStudents && classStudents.length > 0) {
      setSelected(classStudents[0]._id);
      setFilteredStudents(classStudents);
    }
  }, [classStudents]);

  return (
    <>
      <AppModal status={typeModalOpened} onClose={closeTypeModal}>
        <div className={styles.modal}>
          <div className={styles.modalFields}>
            <AppSelect
              data={[
                { label: `${t("general.modal.single")}`, value: "single" },
                { label: `${t("general.modal.all")}`, value: "all" },
                { label: `${t("general.modal.following")}`, value: "following" },
              ]}
              {...form.getInputProps("updateType")}
              placeholder={t("general.modal.updateType")}
            />
            {form.values.updateType === "following" && (
              <div className={styles.modalDatepicker}>
                <AppDatePicker changeDate={(value) => form.setFieldValue("date", dayjs(value).toISOString())} />
              </div>
            )}
            <div className={styles.modalActions}>
              <AppButton variant={"outline"} title={"general.actions.cancel"} onClick={closeTypeModal} />
              <AppButton
                variant={"filled"}
                title={"studentsPage.buttons.addStudent"}
                onClick={() => {
                  putStudentIntoClassHandler();
                  closeTypeModal();
                }}
              />
            </div>
          </div>
        </div>
      </AppModal>
      <AppModal status={deleteModalOpened} onClose={closeDeleteModal}>
        <div className={styles.modal}>
          <div className={styles.modalFields}>
            <AppSelect
              data={[
                { label: `${t("general.modal.single")}`, value: "single" },
                { label: `${t("general.modal.all")}`, value: "all" },
                { label: `${t("general.modal.following")}`, value: "following" },
              ]}
              {...form.getInputProps("updateType")}
              placeholder={t("general.modal.deleteType")}
            />
            {form.values.updateType === "following" && (
              <div className={styles.modalDatepicker}>
                <AppDatePicker changeDate={(value) => form.setFieldValue("date", dayjs(value).toISOString())} />
              </div>
            )}
            <div className={styles.modalActions}>
              <AppButton variant={"outline"} title={"general.actions.cancel"} onClick={closeDeleteModal} />
              <AppButton
                variant={"filled"}
                title={"studentsPage.buttons.deleteStudent"}
                onClick={() => {
                  deleteStudentHandler(studentToDeleteId);
                  closeTypeModal();
                }}
              />
            </div>
          </div>
        </div>
      </AppModal>
      <AppModal status={opened} onClose={close}>
        <div className={styles.modal}>
          <div className={styles.title}>{t("studentsPage.buttons.addStudent")}</div>
          <div className={styles.modalContent}>
            <form
              onSubmit={form.onSubmit(() => {
                close();
                openTypeModal();
              })}
            >
              <AppSelect
                data={students ? [...students?.map((std: Student) => ({ label: std.fullName, value: std._id }))] : []}
                onChange={(value) => form.setValues({ studentId: value ? value : "" })}
              />
              <AppButton variant={"filled"} title={"studentsPage.buttons.addStudent"} type={"submit"} style={{ marginTop: "20px" }} />
            </form>
          </div>
        </div>
      </AppModal>
      <div className={styles.students}>
        <div className={styles.title}>{t("components.teacherStudentsList.text.students")}</div>
        {filteredStudents && filteredStudents?.length > 0 && (
          <div className={styles.studentsList}>
            {filteredStudents?.map((student: Student) => (
              <div
                className={`${styles.studentsItem} ${student._id === selected && styles.studentsItemSelected}`}
                onClick={() => {
                  setSelected(student._id);
                  reviewStudent(student._id);
                }}
                key={student._id}
              >
                <div
                  className={styles.close}
                  onClick={() => {
                    setStudentToDeleteId(student._id);
                    openDeleteModal();
                  }}
                >
                  <Image src={closeIcon} />
                </div>
                <div className={styles.studentsAvatar}>
                  <Image src={student.avatar} />
                </div>
                <div className={styles.studentsName}>{student.fullName}</div>
              </div>
            ))}
          </div>
        )}
        {classStudents && classStudents?.length > 0 && <AppInput placeholder={"Student name"} onChange={(event) => filter(event.target.value)} />}

        <div className={styles.studentsAction}>
          <AppButton variant={"filled"} title={"studentsPage.buttons.addStudent"} onClick={open} />
        </div>
      </div>
    </>
  );
};
