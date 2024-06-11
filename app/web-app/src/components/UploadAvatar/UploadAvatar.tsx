import React, { useEffect, useMemo, useRef } from "react";
import s from "./UploadAvatar.module.scss";
import { Avatar } from "@mantine/core";
import { useTranslation } from "react-i18next";

type UploadAvatarProps = {
  avatarFile: File | null;
  setAvatarFile: (file: File | null) => void;
};

const UploadAvatar = ({ avatarFile, setAvatarFile }: UploadAvatarProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarUrl = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : ""), [avatarFile]);

  const handleClickOverlay = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAvatarFile(file || null);
  };

  useEffect(() => {
    return () => {
      if (!avatarUrl) return;
      URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  return (
    <div className={s.avatarWrapper}>
      {avatarFile ? <Avatar src={avatarUrl} radius={120} className={s.avatar} /> : <div className={s.avatar} />}
      <div className={s.overlay}>
        <div className={s.overlayContent}>
          {!avatarFile && (
            <div onClick={handleClickOverlay} className={s.overlayChangeButton}>
              {t("studentsPage.buttons.changePhoto")}
            </div>
          )}
          {avatarFile && (
            <div onClick={() => setAvatarFile(null)} className={s.overlayDeleteButton}>
              {t("general.actions.delete")}
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
        </div>
      </div>
    </div>
  );
};

export default UploadAvatar;
