
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import type { UserCredential } from 'firebase/auth';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { Container, Box, Typography, TextField, Button, Alert, Grid, Link, Divider, ToggleButtonGroup, ToggleButton, Paper } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

type LoginMode = 'customer' | 'staff';

const Login: React.FC = () => {
  const [mode, setMode] = useState<LoginMode>('customer');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleModeChange = (event: React.MouseEvent<HTMLElement>, newMode: LoginMode | null) => {
    if (newMode !== null) {
      setMode(newMode);
      setError(null);
      setEmail('');
      setUsername('');
      setPassword('');
    }
  };

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

    if (userData?.role === 'waiter') navigate('/waiter');
    else if (userData?.role === 'businessOwner') navigate('/business');
    else if (userData?.phone) navigate('/');
    else navigate('/phone-verification');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'customer') {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await handleSuccessfulLogin(userCredential);
      } catch (err) {
        setError('E-posta veya şifre hatalı.');
      }
    } else { // Staff login
      const waiterEmail = `${username.toLowerCase()}@kaciyorortak.waiter`;
      const ownerEmail = `${username.toLowerCase()}@kaciyorortak.owner`;

      try {
        // Try logging in as a waiter first
        const userCredential = await signInWithEmailAndPassword(auth, waiterEmail, password);
        await handleSuccessfulLogin(userCredential);
      } catch (waiterError: any) {
        // If waiter login fails, try logging in as an owner
        if (waiterError.code === 'auth/user-not-found' || waiterError.code === 'auth/invalid-credential') {
          try {
            const userCredential = await signInWithEmailAndPassword(auth, ownerEmail, password);
            await handleSuccessfulLogin(userCredential);
          } catch (ownerError) {
            setError('Kullanıcı adı veya şifre hatalı.');
          }
        } else {
          setError('Kullanıcı adı veya şifre hatalı.');
        }
      }
    }
  };
  
  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await handleSuccessfulLogin(userCredential);
    } catch (err: any) {
      setError(`Google ile giriş sırasında bir hata oluştu: ${err.code}`);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ marginTop: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Giriş Yap</Typography>
        <ToggleButtonGroup
          color="primary"
          value={mode}
          exclusive
          onChange={handleModeChange}
          sx={{ mt: 2, mb: 2 }}
        >
          <ToggleButton value="customer">Müşteri</ToggleButton>
          <ToggleButton value="staff">Personel</ToggleButton>
        </ToggleButtonGroup>

        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
          {mode === 'customer' ? (
            <TextField
              margin="normal"
              required
              fullWidth
              label="E-posta Adresi"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          ) : (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Kullanıcı Adı"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
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
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, py: 1.5 }}>
            Giriş Yap
          </Button>

          {mode === 'customer' && (
            <>
              <Divider sx={{ my: 3 }}>veya</Divider>
              <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} onClick={handleGoogleLogin} sx={{ py: 1.5 }}>
                Google ile Devam Et
              </Button>
              <Grid container justifyContent="flex-end" sx={{ mt: 3 }}>
                <Link component={RouterLink} to="/register" variant="body2">
                  Hesabınız yok mu? Kayıt Olun
                </Link>
              </Grid>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
