
import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import { db } from '../firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Container, Typography, Box, Paper, Button, Grid, Card, CardContent, CardActions, CircularProgress, Link, Alert } from '@mui/material';
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

interface Position {
    lat: number;
    lng: number;
}

// --- Map Configuration ---
const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
};

const defaultCenter = {
  lat: 39.925533,
  lng: 32.866287 // Ankara
};

// --- Component ---
const HomePage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [userPosition, setUserPosition] = useState<Position | null>(null);
  const [mapCenter, setMapCenter] = useState<Position>(defaultCenter);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    // Fetch user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserPosition(pos);
          setMapCenter(pos); // Center map on user
        },
        () => {
          setLocationError("Konum bilgisi alınamadı. Harita varsayılan konumda gösteriliyor.");
        }
      );
    } else {
      setLocationError("Tarayıcınız konum servisini desteklemiyor.");
    }

    // Fetch restaurants
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

  const featuredRestaurants = restaurants.slice(0, 2);

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box textAlign="center" mb={5}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Yakınındaki Fırsatları Keşfet
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Haritadan restoranları gör, flaş indirimleri yakala!
        </Typography>
      </Box>

      {locationError && <Alert severity="warning" sx={{ mb: 2 }}>{locationError}</Alert>}
      
      <Box mb={6}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
        ) : (
          <LoadScript googleMapsApiKey={mapsApiKey}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={13} // Zoom in a bit more for local view
            >
              {/* Restaurant Markers */}
              {restaurants.map(r => (
                <MarkerF 
                  key={r.id} 
                  position={{ lat: r.location.latitude, lng: r.location.longitude }}
                  title={r.name}
                  onClick={() => navigate(`/restaurant/${r.id}`)}
                />
              ))}
              {/* User's Location Marker */}
              {userPosition && (
                <MarkerF
                  position={userPosition}
                  title="Konumunuz"
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#4285F4",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "white",
                  }}
                />
              )}
            </GoogleMap>
          </LoadScript>
        )}
      </Box>

      <Box mb={6}>
        <Typography variant="h4" component="h2" gutterBottom fontWeight="600" textAlign="center">
          Flaş İndirimler
        </Typography>
        <Grid container spacing={3}>
          {restaurants.filter(r => r.discount).map(r => (
            <Grid item key={r.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6">{r.name}</Typography>
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
