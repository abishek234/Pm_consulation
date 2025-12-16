import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
import { Box, Link, Button, Drawer, Typography, Avatar, Stack, Divider, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import axios from 'axios';
// hooks
import useResponsive from '../../hooks/useResponsive';
// components
import Logo from '../../components/Logo';
import Scrollbar from '../../components/Scrollbar';
import NavSection from '../../components/NavSection';
//
import { getNavConfig } from './NavConfig';


// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    width: DRAWER_WIDTH,
  },
}));

const LogoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 2.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(1),
  color: '#6c757d',
  '&:hover': {
    backgroundColor: '#f8f9fa',
    color: '#1a1a1a',
  },
}));

// ----------------------------------------------------------------------

DashboardSidebar.propTypes = {
  isOpenSidebar: PropTypes.bool,
  onCloseSidebar: PropTypes.func,
};

export default function DashboardSidebar({ isOpenSidebar, onCloseSidebar }) {
  const { pathname } = useLocation();
  const userRole = localStorage.getItem('role');
  const isDesktop = useResponsive('up', 'lg');
  

  useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <LogoBox>
        <Logo />
        {!isDesktop && (
          <CloseButton onClick={onCloseSidebar}>
            <Close />
          </CloseButton>
        )}
      </LogoBox>

      <Divider sx={{ borderStyle: 'dashed', borderColor: '#e9ecef', mx: 2.5 }} />

      <Box sx={{ px: 2.5 }}>
        <NavSection navConfig={getNavConfig(userRole)} />
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ px: 2.5, pb: 3 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
          © 2026 Internship Portal
        </Typography>
      </Box>
    </Scrollbar>
  );

  return (
    <RootStyle>
      {!isDesktop && (
        <Drawer
          open={isOpenSidebar}
          onClose={onCloseSidebar}
          PaperProps={{
            sx: { 
              width: DRAWER_WIDTH,
              backgroundColor: '#ffffff',
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}

      {isDesktop && (
        <Drawer
          open
          variant="persistent"
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              bgcolor: '#ffffff',
              borderRight: '1px solid #e9ecef',
              boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </RootStyle>
  );
}