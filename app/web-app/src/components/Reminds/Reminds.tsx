import { Image, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useAddRemindMutation, useDeleteRemindMutation, useGetRemindsQuery } from "../../app/api/global";
import { useNotification } from "../../app/contexts/NotificationContext";
import { Remind } from "../../app/types/global";
import calendarIcon from "../../assets/icons/calendar.svg";
import closeIcon from "../../assets/icons/close-menu.svg";
import { AppButton } from "../Button/Button";
import { AppDatePicker } from "../Datepicker/Datepicker";
import { AppModal } from "../Modal/Modal";
import { AppTimeInput } from "../TimeInput/TimeInput";
import styles from "./Reminds.module.scss";

dayjs.extend(utc);

interface Props {
  date?: Date;
}

interface FormValues {
  text: string;
  date: string;
  time: string;
}

export const Reminds: FC<Props> = ({ date = new Date() }) => {
  const { t } = useTranslation();
  const [addRemind] = useAddRemindMutation();
  const [removeRemind] = useDeleteRemindMutation();
  const { data: reminds } = useGetRemindsQuery({ startDate: dayjs.utc(date).format(), endDate: dayjs.utc(date).add(1, "day").format() });
  const [opened, { open, close }] = useDisclosure();
  const { addNotification } = useNotification();

  const form = useForm({
    initialValues: {
      text: "",
      date: dayjs().format("YYYY-MM-DD"),
      time: "",
    } as FormValues,
    validate: {},
  });

  const addRemindHandler = async () => {
    try {
      await addRemind({
        date: dayjs.utc(`${form.values.date}T${form.values.time}`, "YYYY-MM-DDTHH:mm:ss").format(),
        text: form.values.text,
      }).unwrap();

      form.reset();
      close();
      addNotification(`${t("components.reminds.notifications.remindAdded")}`);
    } catch (error) {}
  };

  const removeRemindHandler = async (id: string) => {
    try {
      await removeRemind({ id }).unwrap();
      addNotification(`${t("components.reminds.notifications.remindRemoved")}`);
    } catch (error) {}
  };

  return (
    <>
      <AppModal status={opened} onClose={close} size={"xl"}>
        <form onSubmit={form.onSubmit(() => addRemindHandler())}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <div className={styles.dates}>
                <div className={styles.datesTime}>
                  <AppTimeInput {...form.getInputProps("time")} />
                  <span className={styles.label}>{t("components.reminds.modal.time")}</span>
                </div>
                <div className={styles.datesDate}>
                  <Image src={calendarIcon} style={{ maxWidth: "24px" }} />
                  <AppDatePicker changeDate={(value) => form.setValues({ date: dayjs(value).format("YYYY-MM-DD") })} />
                  <div className={styles.label}>{t("components.reminds.modal.date")}</div>
                </div>
              </div>
              <span className={styles.title}>{t("components.reminds.modal.chooseTime")}</span>
            </div>
            <div className={styles.modalBody}>
              <Textarea placeholder={t("components.reminds.modal.textPlaceholder")} autosize minRows={4} {...form.getInputProps("text")} />
              <div className={styles.modalActions}>
                <AppButton variant={"outline"} title={"general.actions.cancel"} onClick={close} />
                <AppButton type="submit" variant={"filled"} title={"components.reminds.actions.addRemind"} />
              </div>
            </div>
          </div>
        </form>
      </AppModal>
      <div className={styles.reminds}>
        <div className={styles.title}>{t("components.reminds.text.remindsToday")}</div>
        {reminds && reminds.length > 0 && (
          <div className={styles.remindsList}>
            {reminds.map((obj: Remind) => (
              <div className={styles.remindsItem} key={obj.text}>
                <span className={styles.remindsItemClose} onClick={() => removeRemindHandler(obj._id)}>
                  <Image src={closeIcon} style={{ minWidth: "24px" }} />
                </span>
                <span className={styles.remindsItemText}>{obj.text}</span>
              </div>
            ))}
          </div>
        )}
        <AppButton onClick={open} variant={"filled"} w={"140px"} title={"components.reminds.actions.addRemind"} className={styles.remindsBtn} />
      </div>
    </>
  );
};
