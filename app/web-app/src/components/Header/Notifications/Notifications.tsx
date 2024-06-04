import { ActionIcon, Button, Image } from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import dayjs from "dayjs";
import "dayjs/locale/he";
import relativeTime from "dayjs/plugin/relativeTime";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetNotificationsQuery, useReadNotificationMutation } from "../../../app/api/global";
import closeIcon from "../../../assets/icons/close-menu.svg";
import { AppButton } from "../../Button/Button";
import styles from "./Notifications.module.scss";

dayjs.extend(relativeTime);

interface Props {
  closeNoticesModal: () => void;
}

export const Notifications: FC<Props> = ({ closeNoticesModal }) => {
  const { t, i18n } = useTranslation();
  const { data: notifications } = useGetNotificationsQuery();
  const [readNotification] = useReadNotificationMutation();
  const noticeRef = useClickOutside(() => closeNoticesModal());
  const [tab, setTab] = useState<"today" | "all">("today");

  const noticeForToday = () => {
    const currentTime = dayjs();

    const filteredItems =
      notifications &&
      notifications.filter((notice) => {
        const itemDate = dayjs(notice.createdAt);
        const timeDifference = currentTime.diff(itemDate, "day", true);
        return timeDifference <= 1;
      });

    return filteredItems || [];
  };

  const readNotificationHandler = async (id: string) => {
    try {
      await readNotification({ id }).unwrap();
    } catch (error) {}
  };

  return (
    <div className={styles.notice} ref={noticeRef}>
      <div className={styles.noticeBtns}>
        <Button
          variant={"default"}
          className={`${styles.noticeBtn} ${tab === "today" ? styles.noticeBtnActive : ""}`}
          onClick={() => setTab("today")}
        >
          {t("components.header.actions.today")}
        </Button>
        <Button variant={"default"} className={`${styles.noticeBtn} ${tab === "all" ? styles.noticeBtnActive : ""}`} onClick={() => setTab("all")}>
          {t("components.header.actions.all")}
        </Button>
      </div>
      {tab === "today" && (
        <div className={styles.noticeList}>
          {noticeForToday()?.length > 0 &&
            noticeForToday().map((notice) => (
              <div className={styles.noticeItem} key={notice._id} hidden={notice.isRead}>
                <div className={styles.noticeItemTop}>
                  <div className={styles.noticeItemLeft}>
                    <ActionIcon variant={"transparent"} onClick={() => readNotificationHandler(notice._id)}>
                      <Image src={closeIcon} />
                    </ActionIcon>
                    <span className={styles.noticeTime}>{dayjs(notice.createdAt).locale(i18n.language).fromNow()}</span>
                  </div>
                  <div className={styles.noticeItemText}>{notice.data.text}</div>
                </div>
                {notice.type !== "remind" && (
                  <div className={styles.noticeItemBtns}>
                    <AppButton title="components.header.actions.decline" variant={"outline"} />
                    <AppButton title="components.header.actions.accept" variant={"filled"} />
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
      {tab === "all" && (
        <div className={styles.noticeList}>
          {notifications &&
            notifications.map((notice) => (
              <div className={styles.noticeItem} key={notice._id} hidden={notice.isRead}>
                <div className={styles.noticeItemTop}>
                  <div className={styles.noticeItemLeft}>
                    <ActionIcon variant={"transparent"} onClick={() => readNotificationHandler(notice._id)}>
                      <Image src={closeIcon} />
                    </ActionIcon>
                    <span className={styles.noticeTime}>{dayjs(notice.createdAt).locale(i18n.language).fromNow()}</span>
                  </div>
                  <div className={styles.noticeItemText}>{notice.data.text}</div>
                </div>
                {notice.type !== "remind" && (
                  <div className={styles.noticeItemBtns}>
                    <AppButton title="components.header.actions.decline" variant={"outline"} />
                    <AppButton title="components.header.actions.accept" variant={"filled"} />
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
