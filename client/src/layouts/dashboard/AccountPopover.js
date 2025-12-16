import { useRef, useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { LogoutOutlined, PersonOutlined } from '@mui/icons-material';
import { Box, Divider, Typography, Stack, MenuItem, Avatar, IconButton } from '@mui/material';
// components
import MenuPopover from '../../components/MenuPopover';

// ----------------------------------------------------------------------

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  fontSize: '0.875rem',
  fontWeight: 700,
  cursor: 'pointer',
  border: `2px solid ${theme.palette.background.paper}`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  backgroundColor: '#5B7FE8',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(91, 127, 232, 0.3)',
  },
}));

const UserInfoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2.5),
  borderRadius: '12px',
  marginBottom: theme.spacing(1),
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.2, 2),
  margin: theme.spacing(0.5, 1),
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(2px)',
  },
}));

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [initials, setInitials] = useState('');

  useEffect(() => {
    // Get user data from localStorage or API
    const storedEmail = localStorage.getItem('email') || '';
    const storedRole = localStorage.getItem('role') || '';
    const userId = localStorage.getItem('id');
    
    setUserEmail(storedEmail);
    setUserRole(storedRole);

    // Fetch user name from API if available
    const fetchUserName = async () => {
      try {
        const response = await fetch(`https://pm-consulation.onrender.com/api/auth/profile/${userId}`);
        const data = await response.json();
        if (data && data.name) {
          setUserName(data.name);
          // Generate initials from name
          const nameInitials = data.name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
          setInitials(nameInitials);
        } else {
          // Fallback to email initials
          const emailInitials = storedEmail.substring(0, 2).toUpperCase();
          setInitials(emailInitials);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to email initials
        const emailInitials = storedEmail.substring(0, 2).toUpperCase();
        setInitials(emailInitials);
        setUserName(storedEmail.split('@')[0]);
      }
    };

    if (userId) {
      fetchUserName();
    }
  }, []);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate('/dashboard/profile');
  };

  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    
    handleClose();
    // Navigate to login page
    navigate('/login');
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.08),
            },
          }),
        }}
      >
        <StyledAvatar alt={userName}>
          {initials || 'U'}
        </StyledAvatar>
      </IconButton>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          p: 0,
          mt: 1.5,
          ml: 0.75,
          width: 240,
          '& .MuiMenuItem-root': {
            typography: 'body2',
            borderRadius: 0.75,
          },
        }}
      >
        <UserInfoBox>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 48,
                height: 48,
                fontSize: '1rem',
                fontWeight: 700,
                backgroundColor: '#5B7FE8',
              }}
            >
              {initials || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, maxWidth: 150 }}>
                {userName || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }} noWrap>
                {userEmail}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#5B7FE8', 
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  fontSize: '0.7rem',
                  display: 'block'
                }}
              >
                {userRole || 'User'}
              </Typography>
            </Box>
          </Stack>
        </UserInfoBox>

        <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

        <StyledMenuItem onClick={handleProfile}>
          <PersonOutlined sx={{ mr: 1.5, fontSize: '1.2rem' }} />
          Profile
        </StyledMenuItem>

        <StyledMenuItem onClick={handleLogout} sx={{ color: 'error.main', mb: 1 }}>
          <LogoutOutlined sx={{ mr: 1.5, fontSize: '1.2rem' }} />
          Logout
        </StyledMenuItem>
      </MenuPopover>
    </>
  );
}