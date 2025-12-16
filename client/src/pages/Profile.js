import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Avatar, 
  Grid, 
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled
} from '@mui/material';
import { Edit, Key, Send, Check, Close } from '@mui/icons-material';
import axios from 'axios';
import Iconify from '../components/Iconify';
import Page from '../components/Page';

// ----------------------------------------------------------------------

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 24,
  boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
  border: '1px solid #e9ecef',
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'visible',
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  fontSize: '2rem',
  fontWeight: 700,
  backgroundColor: '#5B7FE8',
  border: '4px solid #ffffff',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  [theme.breakpoints.down('sm')]: {
    width: 80,
    height: 80,
    fontSize: '1.5rem',
  },
}));

const RoleChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#5B7FE8',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '0.875rem',
  padding: theme.spacing(0.5, 2),
  height: 'auto',
  borderRadius: 16,
  boxShadow: 'none',
  '& .MuiChip-label': {
    padding: '6px 12px',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 14,
    backgroundColor: '#f8f9fa',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: '#e9ecef',
      borderWidth: 2,
    },
    '&:hover': {
      backgroundColor: '#f1f3f5',
      '& fieldset': {
        borderColor: '#dee2e6',
      },
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 14px rgba(91, 127, 232, 0.15)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#5B7FE8',
      borderWidth: 2,
    },
    '&.Mui-disabled': {
      backgroundColor: '#f8f9fa',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '14px',
    fontWeight: 600,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: '12px 28px',
  fontSize: '15px',
  fontWeight: 600,
  textTransform: 'none',
  backgroundColor: '#5B7FE8',
  color: '#ffffff',
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#4865D8',
    boxShadow: '0 4px 12px rgba(91, 127, 232, 0.25)',
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  fontWeight: 700,
  color: '#1a1a1a',
  marginBottom: theme.spacing(2.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  borderRadius: 16,
  padding: theme.spacing(3),
  border: '2px solid #e9ecef',
  marginBottom: theme.spacing(3),
}));

// ----------------------------------------------------------------------

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [initials, setInitials] = useState('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [otpSent, setOtpSent] = useState(false);
  
  const id = localStorage.getItem('id');
  const email = localStorage.getItem('email');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`https://pm-consulation.onrender.com/api/auth/profile/${id}`);
        setUser(response.data);
        
        // Generate initials
        if (response.data.name) {
          const nameInitials = response.data.name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
          setInitials(nameInitials);
        } else {
          const emailInitials = response.data.email.substring(0, 2).toUpperCase();
          setInitials(emailInitials);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage('Error loading profile data');
        setMessageType('error');
      }
    };

    fetchUserData();
  }, [id]);

  const requestOtp = async () => {
    try {
      await axios.post('https://pm-consulation.onrender.com/api/auth/request-otp', { email });
      setMessage('OTP sent to your email successfully!');
      setMessageType('success');
      setOtpSent(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setMessage('Error sending OTP. Please try again.');
      setMessageType('error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://pm-consulation.onrender.com/api/auth/change-password', {
        email: user.email,
        currentPassword,
        newPassword,
        otp,
      });
      setMessage('Password changed successfully!');
      setMessageType('success');
      
      // Reset fields
      setCurrentPassword('');
      setNewPassword('');
      setOtp('');
      setOtpSent(false);
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setPasswordDialogOpen(false);
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage('Error changing password. Please check your OTP or current password.');
      setMessageType('error');
    }
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setOtp('');
    setOtpSent(false);
    setMessage('');
  };

  if (!user) {
    return (
      <Page title="Profile">
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <Typography variant="h6" color="text.secondary">Loading...</Typography>
          </Box>
        </Container>
      </Page>
    );
  }

  return (
    <Page title="Profile">
      <Container maxWidth="lg">
        <Box sx={{ py: 5 }}>
          <StyledCard>
            {/* Profile Header Section */}
            <Grid container spacing={4} alignItems="center" sx={{ mb: 5 }}>
              <Grid item xs={12} md="auto" display="flex" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                <ProfileAvatar>
                  {initials}
                </ProfileAvatar>
              </Grid>
              
              <Grid item xs={12} md sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#1a1a1a',
                    mb: 1,
                    fontSize: { xs: '1.5rem', md: '1.75rem' },
                  }}
                >
                  {user.name || 'User Name'}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap', mt: 2 }}>
                  <RoleChip label={user.role || 'User'} />
                </Box>
              </Grid>
            </Grid>

            {/* Basic Information Section */}
            <Box sx={{ mb: 5 }}>
              <SectionTitle>
                <Iconify icon="eva:person-fill" width={28} height={28} />
                Basic Information
              </SectionTitle>
              
              <InfoBox>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Email Address"
                      value={user.email}
                      fullWidth
                      disabled
                      InputProps={{
                        startAdornment: (
                          <Iconify icon="eva:email-fill" width={20} height={20} sx={{ mr: 1, color: 'text.secondary' }} />
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Role"
                      value={user.role}
                      fullWidth
                      disabled
                      InputProps={{
                        startAdornment: (
                          <Iconify icon="eva:briefcase-fill" width={20} height={20} sx={{ mr: 1, color: 'text.secondary' }} />
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </InfoBox>
            </Box>

            {/* Password Section */}
            <Box>
              <SectionTitle>
                <Iconify icon="eva:lock-fill" width={28} height={28} />
                Security
              </SectionTitle>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  mt: 3
                }}
              >
                <GradientButton
                  startIcon={<Key />}
                  onClick={() => setPasswordDialogOpen(true)}
                  size="large"
                >
                  Change Password
                </GradientButton>
              </Box>
            </Box>
          </StyledCard>
        </Box>
      </Container>

      {/* Change Password Dialog */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            padding: 2,
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Change Password
            </Typography>
            <IconButton onClick={handleClosePasswordDialog} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <StyledTextField
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
              placeholder="Enter your current password"
              InputProps={{
                startAdornment: (
                  <Iconify icon="eva:lock-fill" width={20} height={20} sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              }}
            />
            
            <StyledTextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              placeholder="Enter your new password"
              helperText="Must be at least 6 characters with uppercase, lowercase, and number"
              InputProps={{
                startAdornment: (
                  <Iconify icon="eva:lock-fill" width={20} height={20} sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              }}
            />
            
            {otpSent && (
              <StyledTextField
                label="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                fullWidth
                placeholder="Enter 6-digit OTP"
                InputProps={{
                  startAdornment: (
                    <Iconify icon="eva:shield-fill" width={20} height={20} sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                }}
              />
            )}
            
            {message && (
              <Alert 
                severity={messageType} 
                sx={{ 
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: '1.5rem'
                  }
                }}
              >
                {message}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          {!otpSent ? (
            <>
              <Button 
                onClick={handleClosePasswordDialog}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                  py: 1.2,
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>
              <GradientButton
                onClick={requestOtp}
                startIcon={<Send />}
              >
                Request OTP
              </GradientButton>
            </>
          ) : (
            <>
              <Button 
                onClick={handleClosePasswordDialog}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                  py: 1.2,
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>
              <GradientButton
                onClick={handleChangePassword}
                startIcon={<Check />}
              >
                Change Password
              </GradientButton>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Page>
  );
};

export default ProfilePage;