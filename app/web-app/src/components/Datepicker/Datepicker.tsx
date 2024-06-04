import { DatePickerInput, DatePickerInputProps } from "@mantine/dates";
import "dayjs/locale/he";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props extends DatePickerInputProps {
  changeDate: (value: Date | null) => void;
  dateValue?: Date | null;
}

export const AppDatePicker: FC<Props> = ({ changeDate, dateValue }) => {
  const [value, setValue] = useState<Date | null>(new Date());
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

  useEffect(() => {
    if (dateValue) {
      setValue(dateValue);
    }
  }, [dateValue]);

  return (
    <DatePickerInput
      type={"default"}
      value={value}
      onChange={(value) => {
        setValue(value);
        changeDate(value);
      }}
      className={"datepicker"}
      hideOutsideDates
      popoverProps={{ position: "bottom" }}
      locale={i18n.language === "he" ? "he" : "en"}
      weekdayFormat={(date: Date) => (i18n.language === "he" ? <div>{convertDate(date)}</div> : <div>{daysOfWeek[date.getDay()]}</div>)}
      firstDayOfWeek={0}
    />
  );
};
