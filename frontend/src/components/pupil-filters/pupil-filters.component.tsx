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
  const { groupId } = filter;

  const handleNameFilter = (event: ChangeEvent<HTMLInputElement>) => {
    const nameQueryFilter = event.target.value;
    setFilter({ ...filter, nameQueryFilter });
  };

  const resetNameFilter = () => {
    const nameQueryFilter = '';
    setFilter({ ...filter, nameQueryFilter });
  };

  const setGroupId = (groupId: string) => {
    setFilter({ ...filter, groupId });
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
        .find((school) => school.unitGUID === schoolUnit)
        //Remove subgroups
        ?.groups.filter((group) => !group?.isVKlassGroup && !group?.code && !group?.name?.includes('/'))
    : undefined;

  return (
    <>
      <div className="flex gap-24 max-lg:flex-wrap">
        {loaded && data.length > 1 && (
          <FormControl>
            <FormLabel>{capitalize(t('schools:name'))}</FormLabel>
            <Select
              data-test="pupils-filter-schoolunit"
              size="md"
              variant="tertiary"
              value={schoolUnit}
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
        <FormControl>
          <FormLabel>{capitalize(t('schools:properties.group'))}</FormLabel>
          <Select
            data-test="pupils-filter-class"
            size="md"
            variant="tertiary"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          >
            <Select.Option value="">{capitalize(t('common:all'))}</Select.Option>
            {classes &&
              classes.map((group) => (
                <Select.Option value={group.groupId} key={group.groupId}>
                  {group?.name}
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
        placeholder={t('pupils:search')}
        onReset={() => resetNameFilter()}
        value={filter?.nameQueryFilter ?? ''}
        onChange={handleNameFilter}
      ></SearchField>
    </>
  );
};
