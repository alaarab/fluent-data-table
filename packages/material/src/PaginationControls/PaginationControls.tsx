import * as React from 'react';
import { useMemo, useCallback } from 'react';
import {
  IconButton, Button, Select, MenuItem, Box, Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

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
  const {
    currentPage,
    pageSize,
    totalCount,
    onPageChange,
    onPageSizeChange,
    entityLabelPlural,
    className,
  } = props;
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
    (event: SelectChangeEvent<number>) => {
      onPageSizeChange(Number(event.target.value));
    },
    [onPageSizeChange],
  );

  if (totalCount === 0) {
    return null;
  }

  const startItem = Math.max(1, (currentPage - 1) * pageSize + 1);
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <Box
      className={className}
      role="navigation"
      aria-label="Pagination"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        py: 1,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Showing {startItem} to {endItem} of {totalCount.toLocaleString()} {labelPlural}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          <FirstPageIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>

        {showStartEllipsis && (
          <>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onPageChange(1)}
              aria-label="Page 1"
              sx={{ minWidth: 32, px: 0.5 }}
            >
              1
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }} aria-hidden>
              …
            </Typography>
          </>
        )}

        {pageNumbers.map((pageNum) => (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? 'contained' : 'outlined'}
            size="small"
            onClick={() => onPageChange(pageNum)}
            aria-label={`Page ${pageNum}`}
            aria-current={currentPage === pageNum ? 'page' : undefined}
            sx={{ minWidth: 32, px: 0.5 }}
          >
            {pageNum}
          </Button>
        ))}

        {showEndEllipsis && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }} aria-hidden>
              …
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onPageChange(totalPages)}
              aria-label={`Page ${totalPages}`}
              sx={{ minWidth: 32, px: 0.5 }}
            >
              {totalPages}
            </Button>
          </>
        )}

        <IconButton
          size="small"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          aria-label="Last page"
        >
          <LastPageIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Rows
        </Typography>
        <Select
          value={pageSize}
          onChange={handlePageSizeChange}
          size="small"
          aria-label="Rows per page"
          sx={{ minWidth: 70 }}
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
});
