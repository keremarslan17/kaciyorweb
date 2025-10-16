import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { collection, getDocs, addDoc, query, limit } from 'firebase/firestore';
import { db } from '../firebase'; // Firestore instance'ımız

// MUI Kütüphanesinden bileşenleri import ediyoruz
import { Box, CircularProgress, Typography } from '@mui/material';

// Restoran verisinin tipini tanımlıyoruz
interface Restaurant {
  id: string;
  name: string;
  discount: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

// Örnek veriler (sadece veritabanı boşsa eklenecek)
const mockRestaurants = [
  { name: 'Lezzet Dünyası', discount: 'Sepette %25 İndirim', location: { latitude: 41.01, longitude: 28.98 } },
  { name: 'Kebapçı Halil Usta', discount: '1 Alana 1 Bedava', location: { latitude: 41.005, longitude: 28.975 } },
  { name: 'Deniz Restoran', discount: 'Tüm Balıklarda %30', location: { latitude: 41.015, longitude: 28.97 } },
];

const Home: React.FC = () => {
  const initialPosition: LatLngExpression = [41.0082, 28.9784];
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndSeedRestaurants = async () => {
      setLoading(true);
      setError(null);
      const restaurantsCollectionRef = collection(db, "restaurants");

      try {
        // Koleksiyonda veri var mı diye kontrol et
        const initialCheck = await getDocs(query(restaurantsCollectionRef, limit(1)));
        
        if (initialCheck.empty) {
          // Koleksiyon boşsa, örnek verileri ekle
          console.log("Veritabanı boş, örnek restoranlar ekleniyor...");
          for (const restaurantData of mockRestaurants) {
            await addDoc(restaurantsCollectionRef, restaurantData);
          }
        }

        // Verileri Firestore'dan çek
        const querySnapshot = await getDocs(restaurantsCollectionRef);
        const restaurantsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Restaurant[];
        
        setRestaurants(restaurantsList);

      } catch (err) {
        console.error("Restoranları çekerken hata:", err);
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
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', width: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
      <MapContainer center={initialPosition} zoom={14} style={{ height: '100%', width: '100%' }}>
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
              <Typography variant="body2">{restaurant.discount}</Typography>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default Home;
