import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import type { UserCredential } from 'firebase/auth';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { Container, Box, Typography, TextField, Button, Alert, Grid, Link, Divider } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSuccessfulLogin = async (userCredential: UserCredential) => {
    const user = userCredential.user;
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        name: user.displayName || 'New User',
        email: user.email,
        role: 'user',
        createdAt: new Date(),
      });
    }

    const finalUserDoc = await getDoc(userDocRef);
    const userData = finalUserDoc.data();

    if (userData && userData.phone) {
      navigate('/');
    } else {
      navigate('/phone-verification');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleSuccessfulLogin(userCredential);
    } catch (err: any) {
      if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(err.code)) {
        setError('E-posta veya şifre hatalı.');
      } else {
        setError(`Bir hata oluştu: ${err.code}`); // Show error code
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await handleSuccessfulLogin(userCredential);
    } catch (err: any) {
      // Log the full error for diagnosis and show the specific code to the user
      console.error("Google Sign-In Error:", err);
      setError(`Giriş sırasında bir hata oluştu. Hata Kodu: ${err.code}`);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, bgcolor: 'white', borderRadius: 2, boxShadow: 3 }}>
        <Typography component="h1" variant="h5" color="text.primary">
          Giriş Yap
        </Typography>
        <Box component="form" onSubmit={handleEmailLogin} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="E-posta Adresi"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Şifre"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Alert severity="error" sx={{ mt: 2, wordBreak: 'break-all' }}>{error}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, py: 1.5 }}
          >
            Giriş Yap
          </Button>
          <Divider sx={{ my: 3 }}>veya</Divider>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ py: 1.5 }}
          >
            Google ile Devam Et
          </Button>
          <Grid container justifyContent="flex-end" sx={{ mt: 3 }}>
            <Link component={RouterLink} to="/register" variant="body2">
              Hesabınız yok mu? Kayıt Olun
            </Link>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
