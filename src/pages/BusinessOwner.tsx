
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    Container, Typography, Box, Paper, Tabs, Tab
} from '@mui/material';
import MenuManagement from '../components/MenuManagement'; // Oluşturulacak
import DiscountManager from '../components/DiscountManager'; // Oluşturulacak
import SalesDashboard from '../components/SalesDashboard'; // Oluşturulacak
import RestaurantEditor from '../components/RestaurantEditor'; // Oluşturulacak
import WaiterManagement from '../components/WaiterManagement'; // Mevcut kod taşınacak

// TabPanel Yardımcı Bileşeni
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
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Ana Pano Bileşeni
const BusinessOwnerDashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    if (!userProfile) {
        return <Typography>Yükleniyor...</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>İşletmeci Paneli</Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    Restoran: {userProfile.restaurantName || userProfile.name}
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="business dashboard tabs">
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
