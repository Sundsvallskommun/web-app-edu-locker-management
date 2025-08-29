import { PupilsFilter } from '@data-contracts/backend/data-contracts';
import { usePupils } from '@services/pupil-service';
import { useSchools } from '@services/school-service';
import { Checkbox, FormControl, FormLabel, SearchField, Select } from '@sk-web-gui/react';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

export const PupilFilters: React.FC = () => {
  const { filter, setFilter, schoolUnit, setSchoolUnit } = usePupils();
  const { data, loaded } = useSchools();
  const { t } = useTranslation();
  const { unitId } = filter;

  const handleNameFilter = (event: ChangeEvent<HTMLInputElement>) => {
    const nameQueryFilter = event.target.value;
    setFilter({ ...filter, nameQueryFilter });
  };

  const resetNameFilter = () => {
    const nameQueryFilter = '';
    setFilter({ ...filter, nameQueryFilter });
  };

  const setUnitId = (unitId: string) => {
    setFilter({ ...filter, unitId });
  };

  const handleCheckLockers = (value: PupilsFilter['assignedFilter'], checked: boolean) => {
    if (checked) {
      if (filter?.assignedFilter && filter?.assignedFilter !== value) {
        setFilter({ ...filter, assignedFilter: 'All' });
      } else {
        setFilter({ ...filter, assignedFilter: value });
      }
    } else {
      if (filter?.assignedFilter === 'All') {
        setFilter({ ...filter, assignedFilter: value === 'With' ? 'Without' : 'With' });
      } else {
        setFilter({ ...filter, assignedFilter: undefined });
      }
    }
  };

  const assignFilter = filter?.assignedFilter === 'All' ? ['With', 'Without'] : [filter?.assignedFilter];
  const classes =
    data ?
      data
        .find((school) => school.schoolId === schoolUnit)
        //Remove subgroups
        ?.schoolUnits?.filter((unit) => !unit?.unitName?.includes('/'))
    : undefined;

  return (
    <>
      <div className="flex gap-24 max-xl:flex-wrap max-xl:w-full shrink grow">
        {loaded && data.length > 1 && (
          <FormControl className="max-xl:grow shrink">
            <FormLabel>{capitalize(t('schools:name'))}</FormLabel>
            <Select
              data-test="pupils-filter-schoolunit"
              size="md"
              variant="tertiary"
              value={schoolUnit}
              className="w-full"
              onChange={(e) => setSchoolUnit(e.target.value)}
            >
              {data.map((school) => (
                <Select.Option value={school.schoolId} key={school.schoolId}>
                  {school.schoolName}
                </Select.Option>
              ))}
            </Select>
          </FormControl>
        )}
        <FormControl className="max-xl:grow shrink">
          <FormLabel>{capitalize(t('schools:properties.group'))}</FormLabel>
          <Select
            data-test="pupils-filter-class"
            size="md"
            variant="tertiary"
            className="w-full xl:w-[16rem] grow shrink"
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
          >
            <Select.Option value="">{capitalize(t('common:all'))}</Select.Option>
            {classes &&
              classes.map((unit) => (
                <Select.Option value={unit.unitId} key={unit.unitId}>
                  {unit?.unitName}
                </Select.Option>
              ))}
          </Select>
        </FormControl>
        <FormControl fieldset>
          <FormLabel>{capitalize(t('pupils:properties.assigned_filter'))}</FormLabel>
          <Checkbox.Group direction="row" className="sk-form-checkbox-group mb-0">
            <Checkbox
              data-test="pupils-filter-locker-with"
              value="With"
              checked={assignFilter.includes('With')}
              onChange={(e) => handleCheckLockers('With', e.target.checked)}
            >
              {capitalize(t('pupils:properties.lockers_with'))}
            </Checkbox>
            <Checkbox
              data-test="pupils-filter-locker-without"
              value="Without"
              checked={assignFilter.includes('Without')}
              onChange={(e) => handleCheckLockers('Without', e.target.checked)}
            >
              {capitalize(t('pupils:properties.lockers_without'))}
            </Checkbox>
          </Checkbox.Group>
        </FormControl>
      </div>
      <SearchField
        size="md"
        showSearchButton={false}
        className="max-xl:w-full max-xl:grow shrink"
        placeholder={t('pupils:search')}
        onReset={() => resetNameFilter()}
        value={filter?.nameQueryFilter ?? ''}
        onChange={handleNameFilter}
      ></SearchField>
    </>
  );
};
