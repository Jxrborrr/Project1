import * as React from 'react';
import {
  Avatar, Box, Button, Divider, IconButton, Menu, MenuItem, Stack, Typography
} from '@mui/material';

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

export default function AccountMenu({ onSignOut, onMyTrips, onProfile }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const user = getStoredUser();
  const token = getToken();
  const open = Boolean(anchorEl);

  if (!token) return null; 

  const fullName = user ? `${user.fname || ''} ${user.lname || ''}`.trim() : 'My account';
  const initials = (user?.fname?.[0] || user?.email?.[0] || 'U').toUpperCase();

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSignOut = () => {
    localStorage.removeItem('token'); sessionStorage.removeItem('token');
    localStorage.removeItem('user');  sessionStorage.removeItem('user');
    handleClose();
    onSignOut?.(); 
  };

  return (
    <>
      <IconButton onClick={handleOpen} size="small" sx={{ ml: 1 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
          {initials}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { width: 260, p: 1, borderRadius: 2 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">MY ACCOUNT</Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
            <Avatar sx={{ width: 28, height: 28 }}>{initials}</Avatar>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {fullName || user?.email}
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ my: 1 }} />

        <MenuItem
          onClick={() => { handleClose(); onMyTrips?.(); }}
        >
          <Typography variant="body1">My Trips</Typography>
        </MenuItem>

        <MenuItem
          onClick={() => { handleClose(); onProfile?.(); }}
        >
          <Typography variant="body1">Profile</Typography>
        </MenuItem>

        <Box sx={{ p: 2 }}>
          <Button fullWidth variant="outlined" onClick={handleSignOut}>
            SIGN OUT
          </Button>
        </Box>
      </Menu>
    </>
  );
}
