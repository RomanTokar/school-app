import { Image } from "@mantine/core";
import { AppButton } from "../../Button/Button";
import styles from "./TeacherWhatsapp.module.scss";

import { useTranslation } from "react-i18next";
import whatsappIcon from "../../../assets/icons/whatsapp.svg";

export const TeacherWhatsapp = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{t("components.teacherWhatsapp.text.chat")}</div>
      <AppButton
        onClick={() => window.open("https://api.whatsapp.com/", "_blank")}
        title={t("components.teacherWhatsapp.text.enterChat")}
        leftIcon={<Image src={whatsappIcon} />}
        variant={"outline"}
        w={"100%"}
        mt={"20px"}
      />
    </div>
  );
};
