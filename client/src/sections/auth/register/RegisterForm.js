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
  Typography,
  Box,
  styled
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

const IconBox = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: '#10b981',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 24px',
  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
}));

// ----------------------------------------------------------------------

export default function RegisterForm() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [registeredData, setRegisteredData] = useState(null);

    const RegisterSchema = Yup.object().shape({
        name: Yup.string()
            .min(2, 'Name must be at least 2 characters')
            .max(50, 'Name must be less than 50 characters')
            .required('Name is required'),
        email: Yup.string()
            .email('Email must be a valid email address')
            .required('Email is required'),
        phone: Yup.string()
            .matches(/^[6-9]\d{9}$/, 'Phone number must be a valid 10-digit Indian number')
            .required('Phone number is required'),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            )
            .required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm password is required'),
    });

    const methods = useForm({
        resolver: yupResolver(RegisterSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        },
    });

    const { handleSubmit, formState: { isSubmitting }, reset } = methods;

    const onSubmit = async (data) => {
        try {
            const response = await axios.post('https://pm-consulation.onrender.com/api/auth/register', data);

            if (response.status === 201) {
                setRegisteredData({
                    name: data.name,
                    email: data.email,
                    userId: response.data.userId
                });
                setSuccessDialogOpen(true);
                toast.success('Registration successful! Please complete your profile.');
                reset(); // Clear form
            }
        } catch (error) {
            console.error('Registration error:', error);
            
            if (error.response?.status === 400) {
                toast.error(error.response.data.message || 'User already exists with this email or phone');
            } else {
                toast.error('Registration failed. Please try again.');
            }
        }
    };

    const handleGoToLogin = () => {
        setSuccessDialogOpen(false);
        navigate('/login', { replace: true });
    };

    return (
        <>
            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                    <RHFTextField 
                        name="name" 
                        label="Full Name" 
                        placeholder="Enter your full name"
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
                    
                    <RHFTextField 
                        name="email" 
                        label="Email Address" 
                        placeholder="Enter your email address"
                        type="email"
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
                    
                    <RHFTextField 
                        name="phone" 
                        label="Phone Number" 
                        placeholder="Enter your 10-digit phone number"
                        type="tel"
                        InputLabelProps={{
                          sx: { 
                            fontSize: '15px',
                            fontWeight: 600,
                          }
                        }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start" sx={{ fontWeight: 600 }}>+91</InputAdornment>,
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
                    
                    <RHFTextField
                        name="password"
                        label="Password"
                        placeholder="Create a strong password"
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
                    
                    <RHFTextField
                        name="confirmPassword"
                        label="Confirm Password"
                        placeholder="Re-enter your password"
                        type={showConfirmPassword ? 'text' : 'password'}
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
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                edge="end"
                                sx={{ 
                                  mr: 1,
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                  }
                                }}
                              >
                                <Iconify icon={showConfirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                    />
                </Stack>
                
                <Box 
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    p: 2,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid #e9ecef'
                  }}
                >
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        By registering, you agree to our Terms of Service and Privacy Policy.
                        Your phone number is required for government verification purposes.
                    </Typography>
                </Box>
                
                <StyledButton 
                    fullWidth 
                    size="large" 
                    type="submit" 
                    variant="contained" 
                    loading={isSubmitting}
                >
                    Create Account
                </StyledButton>
            </FormProvider>

            {/* Success Dialog */}
            <StyledDialog 
                open={successDialogOpen} 
                onClose={() => setSuccessDialogOpen(false)}
                maxWidth="sm"
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
                    Registration Successful!
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 4, px: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <IconBox>
                            <Iconify icon="eva:checkmark-circle-2-fill" width={40} height={40} color="white" />
                        </IconBox>
                    </Box>
                    <Typography variant="body1" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
                        Welcome, <strong>{registeredData?.name}</strong>! 
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ textAlign: 'center', lineHeight: 1.8 }}>
                        Your account has been created successfully. You can now login to access your dashboard 
                        and complete your profile to start receiving personalized internship recommendations.
                    </Typography>
                    <Box 
                      sx={{ 
                        textAlign: 'center', 
                        p: 2, 
                        backgroundColor: '#f0fdf4',
                        borderRadius: 2,
                        border: '1px solid #bbf7d0'
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#16a34a' }}>
                          🎉 Registration completed! Please login to continue.
                      </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 4, pb: 4, pt: 0 }}>
                    <LoadingButton 
                        onClick={handleGoToLogin} 
                        variant="contained"
                        fullWidth
                        sx={{
                          borderRadius: 3,
                          textTransform: 'none',
                          px: 3,
                          py: 1.5,
                          fontWeight: 700,
                          backgroundColor: '#2c3e50',
                          color: '#ffffff',
                          fontSize: '15px',
                          boxShadow: '0 4px 14px rgba(44, 62, 80, 0.25)',
                          '&:hover': {
                            backgroundColor: '#1a252f',
                            boxShadow: '0 6px 20px rgba(44, 62, 80, 0.35)',
                          },
                        }}
                        startIcon={<Iconify icon="eva:log-in-fill" />}
                    >
                        Go to Login
                    </LoadingButton>
                </DialogActions>
            </StyledDialog>
        </>
    );
}