import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// MUI
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Form state'lerini currentUser'dan gelen verilerle başlatıyoruz
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState('');
  const [address, setAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // currentUser verisi geldiğinde veya değiştiğinde state'leri doldur
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setSchool(currentUser.school || '');
      setAddress(currentUser.address || '');
    }
  }, [currentUser]);


  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!currentUser) {
      setError("Güncelleme yapmak için giriş yapmalısınız.");
      return;
    }

    setLoading(true);

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        name,
        phone,
        school,
        address,
      });
      setSuccess("Profil bilgileriniz başarıyla güncellendi.");
    } catch (err) {
      setError("Profil güncellenirken bir hata oluştu.");
      console.error("Profil güncelleme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Container maxWidth="sm">
        <Typography>Kullanıcı bilgileri yükleniyor...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Profil Bilgileri
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          E-posta: {currentUser.email} (değiştirilemez)
        </Typography>
         <Typography variant="body1" color="textSecondary" gutterBottom>
          Rol: {currentUser.role} (değiştirilemez)
        </Typography>

        <Box component="form" onSubmit={handleUpdateProfile} sx={{ mt: 3 }}>
          <TextField
            label="İsim Soyisim"
            margin="normal"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Telefon Numarası"
            margin="normal"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            label="Okul"
            margin="normal"
            fullWidth
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />
          <TextField
            label="Adres"
            margin="normal"
            fullWidth
            multiline
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

          <Box sx={{ position: 'relative', mt: 3 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              size="large"
            >
              Bilgileri Güncelle
            </Button>
            {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }} />}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
