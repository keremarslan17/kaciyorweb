
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
    const userData = userDocSnap.data();

    // Create user doc if it doesn't exist (for Google Sign-in)
    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        name: user.displayName || 'New User',
        email: user.email,
        role: 'user', // Default role
        createdAt: new Date(),
      });
    }
    
    // Redirect based on role
    if (userData?.role === 'waiter') {
      navigate('/waiter');
    } else if (userData?.role === 'businessOwner') {
      navigate('/business');
    } else if (userData?.phone) { // Default user has phone verified
      navigate('/');
    } else { // Default user needs phone verification
      navigate('/phone-verification');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      let finalEmail = email;
      if (mode === 'staff') {
        // Assume staff usernames are converted to emails in a specific format
        finalEmail = `${username.toLowerCase()}@kaciyorortak.waiter`;
      }
      const userCredential = await signInWithEmailAndPassword(auth, finalEmail, password);
      await handleSuccessfulLogin(userCredential);
    } catch (err: any) {
      setError('Kullanıcı adı veya şifre hatalı.');
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
        <Typography component="h1" variant="h5">
          Giriş Yap
        </Typography>
        <ToggleButtonGroup
          color="primary"
          value={mode}
          exclusive
          onChange={handleModeChange}
          aria-label="login mode"
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, py: 1.5 }}
          >
            Giriş Yap
          </Button>

          {mode === 'customer' && (
            <>
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
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
