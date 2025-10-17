
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import type { UserCredential } from 'firebase/auth';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { 
    Container, Box, Typography, TextField, Button, Alert, 
    Grid, Link, ToggleButtonGroup, ToggleButton, Paper, Divider 
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

type LoginMode = 'customer' | 'staff';

const Login: React.FC = () => {
    const [mode, setMode] = useState<LoginMode>('customer');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: LoginMode | null) => {
        if (newMode) setMode(newMode);
    };

    const handleSuccessfulLogin = async (user: UserCredential['user']) => {
        await user.getIdToken(true); 
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
                name: user.displayName,
                email: user.email,
                role: 'customer',
                createdAt: new Date(),
            });
             navigate('/');
             return;
        }

        const userData = userDoc.data();
        switch (userData.role) {
            case 'admin': navigate('/admin'); break;
            case 'businessOwner': navigate('/business'); break;
            case 'waiter': navigate('/waiter'); break;
            default: navigate('/'); break;
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
            await handleSuccessfulLogin(userCredential.user);
        } catch (err: any) {
            setError(`Google ile giriş hatası: ${err.message}`);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (mode === 'customer') {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                await handleSuccessfulLogin(userCredential.user);
            } catch {
                setError('E-posta veya şifre hatalı.');
            }
        } else { 
            const cleanedUsername = username.toLowerCase().trim();
            const potentialEmails = [
                `${cleanedUsername}@kaciyorortak.owner`, 
                `${cleanedUsername}@kaciyorortak.waiter`,
                cleanedUsername,
            ];
            
            let loggedIn = false;
            for (const attemptEmail of potentialEmails) {
                try {
                    if (!attemptEmail.includes('@')) continue;
                    const userCredential = await signInWithEmailAndPassword(auth, attemptEmail, password);
                    await handleSuccessfulLogin(userCredential.user);
                    loggedIn = true;
                    break; 
                } catch (err) { /* Continue */ }
            }

            if (!loggedIn) {
                setError('Kullanıcı adı veya şifre hatalı.');
            }
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={6} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">Giriş Yap</Typography>
                <ToggleButtonGroup color="primary" value={mode} exclusive onChange={handleModeChange} sx={{ mt: 2, mb: 2 }}>
                    <ToggleButton value="customer">Müşteri</ToggleButton>
                    <ToggleButton value="staff">Personel</ToggleButton>
                </ToggleButtonGroup>

                <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
                    {mode === 'customer' ? (
                        <TextField label="E-posta Adresi" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth margin="normal" autoComplete="email" />
                    ) : (
                        <TextField label="Kullanıcı Adı veya E-posta" value={username} onChange={(e) => setUsername(e.target.value)} required fullWidth margin="normal" autoComplete="username" />
                    )}
                    <TextField label="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth margin="normal" autoComplete="current-password" />
                    
                    {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
                    
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Giriş Yap</Button>
                    
                    {mode === 'customer' && (
                        <>
                            <Divider sx={{ my: 2 }}>veya</Divider>
                            <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} onClick={handleGoogleLogin}>
                                Google ile Giriş Yap
                            </Button>
                            <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                                <Grid item>
                                    <Link component={RouterLink} to="/register" variant="body2">Hesabınız yok mu? Kayıt Olun</Link>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
