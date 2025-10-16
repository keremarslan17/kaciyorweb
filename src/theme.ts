import { createTheme } from '@mui/material/styles';
import { teal, amber } from '@mui/material/colors';

// Mobil uygulamanın görsel kimliğine uygun bir tema oluşturuyoruz.
const theme = createTheme({
  palette: {
    primary: {
      main: teal[500], // Ana renk: Turkuaz tonları
    },
    secondary: {
      main: amber[700], // Vurgu rengi: Turuncu/Amber tonları
    },
    background: {
      default: '#f4f6f8', // Uygulama geneli için hafif gri bir arka plan
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    button: {
      textTransform: 'none', // Buton metinlerini büyük harf yapma
      fontWeight: 600,
    }
  },
  shape: {
    borderRadius: 8, // Kenar yuvarlaklığı
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 20px', // Butonların iç boşluğu
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined', // Varsayılan TextField stili
        fullWidth: true,
      },
    },
  },
});

export default theme;
