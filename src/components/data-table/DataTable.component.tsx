import { useTable } from 'react-table';
import BTable from 'react-bootstrap/Table';

import { TableRow } from './DataTable.styled';

const DataTable = (
  { columns, data, onClickRow, clickable = true }:
  { columns: any[], data: any[], onClickRow: (row: any) => void, clickable?: boolean }
) => {
  const tableInstance = useTable({ columns, data });
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <BTable striped bordered responsive {...getTableProps()}>
      <thead>
        {// Loop over the header rows
          headerGroups.map(headerGroup => (
            // Apply the header row props
            <tr {...headerGroup.getHeaderGroupProps()}>
              {// Loop over the headers in each row
              headerGroup.headers.map(column => (
                // Apply the header cell props
                <th {...column.getHeaderProps()}>
                  {// Render the header
                  column.render('Header')}
                </th>
              ))}
            </tr>
          ))
        }
      </thead>
      <tbody {...getTableBodyProps()}>
        {
          rows.map(row => {
            // Prepare the row for display
            prepareRow(row)
            const rowProps = {...row.getRowProps(), className: clickable ? 'clickable' : ''};
            return (
              // Apply the row props
              <TableRow {...rowProps} onClick={() => onClickRow(row)}>
                {// Loop over the rows cells
                row.cells.map(cell => {
                  // Apply the cell props
                  return (
                    <td {...cell.getCellProps()}>
                      {// Render the cell contents
                      cell.render('Cell')}
                    </td>
                  )
                })}
              </TableRow>
            )
          })
        }
      </tbody>
    </BTable>
  );
};

export default DataTable;
