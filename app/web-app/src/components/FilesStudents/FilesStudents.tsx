import { ActionIcon, Image, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useParams } from "react-router-dom";
import { AppButton } from "../Button/Button";
import { AppInput } from "../Input/Input";
import { AppModal } from "../Modal/Modal";
import styles from "./FilesStudents.module.scss";

import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useRef } from "react";
import { useDeleteFileMutation, useGetFilesQuery, useUploadFileMutation } from "../../app/api/student";
import { useNotification } from "../../app/contexts/NotificationContext";
import closeIcon from "../../assets/icons/close-menu.svg";
import { FileItem } from "../FileItem/FileItem";

interface FormValues {
  file: File | null;
  name: string;
  notes: string;
}

export const FilesStudents = () => {
  const { id = "" } = useParams();
  const [uploadFile] = useUploadFileMutation();
  const { data: files } = useGetFilesQuery({ id });
  const [opened, { open, close }] = useDisclosure();
  const [deleteFile] = useDeleteFileMutation();

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
          return "File is required";
        }
      },
      name: (value) => {
        if (!value) {
          return "Name is required";
        }
      },
      notes: (value) => {
        if (!value) {
          return "Notes is required";
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
      await uploadFile({ id, body: formData }).unwrap();

      close();
      addNotification("File has been added");
    } catch (error) {}
  };

  const deleteFileHandler = async (file: any) => {
    try {
      await deleteFile({ studentId: id, fileId: file._id }).unwrap();
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
                <AppButton variant="outline" title={"Choose file"} onClick={() => openRef.current()} />
              </>
            )}
          </div>
          <div className={styles.modalBody}>
            <form onSubmit={form.onSubmit(() => uploadFilesHandler())} className={styles.form}>
              <AppInput placeholder="File name" {...form.getInputProps("name")} style={{ marginBottom: "10px" }} />
              <Textarea placeholder="Your notes" autosize minRows={4} {...form.getInputProps("notes")} />
              <div className={styles.modalActions}>
                <AppButton variant={"outline"} title={"Cancel"} onClick={close} />
                <AppButton variant={"filled"} type={"submit"} title={"Add note"} />
              </div>
            </form>
          </div>
        </div>
      </AppModal>
      <div className={styles.files}>
        {!!files?.length && (
          <div className={styles.filesWrapper}>
            {files?.map((file) => (
              <FileItem file={file} onDelete={() => deleteFileHandler(file)} key={file._id} />
            ))}
          </div>
        )}
        <AppButton title="Add file" variant={"filled"} onClick={open} />
      </div>
    </>
  );
};
