
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Paper,
  CssBaseline
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Extend the Window interface to include the recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

const PhoneVerification: React.FC = () => {
  const { auth, setLoading: setAuthLoading } = useAuth();
  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          console.log("reCAPTCHA verified");
        }
      });
    }
  }, [auth]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !window.recaptchaVerifier) {
        setError("Kimlik doğrulama hizmeti yüklenemedi.");
        return;
    }
    setError(null);
    setLoading(true);

    const appVerifier = window.recaptchaVerifier;
    const phoneNumber = `+90${phone.replace(/\\D/g, '')}`;

    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setError(null);
    } catch (err: any) {
      console.error("OTP Send Error:", err);
      setError('SMS gönderilemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) {
      setError("Önce doğrulama kodu gönderilmelidir.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await confirmationResult.confirm(otp);
      setError(null);
      if (setAuthLoading) setAuthLoading(true);
      navigate('/');
    } catch (err: any) {
      console.error("OTP Verify Error:", err);
      setError('Kod doğrulanamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      if (setAuthLoading) setAuthLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Paper elevation={6} sx={{ marginTop: 8, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div id="recaptcha-container"></div>
        <Typography component="h1" variant="h5">
          Telefon Doğrulama
        </Typography>
        
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

        {!confirmationResult ? (
          <Box component="form" onSubmit={handleSendOtp} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label="Telefon Numarası"
              name="phone"
              autoFocus
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Kod Gönder'}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleVerifyOtp} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Doğrulama Kodu"
              name="otp"
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Doğrula'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PhoneVerification;
