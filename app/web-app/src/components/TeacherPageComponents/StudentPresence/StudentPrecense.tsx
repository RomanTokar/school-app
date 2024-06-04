import { Checkbox } from "@mantine/core";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useGetStudentPresenceQuery, useMarkPresenceMutation, useUnmarkPresenceMutation } from "../../../app/api/teacher";
import styles from "./StudentPrecense.module.scss";

interface Props {
  studentId: string;
  classId: string;
}

export const StudentPresence: FC<Props> = ({ studentId, classId }) => {
  const { t } = useTranslation();
  const [markPresence] = useMarkPresenceMutation();
  const [unmarkPresence] = useUnmarkPresenceMutation();
  const { data: presence } = useGetStudentPresenceQuery({ studentId, classId });

  return (
    <div className={styles.wrapper}>
      <Checkbox
        checked={presence}
        labelPosition="left"
        label={t("components.studentPresence.label")}
        color="dark"
        radius="xs"
        onChange={() => {
          if (!presence) {
            markPresence({ studentId, classId });
          } else {
            unmarkPresence({ studentId, classId });
          }
        }}
      />
    </div>
  );
};
