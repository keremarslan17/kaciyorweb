
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { 
    Container, Box, Typography, TextField, Button, Alert, Grid, Link, 
    CircularProgress, Checkbox, FormControlLabel, FormGroup, Divider 
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [communicationAccepted, setCommunicationAccepted] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError("Şifreler eşleşmiyor."); return; }
    if (!name) { setError("İsim soyisim alanı zorunludur."); return; }
    if (!termsAccepted) { setError("Lütfen kullanıcı sözleşmesini kabul edin."); return; }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid, email: user.email, name, role: "customer",
        createdAt: new Date(), termsAccepted, communicationAccepted,
      });
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') setError('Bu e-posta adresi zaten kullanılıyor.');
      else if (err.code === 'auth/weak-password') setError('Şifre en az 6 karakter olmalıdır.');
      else setError('Kayıt sırasında bir hata oluştu: ' + err.message);
    } finally { setLoading(false); }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid, email: user.email, name: user.displayName || "Google Kullanıcısı",
          role: "customer", createdAt: new Date(), termsAccepted: true, communicationAccepted: true,
        });
      }
      navigate('/');
    } catch (err: any) {
      setError("Google ile üye olunurken bir hata oluştu: " + err.message);
    } finally { setLoading(false); }
  };
  
  const isButtonDisabled = loading || !termsAccepted || !communicationAccepted;

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, bgcolor: 'white', borderRadius: 2, boxShadow: 3 }}>
        <Typography component="h1" variant="h5" color="text.primary">Hesap Oluştur</Typography>
        <Box component="form" onSubmit={handleRegister} sx={{ mt: 3 }}>
          <TextField margin="normal" required fullWidth label="İsim Soyisim" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} autoFocus />
          {/* RE-ADD: The missing TextFields for email and password */}
          <TextField margin="normal" required fullWidth label="E-posta" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          <TextField margin="normal" required fullWidth label="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
          <TextField margin="normal" required fullWidth label="Şifreyi Onayla" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
          
          <FormGroup sx={{ mt: 2 }}>
            <FormControlLabel 
              control={<Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />} 
              label={
                <Typography variant="body2">
                  <Link component={RouterLink} to="/user-agreement" target="_blank" rel="noopener noreferrer">
                    Kullanıcı Sözleşmesi
                  </Link>
                  'ni okudum ve kabul ediyorum.
                </Typography>
              }
            />
            <FormControlLabel 
              control={<Checkbox checked={communicationAccepted} onChange={(e) => setCommunicationAccepted(e.target.checked)} />} 
              label={<Typography variant="body2">Kampanya ve duyurular için iletişim izni veriyorum.</Typography>} 
            />
          </FormGroup>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          
          <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
            <Button type="submit" fullWidth variant="contained" disabled={isButtonDisabled} sx={{ py: 1.5 }}>
              Kayıt Ol
            </Button>
            {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }} />}
          </Box>
          
          <Divider sx={{ my: 2 }}>veya</Divider>
          <Button 
            fullWidth 
            variant="outlined" 
            startIcon={<GoogleIcon />} 
            onClick={handleGoogleRegister}
            disabled={loading}
          >
            Google ile Üye Ol
          </Button>

          <Grid container justifyContent="flex-end" sx={{ mt: 3 }}>
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">Zaten hesabın var mı? Giriş Yap</Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
