import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";
import { useGetCityQuery, useGetClassesQuery, useGetMatnasQuery, useUpdateClassMutation } from "../../app/api/classes";
import { City, Classes, Matnas } from "../../app/types/classesTypes";
import styles from "./ClassesTable.module.scss";
import { TableItem } from "./TableItem/TableItem";

import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { DragDropContext, Draggable, DraggableLocation, DropResult, Droppable } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import { useGetTeachersQuery } from "../../app/api/teacher";
import { Teacher } from "../../app/types/teacherTypes";
import { AppButton } from "../Button/Button";
import { AppDatePicker } from "../Datepicker/Datepicker";
import { AppInput } from "../Input/Input";
import { AppModal } from "../Modal/Modal";
import { AppSelect } from "../Select/Select";
import { AppTimeInput } from "../TimeInput/TimeInput";

interface Props {
  startDate?: null | Date;
  endDate?: null | Date;
  isChangable: boolean;
}

interface TeacherType {
  teacherId: string;
  name: string;
  classes: { [key: string]: ClassType[] };
}

export type ClassType = {
  dayOfWeek: number;
  start: string;
  end: string;
  name: string;
  location: string;
  studentsCount: number;
  _id: string;
  isRecurring: boolean;
};

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
  updateType?: string;
  recurringEndDate?: Date | string;
}

export const ClassesTable: FC<Props> = ({ startDate, endDate, isChangable }) => {
  const { t } = useTranslation();
  const { data: classes } = useGetClassesQuery({ startDate: dayjs(startDate).format(), endDate: dayjs(endDate).format() });
  const { data: teachersList } = useGetTeachersQuery({});
  const [days, setDays] = useState<{ dayOfWeek: string; date: string }[]>([]);
  const [daysClass, setDaysClass] = useState<{ [key: string]: ClassType[] }>({});
  const [teachers, setTeachers] = useState<TeacherType[]>([]);
  const [tempTeachers, setTempTeachers] = useState<TeacherType[]>([]);
  const { data: cities } = useGetCityQuery();
  const { data: matnases } = useGetMatnasQuery();
  const [opened, { open, close }] = useDisclosure(false);
  const [openedTypeModal, { open: openTypeModal, close: closeTypeModal }] = useDisclosure(false);
  const [updateClass] = useUpdateClassMutation();
  const [choosedDate, setChoosedDate] = useState<string | null>();
  const [sourceState, setSourceState] = useState<DraggableLocation | null>();
  const [destinationState, setDestinationState] = useState<DraggableLocation | null>();
  const [sourceColumn, setSourceColumn] = useState<ClassType[]>();
  const [destinationColumn, setDestinationColumn] = useState<ClassType[]>();

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
      updateType: undefined,
      recurringEndDate: "",
    } as FormValues,
    validate: {},
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
      updateType: values.updateType,
      recurringEndDate: values.recurringEndDate,
    }),
  });

  useEffect(() => {
    const daysArray = [];
    const days: { [key: string]: ClassType[] } = {};

    if (startDate && endDate) {
      const daysDifference = Math.ceil((endDate?.getTime() - startDate?.getTime()) / (1000 * 60 * 60 * 24));
      const arrayLength = Math.min(daysDifference + 1, 7);
      const currentDate = new Date(startDate);
      for (let i = 0; i < arrayLength; i++) {
        daysArray.push({
          date: dayjs(currentDate.toISOString()).format("DD.MM.YYYY"),
          dayOfWeek: dayjs(currentDate.toISOString()).format("ddd"),
        });
        days[dayjs(currentDate.toISOString()).format("ddd")] = [];
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    setDaysClass(days);
    setDays(daysArray);
  }, [startDate, endDate]);

  useEffect(() => {
    setTeachers([]);
    setTimeout(() => {
      classes && addToDaysClass(classes);
    }, 0);
  }, [classes, teachersList]);

  useEffect(() => {
    if (choosedDate) {
      form.setValues({ date: choosedDate });
    }
  }, [choosedDate]);

  const addToDaysClass = (objects: Classes[]) => {
    const updatedDaysClass = { ...daysClass };
    const teachersClasses: { teacherId: string; name: string; classes: { [key: string]: ClassType[] } }[] = teachersList
      ? [...teachersList?.map((teacher) => ({ teacherId: teacher._id, name: teacher.fullName, classes: { ...updatedDaysClass } }))]
      : [];

    objects.forEach((value) => {
      if (teachersClasses.some((obj) => obj.teacherId === value.teacher._id)) {
        const teacher = teachersClasses.find((obj) => obj.teacherId === value.teacher._id);

        const cls: ClassType = {
          dayOfWeek: dayjs(value.startDate).day(),
          start: dayjs(value.startDate).format("HH:mm"),
          end: dayjs(value.endDate).format("HH:mm"),
          name: value.name,
          location: value.location,
          studentsCount: value.studentsCount,
          _id: value._id,
          isRecurring: value.isRecurring,
        };

        if (teacher) {
          switch (cls.dayOfWeek) {
            case 0:
              teacher.classes["Sun"] = [...teacher.classes["Sun"], cls];
              break;
            case 1:
              teacher.classes["Mon"] = [...teacher.classes["Mon"], cls];
              break;
            case 2:
              teacher.classes["Tue"] = [...teacher.classes["Tue"], cls];
              break;
            case 3:
              teacher.classes["Wed"] = [...teacher.classes["Wed"], cls];
              break;
            case 4:
              teacher.classes["Thu"] = [...teacher.classes["Thu"], cls];
              break;
            case 5:
              teacher.classes["Fri"] = [...teacher.classes["Fri"], cls];
              break;
            case 6:
              teacher.classes["Sat"] = [...teacher.classes["Sat"], cls];
              break;
          }
        }
      } else {
        const teacher = { teacherId: value.teacher._id, name: value.teacher.fullName, classes: { ...updatedDaysClass } };
        const cls: ClassType = {
          dayOfWeek: dayjs(value.startDate).day(),
          start: dayjs(value.startDate).format("HH:mm"),
          end: dayjs(value.endDate).format("HH:mm"),
          name: value.name,
          location: value.location,
          studentsCount: value.studentsCount,
          _id: value._id,
          isRecurring: value.isRecurring,
        };

        switch (cls.dayOfWeek) {
          case 0:
            teacher.classes["Sun"] = [...teacher.classes["Sun"], cls];
            break;
          case 1:
            teacher.classes["Mon"] = [...teacher.classes["Mon"], cls];
            break;
          case 2:
            teacher.classes["Tue"] = [...teacher.classes["Tue"], cls];
            break;
          case 3:
            teacher.classes["Wed"] = [...teacher.classes["Wed"], cls];
            break;
          case 4:
            teacher.classes["Thu"] = [...teacher.classes["Thu"], cls];
            break;
          case 5:
            teacher.classes["Fri"] = [...teacher.classes["Fri"], cls];
            break;
          case 6:
            teacher.classes["Sat"] = [...teacher.classes["Sat"], cls];
            break;
        }

        teachersClasses.push(teacher);
      }
    });
    setDaysClass(updatedDaysClass);
    setTeachers(sortClassesByTime(teachersClasses));
  };

  const reorder = (source: ClassType[], startIndex: number, endIndex: number) => {
    const result = Array.from(source);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const compareTime = (a: ClassType, b: ClassType) => {
    const timeA = dayjs(`1970-01-01 ${a.start}`);
    const timeB = dayjs(`1970-01-01 ${b.start}`);

    if (timeA.isBefore(timeB)) {
      return -1;
    } else if (timeA.isAfter(timeB)) {
      return 1;
    }

    return 0;
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

  const sortClassesByTime = (array: TeacherType[]) => {
    const arr = [...array];

    for (const teacher of arr) {
      for (const day in teacher.classes) {
        teacher.classes[day].sort(compareTime);
      }
    }

    return arr;
  };

  const updateClassHandler = async (values: FormValues) => {
    if (values._id) {
      try {
        await updateClass({
          _id: values._id,
          name: values.classname,
          city: values.city,
          matnas: values.matnas,
          groupLink: values.groupLink,
          location: values.location,
          startDate: values.startDate,
          endDate: values.endDate,
          teacherId: values.teacherId,
          updateType: values.updateType ? values.updateType.toLowerCase() : undefined,
          recurringEndDate: values.updateType === "following" ? dayjs(values.recurringEndDate).toISOString() : undefined,
        }).unwrap();

        setTeachers(tempTeachers);
        close();

        if (sourceColumn && destinationColumn && sourceState && destinationState) {
          const from = Array.from(sourceColumn);
          const [removed] = from.splice(sourceState.index, 1);
          const newFrom = [...from];
          const teacherFromId = sourceState.droppableId.split("-")[0];

          const to = Array.from(destinationColumn);
          to.splice(destinationState.index, 0, removed);
          const newTo = [...to];
          const teacherToId = destinationState.droppableId.split("-")[0];
          const newTeachers = [...teachers];
          newTeachers.forEach((t) => {
            if (t.teacherId === teacherFromId && t.teacherId === teacherToId) {
              t.classes = { ...t.classes, [sourceState.droppableId.split("-")[1]]: newFrom, [destinationState.droppableId.split("-")[1]]: newTo };
            }
            if (t.teacherId === teacherFromId) {
              t.classes = { ...t.classes, [sourceState.droppableId.split("-")[1]]: newFrom };
              return;
            }
            if (t.teacherId === teacherToId) {
              t.classes = { ...t.classes, [destinationState.droppableId.split("-")[1]]: newTo };
              return;
            }
          });
        }

        setTeachers(tempTeachers);
        form.reset();
      } catch (error) {
      } finally {
        setSourceColumn([]);
        setDestinationColumn([]);
        setSourceState(null);
        setDestinationState(null);
      }
    }
  };

  const dragHandler = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceColumn = teachers.find((obj) => obj.teacherId === source.droppableId.split("-")[0])?.classes[source.droppableId.split("-")[1]];
    const destinationColumn = teachers.find((obj) => obj.teacherId === destination.droppableId.split("-")[0])?.classes[
      destination.droppableId.split("-")[1]
    ];

    if (source.droppableId === destination.droppableId && sourceColumn) {
      const result = reorder(sourceColumn, source.index, destination.index);

      const updatedState = teachers.map((teacher) => {
        return teacher.teacherId === source.droppableId.split("-")[0]
          ? { ...teacher, classes: { ...teacher.classes, [source.droppableId.split("-")[1]]: result } }
          : teacher;
      });

      setTeachers(sortClassesByTime(updatedState));

      return;
    }

    if (sourceColumn && destinationColumn) {
      setSourceState(source);
      setDestinationState(destination);
      setSourceColumn(sourceColumn);
      setDestinationColumn(destinationColumn);

      const findedClass = classes?.find((obj) => obj._id === draggableId);
      if (findedClass) {
        form.setFieldValue("classname", findedClass.name);
        form.setFieldValue("location", findedClass.location);
        form.setFieldValue("groupLink", findedClass.groupLink);
        form.setFieldValue("teacherId", findedClass.teacher._id);
        form.setFieldValue("city", findedClass.city);
        form.setFieldValue("matnas", findedClass.matnas);
        form.setFieldValue("_id", findedClass._id);
        if (findedClass.isRecurring) {
          form.setFieldValue("updateType", "single");
        }
        const days = getWeekdays();
        days.forEach((day) => {
          if (day.label.substring(0, 3) === destination.droppableId.split("-")[1]) {
            setChoosedDate(day.value);
          }
        });
      }

      openTypeModal();
    }
  };

  useEffect(() => {
    if (form.values.updateType === "all") {
      const days = getWeekdays();
      days.forEach((day) => {
        if (day.label.substring(0, 3) === sourceState?.droppableId.split("-")[1]) {
          setChoosedDate(day.value);
        }
      });
    }
  }, [form.values.updateType]);

  return (
    <>
      <AppModal status={openedTypeModal} onClose={closeTypeModal}>
        <div className={styles.modal}>
          <div className={styles.modalFields}>
            <AppSelect
              data={[
                { label: "general.modal.single", value: "single" },
                { label: "general.modal.all", value: "all" },
                { label: "general.modal.following", value: "following" },
              ]}
              placeholder="general.modal.updateType"
              {...form.getInputProps("updateType")}
            />
            {form.values.updateType === "following" && (
              <div className={styles.modalDatepicker}>
                <AppDatePicker changeDate={(value) => form.setValues({ recurringEndDate: value ? value : new Date() })} />
              </div>
            )}
            <div className={styles.modalActions}>
              <AppButton variant={"outline"} title={"general.actions.cancel"} onClick={closeTypeModal} />
              <AppButton
                variant={"filled"}
                title={"general.action.update"}
                onClick={() => {
                  closeTypeModal();
                  open();
                }}
              />
            </div>
          </div>
        </div>
      </AppModal>
      {opened && (
        <AppModal status={opened} onClose={() => close()}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>{t("components.classesTable.title")}</div>
            <form onSubmit={form.onSubmit((values) => updateClassHandler(values))} className={styles.form}>
              <AppInput placeholder="components.classesTable.form.classNamePlaceholder" {...form.getInputProps("classname")} />
              <AppInput placeholder="components.classesTable.form.locationPlaceholder" {...form.getInputProps("location")} />
              {cities && (
                <AppSelect
                  data={cities.map((city: City) => ({ value: city.name, label: city.name }))}
                  placeholder="components.classesTable.form.cityPlaceholder"
                  {...form.getInputProps("city")}
                />
              )}
              {matnases && (
                <AppSelect
                  data={matnases.map((matnas: Matnas) => ({ value: matnas.name, label: matnas.name }))}
                  placeholder="components.classesTable.form.matnasPlaceholder"
                  {...form.getInputProps("matnas")}
                />
              )}
              <AppInput placeholder="components.classesTable.form.groupLinkPlaceholder" {...form.getInputProps("groupLink")} />
              {teachersList && (
                <AppSelect
                  data={teachersList.map((teacher: Teacher) => ({ value: teacher._id, label: teacher.fullName }))}
                  placeholder="components.classesTable.form.teacherIdPlaceholder"
                  {...form.getInputProps("teacherId")}
                />
              )}
              {form.values.updateType !== "all" && (
                <AppSelect data={getWeekdays()} placeholder="components.classesTable.form.datePlaceholder" value={choosedDate} />
              )}

              <div className={styles.modalDates}>
                <div className={styles.modalDatesTime}>
                  <div className={styles.modalDatesTimePart}>
                    <AppTimeInput {...form.getInputProps("startTime")} />
                    <span>{t("general.from")}</span>
                  </div>
                  <div className={styles.modalDatesTimePart}>
                    <AppTimeInput {...form.getInputProps("endTime")} />
                    <span>{t("general.to")}</span>
                  </div>
                </div>
              </div>
              <div className={styles.formBtns}>
                <AppButton title="general.actions.cancel" variant={"outline"} onClick={close} />
                <AppButton title="components.classesTable.form.submit" variant={"filled"} type={"submit"} />
              </div>
            </form>
          </div>
        </AppModal>
      )}
      <div className={styles.table}>
        <div className={styles.dates}>
          <div className={styles.datesHead}>
            {days.map((day) => (
              <div className={styles.datesHeadItem} key={day.date}>
                <div className={styles.datesHeadItemDay}>{day.dayOfWeek}</div>
                <div className={styles.datesHeadItemDate}>{day.date}</div>
              </div>
            ))}
          </div>
          <DragDropContext onDragEnd={dragHandler}>
            {teachers.map((teacher) => (
              <div className={styles.wrapper} key={teacher.teacherId}>
                <div className={styles.body}>
                  <div className={styles.bodyDay}>
                    {Object.entries(teacher.classes).map(([key, value]: [string, ClassType[]]) => (
                      <div className={styles.bodyItem} key={`${key}-${teacher.teacherId}`}>
                        <Droppable droppableId={`${teacher.teacherId}-${key}`}>
                          {(droppableProvided) => (
                            <div ref={droppableProvided.innerRef} className={styles.bodyItemInner}>
                              {value.length > 0 &&
                                value.map((cls: ClassType) => (
                                  <Draggable key={cls._id} draggableId={cls._id} index={value.indexOf(cls)}>
                                    {(draggableProvider) => (
                                      <div
                                        ref={draggableProvider.innerRef}
                                        {...draggableProvider.draggableProps}
                                        {...draggableProvider.dragHandleProps}
                                      >
                                        <TableItem isChangable={isChangable} cls={cls} key={cls._id} />
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.teachersName}>{teacher.name}</div>
              </div>
            ))}
          </DragDropContext>
        </div>
      </div>
    </>
  );
};
