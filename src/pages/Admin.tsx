import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container, Typography, Box, TextField, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress,
  Tabs, Tab, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// Data Interfaces
interface Restaurant {
  id: string; name: string; address: string; discount: string;
  location: { latitude: number; longitude: number; };
}
interface User {
  uid: string; name: string; email: string; role: string; restaurantId?: string;
}

const Admin: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', address: '', discount: '', latitude: '', longitude: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const restQuery = await getDocs(collection(db, "restaurants"));
    const userQuery = await getDocs(collection(db, "users"));
    setRestaurants(restQuery.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant)));
    setUsers(userQuery.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User)));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try {
      await addDoc(collection(db, "restaurants"), {
        name: form.name, address: form.address, discount: form.discount,
        location: { latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) }
      });
      setForm({ name: '', address: '', discount: '', latitude: '', longitude: '' });
      await fetchAllData();
    } catch (error) { console.error(error); } 
    finally { setFormLoading(false); }
  };

  const handleRestaurantDelete = async (id: string) => {
    try { await deleteDoc(doc(db, "restaurants", id)); await fetchAllData(); }
    catch (error) { console.error(error); }
  };

  const handleRoleChange = async (uid: string, newRole: string) => {
    await updateDoc(doc(db, 'users', uid), { role: newRole, restaurantId: '' });
    await fetchAllData();
  };
  
  const handleRestaurantAssignment = async (uid: string, restaurantId: string) => {
    await updateDoc(doc(db, 'users', uid), { restaurantId: restaurantId });
    await fetchAllData();
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>Admin Paneli</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab label="Restoran Yönetimi" />
          <Tab label="Kullanıcı Yönetimi" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Yeni Restoran Ekle</Typography>
          <Box component="form" onSubmit={handleRestaurantSubmit}>
            <TextField label="Restoran Adı" name="name" value={form.name} onChange={handleInputChange} fullWidth margin="normal" required />
            <TextField label="Adres" name="address" value={form.address} onChange={handleInputChange} fullWidth margin="normal" required />
            <TextField label="İndirim Metni" name="discount" value={form.discount} onChange={handleInputChange} fullWidth margin="normal" required />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Enlem" name="latitude" value={form.latitude} onChange={handleInputChange} fullWidth margin="normal" required type="number" />
              <TextField label="Boylam" name="longitude" value={form.longitude} onChange={handleInputChange} fullWidth margin="normal" required type="number" />
            </Box>
            <Button type="submit" variant="contained" disabled={formLoading} fullWidth sx={{ mt: 2 }}>Ekle</Button>
          </Box>
          <Typography variant="h6" sx={{ mt: 4 }} gutterBottom>Mevcut Restoranlar</Typography>
          {loading ? <CircularProgress /> : <TableContainer component={Paper}>
            <Table><TableHead><TableRow><TableCell>Adı</TableCell><TableCell>Adres</TableCell><TableCell align="right">İşlemler</TableCell></TableRow></TableHead>
              <TableBody>{restaurants.map((rest) => (<TableRow key={rest.id}><TableCell>{rest.name}</TableCell><TableCell>{rest.address}</TableCell><TableCell align="right"><IconButton disabled><EditIcon /></IconButton><IconButton onClick={() => handleRestaurantDelete(rest.id)} color="error"><DeleteIcon /></IconButton></TableCell></TableRow>))}</TableBody>
            </Table>
          </TableContainer>}
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Kullanıcılar</Typography>
          {loading ? <CircularProgress /> : <TableContainer>
            <Table><TableHead><TableRow><TableCell>İsim</TableCell><TableCell>Email</TableCell><TableCell>Rol</TableCell><TableCell>Atanmış Restoran</TableCell></TableRow></TableHead>
              <TableBody>{users.map((user) => (<TableRow key={user.uid}><TableCell>{user.name}</TableCell><TableCell>{user.email}</TableCell><TableCell sx={{ minWidth: 150 }}><FormControl size="small" fullWidth><Select value={user.role} onChange={(e) => handleRoleChange(user.uid, e.target.value)}><MenuItem value="standart">Standart</MenuItem><MenuItem value="işletmeci">İşletmeci</MenuItem><MenuItem value="garson">Garson</MenuItem><MenuItem value="admin">Admin</MenuItem></Select></FormControl></TableCell><TableCell sx={{ minWidth: 180 }}>{user.role === 'işletmeci' && (<FormControl size="small" fullWidth><InputLabel>Restoran Seç</InputLabel><Select value={user.restaurantId || ''} onChange={(e) => handleRestaurantAssignment(user.uid, e.target.value)}><MenuItem value=""><em>Hiçbiri</em></MenuItem>{restaurants.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}</Select></FormControl>)}</TableCell></TableRow>))}</TableBody>
            </Table>
          </TableContainer>}
        </Paper>
      )}
    </Container>
  );
};

export default Admin;
