import * as Yup from 'yup';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Stack,
  IconButton,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  TextField,
  styled,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField } from '../../../components/hook-form';

// ----------------------------------------------------------------------

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    padding: theme.spacing(2),
    minWidth: 480,
    boxShadow: '0 12px 48px rgba(0,0,0,0.12)',
  },
}));

const StyledButton = styled(LoadingButton)(({ theme }) => ({
  borderRadius: 12,
  padding: '16px 24px',
  fontSize: '16px',
  fontWeight: 700,
  textTransform: 'none',
  backgroundColor: '#2c3e50',
  color: '#ffffff',
  boxShadow: '0 4px 14px rgba(44, 62, 80, 0.25)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#1a252f',
    boxShadow: '0 6px 20px rgba(44, 62, 80, 0.35)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const OTPInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 14,
    fontSize: '2rem',
    letterSpacing: '0.8em',
    textAlign: 'center',
    fontWeight: 800,
    backgroundColor: '#f8f9fa',
    height: '80px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#f1f3f5',
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
    },
    '& input': {
      textAlign: 'center',
      padding: '20px',
    },
    '& fieldset': {
      borderColor: '#dee2e6',
      borderWidth: 2,
    },
    '&:hover fieldset': {
      borderColor: '#ced4da',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2c3e50',
      borderWidth: 2,
    },
  },
}));

const IconBox = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: '#2c3e50',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 24px',
  boxShadow: '0 4px 14px rgba(44, 62, 80, 0.25)',
}));

// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loadingOtp, setLoadingOtp] = useState(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('https://pm-consulation.onrender.com/api/auth/login', data);
      if (response.status === 200) {
        setEmail(data.email);
        setOtpDialogOpen(true);
        toast.info('OTP sent to your email', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Invalid email or password', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleVerifyOtp = async () => {
    setLoadingOtp(true);
    try {
      const response = await axios.post('https://pm-consulation.onrender.com/api/auth/verification-otp', {
        email,
        userOtp: otp,
      });
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('email', response.data.user.email);
        localStorage.setItem('id', response.data.user.id);
        localStorage.setItem('role', response.data.user.role);
        toast.success('Logged in successfully', {
          position: 'top-right',
          autoClose: 2000,
        });
        setOtpDialogOpen(false);
        console.log(response.data);
        navigate('/dashboard/app', { replace: true });
      }
    } catch (error) {
      console.log(error);
      toast.error('Invalid OTP', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoadingOtp(false);
    }
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3.5}>
          <RHFTextField
            name="email"
            label="Email address"
            InputLabelProps={{
              sx: { 
                fontSize: '15px',
                fontWeight: 600,
              }
            }}
            InputProps={{
              sx: {
                borderRadius: 3,
                backgroundColor: '#f8f9fa',
                height: '60px',
                fontSize: '15px',
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
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                },
                '&.Mui-focused fieldset': {
                  borderWidth: 2,
                },
              },
            }}
          />
          <Box>
            <RHFTextField
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              InputLabelProps={{
                sx: { 
                  fontSize: '15px',
                  fontWeight: 600,
                }
              }}
              InputProps={{
                sx: {
                  borderRadius: 3,
                  backgroundColor: '#f8f9fa',
                  height: '60px',
                  fontSize: '15px',
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
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: 2,
                  },
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowPassword(!showPassword)} 
                      edge="end"
                      sx={{ 
                        mr: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        }
                      }}
                    >
                      <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Stack>

        <Box sx={{ mt: 5 }}>
          <StyledButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
            Sign In
          </StyledButton>
        </Box>
      </FormProvider>

      {/* OTP Dialog */}
      <StyledDialog 
        open={otpDialogOpen} 
        onClose={() => setOtpDialogOpen(false)} 
        maxWidth="xs" 
        fullWidth
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 800,
            color: 'text.primary',
            pt: 4,
            pb: 2,
          }}
        >
          Verify Your Identity
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 4, px: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <IconBox>
              <Iconify icon="eva:lock-fill" width={40} height={40} color="white" />
            </IconBox>
            <Box sx={{ color: 'text.secondary', fontSize: '15px', lineHeight: 1.7, fontWeight: 400 }}>
              We've sent a verification code to
              <Box 
                component="span" 
                sx={{ 
                  display: 'block', 
                  fontWeight: 700, 
                  color: 'text.primary', 
                  mt: 1.5, 
                  fontSize: '16px',
                }}
              >
                {email}
              </Box>
            </Box>
          </Box>

          <OTPInput
            autoFocus
            margin="dense"
            placeholder="000000"
            type="text"
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputProps={{
              maxLength: 6,
              style: { textAlign: 'center' },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, pt: 0, gap: 1.5 }}>
          <Button
            onClick={() => setOtpDialogOpen(false)}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              px: 3,
              py: 1.5,
              fontWeight: 700,
              color: 'text.primary',
              border: '2px solid #e9ecef',
              flex: 1,
              fontSize: '15px',
              '&:hover': {
                border: '2px solid #dee2e6',
                backgroundColor: '#f8f9fa',
              },
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleVerifyOtp}
            loading={loadingOtp}
            variant="contained"
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              px: 3,
              py: 1.5,
              fontWeight: 700,
              backgroundColor: '#2c3e50',
              color: '#ffffff',
              flex: 1,
              fontSize: '15px',
              boxShadow: '0 4px 14px rgba(44, 62, 80, 0.25)',
              '&:hover': {
                backgroundColor: '#1a252f',
                boxShadow: '0 6px 20px rgba(44, 62, 80, 0.35)',
              },
            }}
          >
            Verify OTP
          </LoadingButton>
        </DialogActions>
      </StyledDialog>
    </>
  );
}