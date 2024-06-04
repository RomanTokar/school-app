import { ActionIcon, Image } from "@mantine/core";
import dayjs from "dayjs";
import { useDeleteClassMutation } from "../../../app/api/classes";
import { Classes } from "../../../app/types/classesTypes";
import closeIcon from "../../../assets/icons/close-menu.svg";
import locationIcon from "../../../assets/icons/location.svg";
import studentsIcon from "../../../assets/icons/students.svg";
import styles from "./TeacherClass.module.scss";

export const TeacherClass = ({
  data,
  isSelected,
  getClassId,
}: {
  data: Classes;
  isSelected: boolean;
  getClassId: (value: string | null) => void;
}) => {
  const [deleteClass] = useDeleteClassMutation();

  const deleteClassHandler = async () => {
    if (data.isRecurring) {
      try {
        await deleteClass({
          id: data._id,
          deleteType: "single",
        }).unwrap();

        getClassId(null);
      } catch (error) {}
    } else {
      try {
        await deleteClass({
          id: data._id,
        }).unwrap();

        getClassId(null);
      } catch (error) {}
    }
  };

  return (
    <>
      <div className={styles.wrapper} key={data._id}>
        <div className={`${styles.class} ${isSelected ? styles.classSelected : ""}`}>
          <ActionIcon variant={"transparent"} onClick={() => deleteClassHandler()}>
            <Image src={closeIcon} />
          </ActionIcon>
          <div className={styles.classRight}>
            <div className={styles.classTitle}>{data.name}</div>
            <div className={styles.classBottom}>
              <div className={styles.classValue}>
                <Image src={studentsIcon} style={{ width: "24px" }} />
                <span>{data.studentsCount}</span>
              </div>
              <div className={styles.classValue}>
                <Image src={locationIcon} style={{ width: "24px" }} />
                <span>{data.location}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.time}>
          <div className={styles.timeFrom}>{dayjs(data.startDate).format("HH:mm")}</div>
          <div className={styles.timeTo}>{dayjs(data.endDate).format("HH:mm")}</div>
        </div>
      </div>
    </>
  );
};
