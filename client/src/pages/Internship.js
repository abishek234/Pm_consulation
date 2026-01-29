import { filter } from 'lodash';
import { useState, useEffect } from 'react';
// material
import { styled } from '@mui/material/styles';
import {
    Card,
    Table,
    Stack,
    Button,
    Checkbox,
    TableRow,
    TableBody,
    TableCell,
    Container,
    Typography,
    TableContainer,
    TablePagination,
    useMediaQuery,
    Chip,
    CircularProgress,
    Box
} from '@mui/material';
import { useTheme } from '@emotion/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
// components
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import Iconify from '../components/Iconify';
import SearchNotFound from '../components/SearchNotFound';
import { 
    InternshipListHead, 
    InternshipListToolbar, 
    InternshipMoreMenu, 
    InternshipUserDialog, 
    InternshipAddUserDialog, 
    InternshipUserViewDialog, 
    InternshipColumnFilter 
} from '../sections/@dashboard/app/User';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'view', label: 'View', alignRight: false },
    { id: 'job_id', label: 'Job ID', alignRight: false },
    { id: 'title', label: 'Title', alignRight: false },
    { id: 'company', label: 'Company', alignRight: false },
    { id: 'location', label: 'Location', alignRight: false },
    { id: 'skills_required', label: 'Skills', alignRight: false },
    { id: 'sectors', label: 'Sectors', alignRight: false },
    { id: 'remote_ok', label: 'Remote', alignRight: false },
    { id: 'duration', label: 'Duration', alignRight: false },
    { id: 'stipend', label: 'Stipend', alignRight: false },
    { id: 'applicationDeadline', label: 'Deadline', alignRight: false },
    { id: 'websiteLink', label: 'Website', alignRight: false },
    { id: 'status', label: 'Status', alignRight: false },
    { id: 'posted_date', label: 'Posted', alignRight: false },
    { id: 'action', label: 'Action', alignRight: false },
];

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: 16,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e9ecef',
    overflow: 'hidden',
}));

const PageTitle = styled(Typography)(({ theme }) => ({
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#1a1a1a',
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: 12,
    padding: theme.spacing(1.2, 3),
    fontWeight: 700,
    textTransform: 'none',
    boxShadow: '0 4px 12px rgba(91, 127, 232, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: '0 6px 20px rgba(91, 127, 232, 0.4)',
        transform: 'translateY(-2px)',
    },
}));

const PrimaryButton = styled(ActionButton)(({ theme }) => ({
    backgroundColor: '#5B7FE8',
    color: '#ffffff',
    '&:hover': {
        backgroundColor: '#4865D8',
    },
}));

const OutlinedButton = styled(ActionButton)(({ theme }) => ({
    color: '#5B7FE8',
    border: '2px solid #5B7FE8',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    '&:hover': {
        backgroundColor: 'rgba(91, 127, 232, 0.08)',
        borderColor: '#4865D8',
    },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1a1a1a',
    padding: theme.spacing(2),
}));

const ViewButton = styled('button')(({ theme }) => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#5B7FE8',
    backgroundColor: 'rgba(91, 127, 232, 0.08)',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: 'rgba(91, 127, 232, 0.16)',
        transform: 'scale(1.05)',
    },
}));

const ChipContainer = styled(Box)(({ theme }) => ({
    maxWidth: 200,
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
}));

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function getSectorName(sector) {
    if (typeof sector === 'string') return sector;
    if (sector && sector.name) return sector.name;
    return 'Unknown';
}

function applySortFilter(array, comparator, query, filters) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    let filteredArray = stabilizedThis.map((el) => el[0]);

    if (query) {
        filteredArray = filteredArray.filter((internship) =>
            internship.job_id?.toLowerCase().includes(query.toLowerCase()) ||
            internship.title?.toLowerCase().includes(query.toLowerCase()) ||
            internship.company?.toLowerCase().includes(query.toLowerCase()) ||
            internship.location?.toLowerCase().includes(query.toLowerCase()) ||
            internship.skills_required?.some(skill => skill.toLowerCase().includes(query.toLowerCase())) ||
            internship.sectors?.some(sector => getSectorName(sector).toLowerCase().includes(query.toLowerCase())) ||
            internship.duration?.toLowerCase().includes(query.toLowerCase()) ||
            internship.status?.toLowerCase().includes(query.toLowerCase())
        );
    }

    if (filters) {
        filteredArray = filteredArray.filter(internship => {
            const titleMatch = !filters.title || internship.title?.toLowerCase().includes(filters.title.toLowerCase());
            const companyMatch = !filters.company || internship.company?.toLowerCase().includes(filters.company.toLowerCase());
            const locationMatch = !filters.location || internship.location?.toLowerCase().includes(filters.location.toLowerCase());
            const skillsMatch = !filters.skills || internship.skills_required?.some(skill => skill.toLowerCase().includes(filters.skills.toLowerCase()));
            const statusMatch = !filters.status || internship.status?.toLowerCase() === filters.status.toLowerCase();
            const remoteMatch = !filters.remote_ok || (filters.remote_ok === 'true' ? internship.remote_ok : !internship.remote_ok);
            const durationMatch = !filters.duration || internship.duration?.toLowerCase().includes(filters.duration.toLowerCase());
            const jobIdMatch = !filters.job_id || internship.job_id?.toLowerCase().includes(filters.job_id.toLowerCase());
            const stipendMatch = !filters.minStipend || (internship.stipend?.amount && internship.stipend.amount >= parseInt(filters.minStipend, 10));
            const sectorsMatch = !filters.sectors || internship.sectors?.some(sector => getSectorName(sector).toLowerCase().includes(filters.sectors.toLowerCase()));

            return titleMatch && companyMatch && locationMatch && skillsMatch && sectorsMatch && statusMatch && remoteMatch && durationMatch && jobIdMatch && stipendMatch;
        });
    }
    return filteredArray;
}

export default function Internship() {
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('title');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [internships, setInternships] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSectors, setLoadingSectors] = useState(true);
    const [editingInternshipId, setEditingInternshipId] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedInternship, setSelectedInternship] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [AddModalOpen, setAddModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        title: '', company: '', location: '', skills: '', sectors: '',
        status: '', remote_ok: '', duration: '', minStipend: '', job_id: ''
    });
    const [visibleColumns, setVisibleColumns] = useState(TABLE_HEAD.map(column => column.id));

    const token = localStorage.getItem('token');

    useEffect(() => {
        Promise.all([fetchInternships(), fetchSectors()]).finally(() => setLoading(false));
    }, []);

    const fetchSectors = async () => {
        setLoadingSectors(true);
        try {
            const response = await axios.get('http://localhost:7070/api/sectors');
            setSectors(response.data.sectors || []);
        } catch (error) {
            console.error("Error fetching sectors:", error);
            toast.error("Error fetching sectors");
        } finally {
            setLoadingSectors(false);
        }
    };

    const fetchInternships = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:7070/api/internships/internships');
            const internshipsData = response.data.internships || [];
            
            const processedInternships = await Promise.all(
                internshipsData.map(async (internship) => {
                    if (internship.sectors?.length > 0) {
                        const firstSector = internship.sectors[0];
                        if (typeof firstSector === 'string' || (firstSector && !firstSector.name)) {
                            try {
                                const sectorPromises = internship.sectors.map(async (sectorId) => {
                                    if (typeof sectorId === 'string') {
                                        const sectorResponse = await axios.get(`http://localhost:7070/api/sectors/${sectorId}`);
                                        return sectorResponse.data.sector;
                                    }
                                    return sectorId;
                                });
                                internship.sectors = await Promise.all(sectorPromises);
                            } catch (error) {
                                console.warn("Error fetching sector details:", error);
                            }
                        }
                    }
                    return internship;
                })
            );
            
            setInternships(processedInternships);
        } catch (error) {
            console.error("Error fetching internships:", error);
            toast.error("Error fetching internships");
        } finally {
            setLoading(false);
        }
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = (filteredInternships.length > 0 ? filteredInternships : internships).map((internship) => internship._id);
            setSelected(newSelecteds);
        } else {
            setSelected([]);
        }
    };

    const getVisibleSelectedCount = () => selected.filter((id) => filteredInternships.some((internship) => internship._id === id)).length;
    const getSelectedIds = () => selected;

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];
        if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
        else if (selectedIndex === 0) newSelected = newSelected.concat(selected.slice(1));
        else if (selectedIndex === selected.length - 1) newSelected = newSelected.concat(selected.slice(0, -1));
        else if (selectedIndex > 0) newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
        setSelected(newSelected);
    };

    const handleToggleColumn = (columnId) => {
        setVisibleColumns(prev => prev.includes(columnId) ? prev.filter(id => id !== columnId) : [...prev, columnId]);
    };

    const handleResetColumns = () => setVisibleColumns(TABLE_HEAD.map(column => column.id));
    const handleFilterChange = (field, value) => { setFilters(prev => ({ ...prev, [field]: value })); setPage(0); };
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleFilterByName = (event) => { setFilterName(event.target.value); setPage(0); };
    const handleResetFilters = () => { setFilters({ title: '', company: '', location: '', skills: '', sectors: '', status: '', remote_ok: '', duration: '', minStipend: '', job_id: '' }); setFilterName(''); setPage(0); };

    const handleDeleteInternship = async (internshipId) => {
        if (window.confirm("Are you sure you want to delete this internship?")) {
            try {
                await axios.delete(`http://localhost:7070/api/internships/admin/internships/${internshipId}`, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Internship deleted successfully");
                fetchInternships();
                setSelected(prev => prev.filter(id => id !== internshipId));
            } catch (error) {
                console.error("Error deleting internship:", error);
                toast.error("Error deleting internship");
            }
        }
    };

    const handleOpenModal = (internshipId) => { setOpenModal(true); setEditingInternshipId(internshipId); };
    const handleCloseModal = () => { setOpenModal(false); setEditingInternshipId(null); };
    const handleAddModal = () => { setAddModalOpen(true); setEditingInternshipId(null); };
    const handleCloseAddModal = () => { setAddModalOpen(false); setEditingInternshipId(null); };
    const handleViewInternship = (internship) => { setSelectedInternship(internship); setViewModalOpen(true); };
    const handleCloseViewModal = () => { setViewModalOpen(false); setSelectedInternship(null); };

    const handleExportCSV = () => {
        if (filteredInternships.length === 0) { toast.warning("No data available!"); return; }
        const processedData = filteredInternships.map(internship => {
            const data = {};
            if (visibleColumns.includes('job_id')) data.job_id = internship.job_id;
            if (visibleColumns.includes('title')) data.title = internship.title;
            if (visibleColumns.includes('company')) data.company = internship.company;
            if (visibleColumns.includes('location')) data.location = internship.location;
            if (visibleColumns.includes('skills_required')) data.skills_required = internship.skills_required?.join(', ') || '';
            if (visibleColumns.includes('sectors')) data.sectors = internship.sectors?.map(s => getSectorName(s)).join(', ') || '';
            if (visibleColumns.includes('remote_ok')) data.remote_ok = internship.remote_ok ? 'Yes' : 'No';
            if (visibleColumns.includes('duration')) data.duration = internship.duration || '';
            if (visibleColumns.includes('stipend')) data.stipend = internship.stipend?.amount ? `₹${internship.stipend.amount.toLocaleString()}` : 'Not specified';
            if (visibleColumns.includes('applicationDeadline')) data.applicationDeadline = new Date(internship.applicationDeadline).toLocaleDateString();
            if (visibleColumns.includes('status')) data.status = internship.status;
            if (visibleColumns.includes('websiteLink')) data.websiteLink = internship.websiteLink || '';
            if (visibleColumns.includes('posted_date')) data.posted_date = new Date(internship.posted_date || internship.createdAt).toLocaleDateString();
            return data;
        });
        const csvData = Papa.unparse(processedData);
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "internships.csv");
        toast.success("CSV exported!");
    };

    const handleExportExcel = () => {
        if (filteredInternships.length === 0) { toast.warning("No data available!"); return; }
        const processedData = filteredInternships.map(internship => {
            const data = {};
            if (visibleColumns.includes('job_id')) data.job_id = internship.job_id;
            if (visibleColumns.includes('title')) data.title = internship.title;
            if (visibleColumns.includes('company')) data.company = internship.company;
            if (visibleColumns.includes('location')) data.location = internship.location;
            if (visibleColumns.includes('skills_required')) data.skills_required = internship.skills_required?.join(', ') || '';
            if (visibleColumns.includes('sectors')) data.sectors = internship.sectors?.map(s => getSectorName(s)).join(', ') || '';
            if (visibleColumns.includes('remote_ok')) data.remote_ok = internship.remote_ok ? 'Yes' : 'No';
            if (visibleColumns.includes('duration')) data.duration = internship.duration || '';
            if (visibleColumns.includes('stipend')) data.stipend = internship.stipend?.amount ? `₹${internship.stipend.amount.toLocaleString()}` : 'Not specified';
            if (visibleColumns.includes('applicationDeadline')) data.applicationDeadline = new Date(internship.applicationDeadline).toLocaleDateString();
            if (visibleColumns.includes('status')) data.status = internship.status;
            if (visibleColumns.includes('websiteLink')) data.websiteLink = internship.websiteLink || '';
            if (visibleColumns.includes('posted_date')) data.posted_date = new Date(internship.posted_date || internship.createdAt).toLocaleDateString();
            return data;
        });
        const worksheet = XLSX.utils.json_to_sheet(processedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Internships");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, "internships.xlsx");
        toast.success("Excel exported!");
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get('http://localhost:7070/api/internships/admin/internships/template', {
                headers: { Authorization: `Bearer ${token}` }, responseType: 'blob'
            });
            const blob = new Blob([response.data]);
            saveAs(blob, "internship_template.xlsx");
            toast.success("Template downloaded");
        } catch (error) {
            console.error("Error downloading template:", error);
            toast.error("Error downloading template");
        }
    };

    const getColor = (status) => {
        if (status === 'Active') return 'success';
        if (status === 'Paused') return 'warning';
        return 'error';
    };

    const filteredInternships = applySortFilter(internships, getComparator(order, orderBy), filterName, filters);
    const isInternshipNotFound = filteredInternships.length === 0 && !loading;
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredInternships.length) : 0;

    if (loading) {
        return (
            <Page title="Internships">
                <Container>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                        <CircularProgress size={60} sx={{ color: '#5B7FE8' }} />
                        <Typography variant="h6" sx={{ ml: 2 }}>Loading internships...</Typography>
                    </Box>
                </Container>
            </Page>
        );
    }

    return (
        <Page title="Internships">
            <Container maxWidth="xl">
                <Stack direction={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'stretch' : 'center'} justifyContent="space-between" spacing={2} mb={4}>
                    <PageTitle>Internship Management</PageTitle>
                    <Stack direction={isMobile ? 'column' : 'row'} spacing={2} width={isMobile ? '100%' : 'auto'} height={isMobile ? 'auto' : 45}>
                        <PrimaryButton onClick={handleAddModal} startIcon={<Iconify icon="eva:plus-fill" />} fullWidth={isMobile}>
                            New 
                        </PrimaryButton>
                        <OutlinedButton onClick={handleDownloadTemplate} startIcon={<Iconify icon="eva:download-outline" />} fullWidth={isMobile}>
                            Template
                        </OutlinedButton>
                        <PrimaryButton onClick={handleExportCSV} startIcon={<Iconify icon="eva:download-fill" />} fullWidth={isMobile} disabled={filteredInternships.length === 0}>
                            CSV
                        </PrimaryButton>
                        <PrimaryButton onClick={handleExportExcel} startIcon={<Iconify icon="eva:download-fill" />} fullWidth={isMobile} disabled={filteredInternships.length === 0}>
                            Excel
                        </PrimaryButton>
                    </Stack>
                </Stack>

                <StyledCard>
                    <InternshipListToolbar
                        numSelected={getVisibleSelectedCount()}
                        selectedIds={getSelectedIds()}
                        filterName={filterName}
                        onFilterName={handleFilterByName}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onResetFilters={handleResetFilters}
                        sectors={sectors}
                        loadingSectors={loadingSectors}
                    />
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <InternshipColumnFilter
                            columns={TABLE_HEAD}
                            visibleColumns={visibleColumns}
                            onToggleColumn={handleToggleColumn}
                            onResetColumns={handleResetColumns}
                        />
                    </Box>

                    <Scrollbar>
                        <TableContainer sx={{ minWidth: 800 }}>
                            <Table>
                                <InternshipListHead
                                    order={order}
                                    orderBy={orderBy}
                                    rowCount={filteredInternships.length}
                                    numSelected={getVisibleSelectedCount()}
                                    onSelectAllClick={handleSelectAllClick}
                                    onRequestSort={handleRequestSort}
                                    headLabel={TABLE_HEAD.filter(column => visibleColumns.includes(column.id))}
                                />
                                <TableBody>
                                    {filteredInternships.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                        const isItemSelected = selected.indexOf(row._id) !== -1;
                                        return (
                                            <TableRow hover key={row._id} tabIndex={-1} role="checkbox" selected={isItemSelected} aria-checked={isItemSelected} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                                                <TableCell padding="checkbox">
                                                    <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, row._id)} sx={{ color: '#5B7FE8', '&.Mui-checked': { color: '#5B7FE8' } }} />
                                                </TableCell>
                                                {visibleColumns.includes('view') && (
                                                    <StyledTableCell align="left">
                                                        <ViewButton onClick={() => handleViewInternship(row)}>
                                                            <Iconify icon="eva:eye-fill" width={18} height={18} />
                                                        </ViewButton>
                                                    </StyledTableCell>
                                                )}
                                                {visibleColumns.includes('job_id') && <StyledTableCell>{row.job_id}</StyledTableCell>}
                                                {visibleColumns.includes('title') && <StyledTableCell sx={{ fontWeight: 600 }}>{row.title}</StyledTableCell>}
                                                {visibleColumns.includes('company') && <StyledTableCell>{row.company}</StyledTableCell>}
                                                {visibleColumns.includes('location') && <StyledTableCell>{row.location}</StyledTableCell>}
                                                {visibleColumns.includes('skills_required') && (
                                                    <StyledTableCell>
                                                        <ChipContainer>
                                                            {row.skills_required?.slice(0, 3).map((skill, index) => (
                                                                <Chip key={index} label={skill} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                                                            ))}
                                                            {row.skills_required?.length > 3 && (
                                                                <Chip label={`+${row.skills_required.length - 3}`} size="small" sx={{ fontSize: '0.75rem', backgroundColor: '#e9ecef', color: '#6c757d' }} />
                                                            )}
                                                        </ChipContainer>
                                                    </StyledTableCell>
                                                )}
                                                {visibleColumns.includes('sectors') && (
                                                    <StyledTableCell>
                                                        <ChipContainer>
                                                            {row.sectors?.slice(0, 2).map((sector, index) => (
                                                                <Chip key={typeof sector === 'string' ? sector : sector?._id || index} label={getSectorName(sector)} size="small" color="secondary" sx={{ fontSize: '0.75rem' }} />
                                                            ))}
                                                            {row.sectors?.length > 2 && (
                                                                <Chip label={`+${row.sectors.length - 2}`} size="small" color="secondary" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                                                            )}
                                                        </ChipContainer>
                                                    </StyledTableCell>
                                                )}
                                                {visibleColumns.includes('remote_ok') && (
                                                    <StyledTableCell>
                                                        <Label color={row.remote_ok ? 'success' : 'default'}>{row.remote_ok ? 'Yes' : 'No'}</Label>
                                                    </StyledTableCell>
                                                )}
                                                {visibleColumns.includes('duration') && <StyledTableCell>{row.duration}</StyledTableCell>}
                                                {visibleColumns.includes('stipend') && (
                                                    <StyledTableCell sx={{ fontWeight: 600, color: '#36B37E' }}>
                                                        {row.stipend?.amount ? `₹${row.stipend.amount.toLocaleString()}` : 'Not specified'}
                                                    </StyledTableCell>
                                                )}
                                                {visibleColumns.includes('applicationDeadline') && <StyledTableCell>{new Date(row.applicationDeadline).toLocaleDateString()}</StyledTableCell>}
                                                {visibleColumns.includes('websiteLink') && (
                                                    <StyledTableCell>
                                                        {row.websiteLink ? (
                                                            <a href={row.websiteLink} target="_blank" rel="noopener noreferrer" style={{ color: '#5B7FE8', textDecoration: 'none' }}>
                                                                {row.websiteLink.length > 30 ? `${row.websiteLink.slice(0, 30)}...` : row.websiteLink}
                                                            </a>
                                                        ) : 'N/A'}
                                                    </StyledTableCell>
                                                )}
                                                {visibleColumns.includes('status') && (
                                                    <StyledTableCell>
                                                        <Label color={getColor(row.status)}>{row.status}</Label>
                                                    </StyledTableCell>
                                                )}
                                                {visibleColumns.includes('posted_date') && <StyledTableCell>{new Date(row.posted_date || row.createdAt).toLocaleDateString()}</StyledTableCell>}
                                                {visibleColumns.includes('action') && (
                                                    <StyledTableCell>
                                                        <InternshipMoreMenu onEdit={() => handleOpenModal(row._id)} onDelete={() => handleDeleteInternship(row._id)} />
                                                    </StyledTableCell>
                                                )}
                                            </TableRow>
                                        );
                                    })}
                                    {emptyRows > 0 && <TableRow style={{ height: 53 * emptyRows }}><TableCell colSpan={visibleColumns.length + 1} /></TableRow>}
                                </TableBody>
                                {isInternshipNotFound && (
                                    <TableBody>
                                        <TableRow><TableCell align="center" colSpan={visibleColumns.length + 1} sx={{ py: 3 }}><SearchNotFound searchQuery={filterName} /></TableCell></TableRow>
                                    </TableBody>
                                )}
                            </Table>
                        </TableContainer>
                    </Scrollbar>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={filteredInternships.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{ borderTop: '1px solid #e9ecef', '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontWeight: 500 } }}
                    />

                    <InternshipUserDialog open={openModal} onClose={handleCloseModal} internshipId={editingInternshipId} fetchInternships={fetchInternships} />
                    <InternshipAddUserDialog open={AddModalOpen} onClose={handleCloseAddModal} fetchInternships={fetchInternships} />
                    <InternshipUserViewDialog open={viewModalOpen} onClose={handleCloseViewModal} internship={selectedInternship} />
                </StyledCard>
            </Container>
        </Page>
    );
}