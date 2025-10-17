
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
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log("reCAPTCHA verified");
        }
      });
    }
  }, [auth]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
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
      if (err.code === 'auth/invalid-phone-number') {
        setError('Geçersiz telefon numarası. Lütfen kontrol edin.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.');
      } else {
        setError('SMS gönderilemedi. Lütfen daha sonra tekrar deneyin.');
      }
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
      if (err.code === 'auth/invalid-verification-code') {
        setError('Geçersiz doğrulama kodu.');
      } else {
        setError('Kod doğrulanamadı. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
      if (setAuthLoading) setAuthLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Paper elevation={6} sx={{ marginTop: 8, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '16px' }}>
        <div id="recaptcha-container"></div>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Telefon Doğrulama
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          {!confirmationResult
            ? 'Telefon numaranızı girin, size bir doğrulama kodu gönderelim.'
            : 'Telefonunuza gelen 6 haneli kodu girin.'}
        </Typography>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        {!confirmationResult ? (
          <Box component="form" onSubmit={handleSendOtp} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label="Telefon Numarası (5xx xxx xx xx)"
              name="phone"
              autoComplete="tel"
              autoFocus
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="555 123 4567"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: '8px' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Kod Gönder'}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleVerifyOtp} sx={{ width: '100%' }}>
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
              inputProps={{ maxLength: 6 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: '8px' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Doğrula'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PhoneVerification;
