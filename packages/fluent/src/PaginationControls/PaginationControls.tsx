import * as React from 'react';
import { useMemo, useCallback } from 'react';
import { Button, Select } from '@fluentui/react-components';
import type { SelectOnChangeData } from '@fluentui/react-components';
import {
  ChevronLeftRegular,
  ChevronRightRegular,
  ChevronDoubleLeftRegular,
  ChevronDoubleRightRegular,
} from '@fluentui/react-icons';
import styles from './PaginationControls.module.scss';

export interface IPaginationControlsProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  entityLabelPlural?: string;
  className?: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
const MAX_PAGE_BUTTONS = 5;

export const PaginationControls: React.FC<IPaginationControlsProps> = React.memo((props) => {
  const { currentPage, pageSize, totalCount, onPageChange, onPageSizeChange, entityLabelPlural, className } = props;
  const labelPlural = entityLabelPlural ?? 'items';

  const { pageNumbers, showStartEllipsis, showEndEllipsis } = useMemo(() => {
    const totalPages = Math.ceil(totalCount / pageSize);
    if (totalPages <= MAX_PAGE_BUTTONS) {
      const numbers: number[] = [];
      for (let i = 1; i <= totalPages; i++) numbers.push(i);
      return { pageNumbers: numbers, showStartEllipsis: false, showEndEllipsis: false };
    }
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    if (end - start + 1 < MAX_PAGE_BUTTONS) {
      if (start === 1) end = Math.min(totalPages, start + MAX_PAGE_BUTTONS - 1);
      else if (end === totalPages) start = Math.max(1, end - MAX_PAGE_BUTTONS + 1);
    }
    const numbers: number[] = [];
    for (let i = start; i <= end; i++) numbers.push(i);
    return {
      pageNumbers: numbers,
      showStartEllipsis: start > 1,
      showEndEllipsis: end < totalPages,
    };
  }, [currentPage, pageSize, totalCount]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageSizeChange = useCallback(
    (_e: React.ChangeEvent<HTMLSelectElement>, data: SelectOnChangeData) => {
      onPageSizeChange(Number(data.value));
    },
    [onPageSizeChange]
  );

  if (totalCount === 0) {
    return null;
  }

  const startItem = Math.max(1, (currentPage - 1) * pageSize + 1);
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className={`${styles.pagination} ${className || ''}`} role="navigation" aria-label="Pagination">
      <div className={styles.paginationInfo}>
        Showing {startItem} to {endItem} of {totalCount.toLocaleString()} {labelPlural}
      </div>

      <div className={styles.paginationControls}>
        <Button appearance="outline" shape="circular" size="small" icon={<ChevronDoubleLeftRegular />} onClick={() => onPageChange(1)} disabled={currentPage === 1} aria-label="First page" className={styles.navBtn} />
        <Button appearance="outline" shape="circular" size="small" icon={<ChevronLeftRegular />} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page" className={styles.navBtn} />

        <div className={styles.pageNumbers}>
          {showStartEllipsis && (
            <>
              <Button appearance="outline" size="small" shape="rounded" onClick={() => onPageChange(1)} aria-label="Page 1" className={styles.pageBtn}>1</Button>
              <span className={styles.ellipsis} aria-hidden>…</span>
            </>
          )}
          {pageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              appearance={currentPage === pageNum ? 'primary' : 'outline'}
              size="small"
              shape="rounded"
              onClick={() => onPageChange(pageNum)}
              aria-label={`Page ${pageNum}`}
              aria-current={currentPage === pageNum ? 'page' : undefined}
              className={styles.pageBtn}
            >
              {pageNum}
            </Button>
          ))}
          {showEndEllipsis && (
            <>
              <span className={styles.ellipsis} aria-hidden>…</span>
              <Button appearance="outline" size="small" shape="rounded" onClick={() => onPageChange(totalPages)} aria-label={`Page ${totalPages}`} className={styles.pageBtn}>{totalPages}</Button>
            </>
          )}
        </div>

        <Button appearance="outline" shape="circular" size="small" icon={<ChevronRightRegular />} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages} aria-label="Next page" className={styles.navBtn} />
        <Button appearance="outline" shape="circular" size="small" icon={<ChevronDoubleRightRegular />} onClick={() => onPageChange(totalPages)} disabled={currentPage >= totalPages} aria-label="Last page" className={styles.navBtn} />
      </div>

      <div className={styles.pageSizeSelector}>
        <span className={styles.pageSizeLabel}>Rows</span>
        <Select value={String(pageSize)} onChange={handlePageSizeChange} size="small" appearance="outline" aria-label="Rows per page" className={styles.pageSizeSelect}>
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </Select>
      </div>
    </div>
  );
});
