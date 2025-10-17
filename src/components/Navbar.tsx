
import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <AppBar position="static" sx={{ borderRadius: 2, margin: 'auto', mt: 2, maxWidth: '95%' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Kaçıyor
          </Link>
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton color="inherit" component={Link} to="/">
            <HomeIcon />
          </IconButton>

          {user ? (
            <>
              <IconButton color="inherit" component={Link} to="/profile">
                <AccountCircleIcon />
              </IconButton>
              <Button color="inherit" startIcon={<ExitToAppIcon />} onClick={logout}>
                Çıkış Yap
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login" startIcon={<LoginIcon />}>
                Giriş Yap
              </Button>
              <Button color="inherit" component={Link} to="/register" startIcon={<AppRegistrationIcon />}>
                Kayıt Ol
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
