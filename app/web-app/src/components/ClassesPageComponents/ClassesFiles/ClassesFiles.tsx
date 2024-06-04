import { ActionIcon, Image, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { AppButton } from "../../Button/Button";
import { AppInput } from "../../Input/Input";
import { AppModal } from "../../Modal/Modal";
import styles from "./ClassesFiles.module.scss";

import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import dayjs from "dayjs";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useGetClassQuery, useGetFilesQuery, useUploadFileMutation } from "../../../app/api/classes";
import { useNotification } from "../../../app/contexts/NotificationContext";
import closeIcon from "../../../assets/icons/close-menu.svg";
import { AppDatePicker } from "../../Datepicker/Datepicker";
import { AppSelect } from "../../Select/Select";
import { FileItem } from "../FileItem/FileItem";

interface FormValues {
  file: File | null;
  name: string;
  notes: string;
  updateType?: string;
  recurringEndDate?: string | Date;
}

export const ClassesFiles = () => {
  const { t } = useTranslation();
  const params = useParams();
  const [uploadFile] = useUploadFileMutation();
  const { data: classData } = useGetClassQuery({ id: params.classId || "" }, { skip: !params.classId });
  const { data: files } = useGetFilesQuery({ id: params.classId ? params.classId : "" }, { skip: !params.classId });
  const [opened, { open, close }] = useDisclosure();
  const [openedTypeModal, { open: openTypeModal, close: closeTypeModal }] = useDisclosure(false);

  const { addNotification } = useNotification();
  const openRef = useRef<any>();

  const form = useForm({
    initialValues: {
      file: null,
      name: "",
      notes: "",
      updateType: "",
      recurringEndDate: "",
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
      if (classData?.isRecurring && form.values.updateType) {
        formData.append("updateType", form.values.updateType);
        if (form.values.updateType === "following") {
          formData.append("recurringEndDate", dayjs(form.values.recurringEndDate).toISOString());
        }
      }
      await uploadFile({ id: params.classId ? params.classId : "", body: formData }).unwrap();

      close();
      addNotification("components.files.notificatios.fileAdded");
    } catch (error) {}
  };

  return (
    <>
      <AppModal status={openedTypeModal} onClose={closeTypeModal}>
        <div className={styles.modal}>
          <div className={styles.modalFields}>
            <AppSelect
              data={[
                { label: "general.modal.single", value: "single" },
                { label: "general.modal.all", value: "all" },
                { label: "general.modal.following", value: "following" },
              ]}
              placeholder="general.modal.updateType"
              {...form.getInputProps("updateType")}
            />
            {form.values.updateType === "following" && (
              <div className={styles.modalDatepicker}>
                <AppDatePicker changeDate={(value) => form.setValues({ recurringEndDate: value ? value : new Date() })} />
              </div>
            )}
            <div className={styles.modalActions}>
              <AppButton variant={"outline"} title={"general.actions.cancel"} onClick={closeTypeModal} />
              <AppButton
                variant={"filled"}
                title={"general.action.update"}
                onClick={() => {
                  closeTypeModal();
                  open();
                }}
              />
            </div>
          </div>
        </div>
      </AppModal>
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

        <AppButton title="components.files.actions.addFile" variant={"filled"} onClick={openTypeModal} />
      </div>
    </>
  );
};
