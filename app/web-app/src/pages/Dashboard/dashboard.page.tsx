import { Container, Image, RingProgress } from "@mantine/core";
import styles from "./dashboard.module.scss";

import { useMediaQuery } from "@mantine/hooks";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetClassesQuery, useGetClassesStudentsPresenceQuery } from "../../app/api/classes";
import alertIcon from "../../assets/icons/alert.svg";
import calendarIcon from "../../assets/icons/calendar.svg";
import successIcon from "../../assets/icons/success.svg";
import { AppCalendar } from "../../components/Calendar/Calendar";
import { AppDatePicker } from "../../components/Datepicker/Datepicker";
import { Reminds } from "../../components/Reminds/Reminds";

export const Dashboard = () => {
  const { t } = useTranslation();
  const [date, setDate] = useState<Date | null>(new Date());
  const [statsDateFrom, setStatsDateFrom] = useState<Date | null>(new Date());
  const nextweek = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  };

  const [statsDateTo, setStatsDateTo] = useState<Date | null>(nextweek());
  const { data: presence } = useGetClassesStudentsPresenceQuery({
    startDate: dayjs(statsDateFrom).toISOString(),
    endDate: dayjs(statsDateTo).toISOString(),
  });
  const { data: classes } = useGetClassesQuery({ startDate: dayjs(date).toISOString(), endDate: dayjs(date).add(1, "day").toISOString() });
  const desktop = useMediaQuery("(min-width: 992px)");

  const getTeachersCount = () => {
    const uniqueTeachers = new Set();

    classes &&
      classes.forEach((cls) => {
        if (cls.teacher && cls.teacher._id) {
          uniqueTeachers.add(cls.teacher._id);
        }
      });

    return uniqueTeachers.size;
  };

  return (
    <Container size={"xl"}>
      <div className={styles.wrapper}>
        <div className={styles.stats}>
          <h2 className={styles.title}>{t("dashboardPage.myStats")}</h2>
          <div className={styles.diagram}>
            <div className={styles.diagramHead}>
              <div className={styles.diagramHeadItem}>
                <Image src={calendarIcon} style={{ maxWidth: "24px" }} />
                <AppDatePicker changeDate={setStatsDateTo} dateValue={statsDateTo} />
                <span className={styles.label}>{t("general.to")}</span>
              </div>
              <div className={styles.diagramHeadItem}>
                <Image src={calendarIcon} style={{ maxWidth: "24px" }} />
                <AppDatePicker changeDate={setStatsDateFrom} dateValue={statsDateFrom} />
                <span className={styles.label}>{t("general.from")}</span>
              </div>
            </div>
            {presence ? (
              <RingProgress
                size={desktop ? 350 : 290}
                thickness={32}
                sections={[
                  { value: presence?.present, color: "#61BD73" },
                  { value: presence?.absent, color: "#E05763" },
                ]}
                label={
                  <div className={styles.diagramInner}>
                    <div className={styles.diagramInnerItem}>
                      <Image src={successIcon} style={{ maxWidth: "24px" }} />
                      <span>{t("dashboardPage.progressBar.arrived")}</span>
                    </div>
                    {/* <div className={styles.diagramInnerItem}>
                      <Image src={inProgressIcon} style={{ maxWidth: "24px" }} />
                      <span>{t("dashboardPage.progressBar.didntArrived")}</span>
                    </div> */}
                    <div className={styles.diagramInnerItem}>
                      <Image src={alertIcon} style={{ maxWidth: "24px" }} />
                      <span>{t("dashboardPage.progressBar.notReported")}</span>
                    </div>
                  </div>
                }
              />
            ) : (
              <div className={styles.diagramNoData}>{t("dashboardPage.noData")}</div>
            )}
          </div>
        </div>
        <div className={styles.center}>
          <div className={styles.plans}>
            <div className={styles.title}>{t("dashboardPage.planner.title")}</div>
            <div className={styles.plansList}>
              <div className={styles.plansItem}>
                <div className={styles.plansNumber}>{classes?.length}</div>
                <div className={styles.plansName}>{t("dashboardPage.planner.classes")}</div>
              </div>
              <div className={styles.plansItem}>
                <div className={styles.plansNumber}>{getTeachersCount()}</div>
                <div className={styles.plansName}>{t("dashboardPage.planner.teachers")}</div>
              </div>
            </div>
          </div>
          <Reminds />
        </div>
        <div className={styles.calendar}>
          <AppCalendar onChange={(date) => setDate(date)} />
        </div>
      </div>
    </Container>
  );
};
