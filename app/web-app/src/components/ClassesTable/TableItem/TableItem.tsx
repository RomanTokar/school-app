import { Image, Popover, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDeleteClassMutation } from "../../../app/api/classes";
import locationIcon from "../../../assets/icons/location.svg";
import studentsIcon from "../../../assets/icons/students.svg";
import { AppButton } from "../../Button/Button";
import { AppDatePicker } from "../../Datepicker/Datepicker";
import { AppModal } from "../../Modal/Modal";
import { AppSelect } from "../../Select/Select";
import { ClassType } from "../ClassesTable";
import styles from "../ClassesTable.module.scss";

interface Props {
  cls: ClassType;
  isChangable: boolean;
}

export const TableItem: FC<Props> = ({ cls, isChangable }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deleteClass] = useDeleteClassMutation();
  const [opened, { toggle, close }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [deleteStatus, setDeleteStatus] = useState<string>("");
  const [date, setDate] = useState<string>("");

  const deleteClassHandler = async () => {
    try {
      await deleteClass({
        id: cls._id,
        deleteType: deleteStatus ? deleteStatus : undefined,
        recurringEndDate: deleteStatus === "following" ? date : undefined,
      }).unwrap();
    } catch (error) {}
  };

  useEffect(() => {
    close();
  }, [isChangable]);

  return (
    <>
      <AppModal status={deleteModalOpened} onClose={closeDeleteModal}>
        <div className={styles.modal}>
          <div className={styles.modalFields}>
            <AppSelect
              data={[
                { label: "general.modal.single", value: "single" },
                { label: "general.modal.all", value: "all" },
                { label: "general.modal.following", value: "following" },
              ]}
              value={deleteStatus}
              placeholder="general.modal.deleteType"
              onChange={(status) => {
                setDeleteStatus(status ? status : "");
              }}
            />
            {deleteStatus === "following" && (
              <div className={styles.modalDatepicker}>
                <AppDatePicker changeDate={(value) => setDate(dayjs(value).toISOString())} />
              </div>
            )}
            <div className={styles.modalActions}>
              <AppButton variant={"outline"} title={"general.actions.cancel"} onClick={closeDeleteModal} />
              <AppButton
                variant={"filled"}
                title={"general.actions.delete"}
                onClick={() => {
                  deleteClassHandler();
                  closeDeleteModal();
                }}
              />
            </div>
          </div>
        </div>
      </AppModal>
      <Popover opened={opened}>
        <Popover.Target>
          <div
            className={styles.bodyItemSection}
            key={cls.name}
            onClick={() => (isChangable ? toggle() : navigate({ pathname: `/classes/${cls._id}` }))}
          >
            <div className={styles.bodyItemSectionInner}>
              <div className={styles.bodyItemSectionName}>{cls.name}</div>
              <div className={styles.bodyItemSectionInfo}>
                <div className={styles.bodyItemSectionClsCount}>
                  <Image src={studentsIcon} style={{ maxWidth: "10px" }} />
                  <span>{cls.studentsCount}</span>
                </div>
                <div className={styles.bodyItemSectionLocation}>
                  <Image src={locationIcon} style={{ maxWidth: "10px" }} />
                  <span>{cls.location}</span>
                </div>
              </div>
            </div>
            <div className={styles.bodyItemSectionTime}>
              <div className={styles.bodyItemSectionTimeLabel}>{cls.start}</div>
              <div className={styles.bodyItemSectionTimeLabel}>{cls.end}</div>
            </div>
          </div>
        </Popover.Target>
        <Popover.Dropdown
          onClick={() => {
            if (cls.isRecurring) {
              openDeleteModal();
            } else {
              deleteClassHandler();
            }
            close();
          }}
        >
          <div className={styles.popover}>
            <UnstyledButton className={styles.popoverBtn}>{t("general.actions.delete")}</UnstyledButton>
          </div>
        </Popover.Dropdown>
      </Popover>
    </>
  );
};
