import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Container, Box, Typography, TextField, Button, Alert, Grid, Link, CircularProgress } from '@mui/material';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (password !== confirmPassword) { setError("Şifreler eşleşmiyor."); return; }
    if (!name) { setError("İsim soyisim alanı zorunludur."); return; }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid, email: user.email, name, role: "standart",
        phone: "", school: "", address: "", createdAt: new Date(),
      });
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') setError('Bu e-posta adresi zaten kullanılıyor.');
      else if (err.code === 'auth/weak-password') setError('Şifre çok zayıf.');
      else setError('Kayıt sırasında bir hata oluştu.');
    } finally { setLoading(false); }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, bgcolor: 'white', borderRadius: 2, boxShadow: 3 }}>
        <Typography component="h1" variant="h5" color="text.primary">Hesap Oluştur</Typography>
        <Box component="form" onSubmit={handleRegister} sx={{ mt: 3 }}>
          <TextField margin="normal" required fullWidth label="İsim Soyisim" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} autoFocus />
          <TextField margin="normal" required fullWidth label="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          <TextField margin="normal" required fullWidth label="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
          <TextField margin="normal" required fullWidth label="Şifreyi Onayla" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ py: 1.5 }}>Kayıt Ol</Button>
            {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }} />}
          </Box>
          <Grid container justifyContent="flex-end">
            <Grid>
              <Link component={RouterLink} to="/login" variant="body2">Zaten hesabın var mı? Giriş Yap</Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
