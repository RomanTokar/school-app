import { ActionIcon, Image } from "@mantine/core";
import { FC, useState } from "react";
import { TeacherFile } from "../../app/types/teacherTypes";
import styles from "./FileItem.module.scss";

import { useDisclosure } from "@mantine/hooks";
import { useParams } from "react-router-dom";
import { useDeleteFileMutation } from "../../app/api/teacher";
import arrowIcon from "../../assets/icons/arrow.svg";
import closeIcon from "../../assets/icons/close-menu.svg";
import downloadIcon from "../../assets/icons/download.svg";
import fileIcon from "../../assets/icons/file.svg";
import { AppButton } from "../Button/Button";
import { AppModal } from "../Modal/Modal";

import ReactPlayer from "react-player";

interface Props {
  file: TeacherFile;
  onDelete?: () => void;
}

export const FileItem: FC<Props> = ({ file, onDelete }) => {
  const [opened, setOpened] = useState<boolean>(false);
  const [isOpened, { open, close }] = useDisclosure();
  const [deleteFile] = useDeleteFileMutation();
  const params = useParams();

  const deleteFileHandler = async () => {
    if (onDelete) {
      onDelete();
      return;
    }
    try {
      await deleteFile({ teacherId: params.teacherId ? params.teacherId : "", fileId: file._id }).unwrap();
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
      <div key={file._id} className={styles.wrapper}>
        <div className={styles.file}>
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

              <AppButton variant="outline" title={"Remove"} onClick={() => deleteFileHandler()} />
            </div>
            <div className={styles.fileDesc}>{file.notes}</div>
          </div>
        )}
      </div>
    </>
  );
};
