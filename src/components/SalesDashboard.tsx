
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, CircularProgress, Paper, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

// Dummy Data structure for orders
interface OrderItem {
    name: string;
    price: number;
    quantity: number;
}

interface Order {
    id: string;
    createdAt: Timestamp;
    items: OrderItem[];
    total: number;
}

interface SalesData {
    totalRevenue: number;
    totalOrders: number;
    itemsSold: number;
}

const SalesDashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [salesData, setSalesData] = useState<SalesData>({ totalRevenue: 0, totalOrders: 0, itemsSold: 0 });

    const restaurantId = userProfile?.restaurantId;

    useEffect(() => {
        if (!restaurantId) return;

        const ordersQuery = query(collection(db, "orders"), where("restaurantId", "==", restaurantId));
        
        const unsubscribe = onSnapshot(ordersQuery, (snap) => {
            const fetchedOrders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setOrders(fetchedOrders);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [restaurantId]);

    useEffect(() => {
        const calculateSales = () => {
            const now = new Date();
            let startTime: Date;

            switch (timeRange) {
                case 'weekly':
                    startTime = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'monthly':
                    startTime = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                case 'daily':
                default:
                    startTime = new Date(now.setHours(0, 0, 0, 0));
                    break;
            }

            const filteredOrders = orders.filter(order => order.createdAt.toDate() >= startTime);

            const totalRevenue = filteredOrders.reduce((acc, order) => acc + order.total, 0);
            const totalOrders = filteredOrders.length;
            const itemsSold = filteredOrders.reduce((acc, order) => acc + order.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0), 0);

            setSalesData({ totalRevenue, totalOrders, itemsSold });
        };

        if (orders.length > 0) {
            calculateSales();
        }
    }, [orders, timeRange]);

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Typography variant="h5" mb={3}>Satış Raporları</Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Zaman Aralığı</InputLabel>
                <Select
                    value={timeRange}
                    label="Zaman Aralığı"
                    onChange={(e) => setTimeRange(e.target.value as 'daily' | 'weekly' | 'monthly')}
                >
                    <MenuItem value="daily">Günlük</MenuItem>
                    <MenuItem value="weekly">Haftalık</MenuItem>
                    <MenuItem value="monthly">Aylık</MenuItem>
                </Select>
            </FormControl>

            {orders.length === 0 ? (
                <Typography>Bu restorana ait hiç sipariş bulunamadı.</Typography>
            ) : (
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">Toplam Ciro</Typography>
                            <Typography variant="h4" color="primary">₺{salesData.totalRevenue.toFixed(2)}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">Toplam Sipariş</Typography>
                            <Typography variant="h4" color="primary">{salesData.totalOrders}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">Satılan Ürün Sayısı</Typography>
                            <Typography variant="h4" color="primary">{salesData.itemsSold}</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default SalesDashboard;
