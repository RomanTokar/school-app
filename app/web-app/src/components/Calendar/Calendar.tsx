import { Calendar } from "@mantine/dates";
import dayjs from "dayjs";
import "dayjs/locale/he";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./Calendar.module.scss";

interface Props {
  onChange?: (date: Date) => void;
}

export const AppCalendar: FC<Props> = ({ onChange }) => {
  const [selected, setSelected] = useState<Date>(new Date());
  const { i18n } = useTranslation();
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const convertDate = (date: Date) => {
    const day = date.getDay();
    switch (day) {
      case 0:
        return "א’";
      case 1:
        return "ב'";
      case 2:
        return "ג'";
      case 3:
        return "ד'";
      case 4:
        return "ה'";
      case 5:
        return "ו'";
      case 6:
        return "ש'";
    }
  };

  return (
    <Calendar
      getDayProps={(date: Date) => ({
        selected: dayjs(date).isSame(selected, "date"),
        onClick: () => {
          setSelected(date);
          onChange && onChange(date);
        },
      })}
      weekdayFormat={(date: Date) => (i18n.language === "he" ? <div>{convertDate(date)}</div> : <div>{daysOfWeek[date.getDay()]}</div>)}
      firstDayOfWeek={0}
      className={styles.calendarInner}
      locale={i18n.language === "he" ? "he" : "en"}
    />
  );
};
