import { Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useGetTeacherNotesQuery, useSetTeacherNoteMutation } from "../../../app/api/teacher";
import { useNotification } from "../../../app/contexts/NotificationContext";
import { AppButton } from "../../Button/Button";
import { AppModal } from "../../Modal/Modal";
import styles from "./TeacherNotes.module.scss";

interface Props {
  teacherId: string | undefined;
}

interface FormValues {
  text: string;
  id: string | undefined;
}

export const TeacherNotes: FC<Props> = ({ teacherId }) => {
  const { t } = useTranslation();
  const { data: notes } = useGetTeacherNotesQuery({ id: teacherId ? teacherId : "" }, { skip: !teacherId });
  const [setNote] = useSetTeacherNoteMutation();
  const [opened, { open, close }] = useDisclosure();
  const { addNotification } = useNotification();

  const form = useForm({
    initialValues: {
      text: "",
      id: teacherId,
    } as FormValues,
    validate: {
      text: (value) => {
        if (value.trim().length < 5) {
          return t("components.teacherNotes.validation.note");
        }
      },
    },
  });

  const setNoteHandler = async (values: FormValues) => {
    if (values.id) {
      try {
        await setNote({
          id: values.id,
          text: values.text,
        });

        close();
        addNotification(t("components.teacherNotes.notifications.noteAdded"));
      } catch (error) {}
    }
  };

  return (
    <>
      <AppModal status={opened} onClose={close} size={"xl"}>
        <div className={styles.modal}>
          <div className={styles.modalHead}>
            <div className={styles.modalTitle}>{t("components.teacherNotes.text.note")}</div>
          </div>
          <div className={styles.modalBody}>
            <form onSubmit={form.onSubmit((values) => setNoteHandler(values))} className={styles.form}>
              <Textarea placeholder={t("components.teacherNotes.form.textareaPlaceholder")} autosize minRows={4} {...form.getInputProps("text")} />
              <div className={styles.modalActions}>
                <AppButton variant={"outline"} title={"general.actions.cancel"} onClick={close} />
                <AppButton variant={"filled"} type={"submit"} title={"components.teacherNotes.actions.addNote"} />
              </div>
            </form>
          </div>
        </div>
      </AppModal>
      <div className={styles.notes}>
        <div className={styles.title}>{t("components.teacherNotes.text.notes")}</div>
        {notes && notes.length > 0 && (
          <div className={styles.notesWrapper}>
            {notes?.map((note) => (
              <div key={note._id} className={styles.notesItem}>
                <div>{note.text}</div>
                <div className={styles.notesItemTime}>{dayjs(note.createdAt).format("YYYY-MM-DD HH:mm")}</div>
              </div>
            ))}
          </div>
        )}

        <AppButton title={t("components.teacherNotes.actions.addNote")} variant={"filled"} onClick={open} />
      </div>
    </>
  );
};
