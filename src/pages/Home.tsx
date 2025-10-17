
import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import { db } from '../firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Container, Typography, Box, Paper, Button, Grid, Card, CardContent, CardActions, CircularProgress, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// --- Interfaces ---
interface Restaurant {
  id: string;
  name: string;
  discount?: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

// --- Map Configuration ---
const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
};

const defaultCenter = {
  lat: 39.925533,
  lng: 32.866287
};

// --- Component ---
const HomePage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'restaurants'));
        const restaurantList = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data()
        } as Restaurant));
        setRestaurants(restaurantList);
      } catch (error) {
        console.error("Error fetching restaurants: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const featuredRestaurants = restaurants.slice(0, 2); // Show first 2 as featured

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      {/* --- Header --- */}
      <Box textAlign="center" mb={5}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Yakınındaki Fırsatları Keşfet
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Haritadan restoranları gör, flaş indirimleri yakala!
        </Typography>
      </Box>

      {/* --- Google Map --- */}
      <Box mb={6}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
        ) : (
          <LoadScript googleMapsApiKey={mapsApiKey}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={defaultCenter}
              zoom={12}
            >
              {restaurants.map(r => (
                <MarkerF 
                  key={r.id} 
                  position={{ lat: r.location.latitude, lng: r.location.longitude }}
                  title={r.name}
                  onClick={() => navigate(`/restaurant/${r.id}`)}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        )}
      </Box>

      {/* --- Flash Deals Section --- */}
      <Box mb={6}>
        <Typography variant="h4" component="h2" gutterBottom fontWeight="600" textAlign="center">
          Flaş İndirimler
        </Typography>
        <Grid container spacing={3}>
          {restaurants.filter(r => r.discount).map(r => (
            <Grid item key={r.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div">{r.name}</Typography>
                  <Typography variant="body1" color="error" fontWeight="bold">{r.discount}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/restaurant/${r.id}`)}>Menüyü Gör</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* --- Featured Restaurants Section --- */}
      <Box mb={6} bgcolor="alternate.main" p={4} borderRadius={4}>
        <Typography variant="h4" component="h2" gutterBottom fontWeight="600" textAlign="center" color="white">
          Öne Çıkanlar
        </Typography>
        <Grid container spacing={3}>
          {featuredRestaurants.map(r => (
            <Grid item key={r.id} xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">{r.name}</Typography>
                <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={() => navigate(`/restaurant/${r.id}`)}>
                  Hemen Göz At
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* --- Call to Action for Businesses --- */}
      <Paper sx={{ p: 4, textAlign: 'center', mb: 6 }} elevation={3}>
        <Typography variant="h5" component="h3" gutterBottom fontWeight="600">
          İşletmenizi Kaçıyor Ağına Taşıyın!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Binlerce potansiyel müşteriye ulaşın ve kazancınızı artırın.
        </Typography>
        <Button variant="contained" size="large" href="mailto:info@kaciyor.com">
          Bize Ulaşın
        </Button>
      </Paper>

      {/* --- Footer --- */}
      <Box component="footer" sx={{ py: 3, textAlign: 'center', borderTop: '1px solid #ddd' }}>
        <Typography variant="body2" color="text.secondary">
          Powered by Kaçıyor Yazılım
        </Typography>
        <Link href="http://software.kaciyor.com" target="_blank" rel="noopener" variant="body2">
          Detaylı Bilgi
        </Link>
      </Box>
    </Container>
  );
};

export default HomePage;
