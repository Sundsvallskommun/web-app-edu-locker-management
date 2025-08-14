import { CreateLockerBody } from '@data-contracts/backend/data-contracts';
import { LockType } from '@interfaces/locker.interface';
import { useLockers } from '@services/locker-service/use-lockers';
import { useSchool } from '@services/school-service';
import {
  Button,
  Checkbox,
  Dialog,
  Divider,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  RadioButton,
  Select,
} from '@sk-web-gui/react';
import { autoNumber } from '@utils/autonumber-string';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

interface CreateLockerDialogProps {
  show: boolean;
  onClose: () => void;
}

export const CreateLockerDialog: React.FC<CreateLockerDialogProps> = ({ show, onClose }) => {
  const { t } = useTranslation();
  const { schoolUnit, create, refresh } = useLockers();
  const { data: school, loaded } = useSchool(schoolUnit);
  const [lockerCount, setLockerCount] = useState<string>('1');
  const numberOFLockers = parseInt(lockerCount, 10);

  const [autoNames, setAutoNames] = useState<boolean>(false);

  const defaultValues = {
    newLockerNames: [],
    lockType: 'Inget' as LockType,
    building: '',
    buildingFloor: '',
  };

  const form = useForm<CreateLockerBody>({
    defaultValues,
  });

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = form;
  const selectedBuilding = watch('building');

  const firstName = watch('newLockerNames.0');

  const buildings = school?.buildings;
  const buildingFloors =
    selectedBuilding ?
      buildings?.find((build) => build.buildingName === selectedBuilding)?.floors?.filter((floor) => !!floor)
    : undefined;

  useEffect(() => {
    reset(defaultValues);
  }, [loaded]);

  useEffect(() => {
    if (numberOFLockers > 1 && autoNames) {
      for (let index = 1; index < numberOFLockers; index++) {
        setValue(`newLockerNames.${index}`, autoNumber(firstName, index));
      }
    }
  }, [firstName, autoNames, numberOFLockers]);

  const handleClose = () => {
    reset(defaultValues);
    setLockerCount('1');
    setAutoNames(false);
    onClose();
  };

  useEffect(() => {
    if (selectedBuilding && buildingFloors?.length === 1) {
      setValue('buildingFloor', buildingFloors[0]);
    } else {
      setValue('buildingFloor', '');
    }
  }, [selectedBuilding]);

  const onSubmit = (data: CreateLockerBody) => {
    create(data).then((res) => {
      if (res) {
        refresh();
        handleClose();
      }
    });
  };

  return (
    <Dialog
      className="w-[50rem] max-w-[50rem]"
      label={<h1 className="text-h2-sm md:text-h2-md xl:text-h2-lg m-0">{t('lockers:new_locker')}</h1>}
      show={show}
      onClose={handleClose}
      hideClosebutton={false}
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Content className="gap-24 flex flex-col pb-16">
            <div className="flex gap-24 justify-evenly">
              <FormControl className="w-full grow shrink">
                <FormLabel>{t('lockers:properties.building')}</FormLabel>
                <Select
                  data-test="create-lockers-building"
                  className="w-full"
                  variant="tertiary"
                  disabled={!buildings}
                  required={!!buildings && buildings.length > 0}
                  {...register('building')}
                >
                  <Select.Option value="">{capitalize(t('common:select'))}...</Select.Option>
                  {buildings
                    ?.filter((building) => !!building.buildingName)
                    .map((building) => (
                      <Select.Option key={`cb-${building.buildingName}`} value={building.buildingName ?? ''}>
                        {building.buildingName}
                      </Select.Option>
                    ))}
                </Select>
                {!!errors.building && <FormErrorMessage>{errors.building.message}</FormErrorMessage>}
              </FormControl>

              <FormControl className="w-full grow shrink">
                <FormLabel>{t('lockers:properties.buildingFloor')}</FormLabel>
                <Select
                  data-test="create-lockers-buildingFloors"
                  className="w-full"
                  variant="tertiary"
                  disabled={!buildingFloors || buildingFloors?.length === 0}
                  required={!!buildingFloors && buildingFloors.length > 0}
                  {...register('buildingFloor')}
                >
                  {!!buildingFloors && buildingFloors.length > 1 && (
                    <Select.Option value="">{capitalize(t('common:select'))}...</Select.Option>
                  )}
                  {buildingFloors?.map((floor) => (
                    <Select.Option key={`cbf-${floor}`} value={floor}>
                      {floor}
                    </Select.Option>
                  ))}
                </Select>
                {!!selectedBuilding && (!buildingFloors || buildingFloors?.length === 0) && (
                  <FormHelperText>{t('lockers:no_floors')}</FormHelperText>
                )}
                {!!errors.buildingFloor && <FormErrorMessage>{errors.buildingFloor.message}</FormErrorMessage>}
              </FormControl>
            </div>

            <div className="flex gap-24 justify-start">
              <FormControl>
                <FormLabel>{t('lockers:number_of_new_lockers')}</FormLabel>
                <Input
                  data-test="create-lockers-lockercount"
                  min="1"
                  type="number"
                  max="99"
                  hideExtra={false}
                  value={lockerCount}
                  onChange={(e) => setLockerCount(e.target.value)}
                />
              </FormControl>
              <FormControl fieldset>
                <FormLabel>{t('lockers:properties.lockType')}</FormLabel>
                <RadioButton.Group inline>
                  <RadioButton value="Kodlås" {...register('lockType')}>
                    {t('lockers:properties.lockType-code')}
                  </RadioButton>
                  <RadioButton value="Hänglås" {...register('lockType')}>
                    {t('lockers:properties.lockType-key')}
                  </RadioButton>
                </RadioButton.Group>
              </FormControl>
            </div>
            {numberOFLockers > 1 && (
              <Checkbox
                data-test="create-lockers-autonames"
                checked={autoNames}
                onChange={(e) => setAutoNames(e.target.checked)}
              >
                {t('lockers:auto_lockernames')}
              </Checkbox>
            )}
            <FormControl fieldset className="w-full flex flex-col gap-12">
              <FormLabel>{t('lockers:properties.name')}</FormLabel>
              <Divider />
              <div data-test="create-lockers-lockernames" className="w-full flex flex-row gap-x-24 gap-y-12 flex-wrap">
                {lockerCount &&
                  Array.from(Array(numberOFLockers).keys()).map((number, index) => (
                    <Input
                      data-test={`create-lockers-lockername-${index}`}
                      required
                      key={`cln-${number}`}
                      type="text"
                      disabled={autoNames && index !== 0}
                      className="w-[9rem]"
                      aria-label={`${t('lockers:properties.name')} ${number + 1}`}
                      {...register(`newLockerNames.${index}`)}
                    ></Input>
                  ))}
              </div>
              <Divider />
            </FormControl>
          </Dialog.Content>
          <Dialog.Buttons className="justify-evenly">
            <Button variant="secondary" onClick={() => handleClose()} className="w-full grow shrink">
              {capitalize(t('common:cancel'))}
            </Button>
            <Button
              data-test="create-lockers-submit"
              variant="primary"
              color="vattjom"
              type="submit"
              className="w-full grow shrink"
            >
              {capitalize(t('common:save'))}
            </Button>
          </Dialog.Buttons>
        </form>
      </FormProvider>
    </Dialog>
  );
};
