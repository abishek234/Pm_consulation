import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  IconButton,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  DateRange as DateIcon,
  Group as GroupIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Category as CategoryIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import Iconify from '../../../../components/Iconify';

// Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    maxWidth: 900,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  backgroundColor: '#f8f9fa',
  borderBottom: '1px solid #e9ecef',
}));

const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: '1px solid #e9ecef',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
}));

const InfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#6c757d',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 600,
  color: '#1a1a1a',
  marginTop: theme.spacing(0.5),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  fontWeight: 700,
  color: '#1a1a1a',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ChipContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

const IconBox = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}));

const CloseButton = styled(Button)(({ theme }) => ({
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

export default function InternshipUserViewDialog({ open, onClose, internship, internshipId }) {
    const [internshipData, setInternshipData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (internshipId && !internship) {
            fetchInternshipDetails();
        } else if (internship) {
            processInternshipData(internship).then(setInternshipData);
        }
    }, [internshipId, internship]);

    const fetchInternshipDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://pm-consulation.onrender.com/api/internships/internships/${internshipId}`);
            const processedData = await processInternshipData(response.data);
            setInternshipData(processedData);
        } catch (error) {
            console.error("Error fetching internship details:", error);
        } finally {
            setLoading(false);
        }
    };

    const processInternshipData = async (data) => {
        if (data.sectors && data.sectors.length > 0) {
            const firstSector = data.sectors[0];
            if (typeof firstSector === 'string' || (firstSector && !firstSector.name)) {
                try {
                    const sectorPromises = data.sectors.map(async (sectorId) => {
                        if (typeof sectorId === 'string') {
                            const sectorResponse = await axios.get(`https://pm-consulation.onrender.com/api/sectors/${sectorId}`);
                            return sectorResponse.data.sector;
                        }
                        return sectorId;
                    });
                    data.sectors = await Promise.all(sectorPromises);
                } catch (error) {
                    console.warn("Error fetching sector details:", error);
                }
            }
        }
        return data;
    };

    const getStatusColor = (status) => {
        if (status === 'Active') return 'success';
        if (status === 'Paused') return 'warning';
        return 'error';
    };

    const getSectorName = (sector) => {
        if (typeof sector === 'string') return sector;
        if (sector && sector.name) return sector.name;
        return 'Unknown Sector';
    };

    if (loading) {
        return (
            <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <CircularProgress size={60} sx={{ color: '#5B7FE8' }} />
                    <Typography variant="h6" sx={{ ml: 2 }}>Loading internship details...</Typography>
                </DialogContent>
            </StyledDialog>
        );
    }

    if (!internshipData) {
        return (
            <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogContent>
                    <Typography>No internship data available.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <CloseButton onClick={onClose} fullWidth>Close</CloseButton>
                </DialogActions>
            </StyledDialog>
        );
    }

    return (
        <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <StyledDialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <IconBox sx={{ backgroundColor: 'rgba(91, 127, 232, 0.12)' }}>
                            <WorkIcon sx={{ color: '#5B7FE8', fontSize: 24 }} />
                        </IconBox>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {internshipData.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {internshipData.company}
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </StyledDialogTitle>
            
            <DialogContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* Basic Information Card */}
                    <Grid item xs={12}>
                        <InfoCard>
                            <CardContent sx={{ p: 3 }}>
                                <SectionTitle>
                                    <Iconify icon="eva:info-fill" width={24} height={24} sx={{ color: '#5B7FE8' }} />
                                    Basic Information
                                </SectionTitle>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <InfoBox>
                                            <IconBox sx={{ backgroundColor: 'rgba(91, 127, 232, 0.08)' }}>
                                                <BusinessIcon sx={{ color: '#5B7FE8', fontSize: 20 }} />
                                            </IconBox>
                                            <Box>
                                                <InfoLabel>Company</InfoLabel>
                                                <InfoValue>{internshipData.company}</InfoValue>
                                            </Box>
                                        </InfoBox>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
                                        <InfoBox>
                                            <IconBox sx={{ backgroundColor: 'rgba(91, 127, 232, 0.08)' }}>
                                                <LocationIcon sx={{ color: '#5B7FE8', fontSize: 20 }} />
                                            </IconBox>
                                            <Box>
                                                <InfoLabel>Location</InfoLabel>
                                                <InfoValue>
                                                    {internshipData.location}
                                                    {internshipData.remote_ok && (
                                                        <Chip label="Remote OK" size="small" color="success" sx={{ ml: 1, height: 24 }} />
                                                    )}
                                                </InfoValue>
                                            </Box>
                                        </InfoBox>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <InfoBox>
                                            <IconBox sx={{ backgroundColor: 'rgba(91, 127, 232, 0.08)' }}>
                                                <ScheduleIcon sx={{ color: '#5B7FE8', fontSize: 20 }} />
                                            </IconBox>
                                            <Box>
                                                <InfoLabel>Duration</InfoLabel>
                                                <InfoValue>{internshipData.duration || 'Not specified'}</InfoValue>
                                            </Box>
                                        </InfoBox>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <InfoBox>
                                            <IconBox sx={{ backgroundColor: 'rgba(91, 127, 232, 0.08)' }}>
                                                <MoneyIcon sx={{ color: '#5B7FE8', fontSize: 20 }} />
                                            </IconBox>
                                            <Box>
                                                <InfoLabel>Stipend</InfoLabel>
                                                <InfoValue>
                                                    {internshipData.stipend?.amount 
                                                        ? `₹${internshipData.stipend.amount.toLocaleString()}/month`
                                                        : 'Not specified'
                                                    }
                                                </InfoValue>
                                            </Box>
                                        </InfoBox>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <InfoBox>
                                            <IconBox sx={{ backgroundColor: 'rgba(91, 127, 232, 0.08)' }}>
                                                <DateIcon sx={{ color: '#5B7FE8', fontSize: 20 }} />
                                            </IconBox>
                                            <Box>
                                                <InfoLabel>Application Deadline</InfoLabel>
                                                <InfoValue>{new Date(internshipData.applicationDeadline).toLocaleDateString()}</InfoValue>
                                            </Box>
                                        </InfoBox>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <InfoBox>
                                            <IconBox sx={{ backgroundColor: 'rgba(91, 127, 232, 0.08)' }}>
                                                <GroupIcon sx={{ color: '#5B7FE8', fontSize: 20 }} />
                                            </IconBox>
                                            <Box>
                                                <InfoLabel>Max Applications</InfoLabel>
                                                <InfoValue>{internshipData.maxApplications || 'Not specified'}</InfoValue>
                                            </Box>
                                        </InfoBox>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <InfoBox>
                                            <IconBox sx={{ backgroundColor: 'rgba(91, 127, 232, 0.08)' }}>
                                                {internshipData.status === 'Active' ? <CheckIcon sx={{ color: '#36B37E', fontSize: 20 }} /> : <CancelIcon sx={{ color: '#FF5630', fontSize: 20 }} />}
                                            </IconBox>
                                            <Box>
                                                <InfoLabel>Status</InfoLabel>
                                                <Chip label={internshipData.status} color={getStatusColor(internshipData.status)} size="small" sx={{ mt: 0.5, fontWeight: 600 }} />
                                            </Box>
                                        </InfoBox>
                                    </Grid>

                                    {internshipData.websiteLink && (
                                        <Grid item xs={12} sm={6}>
                                            <InfoBox>
                                                <IconBox sx={{ backgroundColor: 'rgba(91, 127, 232, 0.08)' }}>
                                                    <BusinessIcon sx={{ color: '#5B7FE8', fontSize: 20 }} />
                                                </IconBox>
                                                <Box>
                                                    <InfoLabel>Website</InfoLabel>
                                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                        <a href={internshipData.websiteLink} target="_blank" rel="noopener noreferrer" style={{ color: '#5B7FE8', textDecoration: 'none' }}>
                                                            {internshipData.websiteLink.length > 40 ? `${internshipData.websiteLink.slice(0, 40)}...` : internshipData.websiteLink}
                                                        </a>
                                                    </Typography>
                                                </Box>
                                            </InfoBox>
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>
                        </InfoCard>
                    </Grid>

                    {/* Description Card */}
                    <Grid item xs={12}>
                        <InfoCard>
                            <CardContent sx={{ p: 3 }}>
                                <SectionTitle>
                                    <Iconify icon="eva:file-text-fill" width={24} height={24} sx={{ color: '#5B7FE8' }} />
                                    Job Description
                                </SectionTitle>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                                    {internshipData.description || 'No description provided'}
                                </Typography>
                            </CardContent>
                        </InfoCard>
                    </Grid>

                    {/* Skills and Sectors */}
                    <Grid item xs={12} md={6}>
                        <InfoCard>
                            <CardContent sx={{ p: 3 }}>
                                <SectionTitle>
                                    <Iconify icon="eva:code-fill" width={24} height={24} sx={{ color: '#5B7FE8' }} />
                                    Skills Required
                                </SectionTitle>
                                <ChipContainer>
                                    {internshipData.skills_required?.length > 0 ? (
                                        internshipData.skills_required.map((skill, index) => (
                                            <Chip key={index} label={skill} variant="outlined" color="primary" />
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">No specific skills mentioned</Typography>
                                    )}
                                </ChipContainer>
                            </CardContent>
                        </InfoCard>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <InfoCard>
                            <CardContent sx={{ p: 3 }}>
                                <SectionTitle>
                                    <CategoryIcon sx={{ color: '#5B7FE8', fontSize: 24 }} />
                                    Sectors
                                </SectionTitle>
                                <ChipContainer>
                                    {internshipData.sectors?.length > 0 ? (
                                        internshipData.sectors.map((sector, index) => (
                                            <Chip key={typeof sector === 'string' ? sector : sector._id || index} label={getSectorName(sector)} color="secondary" />
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">No sectors specified</Typography>
                                    )}
                                </ChipContainer>
                                {internshipData.sectors?.length > 0 && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        {internshipData.sectors.length} sector{internshipData.sectors.length > 1 ? 's' : ''} listed
                                    </Typography>
                                )}
                            </CardContent>
                        </InfoCard>
                    </Grid>

                    {/* Eligibility */}
                    <Grid item xs={12}>
                        <InfoCard>
                            <CardContent sx={{ p: 3 }}>
                                <SectionTitle>
                                    <Iconify icon="eva:award-fill" width={24} height={24} sx={{ color: '#5B7FE8' }} />
                                    Eligibility Criteria
                                </SectionTitle>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <InfoLabel>Education Level</InfoLabel>
                                        <ChipContainer sx={{ mt: 1 }}>
                                            {internshipData.eligibility?.education?.length > 0 ? (
                                                internshipData.eligibility.education.map((edu, index) => (
                                                    <Chip key={index} label={edu} size="small" color="success" variant="outlined" />
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">Any education level</Typography>
                                            )}
                                        </ChipContainer>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </InfoCard>
                    </Grid>

                    {/* Additional Info */}
                    <Grid item xs={12}>
                        <InfoCard>
                            <CardContent sx={{ p: 3 }}>
                                <SectionTitle>
                                    <Iconify icon="eva:more-horizontal-fill" width={24} height={24} sx={{ color: '#5B7FE8' }} />
                                    Additional Information
                                </SectionTitle>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <InfoLabel>Job ID</InfoLabel>
                                        <InfoValue>{internshipData.job_id || 'Not assigned'}</InfoValue>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <InfoLabel>Posted Date</InfoLabel>
                                        <InfoValue>
                                            {internshipData.posted_date || internshipData.createdAt
                                                ? new Date(internshipData.posted_date || internshipData.createdAt).toLocaleDateString()
                                                : 'Not available'
                                            }
                                        </InfoValue>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <InfoLabel>Current Applications</InfoLabel>
                                        <InfoValue>{internshipData.currentApplications || 0} / {internshipData.maxApplications || 'Unlimited'}</InfoValue>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <InfoLabel>Remote Work</InfoLabel>
                                        <Chip label={internshipData.remote_ok ? 'Remote available' : 'On-site only'} color={internshipData.remote_ok ? 'success' : 'default'} size="small" sx={{ mt: 0.5 }} />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </InfoCard>
                    </Grid>
                </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 0 }}>
                <CloseButton onClick={onClose} fullWidth>Close</CloseButton>
            </DialogActions>
        </StyledDialog>
    );
}