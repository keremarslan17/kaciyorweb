
import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Button, Modal } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import QrScanner from '../components/QrScanner'; // Oluşturduğumuz bileşeni import ediyoruz

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
};

const WaiterDashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const [isScannerOpen, setScannerOpen] = useState(false);

    const handleOpenScanner = () => setScannerOpen(true);
    const handleCloseScanner = () => setScannerOpen(false);

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
                        onClick={handleOpenScanner} // QR tarayıcıyı açacak fonksiyon
                        sx={{ py: 2, px: 4, fontSize: '1.2rem' }}
                    >
                        QR Kod ile Sipariş Al
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

            <Modal
                open={isScannerOpen}
                onClose={handleCloseScanner}
                aria-labelledby="qr-scanner-modal-title"
                aria-describedby="qr-scanner-modal-description"
            >
                <Box sx={style}>
                    <QrScanner onClose={handleCloseScanner} />
                    <Button onClick={handleCloseScanner} sx={{ mt: 2 }} fullWidth>Kapat</Button>
                </Box>
            </Modal>
        </Container>
    );
};

export default WaiterDashboard;
