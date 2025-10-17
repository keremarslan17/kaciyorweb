
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { db } from '../firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Container, Typography, Box, Paper, Button, Grid, Card, CardContent, CardActions, CircularProgress, Link, Alert, Chip } from '@mui/material';
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
  distance?: number; // Optional distance in km
}

interface Position {
    lat: number;
    lng: number;
}

// --- Helper Function ---
// Haversine formula to calculate distance between two lat/lng points in km
const getDistanceInKm = (pos1: Position, pos2: { latitude: number, longitude: number }) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (pos2.latitude - pos1.lat) * (Math.PI / 180);
  const dLng = (pos2.longitude - pos1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pos1.lat * (Math.PI / 180)) * Math.cos(pos2.latitude * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


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

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  useEffect(() => {
    const fetchRestaurantsAndLocation = async () => {
      setLoading(true);
      
      // First, fetch restaurants
      let restaurantList: Restaurant[] = [];
      try {
        const querySnapshot = await getDocs(collection(db, 'restaurants'));
        restaurantList = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data()
        } as Restaurant));
      } catch (error) {
        console.error("Error fetching restaurants: ", error);
      }

      // Then, try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserPosition(pos);
            setMapCenter(pos);
            
            // If location is available, calculate distances and update state
            const restaurantsWithDistance = restaurantList.map(r => ({
              ...r,
              distance: getDistanceInKm(pos, r.location)
            }));
            setRestaurants(restaurantsWithDistance);
          },
          () => {
            setLocationError("Konum bilgisi alınamadı. Restoranlar varsayılan sırayla listeleniyor.");
            setRestaurants(restaurantList); // Set restaurants without distance
          }
        );
      } else {
        setLocationError("Tarayıcınız konum servisini desteklemiyor.");
        setRestaurants(restaurantList); // Set restaurants without distance
      }
      
      setLoading(false);
    };
    
    fetchRestaurantsAndLocation();
  }, []);

  const sortedFlashDeals = useMemo(() => {
    return restaurants
      .filter(r => r.discount)
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }, [restaurants]);
  
  const featuredRestaurants = restaurants.slice(0, 2);

  const renderMap = () => {
    if (!isLoaded) {
      return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
    }
    return (
      <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={13}>
        {restaurants.map(r => (
          <MarkerF 
            key={r.id} 
            position={{ lat: r.location.latitude, lng: r.location.longitude }}
            title={r.name}
            onClick={() => navigate(`/restaurant/${r.id}`)}
          />
        ))}
        {userPosition && (
          <MarkerF
            position={userPosition}
            title="Konumunuz"
            icon={{
              path: 'M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0',
              fillColor: '#4285F4',
              fillOpacity: 1.0,
              strokeWeight: 2,
              strokeColor: 'white',
              scale: 0.6,
            }}
          />
        )}
      </GoogleMap>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box textAlign="center" mb={5}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">Yakınındaki Fırsatları Keşfet</Typography>
        <Typography variant="h6" color="text.secondary">Haritadan restoranları gör, flaş indirimleri yakala!</Typography>
      </Box>

      {locationError && <Alert severity="warning" sx={{ mb: 2 }}>{locationError}</Alert>}
      
      <Box mb={6}>{renderMap()}</Box>

      <Box mb={6}>
        <Typography variant="h4" component="h2" gutterBottom fontWeight="600" textAlign="center">Flaş İndirimler</Typography>
        {loading ? <Box display="flex" justifyContent="center"><CircularProgress /></Box> : (
          <Grid container spacing={3}>
            {sortedFlashDeals.map(r => (
              <Grid item key={r.id} xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{r.name}</Typography>
                    <Typography variant="body1" color="error" fontWeight="bold">{r.discount}</Typography>
                    {r.distance && (
                      <Chip label={`Uzaklık: ${r.distance.toFixed(1)} km`} size="small" sx={{ mt: 1 }} />
                    )}
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate(`/restaurant/${r.id}`)}>Menüyü Gör</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Paper sx={{ p: 4, textAlign: 'center', mb: 6 }} elevation={3}>
        <Typography variant="h5" component="h3" gutterBottom fontWeight="600">İşletmenizi Kaçıyor Ağına Taşıyın!</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>Binlerce potansiyel müşteriye ulaşın ve kazancınızı artırın.</Typography>
        <Button variant="contained" size="large" href="mailto:info@kaciyor.com">Bize Ulaşın</Button>
      </Paper>

      <Box component="footer" sx={{ py: 3, textAlign: 'center', borderTop: '1px solid #ddd' }}>
        <Typography variant="body2" color="text.secondary">Powered by Kaçıyor Yazılım</Typography>
        <Link href="http://software.kaciyor.com" target="_blank" rel="noopener" variant="body2">Detaylı Bilgi</Link>
      </Box>
    </Container>
  );
};

export default HomePage;
