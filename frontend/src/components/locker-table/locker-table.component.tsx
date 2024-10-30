import {
  SchoolLocker,
  SchoolLockerQueryParamsOrderByEnum,
  SchoolLockerQueryParamsOrderDirectionEnum,
} from '@data-contracts/backend/data-contracts';
import { useLockers } from '@services/locker-service';
import { Button, Checkbox, Label, SortMode, Spinner, Table } from '@sk-web-gui/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';
import { LockerTableMultiplePopup } from './components/locker-table-multiple-popup.component';
import { LockerTableSinglePopup } from './components/locker-table-single-popup.component';
import { UnassignLockerDialog } from './components/unassign-locker-dialog.component';
import { LockerTableFooter } from './locker-table-footer.component';

export const LockerTable: React.FC = () => {
  const [unassign, setUnassign] = useState<SchoolLocker[]>([]);
  const [sorting, setSorting] = useState<SchoolLockerQueryParamsOrderByEnum>(SchoolLockerQueryParamsOrderByEnum.Name);
  const [sortOdrer, setSortOrder] = useState<SortMode>(SortMode.ASC);
  const orderDirection =
    sortOdrer === SortMode.DESC ?
      SchoolLockerQueryParamsOrderDirectionEnum.DESC
    : SchoolLockerQueryParamsOrderDirectionEnum.ASC;
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const { data, totalPages, pageNumber, loading } = useLockers({
    OrderBy: sorting,
    OrderDirection: orderDirection,
    PageSize: pageSize,
    PageNumber: page,
  });
  const { watch, register, setValue } = useForm<{ lockers: string[] }>({ defaultValues: { lockers: [] } });

  const [rowHeight, setRowHeight] = useState<'normal' | 'dense'>('normal');
  const selectedLockers = watch('lockers');

  const { t } = useTranslation();

  const handleSorting = (column: SchoolLockerQueryParamsOrderByEnum) => {
    if (sorting !== column) {
      setSortOrder(SortMode.ASC);
      setSorting(column);
      setPage(1);
    } else {
      setSortOrder((order) => (order === SortMode.DESC ? SortMode.ASC : SortMode.DESC));
    }
  };

  useEffect(() => {
    if (page !== pageNumber) {
      setPage(pageNumber);
    }
  }, [pageNumber]);

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
    setPage(1);
    setPageSize(pageSize);
  };

  return data.length > 0 ?
      <div className="relative">
        {loading && (
          <div className="flex justify-center items-center absolute w-screen top-0 bottom-0 left-0 right-0 place-content-center z-10">
            <Spinner />
          </div>
        )}
        <Table background scrollable={false} dense={rowHeight === 'dense'}>
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
                isActive={sorting === SchoolLockerQueryParamsOrderByEnum.Name}
                sortOrder={sortOdrer}
                onClick={() => handleSorting(SchoolLockerQueryParamsOrderByEnum.Name)}
              >
                {t('lockers:properties.name')}
              </Table.SortButton>
            </Table.HeaderColumn>
            <Table.HeaderColumn>
              <Table.SortButton
                data-test="locker-table-sort-building"
                isActive={sorting === SchoolLockerQueryParamsOrderByEnum.Building}
                sortOrder={sortOdrer}
                onClick={() => handleSorting(SchoolLockerQueryParamsOrderByEnum.Building)}
              >
                {t('lockers:properties.building')}
              </Table.SortButton>
            </Table.HeaderColumn>
            <Table.HeaderColumn>
              <Table.SortButton
                data-test="locker-table-sort-floor"
                isActive={sorting === SchoolLockerQueryParamsOrderByEnum.BuildingFloor}
                sortOrder={sortOdrer}
                onClick={() => handleSorting(SchoolLockerQueryParamsOrderByEnum.BuildingFloor)}
              >
                {t('lockers:properties.buildingFloor')}
              </Table.SortButton>
            </Table.HeaderColumn>
            <Table.HeaderColumn>
              <Table.SortButton
                data-test="locker-table-sort-status"
                isActive={sorting === SchoolLockerQueryParamsOrderByEnum.PupilName}
                sortOrder={sortOdrer}
                onClick={() => handleSorting(SchoolLockerQueryParamsOrderByEnum.PupilName)}
              >
                {t('lockers:properties.status')}
              </Table.SortButton>
            </Table.HeaderColumn>
            <Table.HeaderColumn>
              <Table.SortButton
                data-test="locker-table-sort-lock"
                isActive={sorting === SchoolLockerQueryParamsOrderByEnum.CodeLockId}
                sortOrder={sortOdrer}
                onClick={() => handleSorting(SchoolLockerQueryParamsOrderByEnum.CodeLockId)}
              >
                {t('lockers:properties.lock')}
              </Table.SortButton>
            </Table.HeaderColumn>
            <Table.HeaderColumn>
              <Table.SortButton
                data-test="locker-table-sort-code"
                isActive={sorting === SchoolLockerQueryParamsOrderByEnum.ActiveCodeId}
                sortOrder={sortOdrer}
                onClick={() => handleSorting(SchoolLockerQueryParamsOrderByEnum.ActiveCodeId)}
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
                  <Button variant="link">{locker.name}</Button>
                </Table.Column>
                <Table.Column data-test={`locker-table-col-building-index-${index}`}>{locker.building}</Table.Column>
                <Table.Column data-test={`locker-table-col-floor-index-${index}`}>{locker.buildingFloor}</Table.Column>
                <Table.Column data-test={`locker-table-col-status-index-${index}`}>
                  {locker?.assignedTo?.pupilName ??
                    (locker?.status ?
                      <Label inverted color="warning">
                        {locker.status}
                      </Label>
                    : <Label inverted color="success">
                        {t('lockers:empty')}
                      </Label>)}
                </Table.Column>
                <Table.Column data-test={`locker-table-col-lock-index-${index}`}>
                  {locker.lockType === 'Kodlås' ?
                    <Button variant="link">{locker.codeLockId}</Button>
                  : locker?.lockType ?
                    locker.lockType
                  : <Label color="error">{t('lockers:no_lock')}</Label>}
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
                    <LockerTableSinglePopup locker={locker} onUnassign={(locker) => setUnassign([locker])} />
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
              setCurrentPage={setPage}
              pages={totalPages}
              rowHeight={rowHeight}
              setRowHeight={setRowHeight}
            />
          </Table.Footer>
        </Table>
        <UnassignLockerDialog show={unassign.length > 0} lockers={unassign} onClose={() => setUnassign([])} />
      </div>
    : <div className="w-full flex justify-center py-32">
        <h2 className="text-h4-sm md:text-h4-md xl:text-h4-lg">
          {capitalize(t('common:no_resources', { resources: t('lockers:name_zero') }))}
        </h2>
      </div>;
};
