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
  Checkbox,
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
  Chip,
  Box,
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
import { UserListHead, UserListToolbar } from '../sections/@dashboard/app/User';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'email', label: 'Email', alignRight: false },
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'phone', label: 'Phone', alignRight: false },
  { id: 'role', label: 'Role', alignRight: false },
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
  marginBottom: theme.spacing(3),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  fontSize: '0.875rem',
  fontWeight: 700,
  backgroundColor: '#5B7FE8',
}));

const RoleChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 28,
  borderRadius: 8,
}));

const ViewButton = styled(IconButton)(({ theme }) => ({
  color: '#5B7FE8',
  backgroundColor: 'rgba(91, 127, 232, 0.08)',
  padding: theme.spacing(1),
  '&:hover': {
    backgroundColor: 'rgba(91, 127, 232, 0.16)',
    transform: 'scale(1.05)',
  },
  transition: 'all 0.2s ease',
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
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filteredArray = stabilizedThis.map((el) => el[0]);

  if (query) {
    filteredArray = filteredArray.filter(
      (user) =>
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.name?.toLowerCase().includes(query.toLowerCase()) ||
        user.phone?.toLowerCase().includes(query.toLowerCase())
    );
  }


  return filteredArray;
}

export default function User() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('email');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://pm-consulation.onrender.com/api/auth/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.email);
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

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const getInitials = (name, email) => {
    if (name) {
      return name
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return { bg: '#FF5630', text: '#ffffff' };
      case 'user':
        return { bg: '#5B7FE8', text: '#ffffff' };
      case 'super admin':
        return { bg: '#8E33FF', text: '#ffffff' };
      default:
        return { bg: '#6c757d', text: '#ffffff' };
    }
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;
  const filteredUsers = applySortFilter(users, getComparator(order, orderBy), filterName);
  const isUserNotFound = filteredUsers.length === 0;

  return (
    <Page title="User Management">
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
          <PageTitle>User Management</PageTitle>
        </Stack>

        <StyledCard>
          <UserListToolbar
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
                  rowCount={users.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { _id, name, email, phone, role } = row;
                    const isItemSelected = selected.indexOf(email) !== -1;
                    const roleColors = getRoleColor(role);

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
                            <StyledAvatar>{getInitials(name, email)}</StyledAvatar>
                            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                              {email}
                            </Typography>
                          </Stack>
                        </StyledTableCell>
                        <StyledTableCell align="left">{name || '-'}</StyledTableCell>
                        <StyledTableCell align="left">{phone || '-'}</StyledTableCell>
                        <StyledTableCell align="left">
                          <RoleChip
                            label={role}
                            sx={{
                              backgroundColor: roleColors.bg,
                              color: roleColors.text,
                            }}
                          />
                        </StyledTableCell>
                        <StyledTableCell align="left">
                          <ViewButton onClick={() => handleViewUser(row)} size="small">
                            <Iconify icon="eva:eye-fill" width={20} height={20} />
                          </ViewButton>
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
            count={filteredUsers.length}
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

        {/* View User Modal */}
        <StyledDialog open={viewModalOpen} onClose={() => setViewModalOpen(false)}>
          <StyledDialogTitle>
            <Stack direction="row" alignItems="center" spacing={2}>
              <StyledAvatar sx={{ width: 48, height: 48, fontSize: '1.1rem' }}>
                {selectedUser && getInitials(selectedUser.name, selectedUser.email)}
              </StyledAvatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  User Details
                </Typography>
                <Typography variant="caption" sx={{ color: '#6c757d' }}>
                  View user information
                </Typography>
              </Box>
            </Stack>
          </StyledDialogTitle>

          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <InfoBox>
                <InfoLabel>Full Name</InfoLabel>
                <InfoValue>{selectedUser?.name || 'Not provided'}</InfoValue>
              </InfoBox>

              <InfoBox>
                <InfoLabel>Email Address</InfoLabel>
                <InfoValue>{selectedUser?.email}</InfoValue>
              </InfoBox>

              <InfoBox>
                <InfoLabel>Phone Number</InfoLabel>
                <InfoValue>{selectedUser?.phone || 'Not provided'}</InfoValue>
              </InfoBox>

              <InfoBox>
                <InfoLabel>Role</InfoLabel>
                <RoleChip
                  label={selectedUser?.role}
                  sx={{
                    backgroundColor: selectedUser && getRoleColor(selectedUser.role).bg,
                    color: selectedUser && getRoleColor(selectedUser.role).text,
                    mt: 1,
                  }}
                />
              </InfoBox>

              {selectedUser?.createdAt && (
                <InfoBox>
                  <InfoLabel>Member Since</InfoLabel>
                  <InfoValue>{new Date(selectedUser.createdAt).toLocaleDateString()}</InfoValue>
                </InfoBox>
              )}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <CloseButton onClick={() => setViewModalOpen(false)} fullWidth>
              Close
            </CloseButton>
          </DialogActions>
        </StyledDialog>
      </Container>
    </Page>
  );
}