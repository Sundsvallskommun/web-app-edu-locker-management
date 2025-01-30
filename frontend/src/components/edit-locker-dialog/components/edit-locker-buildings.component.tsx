import { SchoolLocker } from '@data-contracts/backend/data-contracts';
import { useSchools } from '@services/school-service';
import { FormControl, FormLabel, Select } from '@sk-web-gui/react';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const EditLockerBuildings: React.FC = () => {
  const { register, watch, setValue } = useFormContext<SchoolLocker>();
  const { t } = useTranslation();
  const unitId = watch('unitId');
  const { data, loaded } = useSchools();
  const selectedBuilding = watch('building');
  const selectedBuildingFloors = watch('buildingFloor');

  const buildings = data?.find((school) => school.unitGUID === unitId)?.buildings;
  const buildingFloors = buildings?.find((building) => building.buildingName === selectedBuilding)?.floors;

  useEffect(() => {
    if (!buildingFloors?.includes(selectedBuildingFloors)) {
      setValue('buildingFloor', buildingFloors?.[0] || '');
    }
  }, [buildingFloors]);

  return (
    loaded && (
      <div className="flex gap-24 justify-evenly">
        <FormControl className="w-full grow shrink">
          <FormLabel>{t('lockers:properties.building')}</FormLabel>
          <Select
            size="md"
            className="w-full"
            variant="tertiary"
            data-test="locker-edit-building"
            {...register('building')}
          >
            {buildings &&
              buildings.map((building) => (
                <Select.Option value={building.buildingName} key={building.buildingName}>
                  {building.buildingName}
                </Select.Option>
              ))}
          </Select>
        </FormControl>
        <FormControl className="w-full grow shrink" disabled={!buildingFloors || buildingFloors?.length < 1}>
          <FormLabel>{t('lockers:properties.buildingFloor')}</FormLabel>
          <Select
            size="md"
            className="w-full"
            variant="tertiary"
            {...register('buildingFloor')}
            data-test="locker-edit-buildingFloors"
          >
            {buildingFloors &&
              buildingFloors.map((floor) => (
                <Select.Option value={floor} key={floor}>
                  {floor}
                </Select.Option>
              ))}
          </Select>
        </FormControl>
      </div>
    )
  );
};
