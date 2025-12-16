import { filter } from 'lodash';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
import {
  Card,
  Table,
  Stack,
  Avatar,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// components
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import Iconify from '../components/Iconify';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, SectorListToolbar, UserMoreMenu } from '../sections/@dashboard/app/User';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Sector Name', alignRight: false },
  { id: 'createdAt', label: 'Created Date', alignRight: false },
  { id: 'actions', label: 'Actions', alignRight: false },
];

// ----------------------------------------------------------------------

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

const AddButton = styled(Button)(({ theme }) => ({
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

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  fontSize: '0.875rem',
  fontWeight: 700,
  backgroundColor: '#5B7FE8',
}));

const DateChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  color: '#6c757d',
  fontWeight: 500,
  fontSize: '0.75rem',
  height: 28,
  borderRadius: 8,
  border: '1px solid #e9ecef',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#1a1a1a',
  padding: theme.spacing(2),
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    padding: theme.spacing(1),
    minWidth: 500,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#1a1a1a',
  paddingBottom: theme.spacing(2),
  paddingTop: theme.spacing(2),
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
    '&.Mui-focused fieldset': {
      borderColor: '#5B7FE8',
    },
    '&.Mui-disabled': {
      backgroundColor: '#f8f9fa',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
    fontSize: '0.95rem',
    '&.Mui-focused': {
      color: '#5B7FE8',
    },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 10,
  padding: theme.spacing(1, 3),
  fontWeight: 600,
  textTransform: 'none',
}));

const PrimaryActionButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: '#5B7FE8',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#4865D8',
  },
}));

const SecondaryActionButton = styled(ActionButton)(({ theme }) => ({
  color: '#6c757d',
  '&:hover': {
    backgroundColor: '#f8f9fa',
  },
}));

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  borderRadius: 12,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  border: '1px solid #e9ecef',
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#6c757d',
  marginBottom: theme.spacing(0.5),
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 600,
  color: '#1a1a1a',
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

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  if (!Array.isArray(array)) {
    console.error('applySortFilter received non-array:', array);
    return [];
  }

  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filteredArray = stabilizedThis.map((el) => el[0]);

  if (query) {
    filteredArray = filteredArray.filter(
      (sector) => sector.name && sector.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  return filteredArray;
}

export default function Sector() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sectors, setSectors] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState('');
  const [selectedSector, setSelectedSector] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:7070/api/sectors');

      if (response.data && response.data.success && Array.isArray(response.data.sectors)) {
        setSectors(response.data.sectors);
      } else if (Array.isArray(response.data)) {
        setSectors(response.data);
      } else {
        console.error('API did not return expected format:', response.data);
        setSectors([]);
        toast.error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching sectors:', error);
      setSectors([]);
      toast.error('Failed to fetch sectors');
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
      const newSelecteds = sectors.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOpenModal = (userId) => {
    if (userId) {
      setEditingUserId(userId);
      const sectorToEdit = sectors.find((sector) => sector._id === userId);
      if (sectorToEdit) {
        setName(sectorToEdit.name || '');
      }
    } else {
      setEditingUserId(null);
      setName('');
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setName('');
    setEditingUserId(null);
  };

  const handleAddSector = async () => {
    if (!name.trim()) {
      toast.error('Sector name is required');
      return;
    }

    try {
      await axios.post('http://localhost:7070/api/sectors', { name });
      toast.success('Sector added successfully');
      fetchSectors();
      handleCloseModal();
    } catch (error) {
      console.error('Error adding sector:', error);
      toast.error('Failed to add sector');
    }
  };

  const handleUpdateSector = async () => {
    if (!name.trim()) {
      toast.error('Sector name is required');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:7070/api/sectors/${editingUserId}`, { name });
      toast.success(response.data.message || 'Sector updated successfully');
      fetchSectors();
      handleCloseModal();
    } catch (error) {
      console.error('Error updating sector:', error);
      toast.error('Failed to update sector');
    }
  };

  const handleDeleteSector = async (userId) => {
    if (window.confirm('Are you sure you want to delete this sector?')) {
      try {
        const response = await axios.delete(`http://localhost:7070/api/sectors/${userId}`);
        toast.success(response.data.message || 'Sector deleted successfully');
        fetchSectors();
      } catch (error) {
        console.error('Error deleting sector:', error);
        toast.error('Failed to delete sector');
      }
    }
  };

  const handleViewSector = (sector) => {
    setSelectedSector(sector);
    setViewModalOpen(true);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - sectors.length) : 0;
  const filteredSectors = applySortFilter(sectors, getComparator(order, orderBy), filterName);
  const isUserNotFound = filteredSectors.length === 0;

  return (
    <Page title="Sector Management">
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
          <PageTitle>Sector Management</PageTitle>
          <AddButton
            variant="contained"
            onClick={() => handleOpenModal(null)}
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            New Sector
          </AddButton>
        </Stack>

        <StyledCard>
          <SectorListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={sectors.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredSectors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { _id, name, createdAt } = row;
                    const isItemSelected = selected.indexOf(name) !== -1;

                    return (
                      <TableRow
                        hover
                        key={_id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={isItemSelected}
                        aria-checked={isItemSelected}
                        sx={{
                          '&:hover': {
                            backgroundColor: '#f8f9fa',
                          },
                        }}
                      >
                        <StyledTableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ pl: 2 }}>
                            <StyledAvatar>{getInitials(name)}</StyledAvatar>
                            <Box>
                              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                                {name}
                              </Typography>
                            </Box>
                          </Stack>
                        </StyledTableCell>
                        <StyledTableCell align="left">
                          <DateChip label={formatDate(createdAt)} icon={<Iconify icon="eva:calendar-outline" />} />
                        </StyledTableCell>
                        <StyledTableCell align="left">
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              onClick={() => handleViewSector(row)}
                              sx={{
                                color: '#5B7FE8',
                                backgroundColor: 'rgba(91, 127, 232, 0.08)',
                                '&:hover': {
                                  backgroundColor: 'rgba(91, 127, 232, 0.16)',
                                },
                              }}
                              size="small"
                            >
                              <Iconify icon="eva:eye-fill" width={18} height={18} />
                            </IconButton>
                            <UserMoreMenu onEdit={() => handleOpenModal(row._id)} onDelete={() => handleDeleteSector(row._id)} />
                          </Stack>
                        </StyledTableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isUserNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredSectors.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: '1px solid #e9ecef',
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontWeight: 500,
              },
            }}
          />
        </StyledCard>

        {/* Add/Edit Sector Modal */}
        <StyledDialog open={openModal} onClose={handleCloseModal}>
          <StyledDialogTitle>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: 'rgba(91, 127, 232, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="eva:grid-fill" width={24} height={24} sx={{ color: '#5B7FE8' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {editingUserId ? 'Edit Sector' : 'Add New Sector'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6c757d' }}>
                  {editingUserId ? 'Update sector information' : 'Create a new sector category'}
                </Typography>
              </Box>
            </Stack>
          </StyledDialogTitle>

          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <StyledTextField
              label="Sector Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              placeholder="e.g., Information Technology"
              autoFocus
              margin="normal"
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <SecondaryActionButton onClick={handleCloseModal}>Cancel</SecondaryActionButton>
            {editingUserId ? (
              <PrimaryActionButton onClick={handleUpdateSector}>Update Sector</PrimaryActionButton>
            ) : (
              <PrimaryActionButton onClick={handleAddSector}>Add Sector</PrimaryActionButton>
            )}
          </DialogActions>
        </StyledDialog>

        {/* View Sector Modal */}
        <StyledDialog open={viewModalOpen} onClose={() => setViewModalOpen(false)}>
          <StyledDialogTitle>
            <Stack direction="row" alignItems="center" spacing={2}>
              <StyledAvatar sx={{ width: 48, height: 48, fontSize: '1.1rem' }}>
                {selectedSector && getInitials(selectedSector.name)}
              </StyledAvatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Sector Details
                </Typography>
                <Typography variant="caption" sx={{ color: '#6c757d' }}>
                  View sector information
                </Typography>
              </Box>
            </Stack>
          </StyledDialogTitle>

          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <InfoBox>
                <InfoLabel>Sector Name</InfoLabel>
                <InfoValue>{selectedSector?.name}</InfoValue>
              </InfoBox>

              <InfoBox>
                <InfoLabel>Created Date</InfoLabel>
                <InfoValue>{selectedSector && formatDateTime(selectedSector.createdAt)}</InfoValue>
              </InfoBox>

              <InfoBox>
                <InfoLabel>Last Updated</InfoLabel>
                <InfoValue>{selectedSector && formatDateTime(selectedSector.updatedAt)}</InfoValue>
              </InfoBox>

              <InfoBox>
                <InfoLabel>Sector ID</InfoLabel>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    color: '#6c757d',
                    backgroundColor: '#ffffff',
                    padding: 1,
                    borderRadius: 1,
                    border: '1px solid #e9ecef',
                  }}
                >
                  {selectedSector?._id}
                </Typography>
              </InfoBox>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
             <CloseButton onClick={() => setViewModalOpen(false)} fullWidth>Close</CloseButton>
          </DialogActions>
        </StyledDialog>
      </Container>
    </Page>
  );
}