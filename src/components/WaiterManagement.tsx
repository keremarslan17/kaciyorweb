
import React, { useState, useEffect } from 'react';
import { db, functions } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';
import { 
    Box, Typography, Button, CircularProgress, List, ListItem, ListItemText, 
    TextField, Alert, Paper
} from '@mui/material';

interface Waiter {
    id: string;
    name: string;
    email: string;
}

const WaiterManagement: React.FC = () => {
    const { userProfile } = useAuth();
    const [waiters, setWaiters] = useState<Waiter[]>([]);
    const [loading, setLoading] = useState(true);

    const [newWaiterName, setNewWaiterName] = useState('');
    const [newWaiterUsername, setNewWaiterUsername] = useState('');
    const [newWaiterPassword, setNewWaiterPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const restaurantId = userProfile?.restaurantId;

    useEffect(() => {
        if (!restaurantId) return;

        const waitersQuery = query(collection(db, "users"), where("role", "==", "waiter"), where("restaurantId", "==", restaurantId));
        const unsubscribe = onSnapshot(waitersQuery, (snap) => {
            setWaiters(snap.docs.map(d => ({ id: d.id, ...d.data() } as Waiter)));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [restaurantId]);

    const handleAddWaiter = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!newWaiterName || !newWaiterUsername || !newWaiterPassword) {
            setError("Tüm alanlar zorunludur.");
            return;
        }
        if (!restaurantId) {
            setError("Restoran kimliği bulunamadı.");
            return;
        }

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
        } catch (err: any) {
            console.error("Error creating waiter:", err);
            setError(err.message || "Garson oluşturulurken bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Box>
            <Typography variant="h5" mb={2}>Garson Yönetimi</Typography>
            
            {/* Add Waiter Form */}
            <Paper component="form" onSubmit={handleAddWaiter} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" mb={2}>Yeni Garson Ekle</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                <TextField
                    label="Garson Adı"
                    value={newWaiterName}
                    onChange={(e) => setNewWaiterName(e.target.value)}
                    fullWidth
                    margin="normal"
                    disabled={isSubmitting}
                />
                <TextField
                    label="Kullanıcı Adı (E-posta)"
                    type="email"
                    value={newWaiterUsername}
                    onChange={(e) => setNewWaiterUsername(e.target.value)}
                    fullWidth
                    margin="normal"
                    disabled={isSubmitting}
                />
                <TextField
                    label="Şifre"
                    type="password"
                    value={newWaiterPassword}
                    onChange={(e) => setNewWaiterPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                    disabled={isSubmitting}
                />
                <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                    sx={{ mt: 2 }}
                >
                    {isSubmitting ? 'Ekleniyor...' : 'Garson Ekle'}
                </Button>
            </Paper>

            {/* Waiter List */}
            <Typography variant="h6" mb={2}>Mevcut Garsonlar</Typography>
            {loading ? <CircularProgress /> : (
                <List>
                    {waiters.length > 0 ? waiters.map(waiter => (
                        <ListItem key={waiter.id}>
                            <ListItemText primary={waiter.name} secondary={waiter.email} />
                        </ListItem>
                    )) : (
                        <Typography>Henüz garson eklenmemiş.</Typography>
                    )}
                </List>
            )}
        </Box>
    );
};

export default WaiterManagement;
