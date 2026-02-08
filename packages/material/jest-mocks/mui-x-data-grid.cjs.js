const React = require('react');

function DataGrid(props) {
  const {
    rows = [],
    columns = [],
    getRowId,
    loading,
    slots,
    slotProps,
    ...rest
  } = props || {};

  return React.createElement(
    'table',
    { 'data-mock': 'DataGrid', ...rest },
    React.createElement(
      'thead',
      null,
      React.createElement(
        'tr',
        null,
        columns.map((col, idx) =>
          React.createElement(
            'th',
            { key: col.field || idx, role: 'columnheader' },
            typeof col.renderHeader === 'function'
              ? col.renderHeader({ colDef: col, field: col.field })
              : col.headerName || col.field
          )
        )
      )
    ),
    React.createElement(
      'tbody',
      null,
      rows.map((row, rowIndex) => {
        const rowId = getRowId ? getRowId(row) : row.id || rowIndex;
        return React.createElement(
          'tr',
          { key: rowId },
          columns.map((col, idx) =>
            React.createElement(
              'td',
              { key: col.field || idx },
              typeof col.renderCell === 'function'
                ? col.renderCell({ row, value: row[col.field], id: rowId })
                : row[col.field] != null ? String(row[col.field]) : ''
            )
          )
        );
      })
    )
  );
}
DataGrid.displayName = 'DataGrid';

module.exports = {
  DataGrid,
};
