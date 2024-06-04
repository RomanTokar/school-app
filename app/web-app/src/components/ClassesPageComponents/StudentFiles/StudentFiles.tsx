import { ActionIcon, Image, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { AppButton } from "../../Button/Button";
import { AppInput } from "../../Input/Input";
import { AppModal } from "../../Modal/Modal";
import styles from "./StudentFiles.module.scss";

import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { FC, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useGetFilesQuery, useUploadFileMutation } from "../../../app/api/student";
import { useNotification } from "../../../app/contexts/NotificationContext";
import closeIcon from "../../../assets/icons/close-menu.svg";
import { FileItem } from "../FileItem/FileItem";

interface FormValues {
  file: File | null;
  name: string;
  notes: string;
}

interface Props {
  studentId: string;
}

export const StudentFiles: FC<Props> = ({ studentId }) => {
  const { t } = useTranslation();
  const [uploadFile] = useUploadFileMutation();
  const { data: files } = useGetFilesQuery({ id: studentId ? studentId : "" }, { skip: !studentId });
  const [opened, { open, close }] = useDisclosure();

  const { addNotification } = useNotification();
  const openRef = useRef<any>();

  const form = useForm({
    initialValues: {
      file: null,
      name: "",
      notes: "",
    } as FormValues,
    validate: {
      file: (value) => {
        if (!value) {
          return t("components.files.validation.file");
        }
      },
      name: (value) => {
        if (!value) {
          return t("components.files.validation.name");
        }
      },
      notes: (value) => {
        if (!value) {
          return t("components.files.validation.notes");
        }
      },
    },
  });

  const uploadFilesHandler = async () => {
    try {
      const formData = new FormData();
      formData.append("file", form.values.file as File);
      formData.append("name", form.values.name);
      formData.append("notes", form.values.notes);
      await uploadFile({ id: studentId ? studentId : "", body: formData }).unwrap();

      close();
      addNotification(t("components.files.notificatios.fileAdded"));
    } catch (error) {}
  };

  return (
    <>
      <AppModal status={opened} onClose={close} size={"xl"}>
        <div className={styles.modal}>
          <div className={styles.modalHead}>
            {form.values.file ? (
              <div className={styles.dropzoneUploaded}>
                <span className={styles.dropzoneFileName}>{form.values.file.name}</span>
                <ActionIcon variant={"transparent"} onClick={() => form.setValues({ file: null })}>
                  <Image src={closeIcon} />
                </ActionIcon>
              </div>
            ) : (
              <>
                <Dropzone
                  openRef={openRef}
                  onDrop={(value) => form.setValues({ file: value[0] })}
                  styles={{ inner: { pointerEvents: "all" } }}
                  style={{ visibility: "hidden", width: "0px", height: "0px" }}
                  accept={[...Object.values(MIME_TYPES)]}
                >
                  {null}
                </Dropzone>
                <AppButton variant="outline" title={t("components.files.actions.chooseFile")} onClick={() => openRef.current()} />
              </>
            )}
          </div>
          <div className={styles.modalBody}>
            <form onSubmit={form.onSubmit(() => uploadFilesHandler())} className={styles.form}>
              <AppInput
                placeholder={t("components.files.form.fileNamePlaceholder")}
                {...form.getInputProps("name")}
                style={{ marginBottom: "10px" }}
              />
              <Textarea placeholder={t("components.files.form.yourNotesPlaceholder")} autosize minRows={4} {...form.getInputProps("notes")} />
              <div className={styles.modalActions}>
                <AppButton
                  variant={"outline"}
                  title={"general.actions.cancel"}
                  onClick={() => {
                    close();
                    form.reset();
                  }}
                />
                <AppButton variant={"filled"} type={"submit"} title={"components.files.actions.addFile"} />
              </div>
            </form>
          </div>
        </div>
      </AppModal>
      <div className={styles.files}>
        <div className={styles.title}>{t("components.files.text.files")}</div>
        {files && files.length > 0 && (
          <div className={styles.filesWrapper}>
            {files?.map((file) => (
              <FileItem file={file} key={file._id} />
            ))}
          </div>
        )}

        <AppButton title="Add file" variant={"filled"} onClick={open} />
      </div>
    </>
  );
};
