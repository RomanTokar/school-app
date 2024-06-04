import { TextInput, TextInputProps } from "@mantine/core";
import { FC } from "react";
import styles from "./Input.module.scss";
import { useTranslation } from "react-i18next";

interface Props extends TextInputProps {
  placeholder: string;
}

export const AppInput: FC<Props> = ({ placeholder, onChange, ...props }) => {
  const { t } = useTranslation();

  return <TextInput {...props} placeholder={t(placeholder)} onChange={onChange} className={styles.input} />;
};
