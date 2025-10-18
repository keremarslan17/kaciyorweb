
import React from 'react';
// FIX: Import Button from Material-UI
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const UserAgreement: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Kullanıcı Sözleşmesi
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Son Güncelleme: 20 Ekim 2025
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>1. Taraflar</Typography>
          <Typography paragraph>
            İşbu Kullanıcı Sözleşmesi ("Sözleşme"), Kaçıyor mobil uygulaması ve web sitesi ("Platform") ile Platform'a üye olan kullanıcı ("Kullanıcı") arasında akdedilmiştir.
          </Typography>

          <Typography variant="h6" gutterBottom>2. Hizmetlerin Tanımı</Typography>
          <Typography paragraph>
            Platform, Kullanıcıların konum tabanlı olarak yiyecek ve içecek hizmeti sunan işletmeleri ("İşletme") ve bu işletmelerin sunduğu indirim ve kampanyaları görmesini sağlayan bir aracı hizmet sağlayıcıdır.
          </Typography>

          <Typography variant="h6" gutterBottom>3. Üyelik ve Kullanım Koşulları</Typography>
          <Typography paragraph>
            Kullanıcı, Platform'a üye olurken verdiği bilgilerin doğru ve güncel olduğunu kabul eder. Üyelik kişiseldir ve başkasına devredilemez. Kullanıcı, Platform'u yasalara uygun amaçlarla kullanmayı taahhüt eder.
          </Typography>
          
          <Typography variant="h6" gutterBottom>4. Gizlilik</Typography>
          <Typography paragraph>
            Platform, Kullanıcıların kişisel verilerini Gizlilik Politikası'na uygun olarak işler. Kullanıcı, üye olarak Gizlilik Politikası'nı kabul etmiş sayılır.
          </Typography>

          <Typography variant="h6" gutterBottom>5. Sorumlulukların Sınırlandırılması</Typography>
          <Typography paragraph>
            Kaçıyor, İşletmeler tarafından sunulan hizmetlerin, ürünlerin veya kampanyaların içeriğinden, kalitesinden veya doğruluğundan sorumlu değildir. Platform, yalnızca bir aracıdır.
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Bu sözleşme, Platform'a üye olunduğu anda yürürlüğe girer.
          </Typography>

           <Button component={Link} to="/register" variant="contained" sx={{mt: 3}}>
                Kayıt Ekranına Geri Dön
            </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserAgreement;
