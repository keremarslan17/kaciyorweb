import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ConfirmationResult } from 'firebase/auth'; // Type-only import
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Container, Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';

const PhoneVerification: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if auth is initialized and if verifier doesn't exist
    if (auth && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // This callback is called when the reCAPTCHA is solved.
          // In the case of invisible reCAPTCHA, this is often immediate.
          console.log("reCAPTCHA verified");
        }
      });
    }
  }, [auth]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!window.recaptchaVerifier) {
      setError("reCAPTCHA başlatılamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
      setLoading(false);
      return;
    }
    const phoneNumber = `+90${phone.replace(/\D/g, '')}`; // Remove non-digits

    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(result);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("SMS gönderilemedi. Telefon numaranızı ve formatını (5xx xxx xx xx) kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!confirmationResult || !currentUser) {
      setError("Doğrulama hatası. Lütfen işlemi baştan başlatın.");
      setLoading(false);
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        phone: `+90${phone.replace(/\D/g, '')}`
      });
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError("Doğrulama kodu geçersiz veya süresi dolmuş.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Alert severity="warning">Bu sayfaya erişmek için önce giriş yapmanız gerekmektedir. Lütfen giriş sayfasına yönlenin.</Alert>
        </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, bgcolor: 'white', borderRadius: 2, boxShadow: 3 }}>
        <Typography component="h1" variant="h5" color="text.primary">
          Telefon Doğrulama
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            Devam etmek için lütfen telefon numaranızı doğrulayın.
        </Typography>

        {!confirmationResult ? (
          <Box component="form" onSubmit={handleSendOtp} sx={{ mt: 3, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Telefon Numarası (5xx xxx xx xx)"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : "Doğrulama Kodu Gönder"}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleVerifyOtp} sx={{ mt: 3, width: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              {`+90${phone.replace(/\D/g, '')}`} numarasına gönderilen 6 haneli kodu girin.
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Doğrulama Kodu"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, py: 1.5 }}
            >
               {loading ? <CircularProgress size={24} /> : "Doğrula ve Devam Et"}
            </Button>
          </Box>
        )}
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
      </Box>
      <div id="recaptcha-container"></div>
    </Container>
  );
};

export default PhoneVerification;
