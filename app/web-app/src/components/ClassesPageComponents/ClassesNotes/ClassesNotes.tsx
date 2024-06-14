import { ActionIcon, Image, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useDeleteNoteMutation, useGetClassQuery, useGetNotesQuery, useSetNoteMutation } from "../../../app/api/classes";
import { useNotification } from "../../../app/contexts/NotificationContext";
import { AppButton } from "../../Button/Button";
import { AppDatePicker } from "../../Datepicker/Datepicker";
import { AppModal } from "../../Modal/Modal";
import { AppSelect } from "../../Select/Select";
import styles from "./ClassesNotes.module.scss";

import dayjs from "dayjs";
import closeIcon from "../../../assets/icons/close-menu.svg";

interface FormValues {
  text: string;
  id: string;
  updateType?: string;
  recurringEndDate?: string | Date;
  noteId?: string;
}

export const ClassesNotes = () => {
  const { t } = useTranslation();
  const params = useParams();
  const { data: classData } = useGetClassQuery({ id: params.classId || "" }, { skip: !params.classId });
  const { data: notes } = useGetNotesQuery({ id: params.classId || "" }, { skip: !params.classId });
  const [setNote] = useSetNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();
  const [opened, { open, close }] = useDisclosure();
  const [openedTypeModal, { open: openTypeModal, close: closeTypeModal }] = useDisclosure(false);
  const [openedDeleteModal, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const { addNotification } = useNotification();

  const form = useForm({
    initialValues: {
      text: "",
      id: params.classId,
      updateType: classData?.isRecurring ? "single" : "",
      recurringEndDate: "",
      noteId: "",
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
          updateType: classData?.isRecurring ? values.updateType : undefined,
          recurringEndDate: form.values.updateType === "following" ? dayjs(form.values.recurringEndDate).toISOString() : undefined,
        });

        close();
        addNotification("components.teacherNotes.notifications.noteAdded");
      } catch (error) {}
    }
  };

  const deleteNoteHandler = async () => {
    if (params.classId && form.values.noteId) {
      try {
        await deleteNote({
          classId: params.classId,
          noteId: form.values.noteId,
          deleteType: classData?.isRecurring ? form.values.updateType : undefined,
          recurringEndDate: form.values.updateType === "following" ? dayjs(form.values.recurringEndDate).toISOString() : undefined,
        }).unwrap();

        closeDeleteModal();
      } catch (error) {}
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
                  closeTypeModal();
                  deleteNoteHandler();
                }}
              />
            </div>
          </div>
        </div>
      </AppModal>
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
            <div className={styles.modalTitle}>{t("components.classesNotes.text.notes")}</div>
          </div>
          <div className={styles.modalBody}>
            <form onSubmit={form.onSubmit((values) => setNoteHandler(values))} className={styles.form}>
              <Textarea placeholder={t("components.classesNotes.form.textarea")} autosize minRows={4} {...form.getInputProps("text")} />
              <div className={styles.modalActions}>
                <AppButton variant={"outline"} title={"general.actions.cancel"} onClick={close} />
                <AppButton variant={"filled"} type={"submit"} title={"components.classesNotes.actions.addNote"} />
              </div>
            </form>
          </div>
        </div>
      </AppModal>
      <div className={styles.notes}>
        <div className={styles.title}>{t("components.classesNotes.text.notes")}</div>
        {notes && notes.length > 0 && (
          <div className={styles.notesWrapper}>
            {notes?.map((note) => (
              <div key={note._id} className={styles.notesItem}>
                <div
                  className={styles.notesClose}
                  onClick={() => {
                    form.setValues({ noteId: note._id });
                    openDeleteModal();
                  }}
                >
                  <ActionIcon variant={"transparent"}>
                    <Image src={closeIcon} />
                  </ActionIcon>
                </div>
                <div className={styles.notesText}>
                  <div>{note.text}</div>
                  <div className={styles.notesItemTime}>{dayjs(note.createdAt).format("YYYY-MM-DD HH:mm")}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AppButton
          title="components.classesNotes.actions.addNote"
          variant={"filled"}
          onClick={() => (classData?.isRecurring ? openTypeModal() : open())}
        />
      </div>
    </>
  );
};
