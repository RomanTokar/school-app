import { Container, Image } from "@mantine/core";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import successIcon from "../../assets/icons/success.svg";
import styles from "./notification.module.scss";

export interface NotificationProps {
  text: string;
  onClose?: () => void;
}

export const Notification: FC<NotificationProps> = ({ text, onClose }) => {
  const { t } = useTranslation();

  setTimeout(() => {
    onClose && onClose();
  }, 3000);

  return (
    <div className={styles.popover}>
      <Container size={"xl"}>
        <div className={styles.popoverInner}>
          <span className={styles.popoverText}>{t(text)}</span>
          <Image className={styles.popoverImage} src={successIcon} />
        </div>
      </Container>
    </div>
  );
};
