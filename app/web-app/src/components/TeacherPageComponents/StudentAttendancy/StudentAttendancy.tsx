import { Image, RingProgress } from "@mantine/core";
import { AppDatePicker } from "../../Datepicker/Datepicker";
import styles from "./StudentAttendancy.module.scss";

import { useMediaQuery } from "@mantine/hooks";
import dayjs from "dayjs";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetStudentAttendanceQuery } from "../../../app/api/teacher";
import alertIcon from "../../../assets/icons/alert.svg";
import calendarIcon from "../../../assets/icons/calendar.svg";
import successIcon from "../../../assets/icons/success.svg";

interface Props {
  studentId: string;
}

export const StudentAttendancy: FC<Props> = ({ studentId }) => {
  const { t } = useTranslation();
  const desktop = useMediaQuery("(min-width: 992px)");
  const [statsDateFrom, setStatsDateFrom] = useState<Date | null>(new Date());
  const [statsDateTo, setStatsDateTo] = useState<Date | null>(nextweek());
  const { data: attendancy } = useGetStudentAttendanceQuery({
    studentId,
    startDate: dayjs(statsDateFrom).toISOString(),
    endDate: dayjs(statsDateTo).toISOString(),
  });

  function nextweek() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  }

  return (
    <div className={styles.attendancy}>
      <div className={styles.title}>{t("components.studentAttendancy.attendancy")}</div>
      <div className={styles.diagram}>
        <div className={styles.diagramHead}>
          <div className={styles.diagramHeadItem}>
            <Image src={calendarIcon} style={{ maxWidth: "24px" }} />
            <AppDatePicker changeDate={setStatsDateTo} dateValue={statsDateTo} />
            <span className={styles.label}>{t("components.studentAttendancy.to")}</span>
          </div>
          <div className={styles.diagramHeadItem}>
            <Image src={calendarIcon} style={{ maxWidth: "24px" }} />
            <AppDatePicker changeDate={setStatsDateFrom} dateValue={statsDateFrom} />
            <span className={styles.label}>{t("components.studentAttendancy.from")}</span>
          </div>
        </div>
        {attendancy && (
          <RingProgress
            size={desktop ? 350 : 290}
            thickness={32}
            sections={[
              { value: attendancy.present, color: "#61BD73" },
              { value: attendancy.absent, color: "#E05763" },
            ]}
            label={
              <div className={styles.diagramInner}>
                <div className={styles.diagramInnerItem}>
                  <Image src={successIcon} style={{ maxWidth: "24px" }} />
                  <span>{t("components.studentAttendancy.arrived")}</span>
                </div>
                <div className={styles.diagramInnerItem}>
                  <Image src={alertIcon} style={{ maxWidth: "24px" }} />
                  <span>{t("components.studentAttendancy.notArrive")}</span>
                </div>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
};
