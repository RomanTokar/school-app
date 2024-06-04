import { DatePickerInput } from "@mantine/dates";
import "dayjs/locale/he";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./DateRangePicker.module.scss";

interface Props {
  changeDate: (value: [Date | null, Date | null]) => void;
}

export const AppDateRangePicker: FC<Props> = ({ changeDate }) => {
  const [value, setValue] = useState<[Date | null, Date | null]>([new Date(), nextweek()]);
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

  function nextweek() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  }

  return (
    <DatePickerInput
      type={"range"}
      value={value}
      onChange={(value) => {
        setValue(value);
        if (value[0] !== null && value[1] !== null) {
          changeDate(value);
        }
      }}
      className={styles.datepicker}
      hideOutsideDates
      locale={i18n.language === "he" ? "he" : "en"}
      weekdayFormat={(date: Date) => (i18n.language === "he" ? <div>{convertDate(date)}</div> : <div>{daysOfWeek[date.getDay()]}</div>)}
      firstDayOfWeek={0}
    />
  );
};
