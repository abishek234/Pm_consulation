import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { 
  Button, 
  Popover, 
  Box, 
  Checkbox, 
  FormControlLabel, 
  Typography, 
  Divider,
  Stack,
  IconButton
} from '@mui/material';
import Iconify from '../../../../components/Iconify';

// ----------------------------------------------------------------------

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 10,
  padding: theme.spacing(1, 2.5),
  fontWeight: 600,
  textTransform: 'none',
  backgroundColor: '#f8f9fa',
  color: '#6c757d',
  border: '2px solid #e9ecef',
  '&:hover': {
    backgroundColor: '#5B7FE8',
    color: '#ffffff',
    borderColor: '#5B7FE8',
  },
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    border: '1px solid #e9ecef',
  },
}));

const PopoverHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2.5),
  backgroundColor: '#f8f9fa',
  borderBottom: '1px solid #e9ecef',
}));

const PopoverContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2.5),
  maxHeight: 400,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#5B7FE8',
    borderRadius: '4px',
  },
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  margin: theme.spacing(0.5, 0),
  padding: theme.spacing(0.5, 1),
  borderRadius: 8,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f8f9fa',
  },
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    fontWeight: 500,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(0.8, 2),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.875rem',
}));

const PrimaryActionButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: '#5B7FE8',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#4865D8',
  },
}));

const SecondaryActionButton = styled(ActionButton)(({ theme }) => ({
  color: '#6c757d',
  border: '1px solid #e9ecef',
  '&:hover': {
    backgroundColor: '#f8f9fa',
  },
}));

// ----------------------------------------------------------------------

export default function InternshipColumnFilter({ columns, visibleColumns, onToggleColumn, onResetColumns }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'column-filter-popover' : undefined;

  const visibleCount = visibleColumns.length;
  const totalCount = columns.length;

  return (
    <>
      <StyledButton
        aria-describedby={id}
        onClick={handleClick}
        startIcon={<Iconify icon="mdi:table-column" width={18} height={18} />}
      >
        Columns ({visibleCount}/{totalCount})
      </StyledButton>

      <StyledPopover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <PopoverHeader>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Manage Columns
            </Typography>
            <IconButton size="small" onClick={handleClose}>
              <Iconify icon="eva:close-outline" width={20} height={20} />
            </IconButton>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Show or hide table columns
          </Typography>
        </PopoverHeader>

        <PopoverContent>
          {columns.map((column) => {
            const isEssential = column.id === 'view' || column.id === 'action';
            return (
              <StyledFormControlLabel
                key={column.id}
                control={
                  <Checkbox
                    checked={visibleColumns.includes(column.id)}
                    onChange={() => onToggleColumn(column.id)}
                    disabled={isEssential}
                    size="small"
                    sx={{
                      color: '#5B7FE8',
                      '&.Mui-checked': {
                        color: '#5B7FE8',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {column.label}
                    </Typography>
                    {isEssential && (
                      <Typography variant="caption" color="text.secondary">
                        Required column
                      </Typography>
                    )}
                  </Box>
                }
              />
            );
          })}
        </PopoverContent>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={1}>
            <SecondaryActionButton 
              onClick={onResetColumns} 
              variant="outlined"
              fullWidth
            >
              Reset All
            </SecondaryActionButton>
            <PrimaryActionButton 
              onClick={handleClose} 
              variant="contained"
              fullWidth
            >
              Apply
            </PrimaryActionButton>
          </Stack>
        </Box>
      </StyledPopover>
    </>
  );
}

InternshipColumnFilter.propTypes = {
  columns: PropTypes.array.isRequired,
  visibleColumns: PropTypes.array.isRequired,
  onToggleColumn: PropTypes.func.isRequired,
  onResetColumns: PropTypes.func.isRequired
};