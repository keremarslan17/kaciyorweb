import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // to get current user's data

// MUI
import { Container, Typography, Paper, Box } from '@mui/material';

const BusinessOwner: React.FC = () => {
  const { currentUser } = useAuth();

  // It's safe to assume currentUser exists because of ProtectedRoute
  // and that restaurantId will exist if the role is 'işletmeci'
  
  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          İşletmeci Paneli
        </Typography>
        <Typography variant="h6">
          Hoş geldiniz, {currentUser?.name || currentUser?.email}!
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1">
            Bu panelde restoranınızın menüsünü yönetebilir, siparişleri takip edebilir ve garsonlarınızı yönetebilirsiniz.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
            Yönettiğiniz Restoran ID: {currentUser?.restaurantId || "Henüz bir restoran atanmamış."}
          </Typography>
        </Box>
        {/* Menü yönetimi (kategori/ürün ekleme) buraya gelecek */}
      </Paper>
    </Container>
  );
};

export default BusinessOwner;
