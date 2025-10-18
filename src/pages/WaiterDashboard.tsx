
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, Modal, Stack, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import EditNoteIcon from '@mui/icons-material/EditNote';
import StorefrontIcon from '@mui/icons-material/Storefront';
import QrScanner from '../components/QrScanner'; 
import ManualOrderForm from '../components/ManualOrderForm';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '600px',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto'
};

const WaiterDashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const [restaurantName, setRestaurantName] = useState('');
    const [isScannerOpen, setScannerOpen] = useState(false);
    const [isManualOrderOpen, setManualOrderOpen] = useState(false);

    useEffect(() => {
        const fetchRestaurantName = async () => {
            if (userProfile?.restaurantId) {
                try {
                    const restaurantRef = doc(db, 'restaurants', userProfile.restaurantId);
                    const restaurantSnap = await getDoc(restaurantRef);
                    if (restaurantSnap.exists()) {
                        setRestaurantName(restaurantSnap.data().name);
                    } else {
                        console.log("Restoran bulunamadı!");
                    }
                } catch (error) {
                    console.error("Restoran adı alınırken hata:", error);
                }
            }
        };

        fetchRestaurantName();
    }, [userProfile]);

    const handleOpenScanner = () => setScannerOpen(true);
    const handleCloseScanner = () => setScannerOpen(false);

    const handleOpenManualOrder = () => setManualOrderOpen(true);
    const handleCloseManualOrder = () => setManualOrderOpen(false);

    return (
        <Container maxWidth="lg">
            <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Garson Paneli
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Hoş geldiniz, {userProfile?.name || 'Kullanıcı'}!
                </Typography>
                {restaurantName && (
                    <Chip 
                        icon={<StorefrontIcon />} 
                        label={restaurantName}
                        color="info"
                        sx={{ mb: 4, fontSize: '1rem' }}
                    />
                )}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    <Button 
                        variant="contained" 
                        size="large" 
                        startIcon={<QrCodeScannerIcon />}
                        onClick={handleOpenScanner}
                        sx={{ py: 2, px: 4, fontSize: '1.2rem' }}
                    >
                        QR Kod ile Sipariş Al
                    </Button>
                    <Button 
                        variant="outlined" 
                        size="large" 
                        startIcon={<EditNoteIcon />}
                        onClick={handleOpenManualOrder}
                        sx={{ py: 2, px: 4, fontSize: '1.2rem' }}
                    >
                        Manuel Sipariş Al
                    </Button>
                </Stack>
                
                <Box mt={5}>
                    <Typography variant="h5" gutterBottom>Aktif Siparişler</Typography>
                    {/* Active orders will be listed here */}
                    <Typography variant="body1" color="text.secondary">
                        Şu anda aktif sipariş bulunmamaktadır.
                    </Typography>
                </Box>
            </Paper>

            {/* QR Scanner Modal */}
            <Modal open={isScannerOpen} onClose={handleCloseScanner}>
                <Box sx={style}>
                    <QrScanner onClose={handleCloseScanner} />
                    <Button onClick={handleCloseScanner} sx={{ mt: 2 }} fullWidth>Kapat</Button>
                </Box>
            </Modal>

            {/* Manual Order Modal */}
            <Modal open={isManualOrderOpen} onClose={handleCloseManualOrder}>
                <Box sx={style}>
                    <ManualOrderForm onClose={handleCloseManualOrder} />
                </Box>
            </Modal>
        </Container>
    );
};

export default WaiterDashboard;
