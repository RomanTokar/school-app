import { Image } from "@mantine/core";
import { useForm } from "@mantine/form";
import { HTMLInputTypeAttribute, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useAuth from "../../app/hooks/useAuth";
import eyeIcon from "../../assets/icons/eye.svg";
import { AppButton } from "../../components/Button/Button";
import { AppInput } from "../../components/Input/Input";
import styles from "./Login.module.scss";

interface FormValues {
  creds: string;
  password: string;
}

export const Login = () => {
  const { t } = useTranslation();
  const { login, error } = useAuth();
  const [isPasswordHidden, setIsPasswordHidden] = useState<HTMLInputTypeAttribute>("password");

  const form = useForm({
    initialValues: {
      creds: "",
      password: "",
    } as FormValues,
  });

  const loginHandler = async (creds: string, password: string) => {
    await login(creds, password);
  };

  useEffect(() => {
    form.setFieldError("creds", error?.data.message);
  }, [error]);

  return (
    <div className={styles.page}>
      <div className={styles.login}>
        <div className={styles.loginTitle}>{t("loginPage.title")}</div>
        <form onSubmit={form.onSubmit((values) => loginHandler(values.creds, values.password))} className={styles.loginForm}>
          <AppInput placeholder="loginPage.form.phonePlaceholder" {...form.getInputProps("creds")} />
          <AppInput
            placeholder="loginPage.form.passwordPlaceholder"
            type={isPasswordHidden}
            {...form.getInputProps("password")}
            icon={
              <Image
                src={eyeIcon}
                width={"24px"}
                onClick={() => setIsPasswordHidden((prev) => (prev === "password" ? "text" : "password"))}
                style={{
                  position: "absolute",
                  zIndex: "10",
                  cursor: "pointer",
                  pointerEvents: "auto",
                  paddingLeft: "20px",
                }}
              />
            }
          />
          <div className={styles.loginFormControls}>
            <AppButton type={"submit"} title="loginPage.form.submit" variant={"filled"} />
          </div>
        </form>
      </div>
    </div>
  );
};
