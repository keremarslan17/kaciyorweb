
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Typography, Box, Paper, Tabs, Tab } from '@mui/material';
import MenuManagement from '../components/MenuManagement';
import DiscountManager from '../components/DiscountManager';
import SalesDashboard from '../components/SalesDashboard';
import RestaurantEditor from '../components/RestaurantEditor';
import WaiterManagement from '../components/WaiterManagement';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`business-tabpanel-${index}`}
      aria-labelledby={`business-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const BusinessOwnerDashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const [value, setValue] = useState(0);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper sx={{ width: '100%', p: 2 }}>
                <Typography variant="h4" gutterBottom sx={{ p: 2 }}>
                    İşletmeci Paneli
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2, p: 2 }}>
                    Restoran: {userProfile?.restaurantName || userProfile?.name || 'Yükleniyor...'}
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={value} 
                        onChange={handleChange} 
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                    >
                        <Tab label="Menü Yönetimi" />
                        <Tab label="İndirimler" />
                        <Tab label="Satış Raporları" />
                        <Tab label="Restoran Bilgileri" />
                        <Tab label="Garson Yönetimi" />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0}>
                    <MenuManagement />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <DiscountManager />
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <SalesDashboard />
                </TabPanel>
                <TabPanel value={value} index={3}>
                    <RestaurantEditor />
                </TabPanel>
                <TabPanel value={value} index={4}>
                    <WaiterManagement />
                </TabPanel>
            </Paper>
        </Container>
    );
};

export default BusinessOwnerDashboard;
