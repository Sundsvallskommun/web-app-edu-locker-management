import { PupilOrderByType } from '@interfaces/pupil.interface';
import { usePupils } from '@services/pupil-service';
import { Button, Checkbox, Label, SortMode, Spinner, Table } from '@sk-web-gui/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';
import { PupilTableFooter } from './pupil-table-footer.component';
import { PupilTableMultiplePopup } from './components/pupil-table-multiple-popup.component';
import { PupilTableSinglePopup } from './components/pupil-table-single-popup.component';
import dayjs from 'dayjs';
import { Pupil } from '@data-contracts/backend/data-contracts';
import { UnassignPupilsDialog } from './components/unassign-pupils-dialog.component';
import { EditLockerDialog } from '@components/edit-locker-dialog/edit-locker-dialog.component';
import { AssignPupilDialog } from './components/assign-pupil-dialog.component';
import { useLocker } from '@services/locker-service/use-locker';

export const PupilTable: React.FC = () => {
  const {
    data,
    totalPages,
    pageNumber,
    setPageNumber,
    loading,
    pageSize,
    setPageSize,
    orderDirection,
    setOrderDirection,
    orderBy,
    setOrderBy,
    refresh,
    schoolUnit,
  } = usePupils();
  const { watch, register, setValue } = useForm<{ pupils: string[] }>({ defaultValues: { pupils: [] } });
  const sortOrder: SortMode = SortMode[orderDirection];
  const [unassign, setUnassign] = useState<Pupil[]>([]);
  const [assign, setAssign] = useState<Pupil[]>([]);
  const [edit, setEdit] = useState<{ lockerName: string; lockerId: string } | null>(null);
  const [rowHeight, setRowHeight] = useState<'normal' | 'dense'>('normal');
  const selectedPupils = watch('pupils');

  const {
    data: editData,
    loaded: editLoaded,
    loading: editLoading,
  } = useLocker(schoolUnit, edit?.lockerId, edit?.lockerName);

  const { t } = useTranslation();

  const handleSorting = (column: PupilOrderByType) => {
    if (orderBy !== column) {
      setOrderBy(column);
    } else {
      setOrderDirection(sortOrder === SortMode.DESC ? 'ASC' : 'DESC');
    }
  };

  const isIndeterminate = selectedPupils.length !== pageSize && selectedPupils.length > 0;

  const handleSelectAll = () => {
    if (selectedPupils.length < pageSize) {
      setValue(
        'pupils',
        data.map((pupil) => pupil.personId)
      );
    } else {
      setValue('pupils', []);
    }
  };

  const closeModals = () => {
    setUnassign([]);
    setAssign([]);
    setEdit(null);
    refresh();
  };

  useEffect(() => {
    const newPupils = [...selectedPupils].filter((personId) => data.map((pupil) => pupil.personId).includes(personId));
    setValue('pupils', newPupils);
  }, [data]);

  return data.length > 0 ?
      <div className="relative">
        {loading && (
          <div className="flex justify-center items-center absolute top-0 bottom-0 left-0 right-0 place-content-center z-10">
            <Spinner />
          </div>
        )}
        <Table background scrollable={'x'} dense={rowHeight === 'dense'}>
          <caption className="sr-only">
            {t('pupils:name_other')}. {t('common:page_count', { page: pageNumber, total: totalPages })}
          </caption>
          <Table.Header>
            <Table.HeaderColumn data-test="pupil-table-select-all">
              <Checkbox
                indeterminate={isIndeterminate}
                checked={selectedPupils.length > 0}
                onClick={() => handleSelectAll()}
              />
            </Table.HeaderColumn>
            <Table.HeaderColumn>
              <Table.SortButton
                data-test="pupil-table-sort-name"
                isActive={orderBy === 'Name'}
                sortOrder={sortOrder}
                onClick={() => handleSorting('Name')}
              >
                {capitalize(t('pupils:properties.name'))}
              </Table.SortButton>
            </Table.HeaderColumn>
            <Table.HeaderColumn>
              <Table.SortButton
                data-test="pupil-table-sort-birthdate"
                isActive={orderBy === 'BirthDate'}
                sortOrder={sortOrder}
                onClick={() => handleSorting('BirthDate')}
              >
                {capitalize(t('pupils:properties.birthDate'))}
              </Table.SortButton>
            </Table.HeaderColumn>
            <Table.HeaderColumn>
              <Table.SortButton
                data-test="pupil-table-sort-class"
                isActive={orderBy === 'ClassName'}
                sortOrder={sortOrder}
                onClick={() => handleSorting('ClassName')}
              >
                {capitalize(t('pupils:properties.className'))}
              </Table.SortButton>
            </Table.HeaderColumn>

            <Table.HeaderColumn>
              <Table.SortButton
                data-test="pupil-table-sort-teacher"
                isActive={orderBy === 'TeacherGivenName'}
                sortOrder={sortOrder}
                onClick={() => handleSorting('TeacherGivenName')}
              >
                {capitalize(t('pupils:properties.teachers'))}
              </Table.SortButton>
            </Table.HeaderColumn>

            <Table.HeaderColumn>
              <Table.SortButton
                data-test="pupil-table-sort-locker"
                isActive={orderBy === 'LockerName'}
                sortOrder={sortOrder}
                onClick={() => handleSorting('LockerName')}
              >
                {capitalize(t('pupils:properties.lockers'))}
              </Table.SortButton>
            </Table.HeaderColumn>

            <Table.HeaderColumn className="flex justify-end" data-test="pupil-table-multi-context">
              <PupilTableMultiplePopup
                pupils={selectedPupils
                  .map((personId) => data.find((pupil) => pupil.personId === personId))
                  .filter((id) => id !== undefined)}
                onUnassign={setUnassign}
                onAssign={setAssign}
              />
            </Table.HeaderColumn>
          </Table.Header>
          <Table.Body className="overflow-visible" data-test="pupil-table-body">
            {data.map((pupil, index) => (
              <Table.Row key={`pupil-${pupil.personId}-${index}`}>
                <Table.Column>
                  <Checkbox {...register('pupils')} value={pupil.personId} />
                </Table.Column>
                <Table.Column data-test={`pupil-table-col-name-index-${index}`}>
                  <strong>{pupil.name}</strong>
                </Table.Column>
                <Table.Column data-test={`pupil-table-col-birthdate-index-${index}`}>
                  {dayjs(pupil.birthDate).format('YYYY-MM-DD')}
                </Table.Column>
                <Table.Column data-test={`pupil-table-col-className-index-${index}`}>{pupil.className}</Table.Column>
                <Table.Column data-test={`pupil-table-col-teachers-index-${index}`}>
                  {pupil.teachers.map((teacher) => `${teacher.givenname} ${teacher.lastname}`).join(', ')}
                </Table.Column>
                <Table.Column data-test={`pupil-table-col-lockers-index-${index}`}>
                  {pupil?.lockers?.length > 0 ?
                    pupil.lockers.map((locker, index) => (
                      <span key={locker.lockerId}>
                        <span className="flex gap-4 relative">
                          <Button variant="link" onClick={() => setEdit(locker)}>
                            {locker.lockerName}
                          </Button>
                          {index < pupil.lockers.length - 1 ? ',  ' : ''}
                          {edit?.lockerId === locker.lockerId && editLoading && (
                            <div className="absolute flex justify-center right-0 left-0">
                              <Spinner size={1.6} />
                            </div>
                          )}
                        </span>
                      </span>
                    ))
                  : <Label color="error">{capitalize(t('pupils:no_locker'))}</Label>}
                </Table.Column>
                <Table.Column data-test={`pupil-table-col-context-index-${index}`} className="flex justify-end">
                  <div className="relative">
                    <PupilTableSinglePopup
                      pupil={pupil}
                      onUnassign={(pupil) => setUnassign([pupil])}
                      onAssign={(pupil) => setAssign([pupil])}
                    />
                  </div>
                </Table.Column>
              </Table.Row>
            ))}
          </Table.Body>
          <Table.Footer>
            <PupilTableFooter
              pageSize={pageSize}
              setPageSize={setPageSize}
              currentPage={pageNumber}
              setCurrentPage={setPageNumber}
              pages={totalPages}
              rowHeight={rowHeight}
              setRowHeight={setRowHeight}
            />
          </Table.Footer>
        </Table>
        <UnassignPupilsDialog pupils={unassign} show={unassign.length > 0} onClose={closeModals} />
        <AssignPupilDialog show={assign.length > 0} pupils={assign} onClose={closeModals} />
        {editLoaded && (
          <EditLockerDialog show={!!editData && editLoaded && !!edit} locker={editData} onClose={closeModals} />
        )}
      </div>
    : <div className="w-full flex justify-center py-32">
        <h2 className="text-h4-sm md:text-h4-md xl:text-h4-lg">
          {capitalize(t('common:no_resources', { resources: t('pupils:name_zero') }))}
        </h2>
      </div>;
};
