
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase'; 
import { Container, Box, Typography, TextField, Button, Alert, Paper, CircularProgress } from '@mui/material';

const PhoneVerification: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // FIX: Use useRef to hold Firebase instances, avoiding global 'window' object
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Setup recaptcha only once when the container is available
    if (recaptchaContainerRef.current && !recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
            'size': 'invisible',
            'callback': () => { /* reCAPTCHA solved */ }
        });
      } catch(e) {
        console.error("Recaptcha error", e);
        setError("Recaptcha başlatılamadı. Lütfen sayfayı yenileyin.");
      }
    }
  }, [user, navigate]);

  const handleSendOtp = async () => {
    setError(null);
    setSuccess(null);
    if (!phone.startsWith('+')) {
        setError('Lütfen ülke koduyla başlayın (örn: +905xxxxxxxxx).');
        return;
    }
    if (!recaptchaVerifierRef.current) {
        setError('Recaptcha hazırlanıyor, lütfen tekrar deneyin.');
        return;
    }
    setLoading(true);
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifierRef.current);
      confirmationResultRef.current = confirmationResult;
      setOtpSent(true);
      setSuccess('Doğrulama kodu telefonunuza gönderildi.');
    } catch (err: any) {
      console.error(err);
      setError(`Kod gönderilemedi: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (!confirmationResultRef.current) {
        setError('Önce doğrulama kodu istemelisiniz.');
        return;
    }
    setLoading(true);
    try {
      await confirmationResultRef.current.confirm(otp);
      // In a real app, you would now update the user's profile in Firestore
      setSuccess('Telefon numaranız başarıyla doğrulandı!');
      setTimeout(() => navigate('/'), 2000); 
    } catch (err: any) {
      console.error(err);
      setError(`Kod doğrulanamadı: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Telefon Doğrulama</Typography>
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{success}</Alert>}

        {!otpSent ? (
          <Box sx={{ mt: 3, width: '100%' }}>
            <TextField label="Telefon Numarası (+90...)" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth margin="normal" />
            <Button onClick={handleSendOtp} fullWidth variant="contained" sx={{ mt: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Doğrulama Kodu Gönder'}
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 3, width: '100%' }}>
            <TextField label="Doğrulama Kodu" value={otp} onChange={(e) => setOtp(e.target.value)} fullWidth margin="normal" />
            <Button onClick={handleVerifyOtp} fullWidth variant="contained" sx={{ mt: 2 }} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Doğrula ve Bitir'}
            </Button>
          </Box>
        )}
        {/* This div is now the mount point for the invisible reCAPTCHA */}
        <div ref={recaptchaContainerRef} style={{ marginTop: '20px' }}></div>
      </Paper>
    </Container>
  );
};

export default PhoneVerification;
