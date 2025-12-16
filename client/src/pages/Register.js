import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Card, Link, Container, Typography, Box } from '@mui/material';
import useResponsive from '../hooks/useResponsive';
import Page from '../components/Page';
import Logo from '../components/Logo';
import { RegisterForm } from '../sections/auth/register';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  background: '#f8f9fa',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
}));

const HeaderStyle = styled('header')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 10,
  padding: theme.spacing(3, 4),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4, 6),
  },
}));

const MainCard = styled(Card)(({ theme }) => ({
  maxWidth: 1200,
  width: '100%',
  margin: 'auto',
  borderRadius: 24,
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
  background: '#ffffff',
  border: '1px solid #e9ecef',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    minHeight: 680,
  },
}));

const SectionStyle = styled(Box)(({ theme }) => ({
  flex: 1,
  background: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(6),
  position: 'relative',
  borderRight: '1px solid #f1f3f5',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const ContentStyle = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(6, 4),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  background: '#ffffff',
  maxWidth: 520,
  margin: '0 auto',
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(7, 5),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(8, 6),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(8, 8),
  },
}));

const IllustrationBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 3,
  maxWidth: 450,
  width: '100%',
  margin: '0 auto',
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
  },
}));

const CircleDecoration = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  zIndex: 0,
  opacity: 0.6,
  '&.circle-1': {
    width: 200,
    height: 200,
    backgroundColor: '#e3f2fd',
    top: '5%',
    right: '8%',
  },
  '&.circle-2': {
    width: 150,
    height: 150,
    backgroundColor: '#fce4ec',
    bottom: '10%',
    left: '5%',
  },
  '&.circle-3': {
    width: 120,
    height: 120,
    backgroundColor: '#f1f8e9',
    top: '60%',
    left: '15%',
  },
  '&.circle-4': {
    width: 100,
    height: 100,
    backgroundColor: '#fff3e0',
    top: '30%',
    right: '20%',
  },
}));

const WelcomeBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 3,
  textAlign: 'center',
}));

// ----------------------------------------------------------------------

export default function Register() {
  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');

  return (
    <Page title="Register">
      <RootStyle>
        <HeaderStyle>
          <Logo />
          {smUp && (
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
              Already have an account?{' '}
              <Link
                variant="subtitle2"
                component={RouterLink}
                to="/login"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 700,
                  ml: 0.5,
                  padding: '10px 24px',
                  borderRadius: 2.5,
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    backgroundColor: '#e9ecef',
                    borderColor: '#dee2e6',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  },
                }}
              >
                Login
              </Link>
            </Typography>
          )}
        </HeaderStyle>

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, mt: { xs: 10, md: 0 } }}>
          <MainCard>
            {mdUp && (
              <SectionStyle>
                <CircleDecoration className="circle-1" />
                <CircleDecoration className="circle-2" />
                <CircleDecoration className="circle-3" />
                <CircleDecoration className="circle-4" />
                
                <WelcomeBox>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      mb: 3,
                      fontSize: { md: '2.5rem', lg: '3.2rem' },
                      lineHeight: 1.2,
                      color: '#1a1a1a',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Join Us Today!
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 6,
                      fontWeight: 400,
                      maxWidth: 380,
                      margin: '0 auto 60px',
                      lineHeight: 1.8,
                      fontSize: '1.1rem',
                      color: '#6c757d',
                    }}
                  >
                    Find the job more effectively with our platform
                  </Typography>
                  <IllustrationBox>
                    <img alt="register illustration" src="/static/illustrations/illustration_register.png" />
                  </IllustrationBox>
                </WelcomeBox>
              </SectionStyle>
            )}

            <ContentStyle>
              <Box sx={{ mb: 5 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    mb: 1.5,
                    color: '#1a1a1a',
                    fontSize: { xs: '1.875rem', md: '2.25rem' },
                    letterSpacing: '-0.02em',
                  }}
                >
                  Create Account
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#6c757d',
                    fontSize: '1rem',
                    fontWeight: 400,
                  }}
                >
                  Enter your details to get started
                </Typography>
              </Box>

              <RegisterForm />

              {!smUp && (
                <Typography variant="body2" sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
                  Already have an account?{' '}
                  <Link
                    variant="subtitle2"
                    to="/login"
                    component={RouterLink}
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontWeight: 700,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Login
                  </Link>
                </Typography>
              )}
            </ContentStyle>
          </MainCard>
        </Container>
      </RootStyle>
    </Page>
  );
}