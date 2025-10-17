
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';

interface UserProfile {
  name: string;
  email: string;
  address?: string;
  phone?: string;
}

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth(); // Changed currentUser to user
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // If no profile exists, create one with default info
            const defaultProfile: UserProfile = {
              name: user.displayName || '',
              email: user.email || '',
            };
            await setDoc(docRef, defaultProfile);
            setProfile(defaultProfile);
          }
          setError(null);
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setError("Profil bilgileri alınamadı.");
        }
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (profile) {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && profile) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, { ...profile });
        setSuccess("Profil başarıyla güncellendi!");
      } catch (err) {
        console.error("Error updating profile:", err);
        setError("Profil güncellenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !profile) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h6" align="center" sx={{ mt: 5 }}>
          Lütfen profilinizi görüntülemek için giriş yapın.
        </Typography>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: '16px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 64, height: 64 }}>
            <AccountCircle sx={{ fontSize: 40 }}/>
          </Avatar>
          <Typography component="h1" variant="h5">
            Profilim
          </Typography>
          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{success}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <TextField
              margin="normal"
              fullWidth
              id="name"
              label="Ad Soyad"
              name="name"
              value={profile.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="E-posta Adresi"
              name="email"
              value={profile.email}
              disabled // Email is usually not changeable
            />
            <TextField
              margin="normal"
              fullWidth
              id="phone"
              label="Telefon Numarası"
              name="phone"
              value={profile.phone || ''}
              onChange={handleChange}
            />
             <TextField
              margin="normal"
              fullWidth
              id="address"
              label="Adres"
              name="address"
              value={profile.address || ''}
              onChange={handleChange}
              multiline
              rows={3}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: '8px' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Değişiklikleri Kaydet'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
