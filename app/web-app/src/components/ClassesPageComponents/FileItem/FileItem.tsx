import { ActionIcon, Image } from "@mantine/core";
import { FC, useState } from "react";
import { TeacherFile } from "../../../app/types/teacherTypes";
import styles from "./FileItem.module.scss";

import { useDisclosure } from "@mantine/hooks";
import { useParams } from "react-router-dom";
import { useDeleteFileMutation, useGetClassQuery } from "../../../app/api/classes";
import arrowIcon from "../../../assets/icons/arrow.svg";
import closeIcon from "../../../assets/icons/close-menu.svg";
import downloadIcon from "../../../assets/icons/download.svg";
import fileIcon from "../../../assets/icons/file.svg";
import { AppButton } from "../../Button/Button";
import { AppModal } from "../../Modal/Modal";

import { useForm } from "@mantine/form";
import dayjs from "dayjs";
import ReactPlayer from "react-player";
import { AppDatePicker } from "../../Datepicker/Datepicker";
import { AppSelect } from "../../Select/Select";

interface Props {
  file: TeacherFile;
}

interface FormValues {
  updateType?: string;
  recurringEndDate?: string | Date;
}

export const FileItem: FC<Props> = ({ file }) => {
  const [opened, setOpened] = useState<boolean>(false);
  const [isOpened, { open, close }] = useDisclosure();
  const [deleteFile] = useDeleteFileMutation();
  const params = useParams();
  const { data: classData } = useGetClassQuery({ id: params.classId || "" }, { skip: !params.classId });
  const [openedDeleteModal, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      updateType: classData?.isRecurring ? "single" : "",
      recurringEndDate: "",
    } as FormValues,
  });

  const deleteFileHandler = async () => {
    try {
      await deleteFile({
        classId: params.classId ? params.classId : "",
        fileId: file._id,
        deleteType: classData?.isRecurring ? form.values.updateType : undefined,
        recurringEndDate:
          classData?.isRecurring && form.values.updateType === "following" ? dayjs(form.values.recurringEndDate).toISOString() : undefined,
      }).unwrap();
    } catch (error) {}
  };

  const getFileType = (filename: string) => {
    const urlObj = new URL(filename);

    const pathParts = urlObj.pathname.split("/");
    const fileName = pathParts[pathParts.length - 1];
    const fileExtension = fileName.split(".").pop();

    if (
      fileExtension?.toLowerCase() === "mp4" ||
      fileExtension?.toLowerCase() === "mov" ||
      fileExtension?.toLowerCase() === "avi" ||
      fileExtension === "mkv"
    ) {
      return "video";
    } else if (
      fileExtension?.toLowerCase() === "jpg" ||
      fileExtension?.toLowerCase() === "jpeg" ||
      fileExtension?.toLowerCase() === "png" ||
      fileExtension?.toLowerCase() === "gif"
    ) {
      return "image";
    } else {
      return "file";
    }
  };

  return (
    <>
      <AppModal status={openedDeleteModal} onClose={closeDeleteModal}>
        <div className={styles.modal}>
          <div className={styles.modalFields}>
            <AppSelect
              data={[
                { label: "general.modal.single", value: "single" },
                { label: "general.modal.all", value: "all" },
                { label: "general.modal.following", value: "following" },
              ]}
              placeholder="general.modal.deleteType"
              {...form.getInputProps("updateType")}
            />
            {form.values.updateType === "following" && (
              <div className={styles.modalDatepicker}>
                <AppDatePicker changeDate={(value) => form.setValues({ recurringEndDate: value ? value : new Date() })} />
              </div>
            )}
            <div className={styles.modalActions}>
              <AppButton variant={"outline"} title={"general.actions.cancel"} onClick={closeDeleteModal} />
              <AppButton
                variant={"filled"}
                title={"general.action.delete"}
                onClick={() => {
                  closeDeleteModal();
                  deleteFileHandler();
                }}
              />
            </div>
          </div>
        </div>
      </AppModal>
      <AppModal status={isOpened} onClose={close} padding={0} size={"xl"}>
        <ActionIcon variant={"transparent"} onClick={() => close()} className={styles.closeBtn}>
          <Image src={closeIcon} style={{ maxWidth: "24px" }} />
        </ActionIcon>
        <ActionIcon variant={"transparent"} onClick={() => window.open(file.url, "_blank")} className={styles.downloadBtn}>
          <Image src={downloadIcon} style={{ maxWidth: "18px", height: "24px" }} />
        </ActionIcon>
        {file.url && getFileType(file.url) === "video" && <ReactPlayer controls={true} url={file.url} width={"100%"} />}
        {file.url && getFileType(file.url) === "image" && (
          <Image src={file.url} style={{ maxWidth: "100%", borderRadius: "8px", overflow: "hidden" }} />
        )}
      </AppModal>
      <div key={file._id} className={styles.file}>
        <div className={styles.fileItem}>
          <ActionIcon variant={"transparent"} onClick={() => setOpened((prev) => !prev)}>
            <Image src={arrowIcon} style={{ transform: opened ? "rotate(180deg)" : "none" }} />
          </ActionIcon>
          <span>{file.name}</span>
        </div>
        {opened && (
          <div className={styles.fileInfo}>
            <div className={styles.fileActions}>
              {file.url && getFileType(file.url) === "video" && (
                <div className={styles.fileImage} onClick={() => open()}>
                  <Image src={fileIcon} style={{ maxWidth: "72px" }} />
                </div>
              )}

              {file.url && getFileType(file.url) === "file" && (
                <div className={styles.fileImage} onClick={() => window.open(file.url, "_blank")}>
                  <Image src={fileIcon} style={{ maxWidth: "72px" }} />
                </div>
              )}

              {file.url && getFileType(file.url) === "image" && (
                <Image src={file.url} style={{ maxWidth: "100px", borderRadius: "20px", overflow: "hidden" }} onClick={() => open()} />
              )}

              <AppButton variant="outline" title={"Remove"} onClick={() => openDeleteModal()} />
            </div>
            <div className={styles.fileDesc}>{file.notes}</div>
          </div>
        )}
      </div>
    </>
  );
};
