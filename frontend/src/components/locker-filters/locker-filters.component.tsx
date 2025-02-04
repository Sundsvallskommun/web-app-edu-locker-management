import { LockerStatus } from '@interfaces/locker.interface';
import { useLockers } from '@services/locker-service/use-lockers';
import { useSchools } from '@services/school-service';
import { FormControl, FormLabel, SearchField, Select } from '@sk-web-gui/react';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

export const LockerFilters: React.FC = () => {
  const { filter, setFilter, schoolUnit, setSchoolUnit } = useLockers();
  const { data, loaded } = useSchools();
  const { t } = useTranslation();

  const handleBuilding = (event: ChangeEvent<HTMLSelectElement>) => {
    const building = event.target.value;
    setFilter({ ...filter, building, buildingFloor: '' });
  };

  const handleBuildingFloor = (event: ChangeEvent<HTMLSelectElement>) => {
    const buildingFloor = event.target.value;
    setFilter({ ...filter, buildingFloor });
  };

  const handleNameFilter = (event: ChangeEvent<HTMLInputElement>) => {
    const nameQueryFilter = event.target.value;
    setFilter({ ...filter, nameQueryFilter });
  };

  const handleStatus = (event: ChangeEvent<HTMLSelectElement>) => {
    const status = event.target.value as LockerStatus;
    setFilter({ ...filter, status });
  };

  const resetNameFilter = () => {
    const nameQueryFilter = '';
    setFilter({ ...filter, nameQueryFilter });
  };
  const buildings = data ? data?.find((school) => school.unitGUID === schoolUnit)?.buildings : null;
  const buildingFloors =
    buildings ? buildings?.find((building) => building.buildingName === filter?.building)?.floors : null;

  return (
    <>
      <div className="flex gap-24 max-xl:flex-wrap max-xl:w-full shrink grow">
        {loaded && data.length > 1 && (
          <FormControl className="max-xl:grow shrink">
            <FormLabel>{capitalize(t('schools:name'))}</FormLabel>
            <Select
              data-test="lockers-filter-schoolunit"
              size="md"
              variant="tertiary"
              value={schoolUnit}
              className="w-full"
              onChange={(e) => setSchoolUnit(e.target.value)}
            >
              {data.map((school) => (
                <Select.Option value={school.unitGUID} key={school.unitGUID}>
                  {school.unitName || school.unitCode}
                </Select.Option>
              ))}
            </Select>
          </FormControl>
        )}
        <FormControl className="max-xl:grow shrink">
          <FormLabel>{capitalize(t('lockers:properties.building'))}</FormLabel>
          <Select
            size="md"
            variant="tertiary"
            value={filter?.building}
            className="w-full xl:w-[16rem] grow shrink"
            onChange={handleBuilding}
            data-test="lockers-filter-building"
          >
            <Select.Option value="">{capitalize(t('common:all'))}</Select.Option>
            {buildings &&
              buildings.map((building) => (
                <Select.Option value={building.buildingName} key={building.buildingName}>
                  {building.buildingName}
                </Select.Option>
              ))}
          </Select>
        </FormControl>
        <FormControl className="max-xl:grow shrink">
          <FormLabel>{capitalize(t('lockers:properties.buildingFloor'))}</FormLabel>
          <Select
            disabled={!filter?.building}
            size="md"
            variant="tertiary"
            className="w-full xl:w-[16rem] grow shrink"
            value={filter?.buildingFloor}
            onChange={handleBuildingFloor}
            data-test="lockers-filter-buildingFloors"
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
        <FormControl className="max-xl:grow shrink">
          <FormLabel>{capitalize(t('lockers:properties.status'))}</FormLabel>
          <Select
            size="md"
            variant="tertiary"
            className="w-full xl:w-[16rem] grow shrink"
            value={filter?.status}
            onChange={handleStatus}
            data-test="lockers-filter-status"
          >
            <Select.Option value="">{capitalize(t('common:all'))}</Select.Option>
            <Select.Option value={'Tilldelad'}>{t('lockers:status.Tilldelad')}</Select.Option>
            <Select.Option value="Ledigt">{t('lockers:status.Ledigt')}</Select.Option>
            <Select.Option value="Ska Tömmas">{t('lockers:status.SkaTommas')}</Select.Option>
          </Select>
        </FormControl>
      </div>
      <SearchField
        size="md"
        className="max-xl:w-full max-xl:grow shrink"
        showSearchButton={false}
        placeholder={t('lockers:search')}
        onReset={() => resetNameFilter()}
        value={filter?.nameQueryFilter ?? ''}
        onChange={handleNameFilter}
      ></SearchField>
    </>
  );
};
