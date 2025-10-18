
import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Box, Button, Typography, Paper, Alert, CircularProgress, List, ListItem, ListItemText, Divider } from '@mui/material';
import { doc, getDoc, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; 

const QrScanner: React.FC<{onClose: () => void}> = ({onClose}) => {
    const [scanResult, setScanResult] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader", 
            {
                qrbox: {
                    width: 250,
                    height: 250,
                },
                fps: 5,
            },
            false
        );

        let isScanning = true;

        const onScanSuccess = (decodedText: string) => {
            if (!isScanning) return;
            isScanning = false;
            scanner.clear(); 
            
            try {
                const parsedResult = JSON.parse(decodedText);
                if (!parsedResult.pendingOrderId) {
                    setError("Geçersiz QR Kod. Sipariş ID'si bulunamadı.");
                    return;
                }
                setScanResult(parsedResult);
                setError('');
                setSuccess('QR Kod okundu. Sipariş detayları aşağıdadır.');
            } catch (e) {
                setError("Okunan QR Kod bir siparişe ait değil.");
                setScanResult(null);
            }
        };
        
        const onScanFailure = (error: any) => { /* console.warn(error) */ };

        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            if (scanner) {
                scanner.clear().catch(err => console.error("Scanner clear failed", err));
            }
        };
    }, []);

    const handleConfirmOrder = async () => {
        if (!scanResult || !scanResult.pendingOrderId) {
            setError("Onaylanacak bir sipariş bulunmuyor.");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const pendingOrderRef = doc(db, "pendingOrders", scanResult.pendingOrderId);
        
        try {
            const pendingOrderSnap = await getDoc(pendingOrderRef);
            if (!pendingOrderSnap.exists() || pendingOrderSnap.data().status !== 'pending') {
                setError("Bu sipariş zaten işleme alınmış veya geçersiz.");
                setLoading(false);
                return;
            }

            const orderData = pendingOrderSnap.data();
            
            // Use a batch write to ensure atomicity
            const batch = writeBatch(db);

            // 1. Create the final order in the 'orders' collection
            const finalOrderRef = doc(db, "orders", scanResult.pendingOrderId); // Use the same ID for simplicity
            batch.set(finalOrderRef, {
                ...orderData,
                status: 'confirmed',
                waiterConfirmedAt: serverTimestamp(),
            });

            // 2. Update the status of the pending order
            batch.update(pendingOrderRef, { status: 'confirmed' });
            
            await batch.commit();

            setSuccess(`Sipariş başarıyla onaylandı! Müşteri bilgilendirildi.`);
            setScanResult(null); 
            
            setTimeout(() => {
                onClose(); 
                window.location.reload();
            }, 2000);

        } catch (err) {
            setError("Sipariş onayı sırasında bir hata oluştu.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleRescan = () => {
        window.location.reload();
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 500, margin: 'auto', mt: 0 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>QR Kod ile Sipariş Onayı</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            
            {scanResult ? (
                <Box>
                    <Typography variant="h6">Sipariş Detayları</Typography>
                    <Typography><b>Restoran:</b> {scanResult.restaurantName}</Typography>
                    <Typography><b>Masa No:</b> {scanResult.tableNumber}</Typography>
                    <Typography><b>Toplam Fiyat:</b> ₺{scanResult.totalPrice}</Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1">Ürünler:</Typography>
                    <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
                        {scanResult.items.map((item: any) => (
                            <ListItem key={item.id}>
                                <ListItemText 
                                    primary={`${item.name} x ${item.quantity}`} 
                                    secondary={`Birim Fiyat: ₺${item.price.toFixed(2)}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfirmOrder}
                        disabled={loading}
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : "Siparişi Onayla"}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleRescan}
                        fullWidth
                        sx={{ mt: 1 }}
                    >
                        Yeni QR Kod Tara
                    </Button>
                </Box>
            ) : (
                <Box id="reader" sx={{minHeight: "300px"}} />
            )}
        </Paper>
    );
};

export default QrScanner;
