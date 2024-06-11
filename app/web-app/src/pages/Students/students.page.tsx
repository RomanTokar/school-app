import { Container, Image } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedValue, useDisclosure, useMediaQuery } from "@mantine/hooks";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetCityQuery, useGetMatnasQuery } from "../../app/api/classes";
import { useGetSchoolsQuery } from "../../app/api/schools";
import { useAddStudentMutation, useLazyGetStudentsQuery, useUpdateStudentAvatarMutation } from "../../app/api/student";
import { City, Matnas } from "../../app/types/classesTypes";
import { School } from "../../app/types/schoolsTypes";
import { AddStudent, Student } from "../../app/types/studentTypes";
import plusIcon from "../../assets/icons/plus.svg";
import { AppButton } from "../../components/Button/Button";
import { AppInput } from "../../components/Input/Input";
import { AppModal } from "../../components/Modal/Modal";
import { Notification } from "../../components/Notification/notification";
import { AppSelect } from "../../components/Select/Select";
import { StudentItem } from "../../components/StudentItem/StudentItem";
import styles from "./students.module.scss";
import UploadAvatar from "../../components/UploadAvatar/UploadAvatar";

export const Students = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<{ matnas: string; school: string; city: string }>({ matnas: "", school: "", city: "" });
  const [debounced] = useDebouncedValue(query, 200);
  const [opened, { open, close }] = useDisclosure(false);
  const [getStudents, { data: studentsList }] = useLazyGetStudentsQuery();
  const [updateStudentAvatar] = useUpdateStudentAvatarMutation();
  const { data: cities } = useGetCityQuery();
  const { data: matnases } = useGetMatnasQuery();
  const { data: schools } = useGetSchoolsQuery();
  const [addStudent] = useAddStudentMutation();
  const [isTeacherAdded, setIsStudentAdded] = useState<boolean>(false);
  const desktop = useMediaQuery("(min-width: 992px)");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
          return t("studentsPage.validations.fullNameRequired");
        }
      },
      city(value) {
        if (!value) {
          return t("studentsPage.validations.cityRequired");
        }
      },
      school(value) {
        if (!value) {
          return t("studentsPage.validations.schoolRequired");
        }
      },
      matnas(value) {
        if (!value) {
          return t("studentsPage.validations.matnasRequired");
        }
      },
      email(value) {
        if (!value) {
          return t("studentsPage.validations.emailRequired");
        }
      },
      phoneNumber(value) {
        if (!value) {
          return t("studentsPage.validations.phoneRequired");
        }
      },
      WhatsAppLink(value) {
        if (!value) {
          return t("studentsPage.validations.phoneRequired");
        }
      },
    },
  });

  useEffect(() => {
    getStudents({ fullName: debounced, city: filters.city, school: filters.school, matnas: filters.school });
  }, [debounced]);

  useEffect(() => {
    getStudents({ fullName: debounced, city: filters.city, school: filters.school, matnas: filters.matnas });
  }, [filters]);

  const addStudentHandler = async (values: AddStudent) => {
    try {
      const response = await addStudent({
        fullName: values.fullName,
        city: values.city,
        school: values.school,
        matnas: values.matnas,
        ID: values.ID ? values.ID : undefined,
        phoneNumber: values.phoneNumber,
        email: values.email,
        WhatsAppLink: values.WhatsAppLink,
      }).unwrap();

      form.reset();
      close();

      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        try {
          if (response?._id) {
            await updateStudentAvatar({
              id: response._id,
              body: formData,
            }).unwrap();
          }
        } catch (error) {
        } finally {
        }
      }
      setIsStudentAdded(true);
    } catch (error) {
    } finally {
      setTimeout(() => {
        setIsStudentAdded(false);
      }, 3000);
    }
  };

  return (
    <>
      {isTeacherAdded && <Notification text={t("studentsPage.notification.studentAdded")} />}
      <Container size={"xl"}>
        <div className={styles.filtersWrapper}>
          <div>
            <div className={styles.filtersItem}>
              <div>{t("studentsPage.filters.matnas")}</div>
              {matnases && (
                <AppSelect
                  data={matnases.map((matnas: Matnas) => ({ value: matnas.name, label: matnas.name }))}
                  placeholder={t("studentsPage.filters.matnasPlaceholder")}
                  value={filters.matnas}
                  onChange={(value: string) => setFilters({ ...filters, matnas: value })}
                />
              )}
            </div>
          </div>
          <div>
            <div className={styles.filtersItem}>
              <div>{t("studentsPage.filters.school")}</div>
              {schools && (
                <AppSelect
                  data={schools.map((schools: School) => ({ value: schools.name, label: schools.name }))}
                  placeholder={t("studentsPage.filters.schoolPlaceholder")}
                  value={filters.school}
                  onChange={(value: string) => setFilters({ ...filters, school: value })}
                />
              )}
            </div>
            <div className={styles.filtersItem}>
              <div>{t("studentsPage.filters.city")}</div>
              {cities && (
                <AppSelect
                  data={cities.map((city: City) => ({ value: city.name, label: city.name }))}
                  placeholder={t("studentsPage.filters.cityPlaceholder")}
                  value={filters.city}
                  onChange={(value: string) => setFilters({ ...filters, city: value })}
                />
              )}
            </div>
          </div>
        </div>
        <div className={styles.studentsSearch}>
          <AppInput placeholder={t("studentsPage.filters.searchPlaceholder")} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className={styles.studentsBtns}>
          <AppButton
            variant={"filled"}
            title={t("studentsPage.buttons.addStudent")}
            leftIcon={<Image src={plusIcon} />}
            style={{ background: "rgba(66, 72, 88, 0.5)", border: "none" }}
            onClick={() => open()}
          />
          <div className={styles.studentsTitle}>{t("studentsPage.buttons.allStudents")}</div>
        </div>
        <div className={styles.studentsList}>
          {studentsList?.map((student: Student) => (
            <StudentItem {...student} key={student._id} updateStudents={() => getStudents({ fullName: debounced })} />
          ))}
        </div>
        {opened && (
          <AppModal status={opened} onClose={() => close()} size={desktop ? "md" : "xs"}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>{t("studentsPage.buttons.addStudent")}</div>
              <form onSubmit={form.onSubmit((values) => addStudentHandler(values))} className={styles.form}>
                <AppInput placeholder={t("studentsPage.form.fullNamePlaceholder")} {...form.getInputProps("fullName")} />
                {cities && (
                  <AppSelect
                    data={cities.map((city: City) => ({ value: city.name, label: city.name }))}
                    placeholder={t("studentsPage.form.cityPlaceholder")}
                    {...form.getInputProps("city")}
                  />
                )}
                {schools && (
                  <AppSelect
                    data={schools.map((school: Matnas) => ({ value: school.name, label: school.name }))}
                    placeholder={t("studentsPage.form.schoolPlaceholder")}
                    {...form.getInputProps("school")}
                  />
                )}
                {matnases && (
                  <AppSelect
                    data={matnases.map((matnas: Matnas) => ({ value: matnas.name, label: matnas.name }))}
                    placeholder={t("studentsPage.form.matnasPlaceholder")}
                    {...form.getInputProps("matnas")}
                  />
                )}
                <AppInput placeholder={t("studentsPage.form.idPlaceholder")} {...form.getInputProps("ID")} />
                <AppInput type={"number"} placeholder={t("studentsPage.form.phoneNumberPlaceholder")} {...form.getInputProps("phoneNumber")} />
                <AppInput placeholder={t("studentsPage.form.emailPlaceholder")} {...form.getInputProps("email")} />
                <AppInput placeholder={t("studentsPage.form.whatsAppLinkPlaceholder")} {...form.getInputProps("WhatsAppLink")} />
                <UploadAvatar avatarFile={avatarFile} setAvatarFile={setAvatarFile} />
                <div className={styles.formBtns}>
                  <AppButton
                    title={t("general.actions.cancel")}
                    variant={"outline"}
                    onClick={() => {
                      close();
                      setAvatarFile(null);
                    }}
                  />
                  <AppButton title={t("studentsPage.form.submit")} variant={"filled"} type={"submit"} />
                </div>
              </form>
            </div>
          </AppModal>
        )}
      </Container>
    </>
  );
};
