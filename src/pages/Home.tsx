import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { collection, getDocs, query, limit, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Box, CircularProgress, Typography, Button, Alert } from '@mui/material';

interface Restaurant {
  id: string;
  name: string;
  discount: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

// Mock data to seed the database if it's empty
const mockRestaurants = [
  { name: 'Lezzet Dünyası', discount: 'Sepette %25 İndirim', location: { latitude: 41.01, longitude: 28.98 } },
  { name: 'Kebapçı Halil Usta', discount: '1 Alana 1 Bedava', location: { latitude: 39.92, longitude: 32.85 } },
  { name: 'Deniz Restoran', discount: 'Tüm Balıklarda %30', location: { latitude: 38.43, longitude: 27.14 } },
];

const Home: React.FC = () => {
  const initialPosition: LatLngExpression = [39.92, 32.85]; // Default to Ankara
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndSeedRestaurants = async () => {
      setLoading(true);
      setError(null);
      const restaurantsCollectionRef = collection(db, "restaurants");
      
      try {
        // Check if there is any data
        const initialCheck = await getDocs(query(restaurantsCollectionRef, limit(1)));
        
        // If the collection is empty, seed it with mock data
        if (initialCheck.empty) {
          console.log("No restaurants found. Seeding database with mock data...");
          for (const restaurantData of mockRestaurants) {
            await addDoc(restaurantsCollectionRef, restaurantData);
          }
        }

        // Fetch all restaurants
        const querySnapshot = await getDocs(restaurantsCollectionRef);
        const restaurantsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Restaurant[];
        
        setRestaurants(restaurantsList);

      } catch (err: any) {
        console.error("Error fetching restaurants:", err);
        setError("Restoran verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndSeedRestaurants();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Harita ve restoranlar yükleniyor...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', width: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
      <MapContainer center={initialPosition} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {restaurants.map(restaurant => (
          <Marker
            key={restaurant.id}
            position={[restaurant.location.latitude, restaurant.location.longitude]}
          >
            <Popup>
              <Typography variant="h6" component="div">{restaurant.name}</Typography>
              <Typography variant="body2" color="text.secondary">{restaurant.discount}</Typography>
              <Button component={RouterLink} to={`/restaurant/${restaurant.id}`} variant="contained" size="small" sx={{ mt: 1 }}>
                Menüyü Gör
              </Button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default Home;
