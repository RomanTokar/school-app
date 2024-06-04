import { Container } from "@mantine/core";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { AppButton } from "../Button/Button";
import styles from "./notificationWithOptions.module.scss";

interface Props {
  action: () => void;
  text: string;
  onClose?: () => void;
}

export const NotificationWithOptions: FC<Props> = ({ text, action, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.popover}>
      <Container size={"xl"}>
        <div className={`${styles.popoverInner} ${styles.popoverInnerAction}`}>
          <div className={styles.popoverBtns}>
            <AppButton title={t("general.actions.cancel")} variant={"outline"} onClick={() => onClose && onClose()} />
            <AppButton title={t("general.actions.apply")} variant={"filled"} onClick={() => action && action()} />
          </div>
          <span className={styles.popoverText}>{t(text)}</span>
        </div>
      </Container>
    </div>
  );
};
