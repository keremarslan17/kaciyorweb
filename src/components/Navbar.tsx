import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

// MUI
import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

const Navbar: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Çıkış yaparken hata oluştu:", error);
    }
  };

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
        >
          Kaçıyor
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {currentUser ? (
            <>
              {currentUser.role && <Chip label={currentUser.role} color="secondary" size="small" sx={{ mr: 2 }} />}

              {currentUser.role === 'admin' && (
                <Button color="inherit" component={RouterLink} to="/admin" startIcon={<AdminPanelSettingsIcon />}>
                  Admin Paneli
                </Button>
              )}
              
              {currentUser.role === 'işletmeci' && (
                <Button color="inherit" component={RouterLink} to="/business" startIcon={<BusinessCenterIcon />}>
                  İşletme Paneli
                </Button>
              )}

              <Button color="inherit" component={RouterLink} to="/profile">
                Profil
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Çıkış Yap
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Giriş Yap
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
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
