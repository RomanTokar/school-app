import { Image } from "@mantine/core";
import { TimeInput, TimeInputProps } from "@mantine/dates";
import { FC } from "react";
import timeIcon from "../../assets/icons/time.svg";
import styles from "./TimeInput.module.scss";

// interface Props extends TimeInputProps {
//   isLabel: boolean;
// }

export const AppTimeInput: FC<TimeInputProps> = ({ ...props }) => {
  return (
    <div className={styles.timeinput}>
      <Image src={timeIcon} style={{ maxWidth: "24px" }} />
      <TimeInput {...props} />
    </div>
  );
};
