import * as React from 'react';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Input, Checkbox, Spinner, Avatar, Tooltip } from '@fluentui/react-components';
import { SearchRegular, ArrowUpRegular, ArrowDownRegular, ArrowSortRegular, FilterRegular } from '@fluentui/react-icons';
import type { UserLike, ColumnFilterType } from '@alaarab/ogrid-core';
import styles from './ColumnHeaderFilter.module.scss';

export interface IColumnHeaderFilterProps {
  columnKey: string;
  columnName: string;
  filterType: ColumnFilterType;
  isSorted?: boolean;
  isSortedDescending?: boolean;
  onSort?: () => void;
  selectedValues?: string[];
  onFilterChange?: (values: string[]) => void;
  options?: string[];
  isLoadingOptions?: boolean;
  textValue?: string;
  onTextChange?: (value: string) => void;
  selectedUser?: UserLike;
  onUserChange?: (user: UserLike | undefined) => void;
  peopleSearch?: (query: string) => Promise<UserLike[]>;
}

const SEARCH_DEBOUNCE_MS = 150;
const EMPTY_ARRAY: string[] = [];

export const ColumnHeaderFilter: React.FC<IColumnHeaderFilterProps> = React.memo((props) => {
  const {
    columnName,
    filterType,
    isSorted = false,
    isSortedDescending = false,
    onSort,
    selectedValues,
    onFilterChange,
    options,
    isLoadingOptions = false,
    textValue = '',
    onTextChange,
    selectedUser,
    onUserChange,
    peopleSearch
  } = props;

  const safeSelectedValues = selectedValues ?? EMPTY_ARRAY;
  const safeOptions = options ?? EMPTY_ARRAY;

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<Set<string>>(new Set(safeSelectedValues));
  const [tempTextValue, setTempTextValue] = useState(textValue);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [peopleSuggestions, setPeopleSuggestions] = useState<UserLike[]>([]);
  const [isPeopleLoading, setIsPeopleLoading] = useState(false);
  const [peopleSearchText, setPeopleSearchText] = useState('');
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const peopleSearchTimeoutRef = useRef<number | undefined>(undefined);
  const peopleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFilterOpen) {
      setTempSelected(new Set(safeSelectedValues));
      setTempTextValue(textValue);
      setSearchText('');
      setDebouncedSearchText('');
      setPeopleSearchText('');
      setPeopleSuggestions([]);

      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setPopoverPosition({
          top: rect.bottom + 4,
          left: rect.left
        });
      }

      if (filterType === 'people') {
        setTimeout(() => {
          peopleInputRef.current?.focus();
        }, 50);
      }
    } else {
      setPopoverPosition(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFilterOpen]);

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchText]);

  useEffect(() => {
    if (!isFilterOpen) return;

    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node;
      const isOutsidePopover = popoverRef.current && !popoverRef.current.contains(target);
      const isOutsideHeader = headerRef.current && !headerRef.current.contains(target);
      
      if (isOutsidePopover && isOutsideHeader) {
        setIsFilterOpen(false);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  useEffect(() => {
    if (!isFilterOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        event.preventDefault();
        event.stopPropagation();
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isFilterOpen]);

  const filteredOptions = useMemo(() => {
    if (!debouncedSearchText.trim()) {
      return safeOptions;
    }
    const searchLower = debouncedSearchText.toLowerCase().trim();
    return safeOptions.filter(opt => opt.toLowerCase().includes(searchLower));
  }, [safeOptions, debouncedSearchText]);

  useEffect(() => {
    if (!peopleSearch || !isFilterOpen || filterType !== 'people') return;
    
    if (peopleSearchTimeoutRef.current) {
      window.clearTimeout(peopleSearchTimeoutRef.current);
    }

    if (!peopleSearchText.trim()) {
      setPeopleSuggestions([]);
      return;
    }

    setIsPeopleLoading(true);
    peopleSearchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const results = await peopleSearch(peopleSearchText);
        setPeopleSuggestions(results.slice(0, 10));
      } catch (error) {
        console.error('Error searching people:', error);
        setPeopleSuggestions([]);
      } finally {
        setIsPeopleLoading(false);
      }
    }, 300);

    return () => {
      if (peopleSearchTimeoutRef.current) {
        window.clearTimeout(peopleSearchTimeoutRef.current);
      }
    };
  }, [peopleSearchText, peopleSearch, isFilterOpen, filterType]);

  const handleFilterIconClick = useCallback((e: React.MouseEvent): void => {
    e.stopPropagation();
    e.preventDefault();
    setIsFilterOpen(prev => !prev);
  }, []);

  const handlePopoverClick = useCallback((e: React.MouseEvent): void => {
    e.stopPropagation();
  }, []);

  const handleInputFocus = useCallback((e: React.FocusEvent): void => {
    e.stopPropagation();
  }, []);

  const handleInputMouseDown = useCallback((e: React.MouseEvent): void => {
    e.stopPropagation();
  }, []);

  const handleInputClick = useCallback((e: React.MouseEvent): void => {
    e.stopPropagation();
  }, []);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent): void => {
    if (e.key !== 'Escape' && e.key !== 'Esc') {
      e.stopPropagation();
    }
  }, []);

  const handleSortClick = useCallback((e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onSort) {
      onSort();
    }
  }, [onSort]);

  const handleCheckboxChange = useCallback((option: string, checked: boolean): void => {
    setTempSelected(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(option);
      } else {
        newSet.delete(option);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((): void => {
    setTempSelected(new Set(filteredOptions));
  }, [filteredOptions]);

  const handleClearSelection = useCallback((): void => {
    setTempSelected(new Set());
  }, []);

  const handleApplyMultiSelect = useCallback((): void => {
    if (onFilterChange) {
      onFilterChange(Array.from(tempSelected));
    }
    setIsFilterOpen(false);
  }, [onFilterChange, tempSelected]);

  const handleTextApply = useCallback((): void => {
    if (onTextChange) {
      onTextChange(tempTextValue.trim());
    }
    setIsFilterOpen(false);
  }, [onTextChange, tempTextValue]);

  const handleTextClear = useCallback((): void => {
    setTempTextValue('');
  }, []);

  const handleTextKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleTextApply();
    }
  }, [handleTextApply]);

  const handleUserSelect = useCallback((user: UserLike): void => {
    if (onUserChange) {
      onUserChange(user);
    }
    setIsFilterOpen(false);
  }, [onUserChange]);

  const handleClearUser = useCallback((): void => {
    if (onUserChange) {
      onUserChange(undefined);
    }
    setIsFilterOpen(false);
  }, [onUserChange]);

  const hasActiveFilter = useMemo(() => {
    if (filterType === 'multiSelect') {
      return safeSelectedValues.length > 0;
    }
    if (filterType === 'text') {
      return !!textValue.trim();
    }
    if (filterType === 'people') {
      return !!selectedUser;
    }
    return false;
  }, [filterType, safeSelectedValues, textValue, selectedUser]);

  const renderPopoverContent = (): JSX.Element | null => {
    if (filterType === 'multiSelect') {
      return (
        <>
          <div className={styles.popoverSearch} onClick={handlePopoverClick}>
            <Input
              placeholder="Search..."
              value={searchText}
              onChange={(e, data) => setSearchText(data.value || '')}
              onFocus={handleInputFocus}
              onMouseDown={handleInputMouseDown}
              onClick={handleInputClick}
              onKeyDown={handleInputKeyDown}
              autoComplete="off"
              className={styles.searchInput}
              contentBefore={<SearchRegular />}
            />
            <div className={styles.resultCount}>
              {filteredOptions.length} of {safeOptions.length} options
            </div>
          </div>
          
          <div className={styles.selectAllRow} onClick={handlePopoverClick}>
            <button type="button" className={styles.selectAllButton} onClick={handleSelectAll}>
              Select All ({filteredOptions.length})
            </button>
            <button type="button" className={styles.selectAllButton} onClick={handleClearSelection}>
              Clear
            </button>
          </div>

          <div className={styles.popoverOptions} onClick={handlePopoverClick}>
            {isLoadingOptions ? (
              <div className={styles.loadingContainer}>
                <Spinner size="small" label="Loading..." />
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className={styles.noResults}>No options found</div>
            ) : (
              filteredOptions.map(option => (
                <div key={option} className={styles.popoverOption}>
                  <Checkbox
                    label={option}
                    checked={tempSelected.has(option)}
                    onChange={(ev, data) => {
                      ev.stopPropagation();
                      handleCheckboxChange(option, data.checked === true);
                    }}
                  />
                </div>
              ))
            )}
          </div>

          <div className={styles.popoverActions} onClick={handlePopoverClick}>
            <button type="button" className={styles.clearButton} onClick={handleClearSelection}>
              Clear
            </button>
            <button type="button" className={styles.applyButton} onClick={handleApplyMultiSelect}>
              Apply
            </button>
          </div>
        </>
      );
    }

    if (filterType === 'text') {
      return (
        <>
          <div className={styles.popoverSearch} onClick={handlePopoverClick}>
            <Input
              placeholder="Enter search term..."
              value={tempTextValue}
              onChange={(e, data) => setTempTextValue(data.value || '')}
              onKeyDown={(e) => {
                handleInputKeyDown(e);
                handleTextKeyDown(e);
              }}
              onFocus={handleInputFocus}
              onMouseDown={handleInputMouseDown}
              onClick={handleInputClick}
              autoComplete="off"
              className={styles.searchInput}
              contentBefore={<SearchRegular />}
            />
          </div>
          <div className={styles.popoverActions} onClick={handlePopoverClick}>
            <button type="button" className={styles.clearButton} onClick={handleTextClear} disabled={!tempTextValue}>
              Clear
            </button>
            <button type="button" className={styles.applyButton} onClick={handleTextApply}>
              Apply
            </button>
          </div>
        </>
      );
    }

    if (filterType === 'people') {
      return (
        <>
          {selectedUser && (
            <div className={styles.selectedUserSection} onClick={handlePopoverClick}>
              <div className={styles.selectedUserLabel}>Currently filtered by:</div>
              <div className={styles.selectedUser}>
                <div className={styles.userInfo}>
                  <Avatar name={selectedUser.displayName} image={{ src: selectedUser.photo }} size={32} />
                  <div className={styles.userText}>
                    <div>{selectedUser.displayName}</div>
                    <div className={styles.userSecondary}>{selectedUser.email}</div>
                  </div>
                </div>
                <button type="button" className={styles.removeUserButton} onClick={handleClearUser} aria-label="Remove filter">
                  <FilterRegular />
                </button>
              </div>
            </div>
          )}
          
          <div className={styles.popoverSearch} onClick={handlePopoverClick}>
            <div className={styles.nativeInputWrapper}>
              <SearchRegular className={styles.nativeInputIcon} />
              <input
                ref={peopleInputRef}
                type="text"
                placeholder="Search for a person..."
                value={peopleSearchText}
                onChange={(e) => setPeopleSearchText(e.target.value)}
                onFocus={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                autoComplete="off"
                className={styles.nativeInput}
              />
            </div>
          </div>

          <div className={styles.popoverOptions} onClick={handlePopoverClick}>
            {isPeopleLoading && peopleSearchText.trim() ? (
              <div className={styles.loadingContainer}>
                <Spinner size="small" label="Searching..." />
              </div>
            ) : peopleSuggestions.length === 0 && peopleSearchText.trim() ? (
              <div className={styles.noResults}>No results found</div>
            ) : peopleSearchText.trim() ? (
              peopleSuggestions.map(user => (
                <div
                  key={user.id || user.email || user.displayName}
                  className={styles.personOption}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserSelect(user);
                  }}
                >
                  <div className={styles.userInfo}>
                    <Avatar name={user.displayName} image={{ src: user.photo }} size={32} />
                    <div className={styles.userText}>
                      <div>{user.displayName}</div>
                      <div className={styles.userSecondary}>{user.email}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noResults}>Type to search...</div>
            )}
          </div>

          {selectedUser && (
            <div className={styles.popoverActions} onClick={handlePopoverClick}>
              <button type="button" className={styles.clearButton} onClick={handleClearUser}>
                Clear Filter
              </button>
            </div>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <div className={styles.columnHeader} ref={headerRef}>
      <div className={styles.headerContent}>
        <Tooltip content={columnName} relationship="label" withArrow>
          <span className={styles.columnNameTooltipTrigger}>
            <span className={styles.columnName} data-header-label>
              {columnName}
            </span>
          </span>
        </Tooltip>
      </div>
      
      <div className={styles.headerActions}>
        {onSort && (
          <button
            type="button"
            className={`${styles.sortIcon} ${isSorted ? styles.sortActive : ''}`}
            onClick={handleSortClick}
            aria-label={`Sort by ${columnName}`}
            title={isSorted ? (isSortedDescending ? 'Sorted descending' : 'Sorted ascending') : 'Sort'}
          >
            {isSorted ? (
              isSortedDescending ? <ArrowDownRegular /> : <ArrowUpRegular />
            ) : (
              <ArrowSortRegular />
            )}
          </button>
        )}
        
        {filterType !== 'none' && (
          <button
            type="button"
            className={`${styles.filterIcon} ${hasActiveFilter ? styles.filterActive : ''} ${isFilterOpen ? styles.filterOpen : ''}`}
            onClick={handleFilterIconClick}
            aria-label={`Filter ${columnName}`}
            title={`Filter ${columnName}`}
          >
            <FilterRegular />
            {hasActiveFilter && <span className={styles.filterBadge} />}
          </button>
        )}
      </div>

      {isFilterOpen && filterType !== 'none' && popoverPosition && (
        <div 
          className={styles.filterPopover} 
          ref={popoverRef} 
          onClick={handlePopoverClick}
          style={{
            top: `${popoverPosition.top}px`,
            left: `${popoverPosition.left}px`
          }}
        >
          <div className={styles.popoverHeader}>
            Filter: {columnName}
          </div>
          {renderPopoverContent()}
        </div>
      )}
    </div>
  );
});

ColumnHeaderFilter.displayName = 'ColumnHeaderFilter';
