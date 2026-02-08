import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Button, Popover, Checkbox, Box, Typography, FormControlLabel,
} from '@mui/material';
import {
  ViewColumn as ViewColumnIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import type { IColumnDefinition } from '@alaarab/ogrid-core';

export type { IColumnDefinition };

export interface IColumnChooserProps {
  columns: IColumnDefinition[];
  visibleColumns: Set<string>;
  onVisibilityChange: (columnKey: string, visible: boolean) => void;
  className?: string;
}

export const ColumnChooser: React.FC<IColumnChooserProps> = (props) => {
  const { columns, visibleColumns, onVisibilityChange, className } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isOpen = Boolean(anchorEl);

  const handleToggle = useCallback((e: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(anchorEl ? null : e.currentTarget);
  }, [anchorEl]);

  const handleClose = useCallback((): void => {
    setAnchorEl(null);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setAnchorEl(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen]);

  const handleCheckboxChange = useCallback(
    (columnKey: string) => {
      return (ev: React.ChangeEvent<HTMLInputElement>) => {
        ev.stopPropagation();
        onVisibilityChange(columnKey, ev.target.checked);
      };
    },
    [onVisibilityChange],
  );

  const handleSelectAll = useCallback((): void => {
    columns.forEach((col) => {
      if (!visibleColumns.has(col.columnId)) {
        onVisibilityChange(col.columnId, true);
      }
    });
  }, [columns, visibleColumns, onVisibilityChange]);

  const handleClearAll = useCallback((): void => {
    columns.forEach((col) => {
      if (!col.required && visibleColumns.has(col.columnId)) {
        onVisibilityChange(col.columnId, false);
      }
    });
  }, [columns, visibleColumns, onVisibilityChange]);

  const visibleCount = visibleColumns.size;
  const totalCount = columns.length;

  return (
    <Box className={className} sx={{ display: 'inline-flex' }}>
      <Button
        ref={buttonRef}
        variant="outlined"
        size="small"
        startIcon={<ViewColumnIcon />}
        endIcon={isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          borderColor: isOpen ? 'primary.main' : 'divider',
        }}
      >
        Column Visibility ({visibleCount} of {totalCount})
      </Button>

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { mt: 0.5, minWidth: 220 },
          },
        }}
      >
        <Box
          sx={{
            px: 1.5,
            py: 1,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Select Columns ({visibleCount} of {totalCount})
          </Typography>
        </Box>

        <Box sx={{ maxHeight: 320, overflowY: 'auto', py: 0.5 }}>
          {columns.map((column) => (
            <Box key={column.columnId} sx={{ px: 1.5, minHeight: 32, display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={visibleColumns.has(column.columnId)}
                    onChange={handleCheckboxChange(column.columnId)}
                  />
                }
                label={<Typography variant="body2">{column.name}</Typography>}
                sx={{ m: 0 }}
              />
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            px: 1.5,
            py: 1,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}
        >
          <Button size="small" onClick={handleClearAll} sx={{ textTransform: 'none' }}>
            Clear All
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleSelectAll}
            sx={{ textTransform: 'none' }}
          >
            Select All
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};
