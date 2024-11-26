import { Pagination, Select } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

interface LockerTableFooterProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pages: number;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  rowHeight: 'normal' | 'dense';
  setRowHeight: (rowHeight: 'normal' | 'dense') => void;
}

export const PupilTableFooter: React.FC<LockerTableFooterProps> = ({
  currentPage,
  setCurrentPage,
  pages,
  pageSize,
  setPageSize,
  rowHeight,
  setRowHeight,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="sk-table-bottom-section sk-table-pagination-mobile">
        <label className="sk-table-bottom-section-label" htmlFor="paginationSelect">
          {t('common:table.page')}:
        </label>
        <Select
          id="paginationSelect"
          size="sm"
          value={currentPage.toString()}
          onSelectValue={(value) => setCurrentPage(parseInt(value, 10))}
        >
          {Array.from(Array(pages).keys()).map((page) => (
            <Select.Option key={`pagipage-${page}`} value={(page + 1).toString()}>
              {page + 1}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div className="sk-table-bottom-section">
        <label className="sk-table-bottom-section-label" htmlFor="pagiPageSize">
          {t('common:table.rows_per_page')}:
        </label>
        <Select
          size="sm"
          id="pagiPageSize"
          value={`${pageSize}`}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setPageSize(parseInt(event.target.value))}
        >
          <Select.Option value="10">10</Select.Option>
          <Select.Option value="15">15</Select.Option>
          <Select.Option value="25">25</Select.Option>
          <Select.Option value="50">50</Select.Option>
          <Select.Option value="100">100</Select.Option>
        </Select>
      </div>

      <div className="sk-table-paginationwrapper">
        <Pagination
          className="sk-table-pagination"
          pages={pages}
          activePage={currentPage}
          showConstantPages
          pagesAfter={1}
          pagesBefore={1}
          changePage={(page: number) => setCurrentPage(page)}
          fitContainer
        />
      </div>

      <div className="sk-table-bottom-section">
        <label className="sk-table-bottom-section-label" htmlFor="pagiRowHeight">
          {t('common:table.rowheight')}:
        </label>
        <Select
          id="pagiRowHeight"
          size="sm"
          value={rowHeight}
          onSelectValue={(value: 'normal' | 'dense') => setRowHeight(value)}
        >
          <Select.Option value={'normal'}>{t('common:table.normal')}</Select.Option>
          <Select.Option value={'dense'}>{t('common:table.dense')}</Select.Option>
        </Select>
      </div>
    </>
  );
};