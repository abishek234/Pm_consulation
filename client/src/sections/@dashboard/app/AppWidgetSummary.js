// @mui
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Card, Typography, Box } from '@mui/material';
// utils
import { fShortenNumber } from '../../../utils/formatNumber';
// components
import Iconify from '../../../components/Iconify';

// ----------------------------------------------------------------------

const StyledCard = styled(Card)(({ theme, color }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid #e9ecef',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  },
}));

const IconWrapperStyle = styled('div')(({ theme, bgcolor }) => ({
  width: 64,
  height: 64,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: bgcolor,
  marginBottom: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
}));

const BackgroundCircle = styled('div')(({ bgcolor }) => ({
  position: 'absolute',
  width: 180,
  height: 180,
  borderRadius: '50%',
  backgroundColor: bgcolor,
  opacity: 0.1,
  bottom: -60,
  right: -60,
}));

// ----------------------------------------------------------------------

AppWidgetSummary.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  total: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  sx: PropTypes.object,
};

const colorMap = {
  primary: '#5B7FE8',
  info: '#00B8D9',
  success: '#36B37E',
  warning: '#FFAB00',
  error: '#FF5630',
  secondary: '#8E33FF',
};

export default function AppWidgetSummary({ title, total, icon, color = 'primary', sx, ...other }) {
  const bgColor = colorMap[color] || colorMap.primary;

  return (
    <StyledCard sx={{ ...sx }} {...other}>
      <BackgroundCircle bgcolor={bgColor} />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <IconWrapperStyle bgcolor={bgColor}>
          <Iconify icon={icon} width={32} height={32} color="#ffffff" />
        </IconWrapperStyle>

        <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, color: '#1a1a1a' }}>
          {typeof total === 'number' ? fShortenNumber(total) : total}
        </Typography>

        <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
    </StyledCard>
  );
}