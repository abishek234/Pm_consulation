import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Button,
  Paper,
  Avatar,
  Alert,
  IconButton,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Tabs,
  Tab,
  CircularProgress,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CardActions
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Build as BuildIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  MonetizationOn as MonetizationOnIcon,
  Assignment as AssignmentIcon,
  DateRange as DateRangeIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Iconify from '../components/Iconify';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid #e9ecef',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 800,
  color: '#1a1a1a',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  fontWeight: 700,
  color: '#1a1a1a',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.2, 3),
  fontWeight: 700,
  textTransform: 'none',
  backgroundColor: '#5B7FE8',
  color: '#ffffff',
  boxShadow: '0 4px 12px rgba(91, 127, 232, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#4865D8',
    boxShadow: '0 6px 20px rgba(91, 127, 232, 0.4)',
    transform: 'translateY(-2px)',
  },
}));

const OutlinedButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.2, 3),
  fontWeight: 700,
  textTransform: 'none',
  color: '#5B7FE8',
  border: '2px solid #5B7FE8',
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(91, 127, 232, 0.08)',
    borderColor: '#4865D8',
  },
}));

const StatsCard = styled(Paper)(({ theme, bgcolor }) => ({
  padding: theme.spacing(2.5),
  textAlign: 'center',
  borderRadius: 16,
  backgroundColor: bgcolor || '#f8f9fa',
  border: '1px solid #e9ecef',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
  },
}));

const InternshipCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  border: '1px solid #e9ecef',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#5B7FE8',
    boxShadow: '0 8px 32px rgba(91, 127, 232, 0.16)',
    transform: 'translateY(-4px)',
  },
}));

const MatchBadge = styled(Chip)(({ theme }) => ({
  backgroundColor: '#5B7FE8',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '0.875rem',
  height: 32,
  borderRadius: 10,
}));

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  borderRadius: 12,
  padding: theme.spacing(2),
  border: '1px solid #e9ecef',
  marginBottom: theme.spacing(2),
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    padding: theme.spacing(1),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
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
    fontWeight: 600,
  },
}));

const StudentDashboard = () => {
  // State declarations
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [availableSectors, setAvailableSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editFormData, setEditFormData] = useState({});
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [emailNotificationStatus, setEmailNotificationStatus] = useState({
    hasEmail: false,
    email: '',
    notificationsEnabled: false,
    notificationType: 'email',
    status: 'disabled'
  });
  const [emailNotificationLoading, setEmailNotificationLoading] = useState(false);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('id');
  const userEmail = localStorage.getItem('email');

  // Predefined options
  const skillOptions = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
    'Angular', 'Vue.js', 'PHP', 'C++', 'C#', 'Ruby', 'Go', 'Swift', 'Kotlin',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS',
    'Git', 'Linux', 'Machine Learning', 'Data Analysis', 'UI/UX Design',
    'Photoshop', 'Illustrator', 'Figma', 'AutoCAD', 'SolidWorks', 'MATLAB',
    'R Programming', 'Tableau', 'Power BI', 'Excel', 'Project Management',
    'Digital Marketing', 'Content Writing', 'Social Media Marketing', 'SEO'
  ];

  const locationOptions = [
    'Remote', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune',
    'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore',
    'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
    'Surat', 'Kochi', 'Coimbatore', 'Madurai', 'Thiruvananthapuram', 'Mysore'
  ];

  const languageOptions = [
    { code: 'en-IN', name: 'English' },
    { code: 'hi-IN', name: 'हिंदी (Hindi)' },
    { code: 'ta-IN', name: 'தமிழ் (Tamil)' },
    { code: 'mr-IN', name: 'मराठी (Marathi)' },
    { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)' },
  ];

  // Initialize dashboard
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchStudentData(),
          fetchSectors(),
          fetchEmailNotificationStatus()
        ]);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        toast.error('Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };
    initializeDashboard();
  }, []);

  // Helper functions
  const getSectorNames = (sectorInterests) => {
    if (!sectorInterests || !Array.isArray(sectorInterests)) return [];
    return sectorInterests.map(sector => {
      if (typeof sector === 'object' && sector.name) return sector.name;
      const foundSector = availableSectors.find(s => s._id === sector);
      return foundSector ? foundSector.name : 'Unknown Sector';
    });
  };

  // API functions
  const fetchSectors = async () => {
    setLoadingSectors(true);
    try {
      const response = await axios.get('http://localhost:7070/api/sectors');
      setAvailableSectors(response.data.sectors || []);
    } catch (error) {
      console.error('Error fetching sectors:', error);
      toast.error('Failed to load sectors');
    } finally {
      setLoadingSectors(false);
    }
  };

  const fetchStudentData = async () => {
    try {
      const profileResponse = await axios.get(
        `http://localhost:7070/api/auth/profile/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (profileResponse.data.profile) {
        setProfile(profileResponse.data.profile);
        fetchRecommendations();
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Error loading profile');
    }
  };

  const fetchRecommendations = async () => {
    try {
      setRecommendationsLoading(true);
      const response = await axios.get(
        `http://localhost:7070/api/internships/recommendations/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const fetchEmailNotificationStatus = async () => {
    try {
      const response = await axios.get(
        `http://localhost:7070/api/auth/status/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmailNotificationStatus(response.data);
    } catch (error) {
      console.error('Error fetching notification status:', error);
      setEmailNotificationStatus({
        hasEmail: !!userEmail,
        email: userEmail || '',
        notificationsEnabled: false,
        notificationType: 'email',
        status: 'disabled'
      });
    }
  };

  const toggleEmailNotifications = async (enabled) => {
    setEmailNotificationLoading(true);
    try {
      await axios.put(
        `http://localhost:7070/api/auth/toggle/${userId}`,
        { enabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchEmailNotificationStatus();
      toast.success(`Email notifications ${enabled ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setEmailNotificationLoading(false);
    }
  };

  // Handler functions
  const handleViewDetails = (internship) => {
    setSelectedInternship(internship);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedInternship(null);
  };

  const handleRefreshRecommendations = () => {
    fetchRecommendations();
    toast.info('Refreshing recommendations...');
  };

  const handleEditProfile = () => {
    setEditFormData({
      education: profile.education || '',
      skills: profile.skills || [],
      sector_interests: profile.sector_interests || [],
      preferred_locations: profile.preferred_locations || [],
      language: profile.language || 'en-IN'
    });

    if (profile.sector_interests) {
      const profileSectorIds = profile.sector_interests.map(sector => 
        typeof sector === 'object' ? sector._id : sector
      );
      const sectorsToSelect = availableSectors.filter(sector => 
        profileSectorIds.includes(sector._id)
      );
      setSelectedSectors(sectorsToSelect);
    }
    setEditDialogOpen(true);
  };

  const handleCompleteProfile = () => {
    navigate('/dashboard/profile-setup');
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setActiveTab(0);
    setEditFormData({});
    setSelectedSectors([]);
  };

  const handleFormChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSectorChange = (event, newValue) => {
    setSelectedSectors(newValue);
    setEditFormData(prev => ({
      ...prev,
      sector_interests: newValue.map(sector => sector._id)
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updateData = { id: userId, ...editFormData };
      const response = await axios.post(
        'http://localhost:7070/api/auth/profile/create',
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.profile) {
        setProfile(response.data.profile);
        toast.success('Profile updated successfully!');
        handleCloseEditDialog();
        fetchRecommendations();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  // Tab Panel Component
  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  // Render Details Dialog
  const renderInternshipDetailsDialog = () => {
    if (!selectedInternship) return null;

    return (
      <StyledDialog open={detailsDialogOpen} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#5B7FE8' }}>
                {selectedInternship.title}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5 }}>
                {selectedInternship.company}
              </Typography>
              <Box display="flex" alignItems="center" mt={1.5} gap={1}>
                <MatchBadge label={`${selectedInternship.matchScore}% Match`} />
                <Chip label={selectedInternship.job_id} variant="outlined" size="small" />
              </Box>
            </Box>
            <IconButton onClick={handleCloseDetailsDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardContent>
                  <SectionTitle sx={{ mb: 2 }}>
                    <Iconify icon="eva:briefcase-fill" width={24} height={24} sx={{ color: '#5B7FE8' }} />
                    Job Details
                  </SectionTitle>
                  
                  <InfoBox>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                      Location
                    </Typography>
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <LocationIcon fontSize="small" sx={{ mr: 1, color: '#5B7FE8' }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedInternship.location}
                      </Typography>
                      {selectedInternship.remote_ok && (
                        <Chip label="Remote" size="small" color="success" sx={{ ml: 1 }} />
                      )}
                    </Box>
                  </InfoBox>

                  <InfoBox>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                      Duration
                    </Typography>
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <ScheduleIcon fontSize="small" sx={{ mr: 1, color: '#5B7FE8' }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedInternship.duration}
                      </Typography>
                    </Box>
                  </InfoBox>

                  <InfoBox>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                      Stipend
                    </Typography>
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <MonetizationOnIcon fontSize="small" sx={{ mr: 1, color: '#36B37E' }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#36B37E' }}>
                        {selectedInternship.stipend?.amount > 0 
                          ? `₹${selectedInternship.stipend.amount.toLocaleString()}/month`
                          : 'Unpaid'
                        }
                      </Typography>
                    </Box>
                  </InfoBox>

                  <InfoBox>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                      Deadline
                    </Typography>
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <DateRangeIcon fontSize="small" sx={{ mr: 1, color: '#FF5630' }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {new Date(selectedInternship.applicationDeadline).toLocaleDateString('en-IN')}
                      </Typography>
                    </Box>
                  </InfoBox>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardContent>
                  <SectionTitle sx={{ mb: 2 }}>
                    <Iconify icon="eva:code-fill" width={24} height={24} sx={{ color: '#5B7FE8' }} />
                    Requirements
                  </SectionTitle>
                  
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, display: 'block', mb: 1 }}>
                      Skills Required
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedInternship.skills_required?.map((skill, index) => (
                        <Chip key={index} label={skill} size="small" color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Box>

                  {selectedInternship.sectors && selectedInternship.sectors.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, display: 'block', mb: 1 }}>
                        Industry Sectors
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedInternship.sectors.map((sector, index) => (
                          <Chip key={index} label={sector.name} size="small" color="secondary" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, display: 'block', mb: 1 }}>
                      Education
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedInternship.eligibility?.education && selectedInternship.eligibility.education.length > 0 ? (
                        selectedInternship.eligibility.education.map((edu, index) => {
                          const isMatched = selectedInternship.eligibilityDetails?.matchedWith && 
                                           edu.toLowerCase() === selectedInternship.eligibilityDetails.matchedWith.toLowerCase();
                          return (
                            <Chip 
                              key={index} 
                              label={edu} 
                              size="small" 
                              color={isMatched ? "success" : "default"}
                              variant={isMatched ? "filled" : "outlined"}
                            />
                          );
                        })
                      ) : (
                        <Chip label="Any education level" size="small" color="success" />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <SectionTitle sx={{ mb: 2 }}>
                    <Iconify icon="eva:file-text-fill" width={24} height={24} sx={{ color: '#5B7FE8' }} />
                    Job Description
                  </SectionTitle>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                    {selectedInternship.description}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12}>
              <StyledCard sx={{ bgcolor: 'rgba(54, 179, 126, 0.08)', border: '1px solid #36B37E' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#36B37E', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon />
                    Why This Matches ({selectedInternship.matchScore}%)
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckIcon sx={{ color: '#36B37E' }} fontSize="small" /></ListItemIcon>
                      <ListItemText primary={selectedInternship.matchDetails?.skills || 'Skills match'} primaryTypographyProps={{ color: '#36B37E', fontWeight: 600 }} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon sx={{ color: '#36B37E' }} fontSize="small" /></ListItemIcon>
                      <ListItemText primary={selectedInternship.matchDetails?.location || 'Location preference'} primaryTypographyProps={{ color: '#36B37E', fontWeight: 600 }} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon sx={{ color: '#36B37E' }} fontSize="small" /></ListItemIcon>
                      <ListItemText primary={selectedInternship.matchDetails?.sectors || 'Sector interest'} primaryTypographyProps={{ color: '#36B37E', fontWeight: 600 }} />
                    </ListItem>
                  </List>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <OutlinedButton onClick={handleCloseDetailsDialog}>Close</OutlinedButton>
          <PrimaryButton startIcon={<SendIcon />} onClick={() => window.open(selectedInternship.websiteLink, '_blank')}>
            Apply Now
          </PrimaryButton>
        </DialogActions>
      </StyledDialog>
    );
  };

  // Render Edit Dialog
  const renderEditDialog = () => (
    <StyledDialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit Profile</Typography>
          <IconButton onClick={handleCloseEditDialog} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Education" />
          <Tab label="Skills" />
          <Tab label="Sectors" />
          <Tab label="Locations" />
          <Tab label="Language" />
          <Tab label="Notifications" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <StyledTextField
            fullWidth
            label="Education Background"
            value={editFormData.education || ''}
            onChange={(e) => handleFormChange('education', e.target.value)}
            placeholder="e.g., B.Tech Computer Science"
            multiline
            rows={3}
            helperText="Describe your educational background"
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Autocomplete
            multiple
            options={skillOptions}
            freeSolo
            value={editFormData.skills || []}
            onChange={(event, newValue) => handleFormChange('skills', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} color="primary" />
              ))
            }
            renderInput={(params) => (
              <StyledTextField {...params} label="Technical Skills" placeholder="Type and press Enter" helperText="Add your technical skills" />
            )}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {loadingSectors ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={24} sx={{ color: '#5B7FE8' }} />
              <Typography sx={{ ml: 2 }}>Loading sectors...</Typography>
            </Box>
          ) : (
            <Autocomplete
              multiple
              options={availableSectors}
              getOptionLabel={(option) => option.name}
              value={selectedSectors}
              onChange={handleSectorChange}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                  <Chip color="secondary" label={option.name} {...getTagProps({ index })} key={option._id} />
                ))
              }
              renderInput={(params) => (
                <StyledTextField {...params} label="Sector Interests" placeholder="Select sectors..." helperText="Choose PM Internship sectors" />
              )}
            />
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Autocomplete
            multiple
            options={locationOptions}
            freeSolo
            value={editFormData.preferred_locations || []}
            onChange={(event, newValue) => handleFormChange('preferred_locations', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip color="info" label={option} {...getTagProps({ index })} key={index} />
              ))
            }
            renderInput={(params) => (
              <StyledTextField {...params} label="Preferred Locations" placeholder="Type city name" helperText="Where would you like to work?" />
            )}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <FormControl fullWidth>
            <InputLabel>Preferred Language</InputLabel>
            <Select
              value={editFormData.language || 'en-IN'}
              onChange={(e) => handleFormChange('language', e.target.value)}
              label="Preferred Language"
              sx={{ borderRadius: 3 }}
            >
              {languageOptions.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          <Box sx={{ border: '2px solid', borderColor: emailNotificationStatus.status === 'enabled' ? '#36B37E' : '#e9ecef', borderRadius: 3, p: 3, bgcolor: emailNotificationStatus.status === 'enabled' ? 'rgba(54, 179, 126, 0.08)' : '#f8f9fa' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={2}>
                {emailNotificationStatus.status === 'enabled' ? (
                  <CheckCircleIcon sx={{ color: '#36B37E', fontSize: 40 }} />
                ) : (
                  <EmailIcon sx={{ color: '#6c757d', fontSize: 40 }} />
                )}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Email Notifications</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {emailNotificationStatus.status === 'enabled' ? 'Enabled' : 'Disabled'}
                  </Typography>
                  {emailNotificationStatus.email && (
                    <Typography variant="caption" color="text.secondary">
                      {emailNotificationStatus.email}
                    </Typography>
                  )}
                </Box>
              </Box>
              <FormControlLabel
                control={<Switch checked={emailNotificationStatus.notificationsEnabled} onChange={(e) => toggleEmailNotifications(e.target.checked)} disabled={emailNotificationLoading} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#5B7FE8' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#5B7FE8' } }} />}
                label={emailNotificationStatus.notificationsEnabled ? 'ON' : 'OFF'}
              />
            </Box>
            
            {emailNotificationStatus.status === 'enabled' ? (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                You'll receive email notifications for 50%+ compatible internships!
              </Alert>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Enable notifications to receive personalized internship recommendations!
              </Alert>
            )}
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <OutlinedButton onClick={handleCloseEditDialog} disabled={saving}>Cancel</OutlinedButton>
        <PrimaryButton onClick={handleSaveProfile} disabled={saving} startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}>
          {saving ? 'Saving...' : 'Save Profile'}
        </PrimaryButton>
      </DialogActions>
    </StyledDialog>
  );

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ color: '#5B7FE8', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Loading your dashboard...</Typography>
            <Typography variant="body2" color="text.secondary">Preparing personalized recommendations</Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  // Profile incomplete state
  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <PageTitle gutterBottom>Welcome to PM Internship Scheme</PageTitle>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Complete Your Profile</Typography>
              <Typography variant="body1" paragraph>Get personalized internship recommendations by completing your profile.</Typography>
              <PrimaryButton onClick={handleCompleteProfile} startIcon={<PersonIcon />}>Complete Profile Now</PrimaryButton>
            </Alert>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Main dashboard
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <PageTitle>Welcome back, {profile.name}!</PageTitle>
          <Typography variant="subtitle1" color="text.secondary">PM Internship Scheme Dashboard</Typography>
        </Box>
        <Box display="flex" gap={2} flexWrap="wrap">
          {emailNotificationStatus.status === 'disabled' && (
            <OutlinedButton startIcon={<EmailIcon />} onClick={() => toggleEmailNotifications(true)} disabled={emailNotificationLoading} size="small">
              {emailNotificationLoading ? 'Enabling...' : 'Enable Alerts'}
            </OutlinedButton>
          )}
          <PrimaryButton startIcon={<EditIcon />} onClick={handleEditProfile}>Edit Profile</PrimaryButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {emailNotificationStatus.status === 'disabled' && (
          <Grid item xs={12}>
            <Alert severity="warning" sx={{ borderRadius: 3 }} action={<Button color="inherit" size="small" onClick={() => toggleEmailNotifications(true)} disabled={emailNotificationLoading} sx={{ fontWeight: 600 }}>Enable Now</Button>}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Don't miss perfect matches!</Typography>
              <Typography variant="body2">Get internship recommendations at {userEmail}</Typography>
            </Alert>
          </Grid>
        )}

        {/* Profile Overview Banner */}
        <Grid item xs={12}>
          <StyledCard sx={{ background: 'linear-gradient(135deg, #5B7FE8 0%, #4865D8 100%)' }}>
            <CardContent sx={{ py: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: '#ffffff', color: '#5B7FE8', width: 64, height: 64, fontSize: '1.5rem', fontWeight: 700 }}>
                      {profile.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
                          {profile.name}
                        </Typography>
                        <Chip 
                          label="PM Candidate" 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(255, 255, 255, 0.2)', 
                            color: '#ffffff',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)'
                          }} 
                        />
                        {emailNotificationStatus.status === 'enabled' && (
                          <Chip 
                            icon={<EmailIcon sx={{ color: '#ffffff !important' }} />}
                            label="Notifications Active" 
                            size="small" 
                            sx={{ 
                              bgcolor: 'rgba(54, 179, 126, 0.3)', 
                              color: '#ffffff',
                              fontWeight: 600,
                              backdropFilter: 'blur(10px)'
                            }} 
                          />
                        )}
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {profile.education && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <SchoolIcon sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.9)' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                              {profile.education}
                            </Typography>
                          </Box>
                        )}
                       
                      </Stack>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Profile Strength
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#ffffff', my: 1 }}>
                      {Math.round(
                        ((profile.skills?.length > 0 ? 25 : 0) +
                         (getSectorNames(profile.sector_interests).length > 0 ? 25 : 0) +
                         (profile.preferred_locations?.length > 0 ? 25 : 0) +
                         (profile.education ? 25 : 0)) 
                      )}%
                    </Typography>
                    <Box sx={{ width: '100%', height: 8, bgcolor: 'rgba(255, 255, 255, 0.2)', borderRadius: 2, overflow: 'hidden' }}>
                      <Box 
                        sx={{ 
                          width: `${Math.round(
                            ((profile.skills?.length > 0 ? 25 : 0) +
                             (getSectorNames(profile.sector_interests).length > 0 ? 25 : 0) +
                             (profile.preferred_locations?.length > 0 ? 25 : 0) +
                             (profile.education ? 25 : 0)) 
                          )}%`, 
                          height: '100%', 
                          bgcolor: '#ffffff',
                          transition: 'width 0.3s ease',
                          borderRadius: 2,
                          boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                        }} 
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Skills Card */}
        <Grid item xs={12} md={4}>
          <StyledCard sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(91, 127, 232, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BuildIcon sx={{ color: '#5B7FE8', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Skills</Typography>
                </Box>
                <MatchBadge label={profile.skills?.length || 0} size="small" />
              </Box>
              <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                {profile.skills && profile.skills.length > 0 ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {profile.skills.map((skill, index) => (
                      <Chip key={index} label={skill} size="small" variant="outlined" color="primary" />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">Add skills for better recommendations</Typography>
                )}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Sectors Card */}
        <Grid item xs={12} md={4}>
          <StyledCard sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(142, 51, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BusinessIcon sx={{ color: '#8E33FF', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Sectors</Typography>
                </Box>
                <Chip label={profile.sector_interests?.length || 0} size="small" sx={{ bgcolor: '#8E33FF', color: '#fff', fontWeight: 600 }} />
              </Box>
              <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                {getSectorNames(profile.sector_interests).length > 0 ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {getSectorNames(profile.sector_interests).map((name, index) => (
                      <Chip key={index} label={name} size="small" color="secondary" />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">Select sectors to find internships</Typography>
                )}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Locations Card */}
        <Grid item xs={12} md={4}>
          <StyledCard sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(0, 184, 217, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LocationIcon sx={{ color: '#00B8D9', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Locations</Typography>
                </Box>
                <Chip label={profile.preferred_locations?.length || 0} size="small" sx={{ bgcolor: '#00B8D9', color: '#fff', fontWeight: 600 }} />
              </Box>
              <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                {profile.preferred_locations && profile.preferred_locations.length > 0 ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {profile.preferred_locations.map((location, index) => (
                      <Chip key={index} label={location} size="small" color="info" />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">Add location preferences</Typography>
                )}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={6} md={3}>
          <StatsCard bgcolor="rgba(91, 127, 232, 0.12)">
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#5B7FE8' }}>{recommendations.length}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#5B7FE8' }}>Active Matches</Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} md={3}>
          <StatsCard bgcolor="rgba(54, 179, 126, 0.12)">
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#36B37E' }}>{profile.skills?.length || 0}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#36B37E' }}>Skills Listed</Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} md={3}>
          <StatsCard bgcolor="rgba(142, 51, 255, 0.12)">
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#8E33FF' }}>{getSectorNames(profile.sector_interests).length}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#8E33FF' }}>Sectors</Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} md={3}>
          <StatsCard bgcolor="rgba(0, 184, 217, 0.12)">
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#00B8D9' }}>{profile.preferred_locations?.length || 0}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#00B8D9' }}>Locations</Typography>
          </StatsCard>
        </Grid>

        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <SectionTitle><WorkIcon sx={{ color: '#5B7FE8' }} />Internship Recommendations</SectionTitle>
                <IconButton onClick={handleRefreshRecommendations} disabled={recommendationsLoading} sx={{ color: '#5B7FE8' }}><RefreshIcon /></IconButton>
              </Box>

              {recommendationsLoading && (
  <Box textAlign="center" py={4}>
    <CircularProgress sx={{ color: '#5B7FE8', mb: 2 }} />
    <Typography variant="body1" sx={{ fontWeight: 600 }}>Finding best matches...</Typography>
  </Box>
)}

{!recommendationsLoading && recommendations.length > 0 && (
  <>
    <Typography variant="body2" color="text.secondary" paragraph>
      Found {recommendations.length} internship{recommendations.length > 1 ? 's' : ''} matching your profile
    </Typography>
    <Grid container spacing={2}>
      {recommendations.map((internship, index) => (
        <Grid item xs={12} md={6} key={index}>
          <InternshipCard>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#5B7FE8' }}>{internship.title}</Typography>
                <MatchBadge label={`${internship.matchScore || 85}% Match`} size="small" />
              </Box>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>{internship.company}</Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <LocationIcon fontSize="small" sx={{ mr: 1, color: '#6c757d' }} />
                <Typography variant="body2" color="text.secondary">
                  {internship.location}
                  {internship.remote_ok && <Chip label="Remote" size="small" color="success" sx={{ ml: 1, height: 20 }} />}
                </Typography>
              </Box>
              {internship.sectors && internship.sectors.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {internship.sectors.map((sector, idx) => (
                      <Chip key={idx} label={sector.name} size="small" color="secondary" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
              <Box sx={{ bgcolor: 'rgba(54, 179, 126, 0.08)', p: 1.5, borderRadius: 2, border: '1px solid rgba(54, 179, 126, 0.3)' }}>
                <Typography variant="caption" sx={{ color: '#36B37E', fontWeight: 700, display: 'block', mb: 0.5 }}>Why this matches:</Typography>
                <Typography variant="caption" sx={{ color: '#36B37E', display: 'block' }}>✓ {internship.matchDetails?.skills || 'Skills'}</Typography>
                <Typography variant="caption" sx={{ color: '#36B37E', display: 'block' }}>✓ {internship.matchDetails?.location || 'Location'}</Typography>
                <Typography variant="caption" sx={{ color: '#36B37E', display: 'block' }}>✓ {internship.matchDetails?.sectors || 'Sector'}</Typography>
              </Box>
              <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                {internship.stipend?.amount > 0 ? (
                  <Chip label={`₹${internship.stipend.amount}/mo`} size="small" sx={{ bgcolor: '#36B37E', color: '#fff', fontWeight: 600 }} />
                ) : (
                  <Chip label="Unpaid" size="small" variant="outlined" />
                )}
                {internship.duration && <Chip label={internship.duration} size="small" color="info" variant="outlined" />}
              </Box>
              {internship.applicationDeadline && (
                <Typography variant="caption" sx={{ color: '#FF5630', fontWeight: 600, display: 'block', mt: 1 }}>
                  Deadline: {new Date(internship.applicationDeadline).toLocaleDateString()}
                </Typography>
              )}
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <OutlinedButton startIcon={<VisibilityIcon />} onClick={() => handleViewDetails(internship)} fullWidth size="small">View Details</OutlinedButton>
              <PrimaryButton startIcon={<SendIcon />} onClick={() => window.open(internship.websiteLink, '_blank')} fullWidth size="small">Apply</PrimaryButton>
            </CardActions>
          </InternshipCard>
        </Grid>
      ))}
    </Grid>
  </>
)}

{!recommendationsLoading && recommendations.length === 0 && (
  <Alert severity="info" sx={{ borderRadius: 3 }}>
    <Typography variant="body1" sx={{ fontWeight: 600 }} gutterBottom>No matching internships found</Typography>
    <Typography variant="body2">
      {emailNotificationStatus.status === 'enabled' 
        ? "We'll email you when matches become available!"
        : "Enable email notifications to get alerted about new opportunities."
      }
    </Typography>
  </Alert>
)}
            </CardContent>
          </StyledCard>
        </Grid>

        {emailNotificationStatus.status === 'enabled' && (
          <Grid item xs={12}>
            <Alert severity="success" variant="outlined" sx={{ borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }} gutterBottom>Email Notifications Active</Typography>
              <Typography variant="body2">
                Recommendations will be sent to {emailNotificationStatus.email} in {languageOptions.find(l => l.code === profile.language)?.name || 'English'}
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>

      {renderInternshipDetailsDialog()}
      {renderEditDialog()}
    </Container>
  );
};

export default StudentDashboard;