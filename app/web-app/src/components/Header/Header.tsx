import { ActionIcon, Button, Container, Image } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../../app/hooks/useAuth";
import burgerMenuIcon from "../../assets/icons/burger.svg";
import closeIcon from "../../assets/icons/close-menu.svg";
import styles from "./Header.module.scss";
import { HeaderProfile } from "./HeaderProfile/HeaderProfile";
import { Notifications } from "./Notifications/Notifications";

export const AppHeader = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isMenuOpened, setIsMenuOpened] = useState<boolean>(false);
  const [isNoticeOpened, setIsNoticeOpened] = useState<boolean>(false);
  const { logout } = useAuth();
  const menuItemsAdmin: string[] = ["Classes", "Students", "Teachers", "Dashboard"];
  const menuItemsTeacher: string[] = ["Dashboard"];
  const menuItems: string[] = user?.role === "teacher" ? menuItemsTeacher : menuItemsAdmin;
  const location = useLocation();
  const desktop = useMediaQuery("(min-width: 992px)");
  const [noticeCount, setNoticeCount] = useState<number>(0);

  const headerMenu = (reverse = false) => {
    const headerMenuItems = reverse ? menuItems.reverse() : menuItems;
    return (
      <div className={styles.headerMenuWrapper}>
        {!desktop && <div className={"backdrop"} />}
        <Container size={"xl"}>
          <div className={styles.headerMenu}>
            {headerMenuItems.map((name: string) => (
              <Link key={name} to={name.toLowerCase()} onClick={() => setIsMenuOpened(false)} style={{ textDecoration: "none" }}>
                <div
                  className={`${styles.headerMenuItem} ${
                    name.toLowerCase() === location.pathname.substring(1) || location.pathname.startsWith(`/${name.toLowerCase()}/`)
                      ? styles.headerMenuItemActive
                      : ""
                  }`}
                >
                  {t(`components.header.menu.${name?.toLowerCase()}`)}
                </div>
              </Link>
            ))}
          </div>
          {!desktop && (
            <Button variant={"outline"} className={styles.headerMenuLogout} onClick={() => logout()}>
              {t("components.header.actions.logOut")}
            </Button>
          )}
        </Container>
      </div>
    );
  };

  return (
    <header className={styles.header}>
      <Container size={"xl"} style={{ position: "relative" }}>
        <div className={styles.headerInner}>
          {desktop && (
            <Button variant={"outline"} className={styles.headerMenuLogout} onClick={() => logout()}>
              {t("components.header.actions.logOut")}
            </Button>
          )}

          {desktop && headerMenu()}

          {!desktop && (
            <ActionIcon variant={"transparent"} onClick={() => setIsMenuOpened((prev) => !prev)}>
              <Image src={isMenuOpened ? closeIcon : burgerMenuIcon} />
            </ActionIcon>
          )}
          <HeaderProfile showNotice={() => setIsNoticeOpened((prev) => !prev)} />
        </div>
        {isNoticeOpened && <Notifications closeNoticesModal={() => setIsNoticeOpened(false)} />}
      </Container>
      {isMenuOpened && headerMenu(true)}
    </header>
  );
};
