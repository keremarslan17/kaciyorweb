
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { 
    Container, 
    Typography, 
    Paper, 
    Box, 
    CircularProgress, 
    List, 
    ListItem, 
    ListItemText, 
    Divider,
    Card,
    CardContent
} from '@mui/material';

interface Order {
    id: string;
    // Add other order properties here, e.g., items, total, customerInfo
}

interface Restaurant {
    id: string;
    name: string;
    // Add other restaurant properties
}

const BusinessOwnerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBusinessData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Fetch restaurants owned by the current user
                const restaurantsQuery = query(collection(db, 'restaurants'), where('ownerId', '==', user.uid));
                const restaurantSnap = await getDocs(restaurantsQuery);
                const ownedRestaurants = restaurantSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant));
                setRestaurants(ownedRestaurants);

                // If the owner has restaurants, fetch orders for those restaurants
                if (ownedRestaurants.length > 0) {
                    const restaurantIds = ownedRestaurants.map(r => r.id);
                    // This query is simplistic. In a real scenario, you might query an 'orders' collection
                    // where each order document has a 'restaurantId' field.
                    // For this example, let's assume we fetch orders for the first restaurant.
                    const ordersQuery = query(collection(db, 'orders'), where('restaurantId', '==', restaurantIds[0]));
                    const ordersSnap = await getDocs(ordersQuery);
                    const fetchedOrders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
                    setOrders(fetchedOrders);
                }
                
                setError(null);
            } catch (err) {
                console.error("Error fetching business data:", err);
                setError("İşletme verileri alınırken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchBusinessData();
    }, [user]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    İşletme Sahibi Paneli
                </Typography>
                
                {error && <Typography color="error">{error}</Typography>}

                <Box sx={{ my: 4 }}>
                    <Typography variant="h5" gutterBottom>Restoranlarım</Typography>
                    {restaurants.length > 0 ? (
                        <List>
                            {restaurants.map(r => (
                                <ListItem key={r.id}>
                                    <ListItemText primary={r.name} />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography>Henüz kayıtlı bir restoranınız bulunmuyor.</Typography>
                    )}
                </Box>
                
                <Divider />

                <Box sx={{ my: 4 }}>
                    <Typography variant="h5" gutterBottom>Gelen Siparişler</Typography>
                    {orders.length > 0 ? (
                        orders.map(order => (
                            <Card key={order.id} sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography>Sipariş ID: {order.id}</Typography>
                                    {/* Display more order details here */}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Typography>Henüz yeni siparişiniz yok.</Typography>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default BusinessOwnerDashboard;
