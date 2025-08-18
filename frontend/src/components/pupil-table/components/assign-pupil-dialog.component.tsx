import { LockerAssign, LockerAssignBody, Pupil } from '@data-contracts/backend/data-contracts';
import { useFindLockers } from '@services/locker-service/use-find-lockers';
import { useLockers } from '@services/locker-service/use-lockers';
import { usePupils } from '@services/pupil-service';
import { useSchools } from '@services/school-service';
import {
  Button,
  Checkbox,
  Dialog,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Label,
  RadioButton,
  SearchField,
  Select,
} from '@sk-web-gui/react';
import { ChangeEvent, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

interface AssignPupilDialogProps {
  pupils: Pupil[];
  show: boolean;
  onClose: () => void;
}

interface AssignLockersForm {
  pupils: string[];
  lockers: string[];
}

export const AssignPupilDialog: React.FC<AssignPupilDialogProps> = ({ pupils, show, onClose }) => {
  const { t } = useTranslation();
  const form = useForm<AssignLockersForm>({
    defaultValues: { lockers: [], pupils: pupils.map((pupil) => pupil.personId) },
  });
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = form;
  const { schoolUnit } = usePupils();
  const isSingle = pupils?.length === 1;

  const { setSchoolUnit, schoolUnit: lockersSchoolUnit, assign } = useLockers();
  const [inRow, setInRow] = useState<boolean>(!isSingle);
  const [hovered, setHovered] = useState<number | null>(null);
  const [query, setQuery] = useState<string>('');
  const [showAssigned, setShowAssigned] = useState<boolean>(false);
  const [building, setBuilding] = useState<string>('');
  const [buildingFloor, setBuildingFloor] = useState<string>('');

  const classes = pupils.reduce<string[]>((classArray, pupil) => {
    if (!pupil?.className || classArray?.includes(pupil.className)) {
      return classArray;
    }
    return [...classArray, pupil.className];
  }, []);

  useEffect(() => {
    if (schoolUnit !== lockersSchoolUnit) {
      setSchoolUnit(schoolUnit);
    }
  }, [schoolUnit, lockersSchoolUnit]);

  const { data, loaded } = useFindLockers(schoolUnit, {
    nameQueryFilter: query,
    status: showAssigned ? undefined : 'Ledigt',
    building,
    buildingFloor,
  });

  const { data: schools } = useSchools();

  const selectedLockers = watch('lockers');

  const handleClose = () => {
    clearErrors();
    reset();
    onClose();
  };

  useEffect(() => {
    if (selectedLockers.length === pupils.length) {
      clearErrors();
    }
  }, [selectedLockers]);

  const heading =
    isSingle ?
      `${pupils[0].name} (${pupils[0].className})`
    : ` ${t('pupils:count', { count: pupils.length })} (${t('pupils:properties.className')} ${classes.join(', ')})`;

  const buildings =
    schools ?
      schools
        ?.find((school) => school.schoolId === schoolUnit)
        ?.buildings?.filter((building) => !!building?.buildingName)
    : null;
  const buildingFloors = buildings ? buildings?.find((build) => build.buildingName === building)?.floors : null;

  const onSubmit = (formdata: AssignLockersForm) => {
    if (pupils.length === formdata.lockers.length) {
      clearErrors();
      const data: LockerAssign[] = pupils.map((pupil, index) => ({
        lockerId: formdata.lockers[index],
        personId: pupil.personId,
      }));
      assign(data).then(() => {
        handleClose();
      });
    } else {
      setError('lockers', { message: t('lockers:error.select_all_lockers') });
    }
  };

  const remaining = pupils.length - selectedLockers.length;

  const selectedWithin = selectedLockers.filter((selected) => {
    const index = data.findIndex((locker) => locker.lockerId === selected);
    return hovered !== null && hovered < index && hovered + remaining >= index;
  }).length;

  const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log(e.target.checked);
    if (!inRow || !e.target.checked) {
      if (selectedLockers.includes(value)) {
        setValue('lockers', [...selectedLockers.filter((selected) => selected !== value)]);
      } else {
        setValue('lockers', [...selectedLockers, value]);
      }
    } else {
      const remainingLockers = data.filter(
        (locker, index) =>
          (hovered !== null && index < hovered) || (locker?.lockerId && !selectedLockers?.includes(locker.lockerId))
      );
      const newLockers: string[] = [];
      for (let index = 0; index < remaining; index++) {
        const rowValue = remainingLockers[index + (hovered ?? 0)]?.lockerId;
        if (rowValue && !selectedLockers.includes(rowValue)) {
          newLockers.push(rowValue);
        }
      }
      setValue('lockers', [...selectedLockers, ...newLockers]);
    }
  };
  return (
    <Dialog
      show={show}
      hideClosebutton={false}
      disableCloseOutside={false}
      label={t('pupils:assign_lockers_to', { pupil: t('pupils:name', { count: pupils.length }) })}
      onClose={handleClose}
      data-test="assign-pupil-dialog"
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Content className="gap-24">
            <header>
              <h1 className="text-h2-sm md:text-h2-md xl:text-h2-lg m-0 p-0">{heading}</h1>
            </header>
            <div className="flex gap-24 justify-evenly">
              <FormControl className="w-full grow shrink">
                <FormLabel>{t('lockers:find_lockers')}</FormLabel>
                <SearchField
                  placeholder={t('lockers:properties.name')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  showResetButton={false}
                  showSearchButton={false}
                />
              </FormControl>
              <FormControl className="w-full grow shrink justify-end">
                <Checkbox checked={showAssigned} onChange={(e) => setShowAssigned(e.target.checked)} className="h-48">
                  {t('lockers:show_assigned_lockers')}
                </Checkbox>
              </FormControl>
            </div>
            <div className="flex gap-24 justify-evenly">
              <FormControl className="w-full grow shrink">
                <FormLabel>{capitalize(t('lockers:properties.building'))}</FormLabel>
                <Select
                  size="md"
                  variant="tertiary"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full"
                >
                  <Select.Option value="">{capitalize(t('common:all'))}</Select.Option>
                  {buildings &&
                    buildings.map((building) => (
                      <Select.Option value={building.buildingName ?? ''} key={building.buildingName}>
                        {building.buildingName}
                      </Select.Option>
                    ))}
                </Select>
              </FormControl>
              <FormControl className="w-full grow shrink">
                <FormLabel>{capitalize(t('lockers:properties.buildingFloor'))}</FormLabel>
                <Select
                  disabled={!buildingFloors}
                  size="md"
                  variant="tertiary"
                  value={buildingFloor}
                  onChange={(e) => setBuildingFloor(e.target.value)}
                  className="w-full"
                >
                  <Select.Option value="">{capitalize(t('common:all'))}</Select.Option>
                  {buildingFloors &&
                    buildingFloors.map((floor) => (
                      <Select.Option value={floor} key={floor}>
                        {floor}
                      </Select.Option>
                    ))}
                </Select>
              </FormControl>
            </div>
            <Divider />
            {!isSingle && (
              <FormControl>
                <Checkbox checked={inRow} onChange={(e) => setInRow(e.target.checked)}>
                  {t('lockers:assign_all_in_row')}
                </Checkbox>
              </FormControl>
            )}
            <div className="w-full flex">
              <div className="w-1/3 font-bold">{t('lockers:properties.name')}</div>
              <div className="w-2/3 font-bold">{t('lockers:assign_pupil')}</div>
            </div>
            <ul className="max-h-[37rem] overflow-auto overflow-x-visible flex flex-col gap-12">
              {loaded &&
                data.map((locker, index) => (
                  <li key={locker.lockerId} className="w-full flex">
                    <div className="w-1/3">
                      {isSingle ?
                        <RadioButton
                          data-test={`assign-locker-radio-${locker.name}`}
                          name="lockers"
                          checked={(locker?.lockerId && selectedLockers?.includes(locker.lockerId)) || false}
                          onChange={() => locker?.lockerId && setValue('lockers', [locker.lockerId])}
                          disabled={!!locker?.assignedTo}
                          value={locker.lockerId}
                        >
                          {locker.name}
                        </RadioButton>
                      : <span
                          onMouseEnter={() =>
                            inRow && locker?.lockerId && !selectedLockers.includes(locker.lockerId) ?
                              setHovered(index)
                            : {}
                          }
                          onMouseLeave={() => setHovered(null)}
                        >
                          <Checkbox
                            data-test={`assign-locker-checkbox-${locker.name}`}
                            name="lockers"
                            onChange={handleCheckbox}
                            checked={(locker?.lockerId && selectedLockers.includes(locker.lockerId)) || false}
                            className={
                              (
                                inRow &&
                                hovered !== null &&
                                locker?.lockerId &&
                                !selectedLockers.includes(locker.lockerId) &&
                                hovered < index &&
                                hovered + remaining + selectedWithin > index
                              ) ?
                                'group-hover'
                              : ''
                            }
                            disabled={
                              !!locker?.assignedTo ||
                              (locker?.lockerId &&
                                !selectedLockers.includes(locker.lockerId) &&
                                selectedLockers.length === pupils.length) ||
                              false
                            }
                            value={locker.lockerId}
                          >
                            {locker.name}
                          </Checkbox>
                        </span>
                      }
                    </div>
                    <div className="w-2/3" data-test={`assign-locker-status-${locker.name}`}>
                      {locker?.assignedTo ?
                        `${locker.assignedTo.pupilName} (${locker.assignedTo.className})`
                      : locker?.lockerId && selectedLockers?.includes(locker.lockerId) ?
                        pupils[selectedLockers.findIndex((id) => id === locker.lockerId)].name
                      : <Label
                          className="whitespace-nowrap text-nowrap"
                          inverted
                          color={
                            locker?.status === 'Ska Tömmas' ? 'warning'
                            : locker?.status === 'Ledigt' ?
                              'success'
                            : 'error'
                          }
                        >
                          {locker.status}
                        </Label>
                      }
                    </div>
                  </li>
                ))}
            </ul>
            <Divider />
            <Dialog.Buttons className="justify-evenly">
              <Button variant="secondary" className="w-full grow shrink" onClick={() => handleClose()}>
                {capitalize(t('common:cancel'))}
              </Button>
              <Button
                data-test="assign-pupil-submit"
                variant="primary"
                color="vattjom"
                type="submit"
                className="w-full grow shrink"
                aria-describedby="error-message"
              >
                {capitalize(t('lockers:assign_lockers'))}
              </Button>
            </Dialog.Buttons>
          </Dialog.Content>
          <div id="error-message">
            {errors.lockers && (
              <FormErrorMessage className="text-error-text-primary">{errors.lockers.message}</FormErrorMessage>
            )}
          </div>
        </form>
      </FormProvider>
    </Dialog>
  );
};
