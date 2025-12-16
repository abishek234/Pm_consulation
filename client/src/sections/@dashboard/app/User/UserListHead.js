import PropTypes from 'prop-types';
// material
import { styled } from '@mui/material/styles';
import { Box, Checkbox, TableRow, TableCell, TableHead, TableSortLabel } from '@mui/material';

// ----------------------------------------------------------------------

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  borderBottom: '2px solid #e9ecef',
  fontWeight: 700,
  fontSize: '0.8rem',
  color: '#1a1a1a',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  padding: theme.spacing(2),
}));

const StyledTableSortLabel = styled(TableSortLabel)(({ theme }) => ({
  fontWeight: 700,
  '&:hover': {
    color: '#5B7FE8',
  },
  '&.Mui-active': {
    color: '#5B7FE8',
    '& .MuiTableSortLabel-icon': {
      color: '#5B7FE8',
    },
  },
}));

// ----------------------------------------------------------------------

UserListHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string,
  rowCount: PropTypes.number,
  headLabel: PropTypes.array,
  numSelected: PropTypes.number,
  onRequestSort: PropTypes.func,
  onSelectAllClick: PropTypes.func,
};

export default function UserListHead({
  order,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onRequestSort,
  onSelectAllClick,
}) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headLabel.map((headCell) => (
          <StyledTableCell
            key={headCell.id}
            align={headCell.alignRight ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id === 'actions' ? (
              headCell.label
            ) : (
              <StyledTableSortLabel
                hideSortIcon={headCell.id === 'actions'}
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box sx={{ ...visuallyHidden }}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </StyledTableSortLabel>
            )}
          </StyledTableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}