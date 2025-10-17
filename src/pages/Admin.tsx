
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab, Grid, CircularProgress } from '@mui/material';
import RestaurantManagement from '../components/admin/RestaurantManagement';
import UserManagement from '../components/admin/UserManagement';
import { PeopleAlt, Restaurant } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactElement;
  title: string;
  value: number | string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
        {React.cloneElement(icon, { sx: { fontSize: 40, color: 'primary.main', mr: 2 } })}
        <Box>
            <Typography variant="h6" color="text.secondary">{title}</Typography>
            <Typography variant="h4">{value}</Typography>
        </Box>
    </Paper>
);

const AdminDashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const [value, setValue] = useState(0);
    const [stats, setStats] = useState({ userCount: '...', restaurantCount: '...' });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'));
                setStats({
                    userCount: usersSnapshot.size.toString(),
                    restaurantCount: restaurantsSnapshot.size.toString()
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
                setStats({ userCount: 'Hata', restaurantCount: 'Hata' });
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, []);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" gutterBottom>
                Admin Paneli
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                Hoş geldiniz, {userProfile?.name || 'Admin'}.
            </Typography>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={4}>
                    {loadingStats ? <CircularProgress /> : <StatCard icon={<PeopleAlt />} title="Toplam Kullanıcı" value={stats.userCount} />}
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    {loadingStats ? <CircularProgress /> : <StatCard icon={<Restaurant />} title="Toplam Restoran" value={stats.restaurantCount} />}
                </Grid>
            </Grid>

            <Paper sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} centered>
                        <Tab label="Restoran Yönetimi" />
                        <Tab label="Kullanıcı Yönetimi" />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0}>
                    <RestaurantManagement />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <UserManagement />
                </TabPanel>
            </Paper>
        </Container>
    );
};

export default AdminDashboard;
