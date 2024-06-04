import { Button, ButtonProps } from "@mantine/core";
import { FC } from "react";
import styles from "./Button.module.scss";
import { useTranslation } from "react-i18next";

interface Props extends ButtonProps {
  title: string;
  onClick?: (e?: any) => void;
}

export const AppButton: FC<Props> = ({ title, onClick, ...props }) => {
  const { t } = useTranslation();

  return (
    <Button {...props} className={`${styles.button} ${props.variant === "filled" ? styles.buttonFilled : ""}`} onClick={onClick}>
      {t(title)}
    </Button>
  );
};
