import { useLockers } from '@services/locker-service';
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
  const resetNameFilter = () => {
    const nameQueryFilter = '';
    setFilter({ ...filter, nameQueryFilter });
  };

  const buildings = data?.find((school) => school.unitGUID === schoolUnit)?.buildings;
  const buildingFloors = buildings?.find((building) => building.buildingName === filter?.building)?.floors;

  return (
    <>
      <div className="flex gap-24">
        {loaded && data.length > 1 && (
          <FormControl>
            <FormLabel>{capitalize(t('schools:name'))}</FormLabel>
            <Select
              data-test="lockers-filter-schoolunit"
              size="sm"
              variant="tertiary"
              value={schoolUnit}
              onChange={(e) => setSchoolUnit(e.target.value)}
            >
              {data.map((school) => (
                <Select.Option value={school.unitGUID} key={school.unitGUID}>
                  {school.unitCode || school.unitName}
                </Select.Option>
              ))}
            </Select>
          </FormControl>
        )}
        <FormControl>
          <FormLabel>{capitalize(t('lockers:properties.building'))}</FormLabel>
          <Select
            size="sm"
            variant="tertiary"
            value={filter?.building}
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
        <FormControl>
          <FormLabel>{capitalize(t('lockers:properties.buildingFloor'))}</FormLabel>
          <Select
            disabled={!filter?.building}
            size="sm"
            variant="tertiary"
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
      </div>
      <SearchField
        size="md"
        showSearchButton={false}
        placeholder={t('lockers:search')}
        onReset={() => resetNameFilter()}
        value={filter?.nameQueryFilter}
        onChange={handleNameFilter}
      ></SearchField>
    </>
  );
};