import PropTypes from 'prop-types';
import { styled, alpha } from '@mui/material/styles';
import { 
  Toolbar, 
  Tooltip, 
  IconButton, 
  Typography, 
  OutlinedInput, 
  InputAdornment, 
  Card, 
  Box, 
  TextField, 
  Button, 
  useMediaQuery,
  Stack,
  Chip
} from '@mui/material';
import { useTheme } from '@emotion/react';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'react-toastify';
import Iconify from '../../../../components/Iconify';
import InternshipFilterForm from './InternshipFilterForm';

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

const NotifyButton = styled(IconButton)(({ theme }) => ({
  width: 42,
  height: 42,
  borderRadius: 12,
  backgroundColor: '#5B7FE8',
  color: '#ffffff',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#4865D8',
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

const DropdownCard = styled(Card)(({ theme, isMobile }) => ({
  position: 'absolute',
  top: '100%',
  left: isMobile ? 0 : 'auto',
  right: isMobile ? 0 : 0,
  zIndex: 10,
  marginTop: theme.spacing(1),
  padding: theme.spacing(2),
  width: isMobile ? '100%' : '400px',
  maxHeight: '500px',
  overflowY: 'auto',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  border: '1px solid #e9ecef',
}));

const NotificationPopup = styled(Card)(({ theme }) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1300,
  padding: theme.spacing(4),
  width: '90vw',
  maxWidth: 450,
  boxShadow: '0 12px 48px rgba(0,0,0,0.2)',
  borderRadius: 20,
  [theme.breakpoints.down('sm')]: {
    width: '95vw',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    '& fieldset': {
      borderColor: '#e9ecef',
      borderWidth: 2,
    },
    '&:hover fieldset': {
      borderColor: '#dee2e6',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#5B7FE8',
    },
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
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

const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 10,
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: 'none',
  color: '#6c757d',
  borderColor: '#e9ecef',
  '&:hover': {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
  },
}));

// ----------------------------------------------------------------------

InternshipListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  filters: PropTypes.object,
  onFilterChange: PropTypes.func,
  onResetFilters: PropTypes.func,
  selectedIds: PropTypes.array,
  sectors: PropTypes.array,
  loadingSectors: PropTypes.bool,
};

export default function InternshipListToolbar({ 
  numSelected, 
  filterName, 
  onFilterName, 
  filters, 
  onFilterChange, 
  onResetFilters, 
  selectedIds,
  sectors,
  loadingSectors
}) {
  const [showFilter, setShowFilter] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [notificationData, setNotificationData] = useState({
    minMatchScore: 50,
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const token = localStorage.getItem('token');

  const handleTriggerNotifications = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Please select internships to send notifications for");
      return;
    }

    setIsLoading(true);
    try {
      const promises = selectedIds.map(internshipId => 
        axios.post(
          `http://localhost:7070/api/internships/admin/internships/${internshipId}/notify`,
          { minMatchScore: notificationData.minMatchScore },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        toast.success(`Notifications sent to users for ${successful} internship${successful > 1 ? 's' : ''}`);
      }
      if (failed > 0) {
        toast.warning(`Failed to send notifications for ${failed} internship${failed > 1 ? 's' : ''}`);
      }

      setShowNotificationPopup(false);
      setNotificationData({ minMatchScore: 50 });
    } catch (error) {
      console.error('Error triggering notifications:', error);
      toast.error('Error sending notifications');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
              placeholder="Search internships..."
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

        <Stack direction="row" spacing={1}>
          {numSelected > 0 ? (
            <Tooltip title="Send notifications to matching users">
              <NotifyButton onClick={() => setShowNotificationPopup(true)}>
                <Iconify icon="eva:bell-fill" width={20} height={20} />
              </NotifyButton>
            </Tooltip>
          ) : (
            <Tooltip title="Filter internships">
              <FilterButton onClick={() => setShowFilter((prev) => !prev)}>
                <Iconify icon="ic:round-filter-list" width={20} height={20} />
              </FilterButton>
            </Tooltip>
          )}
        </Stack>

        {showFilter && (
          <DropdownCard isMobile={isMobile}>
            <InternshipFilterForm 
              filters={filters} 
              onFilterChange={onFilterChange} 
              onResetFilters={onResetFilters}
              sectors={sectors}
              loadingSectors={loadingSectors}
            />
          </DropdownCard>
        )}
      </RootStyle>

      {showNotificationPopup && (
        <>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1299,
            }}
            onClick={() => !isLoading && setShowNotificationPopup(false)}
          />
          <NotificationPopup>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Send Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Notify users whose profiles match the selected internship{selectedIds.length > 1 ? 's' : ''}.
            </Typography>
            
            <StyledTextField
              fullWidth
              type="number"
              label="Minimum Match Score (%)"
              value={notificationData.minMatchScore}
              onChange={(e) => setNotificationData(prev => ({ 
                ...prev, 
                minMatchScore: Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0))
              }))}
              inputProps={{ min: 0, max: 100 }}
              sx={{ mb: 3 }}
              helperText="Only users with match score above this threshold will be notified"
            />

            <Stack direction="row" spacing={2}>
              <SecondaryButton 
                variant="outlined"
                onClick={() => setShowNotificationPopup(false)}
                disabled={isLoading}
                fullWidth
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton 
                variant="contained"
                onClick={handleTriggerNotifications}
                disabled={isLoading}
                startIcon={!isLoading && <Iconify icon="eva:bell-fill" />}
                fullWidth
              >
                {isLoading ? 'Sending...' : 'Send Notifications'}
              </PrimaryButton>
            </Stack>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
              Push notifications will be sent to {numSelected} matching internship{numSelected > 1 ? 's' : ''}
            </Typography>
          </NotificationPopup>
        </>
      )}
    </>
  );
}