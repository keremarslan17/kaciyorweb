
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid
} from '@mui/material';
import { AccountCircle, AccountBalanceWallet } from '@mui/icons-material';

interface UserProfile {
  name: string;
  email: string;
  address?: string;
  phone?: string;
}

interface UserBalance {
  restaurantName: string;
  balance: number;
}

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [balances, setBalances] = React.useState<UserBalance[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchProfileAndBalances = async () => {
      if (user) {
        try {
          // Fetch user profile
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            const defaultProfile: UserProfile = {
              name: user.displayName || '',
              email: user.email || '',
            };
            await setDoc(docRef, defaultProfile);
            setProfile(defaultProfile);
          }

          // Fetch user balances
          const balanceQuery = query(collection(db, 'userBalances'), where('userId', '==', user.uid));
          const balanceSnapshot = await getDocs(balanceQuery);
          const userBalances = balanceSnapshot.docs.map(d => d.data() as UserBalance);
          setBalances(userBalances);

          setError(null);
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Profil ve bakiye bilgileri alınamadı.");
        }
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchProfileAndBalances();
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
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  if (!user || !profile) {
    return <Typography sx={{ textAlign: 'center', mt: 5 }}>Lütfen profilinizi görüntülemek için giriş yapın.</Typography>;
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {/* Profile Edit Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 4, borderRadius: '16px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}><AccountCircle /></Avatar>
              <Typography component="h1" variant="h5">Profilim</Typography>
              {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{success}</Alert>}
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                <TextField margin="normal" fullWidth id="name" label="Ad Soyad" name="name" value={profile.name} onChange={handleChange} />
                <TextField margin="normal" fullWidth id="email" label="E-posta" name="email" value={profile.email} disabled />
                <TextField margin="normal" fullWidth id="phone" label="Telefon" name="phone" value={profile.phone || ''} onChange={handleChange} />
                <TextField margin="normal" fullWidth id="address" label="Adres" name="address" value={profile.address || ''} onChange={handleChange} multiline rows={3} />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Değişiklikleri Kaydet'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Balances Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 4, borderRadius: '16px', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}><AccountBalanceWallet /></Avatar>
              <Typography component="h1" variant="h5">Restoran Bakiyelerim</Typography>
            </Box>
            {balances.length > 0 ? (
              <List>
                {balances.map((b, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText primary={b.restaurantName} secondary={`${b.balance.toFixed(2)} TL`} />
                    </ListItem>
                    {index < balances.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography>Henüz hiçbir restoranda bakiyeniz bulunmuyor.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
