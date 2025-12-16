import { useRef, useState } from 'react';
// material
import { styled } from '@mui/material/styles';
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';
// component
import Iconify from '../../../../components/Iconify';

// ----------------------------------------------------------------------

const StyledIconButton = styled(IconButton)(({ theme}) => ({
  color: '#6c757d',
  backgroundColor: 'rgba(108, 117, 125, 0.08)',
  padding: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(108, 117, 125, 0.16)',
    transform: 'scale(1.05)',
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    border: '1px solid #e9ecef',
    minWidth: 180,
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.2, 2),
  margin: theme.spacing(0.5, 1),
  borderRadius: 8,
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateX(4px)',
  },
}));

const EditMenuItem = styled(StyledMenuItem)(({ theme }) => ({
  color: '#5B7FE8',
  '&:hover': {
    backgroundColor: 'rgba(91, 127, 232, 0.08)',
  },
}));

const NotifyMenuItem = styled(StyledMenuItem)(({ theme }) => ({
  color: '#FFAB00',
  '&:hover': {
    backgroundColor: 'rgba(255, 171, 0, 0.08)',
  },
}));

const DeleteMenuItem = styled(StyledMenuItem)(({ theme }) => ({
  color: '#FF5630',
  '&:hover': {
    backgroundColor: 'rgba(255, 86, 48, 0.08)',
  },
}));

// ----------------------------------------------------------------------

export default function InternshipMoreMenu({ onEdit, onDelete, onTriggerNotifications }) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <StyledIconButton ref={ref} onClick={() => setIsOpen(true)} size="small">
        <Iconify icon="eva:more-vertical-fill" width={20} height={20} />
      </StyledIconButton>

      <StyledMenu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <EditMenuItem
          onClick={() => {
            onEdit();
            setIsOpen(false);
          }}
        >
          <ListItemIcon>
            <Iconify icon="eva:edit-fill" width={20} height={20} sx={{ color: '#5B7FE8' }} />
          </ListItemIcon>
          <ListItemText primary="Edit" primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
        </EditMenuItem>

        {onTriggerNotifications && (
          <NotifyMenuItem
            onClick={() => {
              onTriggerNotifications();
              setIsOpen(false);
            }}
          >
            <ListItemIcon>
              <Iconify icon="eva:bell-fill" width={20} height={20} sx={{ color: '#FFAB00' }} />
            </ListItemIcon>
            <ListItemText primary="Notify Users" primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
          </NotifyMenuItem>
        )}

        <DeleteMenuItem
          onClick={() => {
            onDelete();
            setIsOpen(false);
          }}
        >
          <ListItemIcon>
            <Iconify icon="eva:trash-2-outline" width={20} height={20} sx={{ color: '#FF5630' }} />
          </ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
        </DeleteMenuItem>
      </StyledMenu>
    </>
  );
}