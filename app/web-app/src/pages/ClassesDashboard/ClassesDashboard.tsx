import { ActionIcon, Container, Image } from "@mantine/core";
import styles from "./ClassesDashboard.module.scss";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClassesPlans } from "../../components/ClassesPageComponents/ClassesPlans/ClassesPlans";
import { ClassesStudent } from "../../components/ClassesPageComponents/ClassesStudent/ClassesStudent";
import { StudentNotes } from "../../components/ClassesPageComponents/StudentNotes/StudentNotes";

import { useForm } from "@mantine/form";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useGetClassQuery, useGetClassStudentsQuery, useUpdateClassMutation } from "../../app/api/classes";
import { useGetTeachersQuery } from "../../app/api/teacher";
import { Teacher } from "../../app/types/teacherTypes";
import arrowLeftIcon from "../../assets/icons/arrow-left.svg";
import pencilIcon from "../../assets/icons/pencil.svg";
import whatsappIcon from "../../assets/icons/whatsapp.svg";
import { AppButton } from "../../components/Button/Button";
import { ClassesFiles } from "../../components/ClassesPageComponents/ClassesFiles/ClassesFiles";
import { ClassesNotes } from "../../components/ClassesPageComponents/ClassesNotes/ClassesNotes";
import { ClassesStudents } from "../../components/ClassesPageComponents/ClassesStudents/ClassesStudents";
import { StudentFiles } from "../../components/ClassesPageComponents/StudentFiles/StudentFiles";
import { AppInput } from "../../components/Input/Input";
import { AppSelect } from "../../components/Select/Select";
import { StudentAttendancy } from "../../components/TeacherPageComponents/StudentAttendancy/StudentAttendancy";
import { StudentPresence } from "../../components/TeacherPageComponents/StudentPresence/StudentPrecense";
import { AppTimeInput } from "../../components/TimeInput/TimeInput";

interface FormValues {
  teacher: string;
  location: string;
  startTime?: string;
  endTime?: string;
  startDate: string;
  endDate: string;
  _id?: string;
}

export const ClassesDashboard = () => {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const [updateClass] = useUpdateClassMutation();
  const { data: teachersList } = useGetTeachersQuery({});
  const { data: classStudents } = useGetClassStudentsQuery({ classId: params.classId ? params.classId : "" });
  const { data: classData } = useGetClassQuery({ id: params.classId ? params.classId : "" });
  const [studentId, setStudentId] = useState<string>();
  const [edit, setEdit] = useState<boolean>(false);

  const form = useForm({
    initialValues: {
      teacher: classData?.teacher._id,
      location: classData?.location,
      startTime: "",
      endTime: "",
      startDate: "",
      endDate: "",
    } as FormValues,
    validate: {
      location(value) {
        if (value && value.length < 5) {
          return t("classesPage.validations.locationLength");
        }
      },
    },
  });

  const updateClassHandler = async (values: FormValues) => {
    try {
      await updateClass({
        teacherId: values.teacher,
        location: values.location,
        startDate: dayjs(`${dayjs(classData?.startDate).format("YYYY-MM-DD")}T${values.startTime}`).toISOString(),
        endDate: dayjs(`${dayjs(classData?.endDate).format("YYYY-MM-DD")}T${values.endTime}`).toISOString(),
        _id: classData?._id || "",
      }).unwrap();

      form.reset();
      setEdit(false);
    } catch (error) {}
  };

  useEffect(() => {
    if (classStudents && classStudents.length > 0) {
      setStudentId(classStudents[0]._id);
    }
  }, [classStudents]);

  return (
    <div className={styles.page}>
      <Container size={"xl"}>
        <div className={styles.topBar}>
          <div className={styles.topBarBtn}>
            <ActionIcon variant={"transparent"} title={"classesDashboardPage.text.back"} onClick={() => navigate(-1)}>
              <div style={{ background: "rgba(66, 72, 88, 0.5)", padding: "8px", borderRadius: "100%" }}>
                <Image src={arrowLeftIcon} style={{ minWidth: "24px" }} />
              </div>
            </ActionIcon>
            <span>{t("classesDashboardPage.text.back")}</span>
          </div>
        </div>
        <div className={styles.wrapper}>
          {studentId && (
            <div className={styles.leftColumn}>
              {studentId && <ClassesStudent student={classStudents && classStudents.find((obj) => obj._id === studentId)} />}
              {params.classId && studentId && <StudentPresence classId={params.classId} studentId={studentId} />}
              {studentId && params.classId && <StudentAttendancy studentId={studentId} />}
              {studentId && <StudentNotes studentId={studentId} />}
              {studentId && <StudentFiles studentId={studentId} />}
            </div>
          )}

          <div className={styles.centerColumn}>
            {classData && <ClassesPlans classData={classData} />}
            <ClassesStudents reviewStudent={(value) => setStudentId(value)} />
          </div>
          <div className={styles.rightColumn}>
            <div className={styles.class}>
              <div className={styles.classHeading}>
                <ActionIcon variant={"transparent"} title={"CLASS NAME"} onClick={() => setEdit((prev) => !prev)}>
                  <div style={{ background: "rgba(66, 72, 88, 0.5)", padding: "8px", borderRadius: "100%" }}>
                    <Image src={pencilIcon} style={{ minWidth: "24px" }} />
                  </div>
                </ActionIcon>
                <span className={styles.title}>{classData?.name}</span>
              </div>
              {edit ? (
                <div className={styles.classBody}>
                  <form onSubmit={form.onSubmit((values) => updateClassHandler(values))} className={styles.form}>
                    {teachersList && (
                      <AppSelect
                        data={teachersList.map((teacher: Teacher) => ({ value: teacher._id, label: teacher.fullName }))}
                        placeholder={`${t("components.classesTable.form.teacherIdPlaceholder")}`}
                        {...form.getInputProps("teacher")}
                      />
                    )}
                    <AppInput placeholder="Enter location" {...form.getInputProps("location")} />
                    <div className={styles.dates}>
                      <div className={styles.datesTime}>
                        <div className={styles.datesTimePart}>
                          <AppTimeInput {...form.getInputProps("startTime")} />
                          <span>{t("general.from")}</span>
                        </div>
                        <div className={styles.datesTimePart}>
                          <AppTimeInput {...form.getInputProps("endTime")} />
                          <span>{t("general.to")}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.formBtns}>
                      <AppButton title="general.actions.cancel" variant={"outline"} onClick={() => setEdit(false)} />
                      <AppButton title="Edit" variant={"filled"} type={"submit"} />
                    </div>
                  </form>
                </div>
              ) : (
                <div className={styles.classBody}>
                  <div className={styles.classRow}>
                    <span className={styles.classValue}>{classData?.teacher.fullName}</span>
                    <span className={styles.classLabel}>{t("classesDashboardPage.form.nameLabel")}</span>
                  </div>
                  <div className={styles.classRow}>
                    <span className={styles.classValue}>{classData?.location}</span>
                    <span className={styles.classLabel}>{t("classesDashboardPage.form.locationLabel")}</span>
                  </div>
                  <div className={styles.classRow}>
                    <span className={styles.classValue}>
                      {dayjs(classData?.startDate).format("HH:mm")} - {dayjs(classData?.endDate).format("HH:mm")}
                    </span>
                    <span className={styles.classLabel}>{t("classesDashboardPage.form.timeLabel")}</span>
                  </div>
                  <div className={styles.classRow}>
                    <span className={styles.classValue}>
                      <Image
                        src={whatsappIcon}
                        style={{ maxWidth: "24px", cursor: "pointer" }}
                        onClick={() => window.open(classData?.groupLink, "_blank")}
                      />
                    </span>
                    <span className={styles.classLabel}>{t("classesDashboardPage.form.groupChatLabel")}</span>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.wrapperInner}>
              <ClassesNotes />
            </div>
            <div className={styles.wrapperInner}>
              <ClassesFiles />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
