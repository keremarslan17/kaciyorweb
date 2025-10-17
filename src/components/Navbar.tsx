
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar: React.FC<{ onCartOpen: () => void }> = ({ onCartOpen }) => {
    const { user, userProfile, logout } = useAuth();
    const { cartState } = useCart();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const cartItemCount = cartState.items.reduce((acc, item) => acc + item.quantity, 0);

    const isStaff = userProfile && (userProfile.role === 'admin' || userProfile.role === 'businessOwner' || userProfile.role === 'waiter');

    return (
        // REVERTED: Applying styles for shape AND color from the desired version.
        <AppBar 
            position="static" 
            sx={{ 
                borderRadius: 2, 
                margin: 'auto', 
                mt: 2, 
                maxWidth: '95%',
                backgroundColor: '#468e8b' // The specific teal color from the desired version
            }}
        >
            <Toolbar>
                <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
                    Kaçıyor
                </Typography>
                {user ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {!isStaff && (
                            <>
                                <IconButton component={RouterLink} to="/" color="inherit">
                                    <HomeIcon />
                                </IconButton>
                                <IconButton onClick={onCartOpen} color="inherit">
                                    <Badge badgeContent={cartItemCount} color="error">
                                        <ShoppingCartIcon />
                                    </Badge>
                                </IconButton>
                            </>
                        )}

                        {userProfile?.role === 'admin' && <Button color="inherit" component={RouterLink} to="/admin">Admin Paneli</Button>}
                        {userProfile?.role === 'businessOwner' && <Button color="inherit" component={RouterLink} to="/business">İşletmeci Paneli</Button>}
                        {userProfile?.role === 'waiter' && <Button color="inherit" component={RouterLink} to="/waiter">Garson Paneli</Button>}

                        <IconButton component={RouterLink} to="/profile" color="inherit">
                            <PersonIcon />
                        </IconButton>
                        <Button color="inherit" onClick={handleLogout} startIcon={<ExitToAppIcon />}>
                            Çıkış Yap
                        </Button>
                    </Box>
                ) : (
                    <>
                        <Button color="inherit" component={RouterLink} to="/login">Giriş Yap</Button>
                        <Button color="inherit" component={RouterLink} to="/register">Kayıt Ol</Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
