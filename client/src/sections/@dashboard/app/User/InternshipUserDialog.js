import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Chip,
    Box,
    Switch,
    FormControlLabel,
    CircularProgress,
    Autocomplete,
    Stack,
    IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { toast } from 'react-toastify';
import Iconify from '../../../../components/Iconify';

// Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    maxWidth: 800,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(2),
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
    '&.Mui-disabled': {
      backgroundColor: '#f8f9fa',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 12,
  backgroundColor: '#f8f9fa',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e9ecef',
    borderWidth: 2,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#dee2e6',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#5B7FE8',
    borderWidth: 2,
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 700,
  color: '#1a1a1a',
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ChipContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  backgroundColor: '#f8f9fa',
  borderRadius: 12,
  border: '2px solid #e9ecef',
  minHeight: 60,
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
  '&:disabled': {
    backgroundColor: '#dee2e6',
    color: '#6c757d',
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 10,
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: 'none',
  color: '#6c757d',
  '&:hover': {
    backgroundColor: '#f8f9fa',
  },
}));

export default function InternshipUserDialog({ open, onClose, internshipId, fetchInternships }) {
    const [internshipData, setInternshipData] = useState({
        title: '',
        company: '',
        location: '',
        skills_required: [],
        sectors: [],
        description: '',
        remote_ok: false,
        duration: '',
        stipend: { amount: 0, currency: 'INR' },
        eligibility: { education: [] },
        applicationDeadline: '',
        maxApplications: 50,
        websiteLink: '',
        status: 'Active'
    });

    const [tempSkill, setTempSkill] = useState('');
    const [selectedSectors, setSelectedSectors] = useState([]);
    const [availableSectors, setAvailableSectors] = useState([]);
    const [tempEducation, setTempEducation] = useState('');
    const [loadingSectors, setLoadingSectors] = useState(false);
    const [loadingInternship, setLoadingInternship] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchSectors();
    }, []);

    useEffect(() => {
        if (internshipId) {
            fetchInternshipDetails();
        } else {
            resetForm();
        }
    }, [internshipId]);

    const fetchSectors = async () => {
        setLoadingSectors(true);
        try {
            const response = await axios.get('https://pm-consulation.onrender.com/api/sectors');
            setAvailableSectors(response.data.sectors || []);
        } catch (error) {
            console.error('Error fetching sectors:', error);
            toast.error('Failed to load sectors');
        } finally {
            setLoadingSectors(false);
        }
    };

    const fetchInternshipDetails = async () => {
        setLoadingInternship(true);
        try {
            const response = await axios.get(`https://pm-consulation.onrender.com/api/internships/internships/${internshipId}`);
            const fetchedData = response.data;
          
            setInternshipData({
                title: fetchedData.title || '',
                company: fetchedData.company || '',
                location: fetchedData.location || '',
                skills_required: fetchedData.skills_required || [],
                sectors: fetchedData.sectors || [],
                description: fetchedData.description || '',
                remote_ok: fetchedData.remote_ok || false,
                duration: fetchedData.duration || '',
                stipend: fetchedData.stipend || { amount: 0, currency: 'INR' },
                eligibility: fetchedData.eligibility || { education: [] },
                applicationDeadline: fetchedData.applicationDeadline ? 
                    new Date(fetchedData.applicationDeadline).toISOString().split('T')[0] : '',
                maxApplications: fetchedData.maxApplications || 50,
                websiteLink: fetchedData.websiteLink || '',
                status: fetchedData.status || 'Active'
            });

            if (fetchedData.sectors) {
                const sectorsToSelect = fetchedData.sectors.map(sector => {
                    if (typeof sector === 'string') {
                        return availableSectors.find(s => s._id === sector);
                    }
                    if (sector._id) {
                        return sector;
                    }
                    return null;
                }).filter(Boolean);
                
                setSelectedSectors(sectorsToSelect);
            }
        } catch (error) {
            console.error("Error fetching internship details:", error);
            toast.error("Failed to fetch internship details");
        } finally {
            setLoadingInternship(false);
        }
    };

    const handleUpdateInternship = async () => {
        if (!internshipData.title || !internshipData.company) {
            toast.error('Please fill in required fields');
            return;
        }

        if (selectedSectors.length === 0) {
            toast.error('Please select at least one sector');
            return;
        }

        try {
            const sectorIds = selectedSectors.map(sector => sector._id);
            const dataToSubmit = {
                ...internshipData,
                sectors: sectorIds
            };

            await axios.put(
                `https://pm-consulation.onrender.com/api/internships/admin/internships/${internshipId}`,
                dataToSubmit,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Internship updated successfully");
            fetchInternships();
            onClose();
        } catch (error) {
            console.error("Error updating internship:", error);
            toast.error(error.response?.data?.message || "Error updating internship");
        }
    };

    const resetForm = () => {
        setInternshipData({
            title: '',
            company: '',
            location: '',
            skills_required: [],
            sectors: [],
            description: '',
            remote_ok: false,
            duration: '',
            stipend: { amount: 0, currency: 'INR' },
            eligibility: { education: [] },
            applicationDeadline: '',
            maxApplications: 50,
            websiteLink: '',
            status: 'Active'
        });
        setSelectedSectors([]);
    };

    const addSkill = () => {
        if (tempSkill.trim() && !internshipData.skills_required.includes(tempSkill.trim())) {
            setInternshipData(prev => ({
                ...prev,
                skills_required: [...prev.skills_required, tempSkill.trim()]
            }));
            setTempSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setInternshipData(prev => ({
            ...prev,
            skills_required: prev.skills_required.filter(skill => skill !== skillToRemove)
        }));
    };

    const addEducation = () => {
        if (tempEducation.trim() && !internshipData.eligibility.education.includes(tempEducation.trim())) {
            setInternshipData(prev => ({
                ...prev,
                eligibility: {
                    ...prev.eligibility,
                    education: [...prev.eligibility.education, tempEducation.trim()]
                }
            }));
            setTempEducation('');
        }
    };

    const removeEducation = (educationToRemove) => {
        setInternshipData(prev => ({
            ...prev,
            eligibility: {
                ...prev.eligibility,
                education: prev.eligibility.education.filter(edu => edu !== educationToRemove)
            }
        }));
    };

    if (loadingInternship) {
        return (
            <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <CircularProgress size={60} sx={{ color: '#5B7FE8' }} />
                    <Typography variant="h6" sx={{ ml: 2 }}>Loading...</Typography>
                </DialogContent>
            </StyledDialog>
        );
    }

    return (
        <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <StyledDialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box sx={{ width: 48, height: 48, borderRadius: 2, backgroundColor: 'rgba(91, 127, 232, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Iconify icon="eva:edit-fill" width={24} height={24} sx={{ color: '#5B7FE8' }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Update Internship</Typography>
                            <Typography variant="caption" color="text.secondary">Edit internship details</Typography>
                        </Box>
                    </Stack>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </StyledDialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <Box sx={{ maxHeight: 500, overflowY: 'auto', pr: 1 }}>
                    <SectionTitle>
                        <Iconify icon="eva:info-fill" width={20} height={20} />
                        Basic Information
                    </SectionTitle>

                    <Stack spacing={2}>
                        <StyledTextField fullWidth label="Job Title" value={internshipData.title} onChange={(e) => setInternshipData(prev => ({ ...prev, title: e.target.value }))} />
                        <Stack direction="row" spacing={2}>
                            <StyledTextField fullWidth label="Company" value={internshipData.company} onChange={(e) => setInternshipData(prev => ({ ...prev, company: e.target.value }))} />
                            <StyledTextField fullWidth label="Location" value={internshipData.location} onChange={(e) => setInternshipData(prev => ({ ...prev, location: e.target.value }))} />
                        </Stack>
                        <StyledTextField fullWidth label="Description" value={internshipData.description} onChange={(e) => setInternshipData(prev => ({ ...prev, description: e.target.value }))} multiline rows={3} />
                    </Stack>

                    <SectionTitle>
                        <Iconify icon="eva:code-fill" width={20} height={20} />
                        Skills & Sectors
                    </SectionTitle>

                    <Stack spacing={2}>
                        <Box>
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                <StyledTextField fullWidth label="Add Skill" value={tempSkill} onChange={(e) => setTempSkill(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addSkill()} size="small" />
                                <Button onClick={addSkill} variant="contained" sx={{ minWidth: 100, borderRadius: 2, backgroundColor: '#5B7FE8', '&:hover': { backgroundColor: '#4865D8' } }}>Add</Button>
                            </Stack>
                            <ChipContainer>
                                {internshipData.skills_required.map((skill, index) => (
                                    <Chip key={index} label={skill} onDelete={() => removeSkill(skill)} deleteIcon={<DeleteIcon />} color="primary" variant="outlined" />
                                ))}
                            </ChipContainer>
                        </Box>

                        {loadingSectors ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                                <CircularProgress size={20} />
                                <Typography variant="body2">Loading sectors...</Typography>
                            </Box>
                        ) : (
                            <Autocomplete
                                multiple
                                options={availableSectors}
                                getOptionLabel={(option) => option.name}
                                value={selectedSectors}
                                onChange={(event, newValue) => setSelectedSectors(newValue)}
                                renderInput={(params) => <StyledTextField {...params} label="Select Sectors" placeholder="Choose sectors..." helperText="Select sectors" />}
                                renderTags={(tagValue, getTagProps) => tagValue.map((option, index) => <Chip label={option.name} {...getTagProps({ index })} key={option._id} color="secondary" />)}
                            />
                        )}
                    </Stack>

                    <SectionTitle>
                        <Iconify icon="eva:settings-2-fill" width={20} height={20} />
                        Details
                    </SectionTitle>

                    <Stack spacing={2}>
                        <FormControlLabel
                            control={<Switch checked={internshipData.remote_ok} onChange={(e) => setInternshipData(prev => ({ ...prev, remote_ok: e.target.checked }))} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#5B7FE8' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#5B7FE8' } }} />}
                            label="Remote Work Available"
                        />
                        <Stack direction="row" spacing={2}>
                            <StyledTextField fullWidth label="Duration" value={internshipData.duration} onChange={(e) => setInternshipData(prev => ({ ...prev, duration: e.target.value }))} />
                            <StyledTextField fullWidth label="Stipend (₹)" type="number" value={internshipData.stipend.amount} onChange={(e) => setInternshipData(prev => ({ ...prev, stipend: { ...prev.stipend, amount: parseInt(e.target.value, 10) || 0 } }))} />
                        </Stack>
                        <Stack direction="row" spacing={2}>
                            <StyledTextField fullWidth label="Deadline" type="date" value={internshipData.applicationDeadline} onChange={(e) => setInternshipData(prev => ({ ...prev, applicationDeadline: e.target.value }))} InputLabelProps={{ shrink: true }} />
                            <StyledTextField fullWidth label="Max Applications" type="number" value={internshipData.maxApplications} onChange={(e) => setInternshipData(prev => ({ ...prev, maxApplications: parseInt(e.target.value, 10) || 50 }))} />
                        </Stack>
                        <StyledTextField fullWidth label="Website Link" value={internshipData.websiteLink || ''} onChange={(e) => setInternshipData(prev => ({ ...prev, websiteLink: e.target.value }))} placeholder="https://company.com/careers" />
                        <FormControl fullWidth>
                            <InputLabel sx={{ fontWeight: 600 }}>Status</InputLabel>
                            <StyledSelect value={internshipData.status} label="Status" onChange={(e) => setInternshipData(prev => ({ ...prev, status: e.target.value }))}>
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Paused">Paused</MenuItem>
                                <MenuItem value="Closed">Closed</MenuItem>
                            </StyledSelect>
                        </FormControl>
                    </Stack>

                    <SectionTitle>
                        <Iconify icon="eva:award-fill" width={20} height={20} />
                        Eligibility
                    </SectionTitle>

                    <Box>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                            <StyledTextField fullWidth label="Add Education" value={tempEducation} onChange={(e) => setTempEducation(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addEducation()} size="small" />
                            <Button onClick={addEducation} variant="contained" sx={{ minWidth: 100, borderRadius: 2, backgroundColor: '#5B7FE8', '&:hover': { backgroundColor: '#4865D8' } }}>Add</Button>
                        </Stack>
                        <ChipContainer>
                            {internshipData.eligibility.education.map((edu, index) => (
                                <Chip key={index} label={edu} onDelete={() => removeEducation(edu)} deleteIcon={<DeleteIcon />} color="success" variant="outlined" />
                            ))}
                        </ChipContainer>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                <PrimaryButton onClick={handleUpdateInternship} disabled={selectedSectors.length === 0} startIcon={<Iconify icon="eva:save-fill" />}>
                    Update Internship
                </PrimaryButton>
            </DialogActions>
        </StyledDialog>
    );
}