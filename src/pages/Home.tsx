import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet'; // Tip import'u düzeltildi
import { collection, getDocs, addDoc, query, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Box, CircularProgress, Typography, Button, Link } from '@mui/material';

interface Restaurant {
  id: string; name: string; discount: string;
  location: { latitude: number; longitude: number; };
}

const mockRestaurants = [
  { name: 'Lezzet Dünyası', discount: 'Sepette %25 İndirim', address: 'İstanbul Merkez', location: { latitude: 41.01, longitude: 28.98 } },
  { name: 'Kebapçı Halil Usta', discount: '1 Alana 1 Bedava', address: 'Ankara Kızılay', location: { latitude: 39.92, longitude: 32.85 } },
  { name: 'Deniz Restoran', discount: 'Tüm Balıklarda %30', address: 'İzmir Alsancak', location: { latitude: 38.43, longitude: 27.14 } },
];

const Home: React.FC = () => {
  const initialPosition: LatLngExpression = [39.92, 32.85];
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndSeedRestaurants = async () => {
      setLoading(true); setError(null);
      const restaurantsCollectionRef = collection(db, "restaurants");
      try {
        const initialCheck = await getDocs(query(restaurantsCollectionRef, limit(1)));
        if (initialCheck.empty) {
          for (const restaurantData of mockRestaurants) {
            await addDoc(restaurantsCollectionRef, restaurantData);
          }
        }
        const querySnapshot = await getDocs(restaurantsCollectionRef);
        const restaurantsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Restaurant[];
        setRestaurants(restaurantsList);
      } catch (err) { setError("Restoran verileri yüklenemedi."); } 
      finally { setLoading(false); }
    };
    fetchAndSeedRestaurants();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /><Typography sx={{ ml: 2 }}>Harita yükleniyor...</Typography></Box>;
  if (error) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Typography color="error">{error}</Typography></Box>;

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', width: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
      <MapContainer center={initialPosition} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
        {restaurants.map(restaurant => (
          <Marker key={restaurant.id} position={[restaurant.location.latitude, restaurant.location.longitude]}>
            <Popup>
              <Typography variant="h6" component="div" sx={{ mb: 1 }}>{restaurant.name}</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{restaurant.discount}</Typography>
              <Link component={RouterLink} to={`/restaurant/${restaurant.id}`} underline="none">
                <Button variant="contained" size="small">Menüyü Gör</Button>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default Home;
