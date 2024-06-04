import { ActionIcon, Avatar, Badge, Image } from "@mantine/core";
import styles from "./HeaderProfile.module.scss";

import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetNotificationsQuery } from "../../../app/api/global";
import { useLazyGetTeacherByIdQuery } from "../../../app/api/teacher";
import useAuth from "../../../app/hooks/useAuth";
import bellIcon from "../../../assets/icons/bell.svg";

interface Props {
  showNotice: () => void;
}

export const HeaderProfile: FC<Props> = ({ showNotice }) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const { data: notifications } = useGetNotificationsQuery();
  const [getTeacher, { data: teacher }] = useLazyGetTeacherByIdQuery();
  // const ref = useRef("en");
  const [notsCount, setNotsCount] = useState(0);

  useEffect(() => {
    i18n.changeLanguage("he");
  }, []);

  useEffect(() => {
    if (notifications) {
      const filteredItems = notifications.filter((notice) => !notice.isRead);
      setNotsCount(filteredItems.length);
    }
  }, [notifications]);

  // const handleLangChange = (value: string) => {
  //   if (i18n.language !== value) {
  //     ref.current = value;
  //     i18n.changeLanguage(value);
  //   }
  // };

  useEffect(() => {
    if (user && user?.role === "teacher" && user?.teacherId) {
      getTeacher(user.teacherId);
    }
  }, [user]);

  return (
    <div className={styles.headerWrapper}>
      {/* <AppSelect
        size={"xs"}
        variant={"default"}
        data={[
          { label: "HE", value: "he" },
          { label: "EN", value: "en" },
        ]}
        value={ref.current}
        onChange={handleLangChange}
        style={{ maxWidth: "75px" }}
      /> */}
      <div className={styles.headerProfile}>
        <ActionIcon variant={"transparent"} onClick={() => showNotice()}>
          <div className={styles.headerNotify}>
            <Image src={bellIcon} />
            <Badge variant={"filled"} className={styles.headerNotifyLabel}>
              {notsCount}
            </Badge>
          </div>
        </ActionIcon>
        {user?.role !== "admin" && <Avatar src={teacher?.avatar} alt={"profile avatar"} style={{ borderRadius: "100%", overflow: "hidden" }} />}
      </div>
    </div>
  );
};
