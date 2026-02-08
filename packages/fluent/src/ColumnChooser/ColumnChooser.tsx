import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Checkbox,
  makeStyles,
  tokens,
  mergeClasses,
  CheckboxOnChangeData,
} from '@fluentui/react-components';
import { TableSettingsRegular, ChevronDownRegular, ChevronUpRegular } from '@fluentui/react-icons';
import type { IColumnDefinition } from '@alaarab/ogrid-core';

const useStyles = makeStyles({
  container: {
    position: 'relative',
    display: 'inline-flex',
  },
  triggerButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: 'pointer',
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    transitionDuration: '0.15s',
    transitionProperty: 'all',
    transitionTimingFunction: 'ease',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      border: `1px solid ${tokens.colorNeutralStroke1Hover}`,
    },
  },
  triggerButtonOpen: {
    border: `1px solid ${tokens.colorBrandStroke1}`,
  },
  buttonIcon: {
    fontSize: '16px',
  },
  chevron: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: '0',
    zIndex: 10000,
    minWidth: '220px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow16,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '8px 12px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  optionsList: {
    maxHeight: '320px',
    overflowY: 'auto',
    padding: 0,
  },
  optionItem: {
    padding: '4px 12px',
    display: 'flex',
    alignItems: 'center',
    minHeight: '32px',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '8px 12px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  clearButton: {
    padding: '6px 12px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightRegular,
    cursor: 'pointer',
    transitionDuration: '0.15s',
    transitionProperty: 'all',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      color: tokens.colorNeutralForeground1,
      border: `1px solid ${tokens.colorNeutralStroke1Hover}`,
    },
  },
  selectAllButton: {
    padding: '6px 16px',
    border: 'none',
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    cursor: 'pointer',
    transitionDuration: '0.15s',
    transitionProperty: 'all',
    ':hover': {
      backgroundColor: tokens.colorBrandBackgroundHover,
    },
  },
});

export type { IColumnDefinition };

export interface IColumnChooserProps {
  columns: IColumnDefinition[];
  visibleColumns: Set<string>;
  onVisibilityChange: (columnKey: string, visible: boolean) => void;
  className?: string;
}

export const ColumnChooser: React.FC<IColumnChooserProps> = (props) => {
  const { columns, visibleColumns, onVisibilityChange, className } = props;
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node;
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
      const isOutsideButton = buttonRef.current && !buttonRef.current.contains(target);
      if (isOutsideDropdown && isOutsideButton) {
        setIsOpen(false);
      }
    };
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen]);

  const handleToggle = useCallback((): void => {
    setIsOpen(prev => !prev);
  }, []);

  const handleCheckboxChange = useCallback((columnKey: string) => {
    return (ev: React.ChangeEvent<HTMLInputElement>, data: CheckboxOnChangeData) => {
      ev.stopPropagation();
      onVisibilityChange(columnKey, data.checked === true);
    };
  }, [onVisibilityChange]);

  const handleDropdownClick = useCallback((e: React.MouseEvent): void => {
    e.stopPropagation();
  }, []);

  const handleSelectAll = useCallback((): void => {
    columns.forEach(col => {
      if (!visibleColumns.has(col.columnId)) {
        onVisibilityChange(col.columnId, true);
      }
    });
  }, [columns, visibleColumns, onVisibilityChange]);

  const handleClearAll = useCallback((): void => {
    columns.forEach(col => {
      if (!col.required && visibleColumns.has(col.columnId)) {
        onVisibilityChange(col.columnId, false);
      }
    });
  }, [columns, visibleColumns, onVisibilityChange]);

  const visibleCount = visibleColumns.size;
  const totalCount = columns.length;

  return (
    <div className={`${classes.container} ${className || ''}`}>
      <button
        type="button"
        ref={buttonRef}
        className={mergeClasses(classes.triggerButton, isOpen && classes.triggerButtonOpen)}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <TableSettingsRegular className={classes.buttonIcon} />
        <span>Column Visibility ({visibleCount} of {totalCount})</span>
        {isOpen ? <ChevronUpRegular className={classes.chevron} /> : <ChevronDownRegular className={classes.chevron} />}
      </button>

      {isOpen && (
        <div className={classes.dropdown} ref={dropdownRef} onClick={handleDropdownClick}>
          <div className={classes.header}>
            Select Columns ({visibleCount} of {totalCount})
          </div>
          <div className={classes.optionsList}>
            {columns.map(column => (
              <div key={column.columnId} className={classes.optionItem}>
                <Checkbox
                  label={column.name}
                  checked={visibleColumns.has(column.columnId)}
                  onChange={handleCheckboxChange(column.columnId)}
                />
              </div>
            ))}
          </div>
          <div className={classes.actions}>
            <button type="button" className={classes.clearButton} onClick={handleClearAll}>
              Clear All
            </button>
            <button type="button" className={classes.selectAllButton} onClick={handleSelectAll}>
              Select All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
