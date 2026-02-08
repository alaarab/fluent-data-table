import * as React from 'react';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  TextField, Checkbox, Avatar, Popover, CircularProgress,
  Tooltip, IconButton, Box, Typography, Button,
  InputAdornment, FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  SwapVert as SwapVertIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import type { UserLike, ColumnFilterType } from '@alaarab/ogrid-core';

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
    peopleSearch,
  } = props;

  const safeSelectedValues = selectedValues ?? EMPTY_ARRAY;
  const safeOptions = options ?? EMPTY_ARRAY;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tempSelected, setTempSelected] = useState<Set<string>>(new Set(safeSelectedValues));
  const [tempTextValue, setTempTextValue] = useState(textValue);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [peopleSuggestions, setPeopleSuggestions] = useState<UserLike[]>([]);
  const [isPeopleLoading, setIsPeopleLoading] = useState(false);
  const [peopleSearchText, setPeopleSearchText] = useState('');

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const peopleSearchTimeoutRef = useRef<number | undefined>(undefined);
  const peopleInputRef = useRef<HTMLInputElement>(null);

  const isFilterOpen = Boolean(anchorEl);

  useEffect(() => {
    if (isFilterOpen) {
      setTempSelected(new Set(safeSelectedValues));
      setTempTextValue(textValue);
      setSearchText('');
      setDebouncedSearchText('');
      setPeopleSearchText('');
      setPeopleSuggestions([]);

      if (filterType === 'people') {
        setTimeout(() => {
          peopleInputRef.current?.focus();
        }, 50);
      }
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

  const filteredOptions = useMemo(() => {
    if (!debouncedSearchText.trim()) {
      return safeOptions;
    }
    const searchLower = debouncedSearchText.toLowerCase().trim();
    return safeOptions.filter((opt) => opt.toLowerCase().includes(searchLower));
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

  const handleFilterIconClick = useCallback((e: React.MouseEvent<HTMLElement>): void => {
    e.stopPropagation();
    e.preventDefault();
    setAnchorEl(anchorEl ? null : e.currentTarget);
  }, [anchorEl]);

  const handlePopoverClose = useCallback((): void => {
    setAnchorEl(null);
  }, []);

  const handleSortClick = useCallback(
    (e: React.MouseEvent): void => {
      e.stopPropagation();
      if (onSort) {
        onSort();
      }
    },
    [onSort],
  );

  const handleCheckboxChange = useCallback((option: string, checked: boolean): void => {
    setTempSelected((prev) => {
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
    setAnchorEl(null);
  }, [onFilterChange, tempSelected]);

  const handleTextApply = useCallback((): void => {
    if (onTextChange) {
      onTextChange(tempTextValue.trim());
    }
    setAnchorEl(null);
  }, [onTextChange, tempTextValue]);

  const handleTextClear = useCallback((): void => {
    setTempTextValue('');
  }, []);

  const handleTextKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleTextApply();
      }
    },
    [handleTextApply],
  );

  const handleUserSelect = useCallback(
    (user: UserLike): void => {
      if (onUserChange) {
        onUserChange(user);
      }
      setAnchorEl(null);
    },
    [onUserChange],
  );

  const handleClearUser = useCallback((): void => {
    if (onUserChange) {
      onUserChange(undefined);
    }
    setAnchorEl(null);
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
        <Box sx={{ width: 280 }}>
          <Box sx={{ p: 1.5, pb: 0.5 }}>
            <TextField
              placeholder="Search..."
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
              autoComplete="off"
              size="small"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {filteredOptions.length} of {safeOptions.length} options
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1.5, py: 0.5 }}>
            <Button size="small" onClick={handleSelectAll}>
              Select All ({filteredOptions.length})
            </Button>
            <Button size="small" onClick={handleClearSelection}>
              Clear
            </Button>
          </Box>

          <Box sx={{ maxHeight: 240, overflowY: 'auto', px: 0.5 }}>
            {isLoadingOptions ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : filteredOptions.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No options found
              </Typography>
            ) : (
              filteredOptions.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      size="small"
                      checked={tempSelected.has(option)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCheckboxChange(option, e.target.checked)}
                    />
                  }
                  label={<Typography variant="body2">{option}</Typography>}
                  sx={{ display: 'flex', mx: 0, '& .MuiFormControlLabel-label': { flex: 1, minWidth: 0 } }}
                />
              ))
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              p: 1.5,
              pt: 1,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Button size="small" onClick={handleClearSelection}>
              Clear
            </Button>
            <Button size="small" variant="contained" onClick={handleApplyMultiSelect}>
              Apply
            </Button>
          </Box>
        </Box>
      );
    }

    if (filterType === 'text') {
      return (
        <Box sx={{ width: 260 }}>
          <Box sx={{ p: 1.5 }}>
            <TextField
              placeholder="Enter search term..."
              value={tempTextValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempTextValue(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                e.stopPropagation();
                handleTextKeyDown(e as React.KeyboardEvent<HTMLInputElement>);
              }}
              autoComplete="off"
              size="small"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              p: 1.5,
              pt: 0,
            }}
          >
            <Button size="small" disabled={!tempTextValue} onClick={handleTextClear}>
              Clear
            </Button>
            <Button size="small" variant="contained" onClick={handleTextApply}>
              Apply
            </Button>
          </Box>
        </Box>
      );
    }

    if (filterType === 'people') {
      return (
        <Box sx={{ width: 300 }}>
          {selectedUser && (
            <Box sx={{ p: 1.5, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Currently filtered by:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Avatar
                  src={selectedUser.photo}
                  alt={selectedUser.displayName}
                  sx={{ width: 32, height: 32 }}
                >
                  {selectedUser.displayName?.[0]}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap>
                    {selectedUser.displayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {selectedUser.email}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={handleClearUser} aria-label="Remove filter">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}

          <Box sx={{ p: 1.5, pb: 0.5 }}>
            <TextField
              inputRef={peopleInputRef}
              placeholder="Search for a person..."
              value={peopleSearchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPeopleSearchText(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
              autoComplete="off"
              size="small"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Box sx={{ maxHeight: 240, overflowY: 'auto' }}>
            {isPeopleLoading && peopleSearchText.trim() ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : peopleSuggestions.length === 0 && peopleSearchText.trim() ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No results found
              </Typography>
            ) : peopleSearchText.trim() ? (
              peopleSuggestions.map((user) => (
                <Box
                  key={user.id || user.email || user.displayName}
                  onClick={() => handleUserSelect(user)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Avatar
                    src={user.photo}
                    alt={user.displayName}
                    sx={{ width: 32, height: 32 }}
                  >
                    {user.displayName?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {user.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                Type to search...
              </Typography>
            )}
          </Box>

          {selectedUser && (
            <Box sx={{ p: 1.5, pt: 1, borderTop: 1, borderColor: 'divider' }}>
              <Button size="small" fullWidth onClick={handleClearUser}>
                Clear Filter
              </Button>
            </Box>
          )}
        </Box>
      );
    }

    return null;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: 0 }}>
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Tooltip title={columnName} arrow>
          <Typography
            variant="body2"
            fontWeight={600}
            noWrap
            data-header-label
            sx={{ lineHeight: 1.4 }}
          >
            {columnName}
          </Typography>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5, flexShrink: 0 }}>
        {onSort && (
          <IconButton
            size="small"
            onClick={handleSortClick}
            aria-label={`Sort by ${columnName}`}
            title={isSorted ? (isSortedDescending ? 'Sorted descending' : 'Sorted ascending') : 'Sort'}
            color={isSorted ? 'primary' : 'default'}
            sx={{ p: 0.25 }}
          >
            {isSorted ? (
              isSortedDescending ? (
                <ArrowDownwardIcon sx={{ fontSize: 16 }} />
              ) : (
                <ArrowUpwardIcon sx={{ fontSize: 16 }} />
              )
            ) : (
              <SwapVertIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        )}

        {filterType !== 'none' && (
          <IconButton
            size="small"
            onClick={handleFilterIconClick}
            aria-label={`Filter ${columnName}`}
            title={`Filter ${columnName}`}
            color={hasActiveFilter || isFilterOpen ? 'primary' : 'default'}
            sx={{ p: 0.25, position: 'relative' }}
          >
            <FilterListIcon sx={{ fontSize: 16 }} />
            {hasActiveFilter && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                }}
              />
            )}
          </IconButton>
        )}
      </Box>

      <Popover
        open={isFilterOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: { mt: 0.5, overflow: 'visible' },
            onClick: (e: React.MouseEvent) => e.stopPropagation(),
          },
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 1.5, py: 1 }}>
          <Typography variant="subtitle2">Filter: {columnName}</Typography>
        </Box>
        {renderPopoverContent()}
      </Popover>
    </Box>
  );
});

ColumnHeaderFilter.displayName = 'ColumnHeaderFilter';
