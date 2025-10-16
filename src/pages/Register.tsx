import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// MUI Bileşenleri
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Link,
  CircularProgress
} from '@mui/material';

const Register: React.FC = () => {
  const [name, setName] = useState(''); // İsim soyisim için state eklendi
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (!name) {
      setError("İsim soyisim alanı zorunludur.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firestore'da kullanıcı dokümanını yeni alanlarla oluştur
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: name, // Kayıt sırasında alınan isim
        role: "standart",
        phone: "", // Diğer alanlar başlangıçta boş
        school: "",
        address: "",
        createdAt: new Date(),
      });

      navigate('/');

    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Bu e-posta adresi zaten kullanılıyor.');
      } else if (err.code === 'auth/weak-password') {
        setError('Şifre çok zayıf. En az 6 karakter olmalı.');
      } else {
        setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
      console.error("Kayıt sırasında hata:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4,
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Typography component="h1" variant="h5" sx={{ color: 'text.primary' }}>
          Hesap Oluştur
        </Typography>
        <Box component="form" onSubmit={handleRegister} sx={{ mt: 3 }}>
           <TextField margin="normal" required fullWidth id="name" label="İsim Soyisim" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} autoFocus />
          <TextField margin="normal" required fullWidth id="email" label="E-posta Adresi" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          <TextField margin="normal" required fullWidth name="password" label="Şifre" type="password" id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
          <TextField margin="normal" required fullWidth name="confirmPassword" label="Şifreyi Onayla" type="password" id="confirmPassword" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
          
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          
          <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ py: 1.5 }}>
              Kayıt Ol
            </Button>
            {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />}
          </Box>

          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Zaten bir hesabınız var mı? Giriş Yapın
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
