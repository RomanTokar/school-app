import { Checkbox, Container, Image } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAddClassMutation, useGetCityQuery, useGetMatnasQuery } from "../../app/api/classes";
import { useGetTeachersQuery } from "../../app/api/teacher";
import { City, Matnas } from "../../app/types/classesTypes";
import { Teacher } from "../../app/types/teacherTypes";
import pencilIcon from "../../assets/icons/pencil.svg";
import plusIcon from "../../assets/icons/plus.svg";
import { AppButton } from "../../components/Button/Button";
import { ClassesTable } from "../../components/ClassesTable/ClassesTable";
import { AppDateRangePicker } from "../../components/DateRangePicker/DateRangePicker";
import { AppDatePicker } from "../../components/Datepicker/Datepicker";
import { AppInput } from "../../components/Input/Input";
import { AppModal } from "../../components/Modal/Modal";
import { AppSelect } from "../../components/Select/Select";
import { AppTimeInput } from "../../components/TimeInput/TimeInput";
import styles from "./classes.module.scss";

interface FormValues {
  classname: string;
  location: string;
  groupLink: string;
  startTime?: string;
  endTime?: string;
  date?: string;
  startDate: string;
  endDate: string;
  teacherId: string;
  matnas: string;
  city: string;
  _id?: string;
  isRecuring?: boolean;
  recurringEndDate?: Date | string;
}

export const AppClasses = () => {
  const { t } = useTranslation();
  const { data: teachersList } = useGetTeachersQuery({});
  const { data: cities } = useGetCityQuery();
  const { data: matnases } = useGetMatnasQuery();
  const [addClass] = useAddClassMutation();
  const [isChangeable, setIsChangeable] = useState<boolean>(false);
  const [date, setDate] = useState<[Date | null, Date | null]>([new Date(), nextweek()]);
  const [choosedDate, setChoosedDate] = useState<string | null>();
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
  const desktop = useMediaQuery("(min-width: 992px)");

  function nextweek() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  }

  const form = useForm({
    initialValues: {
      classname: "",
      location: "",
      groupLink: "",
      startTime: "",
      endTime: "",
      date: "",
      startDate: "",
      endDate: "",
      teacherId: "",
      matnas: "",
      city: "",
      _id: "",
      isRecuring: false,
      recurringEndDate: new Date(),
    } as FormValues,
    validate: {
      classname: (value) => {
        if (value.trim().length < 5) {
          return t("classesPage.validations.classLength");
        }
      },
      location(value) {
        if (value.trim().length < 5) {
          return t("classesPage.validations.locationLength");
        }
      },
      groupLink(value) {
        if (!value) {
          return t("classesPage.validations.groupLinkRequired");
        }
      },
      date(value) {
        if (!value) {
          return t("classesPage.validations.dateRequired");
        }
      },
      teacherId(value) {
        if (!value) {
          return t("classesPage.validations.teacherRequired");
        }
      },
      matnas(value) {
        if (!value) {
          return t("classesPage.validations.matnasRequired");
        }
      },
      city(value) {
        if (!value) {
          return t("classesPage.validations.cityRequired");
        }
      },
    },
    transformValues: (values: FormValues) => ({
      startDate: dayjs(`${values.date}T${values.startTime}`).toISOString(),
      endDate: dayjs(`${values.date}T${values.endTime}`).toISOString(),
      classname: values.classname,
      location: values.location,
      groupLink: values.groupLink,
      teacherId: values.teacherId,
      matnas: values.matnas,
      city: values.city,
      _id: values._id,
      isRecuring: values.isRecuring,
      recurringEndDate: values.isRecuring ? dayjs(values.recurringEndDate).toISOString() : undefined,
    }),
  });

  const addClassHandler = async (values: FormValues) => {
    try {
      await addClass({
        name: values.classname,
        location: values.location,
        groupLink: values.groupLink,
        teacherId: values.teacherId,
        startDate: values.startDate,
        endDate: values.endDate,
        matnas: values.matnas,
        city: values.city,
        isRecurring: values.isRecuring,
        recurringEndDate: values.isRecuring ? dayjs(values.recurringEndDate).toISOString() : undefined,
      }).unwrap();

      form.reset();
      closeAddModal();
    } catch (error) {}
  };

  const getWeekdays = () => {
    const currentDate = dayjs();

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = currentDate.add(i, "day");
      const object = {
        value: date.format("YYYY-MM-DD"),
        label: date.format("dddd"),
      };
      weekDates.push(object);
    }

    return weekDates;
  };

  useEffect(() => {
    if (choosedDate) {
      form.setValues({ date: choosedDate });
    }
  }, [choosedDate]);

  return (
    <Container size={"xl"}>
      <div className={styles.navigation}>
        <AppDateRangePicker changeDate={(value) => setDate(value)} />
      </div>
      <div className={styles.managing}>
        <div className={styles.classesManage}>
          <AppButton
            variant={"subtle"}
            title={isChangeable ? "classesPage.actions.finishManage" : "classesPage.actions.manageClasses"}
            leftIcon={
              <Image
                src={pencilIcon}
                style={{ background: isChangeable ? "#2064CB" : "rgba(66, 72, 88, 0.5)", padding: "8px", borderRadius: "100%" }}
              />
            }
            className={styles.classesManageBtn}
            onClick={() => setIsChangeable((prev) => !prev)}
          />
        </div>
        <div className={styles.classesBtns}>
          <AppButton
            variant={"filled"}
            title="classesPage.actions.addClass"
            leftIcon={<Image src={plusIcon} />}
            style={{ background: "rgba(66, 72, 88, 0.5)", border: "none" }}
            onClick={() => openAddModal()}
          />
          <div className={styles.classesTitle}>{t("classesPage.text.thisWeekClasses")}</div>
        </div>
      </div>

      {date && <ClassesTable startDate={date ? date[0] : null} endDate={date ? date[1] : null} isChangable={isChangeable} />}
      {addModalOpened && (
        <AppModal status={addModalOpened} onClose={() => closeAddModal()} size={desktop ? "md" : "xs"}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>{t("classesPage.text.addClass")}</div>
            <form onSubmit={form.onSubmit((values) => addClassHandler(values))} className={styles.form}>
              <AppInput placeholder={t("classesPage.form.classNamePlaceholder")} {...form.getInputProps("classname")} />
              <AppInput placeholder={t("classesPage.form.locationPlaceholder")} {...form.getInputProps("location")} />
              {cities && (
                <AppSelect
                  data={cities.map((city: City) => ({ value: city.name, label: city.name }))}
                  placeholder={t("classesPage.form.cityPlaceholder")}
                  {...form.getInputProps("city")}
                />
              )}
              {matnases && (
                <AppSelect
                  data={matnases.map((matnas: Matnas) => ({ value: matnas.name, label: matnas.name }))}
                  placeholder={t("classesPage.form.matnasPlaceholder")}
                  {...form.getInputProps("matnas")}
                />
              )}
              <AppInput placeholder={t("classesPage.form.groupLinkPlaceholder")} {...form.getInputProps("groupLink")} />
              {teachersList && (
                <AppSelect
                  data={teachersList.map((teacher: Teacher) => ({ value: teacher._id, label: teacher.fullName }))}
                  placeholder={t("classesPage.form.teacherIdPlaceholder")}
                  {...form.getInputProps("teacherId")}
                />
              )}
              <AppSelect data={getWeekdays()} placeholder={t("classesPage.form.datePlaceholder")} onChange={(value) => setChoosedDate(value)} />
              <div className={styles.dates}>
                <div className={styles.datesTime}>
                  <div className={styles.datesTimePart}>
                    <AppTimeInput {...form.getInputProps("startTime")} />
                    <span>{t("general.from")}</span>
                  </div>
                  <div className={styles.datesTimePart}>
                    <AppTimeInput {...form.getInputProps("endTime")} />
                    <span>{t("general.to")}</span>
                  </div>
                </div>
              </div>
              <Checkbox
                checked={form.values.isRecuring}
                labelPosition="right"
                label={"Is reccuring?"}
                color="dark"
                radius="xs"
                onChange={(event) => {
                  form.setValues({ isRecuring: event.currentTarget.checked });
                }}
                style={{ marginLeft: "auto" }}
              />
              {form.values.isRecuring && (
                <AppDatePicker
                  style={{ textAlign: "right" }}
                  changeDate={(value) => form.setValues({ recurringEndDate: value ? value : new Date() })}
                />
              )}

              <div className={styles.formBtns}>
                <AppButton title={t("classesPage.form.cancel")} variant={"outline"} onClick={closeAddModal} />
                <AppButton title={t("classesPage.form.submit")} variant={"filled"} type={"submit"} />
              </div>
            </form>
          </div>
        </AppModal>
      )}
    </Container>
  );
};
