import { ActionIcon, Container, Image } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { AppButton } from "../../components/Button/Button";
import { AppInput } from "../../components/Input/Input";
import styles from "./teachers.module.scss";

import { useForm } from "@mantine/form";
import { useDebouncedValue, useDisclosure, useMediaQuery } from "@mantine/hooks";
import { HTMLInputTypeAttribute, useEffect, useState } from "react";
import { useAddTeacherMutation, useLazyGetTeachersQuery, useUploadTeacherImageMutation } from "../../app/api/teacher";
import { useNotification } from "../../app/contexts/NotificationContext";
import { Teacher } from "../../app/types/teacherTypes";
import closeIcon from "../../assets/icons/close-menu.svg";
import eyeIcon from "../../assets/icons/eye.svg";
import plusIcon from "../../assets/icons/plus.svg";
import { AppModal } from "../../components/Modal/Modal";
import { TeacherItem } from "../../components/TeacherPageComponents/TeacherItem/TeacherItem";

import { useTranslation } from "react-i18next";

interface FormValues {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  dropzone: File[];
}

export const Teachers = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [debounced] = useDebouncedValue(query, 200);
  const [getTeachers, { data: teachersList }] = useLazyGetTeachersQuery();
  const [addTeacher] = useAddTeacherMutation();
  const [uploadTeacherImage] = useUploadTeacherImageMutation();
  const [opened, { open, close }] = useDisclosure(false);
  const [isPasswordHidden, setIsPasswordHidden] = useState<HTMLInputTypeAttribute>("password");
  const { addNotification } = useNotification();

  const desktop = useMediaQuery("(min-width: 992px)");

  const form = useForm({
    initialValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      dropzone: [],
    } as FormValues,
    validate: {
      confirmPassword: (value, values) => (value !== values.password ? t("teachersPage.validations.passwordMatch") : null),
      fullName(value) {
        if (value.length < 5) {
          return t("studentDetail.validations.fullNameRequired");
        }
        return null;
      },
      email(value) {
        if (!value.includes("@")) {
          return t("studentDetail.validations.emailRequired");
        }
        return null;
      },
      phoneNumber(value) {
        const containsLetters = /[a-zA-Z]/.test(value);

        if (containsLetters || value.length < 5) {
          return t("studentDetail.validations.phoneRequired");
        }
        return null;
      },
    },
  });

  const addTeacherHandler = async (values: FormValues) => {
    try {
      const file = values.dropzone[0];
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await addTeacher({
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
      }).unwrap();

      close();

      await uploadTeacherImage({ id: response._id, body: formData }).unwrap();

      form.reset();

      addNotification(t("teachersPage.notifications.teacherAdded"));
    } catch (error) {
    } finally {
    }
  };

  useEffect(() => {
    getTeachers({ fullName: debounced });
  }, [debounced]);

  return (
    <Container size={"xl"}>
      <div className={styles.teacherSearch}>
        <AppInput placeholder={t("teachersPage.form.searchPlaceholder")} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className={styles.teacherBtns}>
        <AppButton
          variant={"filled"}
          title={"teachersPage.actions.addTeacher"}
          leftIcon={<Image src={plusIcon} />}
          style={{ background: "rgba(66, 72, 88, 0.5)", border: "none" }}
          onClick={() => open()}
        />
        <div className={styles.teacherTitle}>{t("teachersPage.text.allTeachers")}</div>
      </div>
      <div className={styles.teacherList}>
        {teachersList?.map((teacher: Teacher) => (
          <TeacherItem {...teacher} key={teacher._id} updateTeachers={() => getTeachers({ fullName: debounced })} />
        ))}
      </div>
      {opened && (
        <AppModal status={opened} onClose={() => close()} size={desktop ? "md" : "xs"}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>{t("teachersPage.actions.addTeacher")}</div>
            <form onSubmit={form.onSubmit((values) => addTeacherHandler(values))} className={styles.form}>
              <AppInput placeholder="teachersPage.form.fullNamePlaceholder" {...form.getInputProps("fullName")} />
              <AppInput type={"number"} placeholder="teachersPage.form.phoneNumberPlaceholder" {...form.getInputProps("phoneNumber")} />
              <AppInput placeholder="teachersPage.form.emailPlaceholder" {...form.getInputProps("email")} />
              <AppInput
                placeholder="teachersPage.form.passwordPlaceholder"
                type={isPasswordHidden}
                {...form.getInputProps("password")}
                icon={
                  <Image
                    src={eyeIcon}
                    width={"24px"}
                    onClick={() => setIsPasswordHidden((prev) => (prev === "password" ? "text" : "password"))}
                    style={{
                      position: "absolute",
                      zIndex: "10",
                      cursor: "pointer",
                      pointerEvents: "auto",
                      paddingLeft: "20px",
                    }}
                  />
                }
              />
              <AppInput type={"password"} placeholder="teachersPage.form.confirmPasswordPlaceholder" {...form.getInputProps("confirmPassword")} />
              {form.values.dropzone.length > 0 ? (
                <div className={styles.dropzoneUploaded}>
                  <span className={styles.dropzoneFileName}>{form.values.dropzone[0].name}</span>
                  <ActionIcon variant={"transparent"} onClick={() => form.setValues({ dropzone: [] })}>
                    <Image src={closeIcon} />
                  </ActionIcon>
                </div>
              ) : (
                <Dropzone
                  onDrop={(files) => form.setValues({ dropzone: files })}
                  onReject={() => form.setErrors({ dropzone: "File rejected" })}
                  maxSize={3 * 1024 ** 2}
                  accept={IMAGE_MIME_TYPE}
                  style={{ marginTop: "20px", marginLeft: "auto" }}
                  {...form.getInputProps("avatar")}
                >
                  <div className={styles.dropzone}>
                    <span>{t("teachersPage.actions.addPhoto")}</span>
                  </div>
                </Dropzone>
              )}

              <div className={styles.formBtns}>
                <AppButton
                  title="general.actions.cancel"
                  variant={"outline"}
                  onClick={() => {
                    close();
                    form.reset();
                  }}
                />
                <AppButton title="teachersPage.actions.addTeacher" variant={"filled"} type={"submit"} />
              </div>
            </form>
          </div>
        </AppModal>
      )}
    </Container>
  );
};
