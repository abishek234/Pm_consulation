import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    IconButton,
    Typography,
    Chip,
    Box,
    Switch,
    FormControlLabel,
    CircularProgress,
    Autocomplete,
    Stack,
    Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { toast } from 'react-toastify';
import Iconify from '../../../../components/Iconify';

// ----------------------------------------------------------------------

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: 20,
        maxWidth: 700,
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(2),
}));

const TitleBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const IconBox = styled(Box)(({ theme }) => ({
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(91, 127, 232, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing(2),
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
        fontSize: '0.875rem',
    },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#1a1a1a',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const AddButton = styled(Button)(({ theme }) => ({
    borderRadius: 10,
    padding: theme.spacing(0.8, 2),
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '0.875rem',
    minWidth: 80,
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    margin: theme.spacing(0.5),
    fontWeight: 500,
}));

const FileUploadBox = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    border: '2px dashed #e9ecef',
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: '#5B7FE8',
        backgroundColor: 'rgba(91, 127, 232, 0.04)',
    },
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: 10,
    padding: theme.spacing(1.2, 3),
    fontWeight: 600,
    textTransform: 'none',
}));

const PrimaryButton = styled(ActionButton)(({ theme }) => ({
    backgroundColor: '#5B7FE8',
    color: '#ffffff',
    '&:hover': {
        backgroundColor: '#4865D8',
    },
    '&:disabled': {
        backgroundColor: '#e9ecef',
        color: '#6c757d',
    },
}));

const SecondaryButton = styled(ActionButton)(({ theme }) => ({
    color: '#6c757d',
    borderColor: '#e9ecef',
    '&:hover': {
        backgroundColor: '#f8f9fa',
    },
}));

// ----------------------------------------------------------------------

export default function InternshipAddUserDialog({ open, onClose, fetchInternships }) {
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
        websiteLink: '',
        maxApplications: 50
    });

    const [tempSkill, setTempSkill] = useState('');
    const [selectedSectors, setSelectedSectors] = useState([]);
    const [availableSectors, setAvailableSectors] = useState([]);
    const [tempEducation, setTempEducation] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [loadingSectors, setLoadingSectors] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (open) {
            fetchSectors();
        }
    }, [open]);

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

    const handleAddInternship = async () => {
        if (!internshipData.title || !internshipData.company || selectedSectors.length === 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const sectorIds = selectedSectors.map(sector => sector._id);
            const dataToSubmit = {
                ...internshipData,
                sectors: sectorIds
            };

            const response = await axios.post(
                'http://localhost:7070/api/internships/admin/internships',
                dataToSubmit,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201) {
                fetchInternships();
                onClose();
                resetForm();
                toast.success('Internship added successfully');
            }
        } catch (error) {
            console.error('Error adding internship:', error);
            toast.error(error.response?.data?.message || 'Error adding internship');
        }
    };

    const handleBulkUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file before uploading');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post(
                'http://localhost:7070/api/internships/admin/internships/bulk-upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    },
                }
            );

            if (response.status === 201) {
                toast.success(`${response.data.count} internships uploaded successfully`);
                fetchInternships();
                setSelectedFile(null);
                onClose();
                resetForm();
            }
        } catch (error) {
            console.error('Error bulk uploading internships:', error);
            toast.error(error.response?.data?.message || 'Error bulk uploading internships');
        } finally {
            setIsUploading(false);
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
            websiteLink: '',
            maxApplications: 50
        });
        setTempSkill('');
        setSelectedSectors([]);
        setTempEducation('');
        setSelectedFile(null);
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

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const validTypes = ['.csv', '.xlsx', '.xls'];
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            
            if (validTypes.includes(fileExtension)) {
                setSelectedFile(file);
            } else {
                toast.error('Please upload a valid CSV or Excel file');
            }
        }
    };

    const isBulkMode = !!selectedFile;

    const handleIsBulkMode = (isBulkMode) => {
        if (!isBulkMode) {
            return 'Add Internship';
        }
        return 'Upload Internships';
    }

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <StyledDialogTitle>
                <TitleBox>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconBox>
                            <Iconify 
                                icon={isBulkMode ? "eva:cloud-upload-fill" : "eva:plus-circle-fill"} 
                                width={28} 
                                height={28} 
                                sx={{ color: '#5B7FE8' }} 
                            />
                        </IconBox>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                                {isBulkMode ? 'Bulk Upload Internships' : 'Add New Internship'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {isBulkMode ? 'Upload multiple internships from file' : 'Create a single internship posting'}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </TitleBox>
            </StyledDialogTitle>

            <DialogContent sx={{ px: 3, pb: 2 }}>
                {!isBulkMode ? (
                    <Box>
                        {/* Basic Information */}
                        <SectionTitle>
                            <Iconify icon="eva:info-fill" width={20} height={20} sx={{ color: '#5B7FE8' }} />
                            Basic Information
                        </SectionTitle>

                        <Stack spacing={2}>
                            <StyledTextField
                                fullWidth
                                label="Job Title"
                                value={internshipData.title}
                                onChange={(e) => setInternshipData(prev => ({ ...prev, title: e.target.value }))}
                                required
                                placeholder="e.g. Software Development Intern"
                            />

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <StyledTextField
                                    fullWidth
                                    label="Company"
                                    value={internshipData.company}
                                    onChange={(e) => setInternshipData(prev => ({ ...prev, company: e.target.value }))}
                                    required
                                    placeholder="e.g. Google"
                                />

                                <StyledTextField
                                    fullWidth
                                    label="Location"
                                    value={internshipData.location}
                                    onChange={(e) => setInternshipData(prev => ({ ...prev, location: e.target.value }))}
                                    required
                                    placeholder="e.g. Bangalore"
                                />
                            </Stack>

                            <StyledTextField
                                fullWidth
                                label="Description"
                                value={internshipData.description}
                                onChange={(e) => setInternshipData(prev => ({ ...prev, description: e.target.value }))}
                                multiline
                                rows={3}
                                required
                                placeholder="Describe the internship role..."
                            />
                        </Stack>

                        {/* Skills */}
                        <SectionTitle>
                            <Iconify icon="eva:code-fill" width={20} height={20} sx={{ color: '#5B7FE8' }} />
                            Skills Required
                        </SectionTitle>

                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                            <StyledTextField
                                label="Add Skill"
                                value={tempSkill}
                                onChange={(e) => setTempSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                size="small"
                                sx={{ flex: 1 }}
                            />
                            <AddButton onClick={addSkill} variant="outlined">
                                Add
                            </AddButton>
                        </Stack>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {internshipData.skills_required.map((skill, index) => (
                                <StyledChip
                                    key={index}
                                    label={skill}
                                    onDelete={() => removeSkill(skill)}
                                    deleteIcon={<DeleteIcon />}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>

                        {/* Sectors */}
                        <SectionTitle>
                            <Iconify icon="eva:grid-fill" width={20} height={20} sx={{ color: '#5B7FE8' }} />
                            Sectors
                        </SectionTitle>

                        {loadingSectors ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
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
                                renderInput={(params) => (
                                    <StyledTextField
                                        {...params}
                                        label="Select Sectors"
                                        placeholder="Choose sectors..."
                                        helperText="Select from PM Internship sectors"
                                    />
                                )}
                                renderTags={(tagValue, getTagProps) =>
                                    tagValue.map((option, index) => (
                                        <Chip
                                            label={option.name}
                                            {...getTagProps({ index })}
                                            key={option._id}
                                            variant="outlined"
                                            color="secondary"
                                        />
                                    ))
                                }
                            />
                        )}

                        {/* Internship Details */}
                        <SectionTitle>
                            <Iconify icon="eva:settings-fill" width={20} height={20} sx={{ color: '#5B7FE8' }} />
                            Internship Details
                        </SectionTitle>

                        <Stack spacing={2}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={internshipData.remote_ok}
                                        onChange={(e) => setInternshipData(prev => ({ ...prev, remote_ok: e.target.checked }))}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#5B7FE8',
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: '#5B7FE8',
                                            },
                                        }}
                                    />
                                }
                                label="Remote Work Available"
                            />

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <StyledTextField
                                    fullWidth
                                    label="Duration"
                                    value={internshipData.duration}
                                    onChange={(e) => setInternshipData(prev => ({ ...prev, duration: e.target.value }))}
                                    placeholder="e.g. 3 months"
                                />

                                <StyledTextField
                                    fullWidth
                                    label="Monthly Stipend (₹)"
                                    type="number"
                                    value={internshipData.stipend.amount}
                                    onChange={(e) => setInternshipData(prev => ({ 
                                        ...prev, 
                                        stipend: { ...prev.stipend, amount: parseInt(e.target.value, 10) || 0 }
                                    }))}
                                />
                            </Stack>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <StyledTextField
                                    fullWidth
                                    label="Application Deadline"
                                    type="date"
                                    value={internshipData.applicationDeadline}
                                    onChange={(e) => setInternshipData(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />

                                <StyledTextField
                                    fullWidth
                                    label="Max Applications"
                                    type="number"
                                    value={internshipData.maxApplications}
                                    onChange={(e) => setInternshipData(prev => ({ ...prev, maxApplications: parseInt(e.target.value, 10) || 50 }))}
                                />
                            </Stack>

                            <StyledTextField
                                fullWidth
                                label="Website Link"
                                value={internshipData.websiteLink || ''}
                                onChange={(e) => setInternshipData(prev => ({ ...prev, websiteLink: e.target.value }))}
                                placeholder="https://company.com/careers"
                            />
                        </Stack>

                        {/* Eligibility */}
                        <SectionTitle>
                            <Iconify icon="eva:checkmark-circle-fill" width={20} height={20} sx={{ color: '#5B7FE8' }} />
                            Eligibility Criteria
                        </SectionTitle>

                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                            <StyledTextField
                                label="Add Education Level"
                                value={tempEducation}
                                onChange={(e) => setTempEducation(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEducation())}
                                size="small"
                                placeholder="e.g. B.Tech, MBA"
                                sx={{ flex: 1 }}
                            />
                            <AddButton onClick={addEducation} variant="outlined">
                                Add
                            </AddButton>
                        </Stack>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {internshipData.eligibility.education.map((edu, index) => (
                                <StyledChip
                                    key={index}
                                    label={edu}
                                    onDelete={() => removeEducation(edu)}
                                    deleteIcon={<DeleteIcon />}
                                    color="success"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                ) : null}

                {/* Bulk Upload Section */}
                <FileUploadBox>
                    <Iconify icon="eva:cloud-upload-outline" width={48} height={48} sx={{ color: '#5B7FE8', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        {selectedFile ? 'File Selected' : 'Bulk Upload Internships'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {selectedFile ? selectedFile.name : 'Upload CSV or Excel file with multiple internships'}
                    </Typography>
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        id="file-upload-input"
                    />
                    <label htmlFor="file-upload-input">
                        <Button
                            component="span"
                            variant={selectedFile ? "outlined" : "contained"}
                            startIcon={<Iconify icon="eva:attach-fill" />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            {selectedFile ? 'Change File' : 'Choose File'}
                        </Button>
                    </label>
                </FileUploadBox>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <SecondaryButton onClick={onClose} variant="outlined">
                    Cancel
                </SecondaryButton>
                <PrimaryButton
                    onClick={isBulkMode ? handleBulkUpload : handleAddInternship}
                    disabled={isUploading || (!isBulkMode && (selectedSectors.length === 0 || !internshipData.title))}
                    startIcon={
                        isUploading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            <Iconify icon={isBulkMode ? "eva:cloud-upload-fill" : "eva:plus-fill"} />
                        )
                    }
                >
                    {isUploading ? 'Uploading...' : handleIsBulkMode(isBulkMode)}
                </PrimaryButton>
            </DialogActions>
        </StyledDialog>
    );
}