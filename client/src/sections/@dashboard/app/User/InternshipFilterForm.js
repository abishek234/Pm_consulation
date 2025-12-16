import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Stack
} from '@mui/material';
import Iconify from '../../../../components/Iconify';

// ----------------------------------------------------------------------

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    fontSize: '0.875rem',
    '& fieldset': {
      borderColor: '#e9ecef',
      borderWidth: 2,
    },
    '&:hover fieldset': {
      borderColor: '#dee2e6',
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#5B7FE8',
      borderWidth: 2,
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    fontWeight: 600,
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 12,
  backgroundColor: '#f8f9fa',
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
    borderWidth: 2,
  },
}));

const ResetButton = styled(Button)(({ theme }) => ({
  borderRadius: 10,
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: 'none',
  backgroundColor: '#5B7FE8',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#4865D8',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#6c757d',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

// ----------------------------------------------------------------------

InternshipFilterForm.propTypes = {
  filters: PropTypes.object,
  onFilterChange: PropTypes.func,
  onResetFilters: PropTypes.func,
  sectors: PropTypes.array,
  loadingSectors: PropTypes.bool,
};

export default function InternshipFilterForm({ 
  filters, 
  onFilterChange, 
  onResetFilters,
  sectors = [],
  loadingSectors = false
}) {
  const [selectedSector, setSelectedSector] = useState(null);

  useEffect(() => {
    if (filters.sectors && sectors.length > 0) {
      const sector = sectors.find(s => 
        s.name.toLowerCase().includes(filters.sectors.toLowerCase())
      );
      setSelectedSector(sector || null);
    } else {
      setSelectedSector(null);
    }
  }, [filters.sectors, sectors]);

  const handleInputChange = (field) => (event) => {
    onFilterChange(field, event.target.value);
  };

  const handleSectorChange = (event, newValue) => {
    setSelectedSector(newValue);
    onFilterChange('sectors', newValue ? newValue.name : '');
  };

  const handleResetFilters = () => {
    setSelectedSector(null);
    onResetFilters();
  };

  return (
    <Box sx= {{ mb:7}}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Filter Internships
        </Typography>
        <Iconify icon="ic:round-filter-list" width={24} height={24} sx={{ color: '#5B7FE8' }} />
      </Box>
      
      <Stack spacing={2}>
        {/* Basic Filters */}
        <SectionTitle>Basic Information</SectionTitle>
        
        <StyledTextField
          fullWidth
          label="Job Title"
          value={filters.title || ''}
          onChange={handleInputChange('title')}
          placeholder="e.g. Software Developer"
          size="small"
        />

        <StyledTextField
          fullWidth
          label="Company"
          value={filters.company || ''}
          onChange={handleInputChange('company')}
          placeholder="e.g. Google, Microsoft"
          size="small"
        />

        <StyledTextField
          fullWidth
          label="Location"
          value={filters.location || ''}
          onChange={handleInputChange('location')}
          placeholder="e.g. Bangalore, Mumbai, Remote"
          size="small"
        />

        <StyledTextField
          fullWidth
          label="Job ID"
          value={filters.job_id || ''}
          onChange={handleInputChange('job_id')}
          placeholder="e.g. J1001"
          size="small"
        />

        {/* Skills & Sectors */}
        <SectionTitle>Skills & Sectors</SectionTitle>

        <StyledTextField
          fullWidth
          label="Skills"
          value={filters.skills || ''}
          onChange={handleInputChange('skills')}
          placeholder="e.g. Python, JavaScript, React"
          size="small"
          helperText="Search by required skills"
        />

        {loadingSectors ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Loading sectors...
            </Typography>
          </Box>
        ) : (
          <Autocomplete
            options={sectors}
            getOptionLabel={(option) => option.name}
            value={selectedSector}
            onChange={handleSectorChange}
            renderInput={(params) => (
              <StyledTextField
                {...params}
                label="Sector"
                placeholder="Select a sector..."
                size="small"
                helperText="Choose from available sectors"
              />
            )}
            fullWidth
          />
        )}

        {/* Status & Type */}
        <SectionTitle>Status & Type</SectionTitle>

        <FormControl variant="outlined" fullWidth size="small">
          <InputLabel sx={{ fontWeight: 600 }}>Status</InputLabel>
          <StyledSelect
            value={filters.status || ''}
            onChange={handleInputChange('status')}
            label="Status"
          >
            <MenuItem value="">
              <em>All Statuses</em>
            </MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Paused">Paused</MenuItem>
            <MenuItem value="Closed">Closed</MenuItem>
          </StyledSelect>
        </FormControl>

        <FormControl variant="outlined" fullWidth size="small">
          <InputLabel sx={{ fontWeight: 600 }}>Remote Work</InputLabel>
          <StyledSelect
            value={filters.remote_ok || ''}
            onChange={handleInputChange('remote_ok')}
            label="Remote Work"
          >
            <MenuItem value="">
              <em>All Types</em>
            </MenuItem>
            <MenuItem value="true">Remote Available</MenuItem>
            <MenuItem value="false">On-site Only</MenuItem>
          </StyledSelect>
        </FormControl>

        {/* Additional Filters */}
        <SectionTitle>Additional Filters</SectionTitle>

        <StyledTextField
          fullWidth
          label="Duration"
          value={filters.duration || ''}
          onChange={handleInputChange('duration')}
          placeholder="e.g. 3 months, 6 months"
          size="small"
          helperText="Search by internship duration"
        />

        <StyledTextField
          fullWidth
          label="Minimum Stipend (₹)"
          type="number"
          value={filters.minStipend || ''}
          onChange={handleInputChange('minStipend')}
          placeholder="e.g. 10000"
          size="small"
          helperText="Filter by minimum monthly stipend"
        />

        {/* Reset Button */}
        <ResetButton 
          variant="contained"
          fullWidth
          onClick={handleResetFilters}
          startIcon={<Iconify icon="eva:refresh-fill" />}
          sx={{ mt: 2 }}
        >
          Reset All Filters
        </ResetButton>
      </Stack>
    </Box>
  );
}