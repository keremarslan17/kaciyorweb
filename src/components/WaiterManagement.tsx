
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, TextField, CircularProgress, Alert, List, ListItem, ListItemText, Divider, IconButton } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions, db, auth } from '../firebase'; // Import auth
import { sendPasswordResetEmail } from 'firebase/auth'; // Import password reset function
import { collection, query, where, getDocs } from 'firebase/firestore';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

const WaiterManagement: React.FC = () => {
    const { userProfile } = useAuth();
    const restaurantId = userProfile?.restaurantId;

    const [newWaiterName, setNewWaiterName] = useState('');
    const [newWaiterUsername, setNewWaiterUsername] = useState('');
    const [newWaiterPassword, setNewWaiterPassword] = useState('');
    const [waiters, setWaiters] = useState<any[]>([]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingWaiters, setIsFetchingWaiters] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resettingPasswordFor, setResettingPasswordFor] = useState<string | null>(null);

    const fetchWaiters = useCallback(async () => {
        if (!restaurantId) return;
        setIsFetchingWaiters(true);
        try {
            const q = query(collection(db, "users"), where("restaurantId", "==", restaurantId), where("role", "==", "waiter"));
            const querySnapshot = await getDocs(q);
            const waitersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setWaiters(waitersList);
        } catch (err) {
            console.error("Error fetching waiters:", err);
            setError("Garsonlar listelenirken bir hata oluştu.");
        } finally {
            setIsFetchingWaiters(false);
        }
    }, [restaurantId]);

    useEffect(() => {
        fetchWaiters();
    }, [fetchWaiters]);

    const handleAddWaiter = async () => {
        if (!newWaiterName || !newWaiterUsername || !newWaiterPassword) {
            setError("Lütfen tüm alanları doldurun.");
            return;
        }
        if (!restaurantId) {
            setError("Restoran kimliği bulunamadı. Lütfen tekrar giriş yapın.");
            return;
        }
        setError('');
        setSuccess('');
        setIsSubmitting(true);
        try {
            const createWaiter = httpsCallable(functions, 'createWaiter');
            await createWaiter({
                email: newWaiterUsername,
                password: newWaiterPassword,
                displayName: newWaiterName,
                restaurantId: restaurantId,
            });
            setSuccess(`Garson ${newWaiterName} başarıyla oluşturuldu.`);
            setNewWaiterName('');
            setNewWaiterUsername('');
            setNewWaiterPassword('');
            fetchWaiters(); // Refresh the list
        } catch (err: any) {
            console.error("Error creating waiter:", err);
            setError(err.message || "Garson oluşturulurken bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPassword = async (email: string) => {
        setError('');
        setSuccess('');
        setResettingPasswordFor(email); // Show loader on the specific button
        try {
            // 1. Call the Cloud Function to verify permissions
            const authorizePasswordReset = httpsCallable(functions, 'sendPasswordResetEmail');
            await authorizePasswordReset({ email });

            // 2. If the function returns success, send the email from the client
            await sendPasswordResetEmail(auth, email);
            
            setSuccess(`Şifre sıfırlama e-postası ${email} adresine başarıyla gönderildi.`);
        } catch (err: any) {
            console.error("Error sending password reset email:", err);
            setError(err.message || "Şifre sıfırlama e-postası gönderilirken bir hata oluştu.");
        } finally {
            setResettingPasswordFor(null); // Hide loader
        }
    };

    return (
        <Box>
            <Typography variant="h5" mb={2}>Garson Yönetimi</Typography>
            
            {/* Add Waiter Form */}
            <Box component="form" noValidate autoComplete="off" sx={{ mb: 4 }}>
                <Typography variant="h6" mb={1}>Yeni Garson Ekle</Typography>
                <TextField label="Garson Adı Soyadı" value={newWaiterName} onChange={(e) => setNewWaiterName(e.target.value)} fullWidth margin="normal" />
                <TextField label="Kullanıcı Adı (E-posta)" value={newWaiterUsername} onChange={(e) => setNewWaiterUsername(e.target.value)} fullWidth margin="normal" />
                <TextField label="Geçici Şifre" type="password" value={newWaiterPassword} onChange={(e) => setNewWaiterPassword(e.target.value)} fullWidth margin="normal" />
                <Button variant="contained" onClick={handleAddWaiter} disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} /> : 'Garson Ekle'}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ my: 2 }}>{success}</Alert>}

            <Divider sx={{ my: 4 }} />

            {/* Waiter List */}
            <Typography variant="h6" mb={2}>Mevcut Garsonlar</Typography>
            {isFetchingWaiters ? <CircularProgress /> : (
                <List>
                    {waiters.map((waiter) => (
                        <ListItem key={waiter.id} secondaryAction={
                            <Button
                                variant="outlined"
                                startIcon={<VpnKeyIcon />}
                                onClick={() => handleResetPassword(waiter.email)}
                                disabled={resettingPasswordFor === waiter.email}
                            >
                                {resettingPasswordFor === waiter.email ? <CircularProgress size={24} /> : 'Şifre Sıfırla'}
                            </Button>
                        }>
                            <ListItemText primary={waiter.name} secondary={waiter.email} />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default WaiterManagement;
