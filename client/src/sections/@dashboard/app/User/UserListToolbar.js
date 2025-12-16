import PropTypes from 'prop-types';
// material
import { styled, alpha } from '@mui/material/styles';
import { 
  Toolbar, 
  Tooltip, 
  IconButton, 
  Typography, 
  OutlinedInput, 
  InputAdornment, 
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
} from '@mui/material';
import Iconify from '../../../../components/Iconify';

// ----------------------------------------------------------------------

const RootStyle = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2, 0, 3),
}));

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 280,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  borderRadius: 12,
  backgroundColor: '#f8f9fa',
  '&.Mui-focused': {
    width: 360,
    boxShadow: '0 4px 14px rgba(91, 127, 232, 0.15)',
    backgroundColor: '#ffffff',
  },
  '& fieldset': {
    borderWidth: `2px !important`,
    borderColor: `#e9ecef !important`,
  },
  '&:hover fieldset': {
    borderColor: `#dee2e6 !important`,
  },
  '&.Mui-focused fieldset': {
    borderColor: `#5B7FE8 !important`,
  },
  '& input': {
    fontWeight: 500,
    fontSize: '0.875rem',
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  minWidth: 140,
  height: 42,
  borderRadius: 12,
  backgroundColor: '#f8f9fa',
  fontWeight: 600,
  fontSize: '0.875rem',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e9ecef',
    borderWidth: 2,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#dee2e6',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#5B7FE8',
  },
}));

const FilterButton = styled(IconButton)(({ theme }) => ({
  width: 42,
  height: 42,
  borderRadius: 12,
  backgroundColor: '#f8f9fa',
  color: '#6c757d',
  border: '2px solid #e9ecef',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#5B7FE8',
    color: '#ffffff',
    borderColor: '#5B7FE8',
    transform: 'scale(1.05)',
  },
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  width: 42,
  height: 42,
  borderRadius: 12,
  backgroundColor: '#FF5630',
  color: '#ffffff',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#E04A2A',
    transform: 'scale(1.05)',
  },
}));

const SelectedChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#5B7FE8',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '0.875rem',
  height: 32,
  borderRadius: 10,
  '& .MuiChip-label': {
    padding: '0 12px',
  },
}));

// ----------------------------------------------------------------------

UserListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
};

export default function UserListToolbar({ 
  numSelected, 
  filterName, 
  onFilterName, 

}) {
  return (
    <RootStyle
      sx={{
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: alpha('#5B7FE8', 0.08),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Stack direction="row" alignItems="center" spacing={2}>
          <SelectedChip label={`${numSelected} selected`} />
        </Stack>
      ) : (
        <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
          <SearchStyle
            value={filterName}
            onChange={onFilterName}
            placeholder="Search by email, name, or phone..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify 
                  icon="eva:search-fill" 
                  sx={{ color: '#6c757d', width: 20, height: 20 }} 
                />
              </InputAdornment>
            }
          />
        </Stack>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete selected">
          <DeleteButton>
            <Iconify icon="eva:trash-2-fill" width={20} height={20} />
          </DeleteButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter options">
          <FilterButton>
            <Iconify icon="ic:round-filter-list" width={20} height={20} />
          </FilterButton>
        </Tooltip>
      )}
    </RootStyle>
  );
}