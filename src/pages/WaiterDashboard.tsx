
import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const WaiterDashboard: React.FC = () => {
    const { userProfile } = useAuth();

    const handleNewOrder = () => {
        // This will later trigger the QR scanner or a new order form
        alert('Yeni sipariş alma işlemi başlatılıyor...');
    };

    return (
        <Container maxWidth="lg">
            <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Garson Paneli
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                    Hoş geldiniz, {userProfile?.name || 'Kullanıcı'}!
                </Typography>

                <Box>
                    <Button 
                        variant="contained" 
                        size="large" 
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={handleNewOrder}
                        sx={{ py: 2, px: 4, fontSize: '1.2rem' }}
                    >
                        Sipariş Al
                    </Button>
                </Box>
                
                <Box mt={5}>
                    <Typography variant="h5" gutterBottom>Aktif Siparişler</Typography>
                    {/* Active orders will be listed here */}
                    <Typography variant="body1" color="text.secondary">
                        Şu anda aktif sipariş bulunmamaktadır.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default WaiterDashboard;
