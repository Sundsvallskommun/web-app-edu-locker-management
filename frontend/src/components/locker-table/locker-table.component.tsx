import { SchoolLocker } from '@data-contracts/backend/data-contracts';
import { LockerOrderByType, OrderDirectionType } from '@interfaces/locker.interface';
import { useLockers } from '@services/locker-service';
import { Button, Checkbox, Label, SortMode, Spinner, Table } from '@sk-web-gui/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';
import { AssignLockerDialog } from './components/assign-locker-dialog.component';
import { EditCodeLockDialog } from './components/edit-locker-dialog/components/edit-codelock-dialog.component';
import { EditLockerDialog } from './components/edit-locker-dialog/edit-locker-dialog.component';
import { LockerTableMultiplePopup } from './components/locker-table-multiple-popup.component';
import { LockerTableSinglePopup } from './components/locker-table-single-popup.component';
import { UnassignLockerDialog } from './components/unassign-locker-dialog.component';
import { LockerTableFooter } from './locker-table-footer.component';
import LoaderFullScreen from '@components/loader/loader-fullscreen';

export const LockerTable: React.FC = () => {
  const [unassign, setUnassign] = useState<SchoolLocker[]>([]);
  const [assign, setAssign] = useState<SchoolLocker | null>(null);
  const [edit, setEdit] = useState<SchoolLocker | null>(null);
  const [editCodeLock, setEditCodeLock] = useState<SchoolLocker | null>(null);
  const {
    data,
    totalPages,
    pageNumber,
    loaded,
    loading,
    refresh,
    orderBy,
    setOrderBy,
    orderDirection,
    setOrderDirection,
    setPageNumber,
    pageSize,
    setPageSize,
  } = useLockers();
  const sortOrder = SortMode[orderDirection];
  const { watch, register, setValue } = useForm<{ lockers: string[] }>({ defaultValues: { lockers: [] } });

  const [rowHeight, setRowHeight] = useState<'normal' | 'dense'>('normal');
  const selectedLockers = watch('lockers');

  const { t } = useTranslation();

  const handleSorting = (column: LockerOrderByType) => {
    if (orderBy !== column) {
      setOrderBy(column);
    } else {
      setOrderDirection(sortOrder === SortMode.DESC ? 'ASC' : 'DESC');
    }
  };

  const isIndeterminate = selectedLockers.length !== pageSize && selectedLockers.length > 0;

  const handleSelectAll = () => {
    if (selectedLockers.length < pageSize) {
      setValue(
        'lockers',
        data.map((locker) => locker.lockerId)
      );
    } else {
      setValue('lockers', []);
    }
  };

  useEffect(() => {
    const newLockers = [...selectedLockers].filter((lockerId) =>
      data.map((locker) => locker.lockerId).includes(lockerId)
    );
    setValue('lockers', newLockers);
  }, [data]);

  const handlePageSize = (pageSize: number) => {
    setPageSize(pageSize);
  };

  const handleCloseEditCodeLock = () => {
    refresh();
    setEditCodeLock(null);
  };

  return data.length > 0 ?
      <div className="relative">
        {loading && (
          <div className="flex justify-center items-center absolute top-0 bottom-0 left-0 right-0 place-content-center z-10">
            <Spinner />
          </div>
        )}

        <Table background scrollable={'x'} dense={rowHeight === 'dense'} aria-busy={loading}>
          <caption className="sr-only">
            {t('lockers:name_other')}. {t('common:page_count', { page: pageNumber, total: totalPages })}
          </caption>
          <Table.Header>
            <Table.HeaderColumn data-test="locker-table-select-all">
              <Checkbox
                indeterminate={isIndeterminate}
                checked={selectedLockers.length > 0}
                onClick={() => handleSelectAll()}
              />
            </Table.HeaderColumn>
            <Table.HeaderColumn>
              <Table.SortButton
                data-test="locker-table-sort-name"
                isActive={orderBy === 'Name'}
                sortOrder={sortOrder}
                onClick={() => handleSorting('Name')}
              >
                {t('lockers:properties.name')}
              </Table.SortButton>
            </Table.HeaderColumn>
            <Table.HeaderColumn>
              <Table.SortButton
                data-test="locker-table-sort-building"
                isActive={orderBy === 'Building'}
                sortOrder={sortOrder}
                onClick={() => handleSorting('Building')}
              >
                {t('lockers:properties.building')}
              </Table.SortButton>
            </Table.HeaderColumn>
            <Table.HeaderColumn>
              <Table.SortButton
                data-test="locker-table-sort-floor"
                isActive={orderBy === 'BuildingFloor'}
                sortOrder={sortOrder}
                onClick={() => handleSorting('BuildingFloor')}
              >
                {t('lockers:properties.buildingFloor')}
              </Table.SortButton>
            </Table.HeaderColumn>
            <Table.HeaderColumn>
              <Table.SortButton
                data-test="locker-table-sort-status"
                isActive={orderBy === 'PupilName'}
                sortOrder={sortOrder}
                onClick={() => handleSorting('PupilName')}
              >
                {t('lockers:properties.status')}
              </Table.SortButton>
            </Table.HeaderColumn>
            <Table.HeaderColumn>
              <Table.SortButton
                data-test="locker-table-sort-lock"
                isActive={orderBy === 'CodeLockId'}
                sortOrder={sortOrder}
                onClick={() => handleSorting('CodeLockId')}
              >
                {t('lockers:properties.lock')}
              </Table.SortButton>
            </Table.HeaderColumn>
            <Table.HeaderColumn>
              <Table.SortButton
                data-test="locker-table-sort-code"
                isActive={orderBy === 'ActiveCodeId'}
                sortOrder={sortOrder}
                onClick={() => handleSorting('ActiveCodeId')}
              >
                {t('lockers:properties.code')}
              </Table.SortButton>
            </Table.HeaderColumn>
            <Table.HeaderColumn className="flex justify-end" data-test="locker-table-multi-context">
              <LockerTableMultiplePopup
                selectedLockers={selectedLockers.map((lockerid) => data.find((locker) => locker.lockerId === lockerid))}
                onUnassign={setUnassign}
              />
            </Table.HeaderColumn>
          </Table.Header>
          <Table.Body className="overflow-visible" data-test="locker-table-body">
            {data.map((locker, index) => (
              <Table.Row key={`locker-${locker.lockerId}-${index}`}>
                <Table.Column>
                  <Checkbox {...register('lockers')} value={locker.lockerId} />
                </Table.Column>
                <Table.Column data-test={`locker-table-col-name-index-${index}`}>
                  <Button variant="link" onClick={() => setEdit(locker)}>
                    {locker.name}
                  </Button>
                </Table.Column>
                <Table.Column data-test={`locker-table-col-building-index-${index}`}>{locker.building}</Table.Column>
                <Table.Column data-test={`locker-table-col-floor-index-${index}`}>{locker.buildingFloor}</Table.Column>
                <Table.Column data-test={`locker-table-col-status-index-${index}`}>
                  {locker?.assignedTo?.pupilName ?? (
                    <Label
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
                  )}
                </Table.Column>
                <Table.Column data-test={`locker-table-col-lock-index-${index}`}>
                  {locker.lockType === 'Kodlås' ?
                    locker?.codeLockId ?
                      <Button variant="link" onClick={() => setEditCodeLock(locker)}>
                        {locker.codeLockId}
                      </Button>
                    : `${t('lockers:properties.lockType-code')} (${t('common:missing')})`
                  : !locker?.lockType || locker.lockType === 'Inget' ?
                    <Label color="error">{t('lockers:no_lock')}</Label>
                  : locker.lockType}
                </Table.Column>
                <Table.Column data-test={`locker-table-col-code-index-${index}`}>
                  {locker.lockType === 'Kodlås' ?
                    locker.activeCodeId ?
                      <>
                        {t('lockers:properties.code')} {locker.activeCodeId} - {locker.activeCode}
                      </>
                    : <Label color="error">{t('lockers:no_code')}</Label>
                  : '-'}
                </Table.Column>
                <Table.Column data-test={`locker-table-col-context-index-${index}`} className="flex justify-end">
                  <div className="relative">
                    <LockerTableSinglePopup
                      locker={locker}
                      onUnassign={(locker) => setUnassign([locker])}
                      onAssign={setAssign}
                      onEdit={setEdit}
                    />
                  </div>
                </Table.Column>
              </Table.Row>
            ))}
          </Table.Body>
          <Table.Footer>
            <LockerTableFooter
              pageSize={pageSize}
              setPageSize={handlePageSize}
              currentPage={pageNumber}
              setCurrentPage={setPageNumber}
              pages={totalPages}
              rowHeight={rowHeight}
              setRowHeight={setRowHeight}
            />
          </Table.Footer>
        </Table>

        <UnassignLockerDialog show={unassign.length > 0} lockers={unassign} onClose={() => setUnassign([])} />
        <AssignLockerDialog show={!!assign} locker={assign} onClose={() => setAssign(null)} />
        <EditLockerDialog show={!!edit} locker={edit} onClose={() => setEdit(null)} />
        {editCodeLock && (
          <EditCodeLockDialog show={!!editCodeLock} locker={editCodeLock} onCloseEdit={handleCloseEditCodeLock} />
        )}
      </div>
    : <div className="w-full flex justify-center py-32">
        <h2 className="text-h4-sm md:text-h4-md xl:text-h4-lg">
          {capitalize(t('common:no_resources', { resources: t('lockers:name_zero') }))}
        </h2>
      </div>;
};
