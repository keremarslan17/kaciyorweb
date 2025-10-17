
import React, { useState, useEffect } from 'react';
import { db, functions } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';
import { 
    Container, 
    Typography, 
    Box, 
    Paper, 
    TextField, 
    Button, 
    CircularProgress, 
    Alert, 
    List, 
    ListItem, 
    ListItemText,
    Divider,
    Grid
} from '@mui/material';

interface Waiter {
    id: string;
    name: string;
    email: string;
}

interface CreateWaiterResult {
    success: boolean;
    message: string;
    uid?: string;
}

const BusinessOwnerDashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const [waiters, setWaiters] = useState<Waiter[]>([]);
    const [loadingWaiters, setLoadingWaiters] = useState(true);

    const [newWaiterName, setNewWaiterName] = useState('');
    const [newWaiterUsername, setNewWaiterUsername] = useState('');
    const [newWaiterPassword, setNewWaiterPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (userProfile?.role === 'businessOwner' && userProfile.restaurantId) {
            const waitersQuery = query(
                collection(db, "users"), 
                where("role", "==", "waiter"), 
                where("restaurantId", "==", userProfile.restaurantId)
            );

            const unsubscribe = onSnapshot(waitersQuery, (querySnapshot) => {
                const waitersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Waiter));
                setWaiters(waitersData);
                setLoadingWaiters(false);
            });

            return () => unsubscribe();
        }
    }, [userProfile]);

    const handleAddWaiter = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const createWaiter = httpsCallable< { username: string; password: string; displayName: string; }, CreateWaiterResult >(functions, 'createWaiter');
            const result = await createWaiter({ 
                username: newWaiterUsername, 
                password: newWaiterPassword, 
                displayName: newWaiterName 
            });

            const data = result.data;
            if (data.success) {
                setSuccess(data.message);
                setNewWaiterName('');
                setNewWaiterUsername('');
                setNewWaiterPassword('');
            } else {
                 throw new Error("Cloud function returned failure.");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Garson oluşturulurken bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    İşletmeci Kontrol Paneli
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                    Restoran: {userProfile?.restaurantName || 'Yükleniyor...'}
                </Typography>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={5}>
                        <Typography variant="h5" gutterBottom>Yeni Garson Ekle</Typography>
                        <Box component="form" onSubmit={handleAddWaiter}>
                            <TextField
                                label="Garson Adı Soyadı"
                                value={newWaiterName}
                                onChange={(e) => setNewWaiterName(e.target.value)}
                                fullWidth
                                required
                                margin="normal"
                            />
                            <TextField
                                label="Kullanıcı Adı"
                                value={newWaiterUsername}
                                onChange={(e) => setNewWaiterUsername(e.target.value)}
                                fullWidth
                                required
                                margin="normal"
                            />
                            <TextField
                                label="Şifre"
                                type="password"
                                value={newWaiterPassword}
                                onChange={(e) => setNewWaiterPassword(e.target.value)}
                                fullWidth
                                required
                                margin="normal"
                            />
                            <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={isSubmitting}>
                                {isSubmitting ? <CircularProgress size={24} /> : 'Garson Ekle'}
                            </Button>
                            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <Typography variant="h5" gutterBottom>Mevcut Garsonlar</Typography>
                        {loadingWaiters ? <CircularProgress /> : (
                            <List>
                                {waiters.length > 0 ? waiters.map((waiter, index) => (
                                    <React.Fragment key={waiter.id}>
                                        <ListItem>
                                            <ListItemText 
                                                primary={waiter.name} 
                                                secondary={waiter.email} 
                                            />
                                        </ListItem>
                                        {index < waiters.length - 1 && <Divider />}
                                    </React.Fragment>
                                )) : (
                                    <Typography>Henüz garson eklenmemiş.</Typography>
                                )}
                            </List>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default BusinessOwnerDashboard;
