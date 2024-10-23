import { SchoolLocker } from '@data-contracts/backend/data-contracts';
import { Button, Checkbox, Icon, Label, PopupMenu, SortMode, Table } from '@sk-web-gui/react';
import { Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';
import { LockerTableFooter } from './locker-table-footer.component';

interface LockerTableProps {
  data: SchoolLocker[];
}

export const LockerTable: React.FC<LockerTableProps> = ({ data }) => {
  const { watch, register, setValue } = useForm<{ lockers: string[] }>({ defaultValues: { lockers: [] } });
  const [sorting, setSorting] = useState<string>('name');
  const [sortOdrer, setSortOrder] = useState<SortMode>(SortMode.DESC);
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(0);
  const [rowHeight, setRowHeight] = useState<'normal' | 'dense'>('normal');
  const startIndex = page * pageSize + 1;
  const selectedLockers = watch('lockers');
  const pages = Math.ceil(data.length / pageSize);

  const { t } = useTranslation();

  const handleSorting = (column: string) => {
    if (sorting !== column) {
      setSortOrder(SortMode.DESC);
      setSorting(column);
    } else {
      setSortOrder((order) => (order === SortMode.DESC ? SortMode.ASC : SortMode.DESC));
    }
  };

  const sortedData = data.sort((a, b) => {
    const sort = sortOdrer === SortMode.ASC ? -1 : 1;

    switch (sorting) {
      case 'status':
        const astatus = a?.assignedTo?.pupilName || a?.status || t('lockers:empty');
        const bstatus = b?.assignedTo?.pupilName || b?.status || t('lockers:empty');
        return (
          astatus < bstatus ? sort
          : astatus > bstatus ? sort * -1
          : 0
        );

      case 'lock':
        const alock = a?.lockType === 'Kodlås' ? a.codeLockId : a?.lockType || t('lockers:no_lock');
        const block = b?.lockType === 'Kodlås' ? b.codeLockId : b?.lockType || t('lockers:no_lock');
        return (
          alock < block ? sort
          : alock > block ? sort * -1
          : 0
        );
      case 'code':
        const acode =
          a?.lockType === 'Kodlås' ?
            a.activeCodeId ?
              `${a.activeCodeId} - ${a.activeCode}`
            : t('lockers:no_code')
          : '-';
        const bcode =
          b?.lockType === 'Kodlås' ?
            b.activeCodeId ?
              `${b.activeCodeId} - ${b.activeCode}`
            : t('lockers:no_code')
          : '-';
        return (
          acode < bcode ? sort
          : acode > bcode ? sort * -1
          : 0
        );
      default:
        return (
          a[sorting] < b[sorting] ? sort
          : a[sorting] > b[sorting] ? sort * -1
          : 0
        );
    }
  });

  const isIndeterminate = selectedLockers.length !== pageSize && selectedLockers.length > 0;

  const handleSelectAll = () => {
    if (selectedLockers.length < pageSize) {
      setValue(
        'lockers',
        sortedData.slice(startIndex, startIndex + pageSize).map((locker) => locker.lockerId)
      );
    } else {
      setValue('lockers', []);
    }
  };

  return data.length > 0 ?
      <Table background scrollable={false} dense={rowHeight === 'dense'}>
        <Table.Header>
          <Table.HeaderColumn>
            <Checkbox
              indeterminate={isIndeterminate}
              checked={selectedLockers.length > 0}
              onClick={() => handleSelectAll()}
            />
          </Table.HeaderColumn>
          <Table.HeaderColumn>
            <Table.SortButton isActive={sorting === 'name'} sortOrder={sortOdrer} onClick={() => handleSorting('name')}>
              {t('lockers:properties.name')}
            </Table.SortButton>
          </Table.HeaderColumn>
          <Table.HeaderColumn>
            <Table.SortButton
              isActive={sorting === 'building'}
              sortOrder={sortOdrer}
              onClick={() => handleSorting('building')}
            >
              {t('lockers:properties.building')}
            </Table.SortButton>
          </Table.HeaderColumn>
          <Table.HeaderColumn>
            <Table.SortButton
              isActive={sorting === 'buildingFloor'}
              sortOrder={sortOdrer}
              onClick={() => handleSorting('buildingFloor')}
            >
              {t('lockers:properties.buildingFloor')}
            </Table.SortButton>
          </Table.HeaderColumn>
          <Table.HeaderColumn>
            <Table.SortButton
              isActive={sorting === 'status'}
              sortOrder={sortOdrer}
              onClick={() => handleSorting('status')}
            >
              {t('lockers:properties.status')}
            </Table.SortButton>
          </Table.HeaderColumn>
          <Table.HeaderColumn>
            <Table.SortButton isActive={sorting === 'lock'} sortOrder={sortOdrer} onClick={() => handleSorting('lock')}>
              {t('lockers:properties.lock')}
            </Table.SortButton>
          </Table.HeaderColumn>
          <Table.HeaderColumn>
            <Table.SortButton isActive={sorting === 'code'} sortOrder={sortOdrer} onClick={() => handleSorting('code')}>
              {t('lockers:properties.code')}
            </Table.SortButton>
          </Table.HeaderColumn>
          <Table.HeaderColumn className="flex justify-end">
            <div className="relative">
              <PopupMenu position="left" align="end">
                <PopupMenu.Button size="sm" variant="tertiary" iconButton>
                  <Icon icon={<Ellipsis />} />
                </PopupMenu.Button>
                <PopupMenu.Panel></PopupMenu.Panel>
              </PopupMenu>
            </div>
          </Table.HeaderColumn>
        </Table.Header>
        <Table.Body className="overflow-visible">
          {sortedData.slice(startIndex, startIndex + pageSize).map((locker, index) => (
            <Table.Row key={`locker-${locker.lockerId}-${index}`}>
              <Table.Column>
                <Checkbox {...register('lockers')} value={locker.lockerId} />
              </Table.Column>
              <Table.Column>
                <Button variant="link">{locker.name}</Button>
              </Table.Column>
              <Table.Column>{locker.building}</Table.Column>
              <Table.Column>{locker.buildingFloor}</Table.Column>
              <Table.Column>
                {locker?.assignedTo?.pupilName ??
                  (locker?.status ?
                    <Label inverted color="warning">
                      {locker.status}
                    </Label>
                  : <Label inverted color="success">
                      {t('lockers:empty')}
                    </Label>)}
              </Table.Column>
              <Table.Column>
                {locker.lockType === 'Kodlås' ?
                  <Button variant="link">{locker.codeLockId}</Button>
                : locker?.lockType ?
                  locker.lockType
                : <Label color="error">{t('lockers:no_lock')}</Label>}
              </Table.Column>
              <Table.Column>
                {locker.lockType === 'Kodlås' ?
                  locker.activeCodeId ?
                    <>
                      {t('lockers:properties.code')} {locker.activeCodeId} - {locker.activeCode}
                    </>
                  : <Label color="error">{t('lockers:no_code')}</Label>
                : '-'}
              </Table.Column>
              <Table.Column className="flex justify-end">
                <div className="relative">
                  <PopupMenu position="left" align="end" size="sm">
                    <PopupMenu.Button size="sm" variant="tertiary" iconButton>
                      <Icon icon={<Ellipsis />} />
                    </PopupMenu.Button>
                    <PopupMenu.Panel>
                      <PopupMenu.Items>
                        <PopupMenu.Item>
                          <Button>Testar</Button>
                        </PopupMenu.Item>
                      </PopupMenu.Items>
                    </PopupMenu.Panel>
                  </PopupMenu>
                </div>
              </Table.Column>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer>
          <LockerTableFooter
            pageSize={pageSize}
            setPageSize={setPageSize}
            currentPage={page}
            setCurrentPage={setPage}
            pages={pages}
            rowHeight={rowHeight}
            setRowHeight={setRowHeight}
          />
        </Table.Footer>
      </Table>
    : <div className="w-full flex justify-center py-32">
        <h2 className="text-h4-sm md:text-h4-md xl:text-h4-lg">
          {capitalize(t('common:no_resources', { resources: t('lockers:name_zero') }))}
        </h2>
      </div>;
};
