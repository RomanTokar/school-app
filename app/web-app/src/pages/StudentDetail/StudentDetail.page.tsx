import { Avatar, Container, Image, RingProgress, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedValue, useDisclosure, useMediaQuery } from "@mantine/hooks";
import dayjs from "dayjs";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { useGetCityQuery, useGetMatnasQuery } from "../../app/api/classes";
import { useGetSchoolsQuery } from "../../app/api/schools";
import {
  useAddStudentNoteMutation,
  useDeleteStudentAvatarMutation,
  useDeleteStudentNoteMutation,
  useGetStudentAttendanceQuery,
  useGetStudentByIdQuery,
  useGetStudentClassesQuery,
  useGetStudentNotesQuery,
  useUpdateStudentAvatarMutation,
  useUpdateStudentMutation,
} from "../../app/api/student";
import { City, Classes, Matnas } from "../../app/types/classesTypes";
import { AddStudent } from "../../app/types/studentTypes";
import alertIcon from "../../assets/icons/alert.svg";
import arrowLeftIcon from "../../assets/icons/arrow-left.svg";
import calendarIcon from "../../assets/icons/calendar.svg";
import closeIcon from "../../assets/icons/close-menu.svg";
import pencilIcon from "../../assets/icons/pencil.svg";
import successIcon from "../../assets/icons/success.svg";
import whatsappIcon from "../../assets/icons/whatsapp.svg";
import { AppButton } from "../../components/Button/Button";
import { AppDatePicker } from "../../components/Datepicker/Datepicker";
import { FilesStudents } from "../../components/FilesStudents/FilesStudents";
import { AppInput } from "../../components/Input/Input";
import { AppModal } from "../../components/Modal/Modal";
import { Notification } from "../../components/Notification/notification";
import { AppSelect } from "../../components/Select/Select";
import { StudentClassItem } from "../../components/StudentClassItem/StudentClassItem";
import styles from "./StudentDetail.module.scss";

export const StudentDetail: FC = () => {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const desktop = useMediaQuery("(min-width: 992px)");
  const [query, setQuery] = useState("");
  const [debounced] = useDebouncedValue(query, 200);
  const [isChangeable, setIsChangeable] = useState<boolean>(false);
  const { data: student } = useGetStudentByIdQuery({ id });
  const { data: notes } = useGetStudentNotesQuery({ id });
  const { data: classes } = useGetStudentClassesQuery({
    id,
    name: debounced,
  });
  const [updateStudent] = useUpdateStudentMutation();
  const [updateStudentAvatar] = useUpdateStudentAvatarMutation();
  const [deleteStudentAvatar] = useDeleteStudentAvatarMutation();

  const [addStudentNote] = useAddStudentNoteMutation();
  const [deleteStudentNote] = useDeleteStudentNoteMutation();
  const { data: cities } = useGetCityQuery();
  const { data: matnases } = useGetMatnasQuery();
  const { data: schools } = useGetSchoolsQuery();
  const [isStudentUpdated, setIsStudentUpdated] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<any>(null);
  // toDeleteAvatar- flag, if true, then delete avatar after apply
  const [toDeleteAvatar, setToDeleteAvatar] = useState<boolean>(false);
  const [modalNote, setModalNote] = useState("");
  const [opened, { open, close }] = useDisclosure();
  const [statsDateFrom, setStatsDateFrom] = useState<Date | null>(new Date());
  const [statsDateTo, setStatsDateTo] = useState<Date | null>(nextweek());
  const { data: attendancy } = useGetStudentAttendanceQuery({
    studentId: id,
    startDate: dayjs(statsDateFrom).toISOString(),
    endDate: dayjs(statsDateTo).toISOString(),
  });

  function nextweek() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  }

  const form = useForm({
    initialValues: {
      fullName: "",
      city: "",
      school: "",
      matnas: "",
      ID: "",
      phoneNumber: "",
      email: "",
      WhatsAppLink: "",
    } as AddStudent,
    validate: {
      fullName: (value) => {
        if (!value) {
          return t("studentDetail.validations.fullNameRequired");
        }
      },
      city(value) {
        if (!value) {
          return t("studentDetail.validations.cityRequired");
        }
      },
      school(value) {
        if (!value) {
          return t("studentDetail.validations.schoolRequired");
        }
      },
      matnas(value) {
        if (!value) {
          return t("studentDetail.validations.matnasRequired");
        }
      },
      ID(value) {
        if (!value) {
          return t("studentDetail.validations.IDRequired");
        }
      },
      phoneNumber(value) {
        if (!value) {
          return t("studentDetail.validations.phoneRequired");
        }
      },
      email(value) {
        if (!value) {
          return t("studentDetail.validations.emailRequired");
        }
      },
    },
  });

  useEffect(() => {
    form.setValues((prev) => ({
      ...prev,
      fullName: student?.fullName,
      city: student?.city,
      school: student?.school,
      matnas: student?.matnas,
      ID: student?.ID,
      phoneNumber: student?.phoneNumber,
      email: student?.email,
      WhatsAppLink: student?.WhatsAppLink,
    }));
  }, [student]);

  const updateStudentHandler = async () => {
    setIsChangeable((prev) => !prev);
    if (student?._id) {
      try {
        await updateStudent({
          id: student._id,
          body: form.values,
        }).unwrap();

        form.reset();
        close();
        if (preview) {
          const formData = new FormData();
          formData.append("avatar", preview);
          try {
            if (student?._id) {
              await updateStudentAvatar({
                id: student._id,
                body: formData,
              }).unwrap();
            }
          } catch (error) {
          } finally {
          }
        }
        if (toDeleteAvatar) {
          await deleteStudentAvatar({
            id: student._id,
          }).unwrap();
        }
        setIsStudentUpdated(true);
      } catch (error) {
      } finally {
        setTimeout(() => {
          setIsStudentUpdated(false);
        }, 3000);
      }
    }
  };

  const handleClickOverlay = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    setPreview(file);
    setToDeleteAvatar(false);
  };

  const handleDeleteAvatar = async () => {
    setToDeleteAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPreview(null);
  };

  const handleAddNote = () => {
    if (modalNote.trim().length) {
      addStudentNote({ id, text: modalNote });
      close();
    }
  };

  const avatarUrl = useMemo(() => {
    if (toDeleteAvatar) {
      return "";
    }
    return preview ? URL.createObjectURL(preview) : student?.avatar;
  }, [toDeleteAvatar, preview, student]);

  return (
    <>
      {isStudentUpdated && <Notification text={t("studentDetail.notification.studentUpdated")} />}
      <AppModal status={opened} onClose={close} size={"xl"}>
        <div className={styles.modal}>
          <div className={styles.modalHead}>{t("studentDetail.modal.title")}</div>
          <div className={styles.modalBody}>
            <Textarea placeholder={t("studentDetail.modal.newNotePlaceholder")} autosize minRows={4} onChange={(e) => setModalNote(e.target.value)} />
            <div className={styles.modalActions}>
              <AppButton variant={"outline"} title={t("general.actions.cancel")} onClick={close} />
              <AppButton variant={"filled"} title={t("studentDetail.modal.submit")} onClick={handleAddNote} />
            </div>
          </div>
        </div>
      </AppModal>
      <div className={styles.pageWrapper}>
        <Link to={`/students`} className={styles.backbutton}>
          <div className={styles.backbuttonIcon}>
            <Image src={arrowLeftIcon} style={{ maxWidth: "24px" }} />
          </div>
          <span>{t("studentDetail.buttons.backButton")}</span>
        </Link>
        <Container size={"xl"} className={styles.studentWrapper}>
          <div className={styles.studentRow}>
            <div className={styles.studentBlockWrapper}>
              <div className={styles.studentBlockTitle}>{t("studentDetail.block.notes")}</div>
              <div className={styles.studentBlock}>
                {!!notes?.length && (
                  <div className={styles.notesWrapper}>
                    {notes?.map((note) => (
                      <div key={note._id} className={styles.notesItem}>
                        <Image src={closeIcon} style={{ maxWidth: "24px" }} onClick={() => deleteStudentNote({ noteId: note._id, studentId: id })} />
                        <div>
                          <div>{note.text}</div>
                          <div className={styles.notesItemTime}>{dayjs(note.createdAt).format("YYYY-MM-DD HH:mm")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <AppButton title={t("studentDetail.buttons.addNote")} variant={"filled"} onClick={open} />
              </div>
            </div>

            <div className={styles.studentBlockWrapper}>
              <div className={styles.studentBlockTitle}>{t("studentDetail.block.attendancy")}</div>
              <div className={styles.studentBlock}>
                <div className={styles.diagramHead}>
                  <div className={styles.diagramHeadItem}>
                    <Image src={calendarIcon} style={{ maxWidth: "24px" }} />
                    <AppDatePicker changeDate={setStatsDateTo} />
                    <span className={styles.label}>{t("general.to")}</span>
                  </div>
                  <div className={styles.diagramHeadItem}>
                    <Image src={calendarIcon} style={{ maxWidth: "24px" }} />
                    <AppDatePicker changeDate={setStatsDateFrom} dateValue={nextweek()} />
                    <span className={styles.label}>{t("general.from")}</span>
                  </div>
                </div>
                <div className={styles.diagramWrapper}>
                  {attendancy && (
                    <RingProgress
                      size={desktop ? 350 : 290}
                      thickness={32}
                      sections={[
                        { value: attendancy.present, color: "#61BD73" },
                        { value: attendancy.absent, color: "#E05763" },
                      ]}
                      label={
                        <div className={styles.diagramInner}>
                          <div className={styles.diagramInnerItem}>
                            <Image src={successIcon} style={{ maxWidth: "24px" }} />
                            <span>{t("components.studentAttendancy.arrived")}</span>
                          </div>
                          <div className={styles.diagramInnerItem}>
                            <Image src={alertIcon} style={{ maxWidth: "24px" }} />
                            <span>{t("components.studentAttendancy.notArrive")}</span>
                          </div>
                        </div>
                      }
                    />
                  )}
                </div>
              </div>
            </div>

            <div className={styles.studentBlockWrapper}>
              <div className={styles.studentBlockTitleButton}>
                <AppButton
                  variant={"subtle"}
                  title={t("studentDetail.block.student")}
                  leftIcon={
                    <Image
                      src={pencilIcon}
                      style={{ background: isChangeable ? "#2064CB" : "rgba(66, 72, 88, 0.5)", padding: "8px", borderRadius: "100%" }}
                    />
                  }
                  onClick={() => setIsChangeable((prev) => !prev)}
                />
              </div>
              <div className={`${styles.studentBlock} ${styles.studentProfile}`}>
                <form onSubmit={form.onSubmit(() => updateStudentHandler())}>
                  <div className={styles.avatarWrapper}>
                    <Avatar src={avatarUrl} radius={120} className={styles.avatar} />
                    {isChangeable && (
                      <div className={styles.overlay}>
                        <div className={styles.overlayContent}>
                          <div onClick={handleClickOverlay} className={styles.overlayChangeButton}>
                            {t("studentDetail.buttons.changePhoto")}
                          </div>
                          {(preview || (student?.avatar && !toDeleteAvatar)) && (
                            <div onClick={handleDeleteAvatar} className={styles.overlayDeleteButton}>
                              {t("general.actions.delete")}
                            </div>
                          )}
                          <input ref={fileInputRef} type="file" onChange={handleFileChange} style={{ display: "none" }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={styles.profileRow}>
                    {isChangeable ? (
                      <AppInput placeholder={t("studentDetail.form.fullNamePlaceholder")} {...form.getInputProps("fullName")} />
                    ) : (
                      <span>{student?.fullName || "-"}</span>
                    )}
                    <span>{t("studentDetail.form.fullNameField")}</span>
                  </div>
                  <div className={styles.profileRow}>
                    {isChangeable && cities ? (
                      <AppSelect
                        data={cities.map((city: City) => ({ value: city.name, label: city.name }))}
                        placeholder={t("studentDetail.form.cityPlaceholder")}
                        {...form.getInputProps("city")}
                      />
                    ) : (
                      <span>{student?.city || "-"}</span>
                    )}
                    <span>{t("studentDetail.form.cityField")}</span>
                  </div>
                  <div className={styles.profileRow}>
                    {isChangeable && schools ? (
                      <AppSelect
                        data={schools.map((school: Matnas) => ({ value: school.name, label: school.name }))}
                        placeholder={t("studentDetail.form.schoolPlaceholder")}
                        {...form.getInputProps("school")}
                      />
                    ) : (
                      <span>{student?.school || "-"}</span>
                    )}
                    <span>{t("studentDetail.form.schoolField")}</span>
                  </div>
                  <div className={styles.profileRow}>
                    {isChangeable && matnases ? (
                      <AppSelect
                        data={matnases.map((matnas: Matnas) => ({ value: matnas.name, label: matnas.name }))}
                        placeholder={t("studentDetail.form.matnasPlaceholder")}
                        {...form.getInputProps("matnas")}
                      />
                    ) : (
                      <span>{student?.matnas || "-"}</span>
                    )}
                    <span>{t("studentDetail.form.matnasField")}</span>
                  </div>
                  <div className={styles.profileRow}>
                    {isChangeable ? (
                      <AppInput placeholder={t("studentDetail.form.idPlaceholder")} {...form.getInputProps("ID")} />
                    ) : (
                      <span>{student?.ID || "-"}</span>
                    )}
                    <span>{t("studentDetail.form.idField")}</span>
                  </div>
                  <div className={styles.profileRow}>
                    {isChangeable ? (
                      <AppInput placeholder={t("studentDetail.form.phoneNumberPlaceholder")} {...form.getInputProps("phoneNumber")} />
                    ) : (
                      <span>{student?.phoneNumber || "-"}</span>
                    )}
                    <span>{t("studentDetail.form.phoneNumberField")}</span>
                  </div>
                  <div className={styles.profileRow}>
                    {isChangeable ? (
                      <AppInput placeholder={t("studentDetail.form.emailPlaceholder")} {...form.getInputProps("email")} />
                    ) : (
                      <span>{student?.email || "-"}</span>
                    )}
                    <span>{t("studentDetail.form.emailField")}</span>
                  </div>
                  <div className={styles.profileRow}>
                    {isChangeable ? (
                      <AppInput placeholder={t("studentDetail.form.whatsAppLinkPlaceholder")} {...form.getInputProps("WhatsAppLink")} />
                    ) : (
                      <span className={styles.whatsAppLink}>
                        {student?.WhatsAppLink ? (
                          <>
                            <Image src={whatsappIcon} /> {student?.WhatsAppLink}
                          </>
                        ) : (
                          "-"
                        )}
                      </span>
                    )}
                    <span>{t("studentDetail.form.whatsAppLinkField")}</span>
                  </div>
                  {isChangeable && (
                    <div className={styles.profileButtons}>
                      <AppButton
                        variant={"outline"}
                        title={t("general.actions.cancel")}
                        onClick={() => {
                          setIsChangeable((prev) => !prev);
                          setPreview(null);
                        }}
                      />
                      <AppButton variant={"filled"} title={t("studentDetail.form.submit")} type={"submit"} />
                    </div>
                  )}
                </form>
              </div>
            </div>

            <div className={styles.studentBlockWrapper}>
              <div className={styles.studentBlockTitle}>{t("studentDetail.block.files")}</div>
              <div className={styles.studentBlock}>
                <FilesStudents />
              </div>
            </div>
          </div>
          <div className={styles.classesHeader}>
            <span>
              {student?.fullName} {t("studentDetail.filters.classes")}
            </span>
          </div>
          <div className={styles.classesSearch}>
            <AppInput placeholder={t("studentDetail.filters.searchPlaceholder")} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className={styles.classesList}>
            {classes?.map((studentClass: Classes) => {
              return <StudentClassItem classData={studentClass} studentId={student?._id} key={studentClass._id} />;
            })}
          </div>
        </Container>
      </div>
    </>
  );
};
