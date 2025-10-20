
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { useCart } from '../contexts/CartContext';
import { 
    Container, 
    Typography, 
    Box, 
    CircularProgress,
    Chip,
    CardMedia,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    IconButton,
    Paper
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Bu interface'leri hem MenuManagement hem de RestaurantMenu'da kullanmak için
// merkezi bir yere (örn: src/types.ts) taşımak daha iyi olabilir.
// Şimdilik burada tanımlıyorum.
export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string; // Bu artık bir kategori ID'si
    imageUrl?: string;
    imagePath?: string;
    allergens?: string;
}

export interface Category {
    id: string;
    name: string;
}

interface Restaurant {
    name: string;
    cuisine: string;
    imageUrl?: string;
}

const RestaurantMenuPage: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        if (!restaurantId) return;
        setLoading(true);

        const fetchRestaurant = async () => {
            const restaurantRef = doc(db, 'restaurants', restaurantId);
            const restaurantSnap = await getDoc(restaurantRef);
            if (restaurantSnap.exists()) {
                setRestaurant(restaurantSnap.data() as Restaurant);
            } else {
                console.log("No such restaurant!");
            }
        };
        fetchRestaurant();

        const menuQuery = collection(db, 'restaurants', restaurantId, 'menu');
        const categoryQuery = collection(db, 'restaurants', restaurantId, 'categories');

        const unsubscribeMenu = onSnapshot(menuQuery, (snap) => {
            setMenuItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)));
            checkIfLoadingComplete();
        });

        const unsubscribeCategories = onSnapshot(categoryQuery, (snap) => {
            setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
            checkIfLoadingComplete();
        });

        const checkIfLoadingComplete = () => {
             // Basit bir kontrol, iki veri de en az bir kez yüklendiğinde loading biter.
             // Daha sofistike bir kontrol eklenebilir.
            setLoading(false);
        }

        return () => {
            unsubscribeMenu();
            unsubscribeCategories();
        };
    }, [restaurantId]);

    const handleAddToCart = (item: MenuItem) => {
        if (restaurantId && restaurant) {
            // CartContext'in de tam MenuItem objesini alacak şekilde güncellendiğinden emin olmalıyız.
            addToCart(item, { id: restaurantId, name: restaurant.name });
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    }

    if (!restaurant) {
        return <Typography variant="h5" align="center" sx={{ mt: 5 }}>Restoran bulunamadı.</Typography>;
    }
    
    const groupedMenu = categories.map(category => ({
        ...category,
        items: menuItems.filter(item => item.category === category.id)
    }));

    const uncategorizedItems = menuItems.filter(item => !item.category || !categories.some(c => c.id === item.category));

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                {restaurant.imageUrl && <CardMedia component="img" height="250" image={restaurant.imageUrl} alt={restaurant.name} />}
                <Box sx={{ p: 3 }}>
                    <Typography variant="h3" gutterBottom component="h1">{restaurant.name}</Typography>
                    <Chip label={restaurant.cuisine} color="primary" />
                </Box>
            </Paper>
            
            {groupedMenu.map(group => (
                group.items.length > 0 && (
                    <Accordion key={group.id} defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h5">{group.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <ImageList cols={3} gap={16}>
                                {group.items.map(item => (
                                    <ImageListItem key={item.id} sx={{ '& .MuiImageListItem-img': { borderRadius: 2, boxShadow: 3 } }}>
                                        <img
                                            src={item.imageUrl || 'https://via.placeholder.com/300x200?text=Görsel+Yok'}
                                            alt={item.name}
                                            loading="lazy"
                                            style={{ width: '100%', height: 200, objectFit: 'cover' }}
                                        />
                                        <ImageListItemBar
                                            sx={{ borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}
                                            title={item.name}
                                            subtitle={<span>₺{item.price.toFixed(2)}</span>}
                                            actionIcon={
                                                <IconButton
                                                    sx={{ color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.4)', mr: 1 }}
                                                    aria-label={`add ${item.name} to cart`}
                                                    onClick={() => handleAddToCart(item)}
                                                >
                                                    <AddShoppingCartIcon />
                                                </IconButton>
                                            }
                                        />
                                        {item.allergens && <Chip label={`Alerjen: ${item.allergens}`} size="small" sx={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }} />}
                                    </ImageListItem>
                                ))}
                            </ImageList>
                        </AccordionDetails>
                    </Accordion>
                )
            ))}

            {uncategorizedItems.length > 0 && (
                 <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h5">Diğer Ürünler</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                       {/* Kategorisiz ürünler için de benzer bir görsel liste kullanılabilir veya daha basit bir liste */}
                        <ImageList cols={3} gap={16}>
                                {uncategorizedItems.map(item => (
                                    <ImageListItem key={item.id} sx={{ '& .MuiImageListItem-img': { borderRadius: 2, boxShadow: 3 } }}>
                                        <img
                                            src={item.imageUrl || 'https://via.placeholder.com/300x200?text=Görsel+Yok'}
                                            alt={item.name}
                                            loading="lazy"
                                            style={{ width: '100%', height: 200, objectFit: 'cover' }}
                                        />
                                        <ImageListItemBar
                                            sx={{ borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}
                                            title={item.name}
                                            subtitle={<span>₺{item.price.toFixed(2)}</span>}
                                            actionIcon={
                                                <IconButton
                                                    sx={{ color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.4)', mr: 1 }}
                                                    aria-label={`add ${item.name} to cart`}
                                                    onClick={() => handleAddToCart(item)}
                                                >
                                                    <AddShoppingCartIcon />
                                                </IconButton>
                                            }
                                        />
                                         {item.allergens && <Chip label={`Alerjen: ${item.allergens}`} size="small" sx={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }} />}
                                    </ImageListItem>
                                ))}
                            </ImageList>
                    </AccordionDetails>
                </Accordion>
            )}

        </Container>
    );
};

export default RestaurantMenuPage;
