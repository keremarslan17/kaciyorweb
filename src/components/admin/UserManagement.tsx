
import React, { useState, useEffect } from 'react';
import { db, functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';
import { collection, onSnapshot } from 'firebase/firestore';
import { Box, Typography, Alert, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';

// FIX: Define a type for the user data to resolve the property error
interface UserData {
    id: string;
    role: string;
    name: string;
    email: string;
}

const UserManagement: React.FC = () => {
    const [rows, setRows] = useState<GridRowsProp>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const validRoles = ['admin', 'businessOwner', 'waiter', 'customer'];

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'users'), (snap) => {
            const data = snap.docs
                // Cast the mapped data to the UserData type
                .map(d => ({ id: d.id, ...d.data() } as UserData))
                .filter(user => user.role && validRoles.includes(user.role));
            setRows(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const handleRoleChange = async (userId: string, newRole: string) => {
        setError(null);
        setSuccess(null);
        
        const originalRows = rows;
        setRows(prevRows => prevRows.map(row => row.id === userId ? { ...row, role: newRole } : row));

        try {
            const setUserRole = httpsCallable(functions, 'setUserRole');
            await setUserRole({ userId, newRole });
            setSuccess(`Kullanıcının rolü başarıyla güncellendi.`);
        } catch (err: any) {
            setRows(originalRows);
            setError(err.message || "Rol güncellenirken bir hata oluştu.");
        }
    };
    
    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Adı', width: 200 },
        { field: 'email', headerName: 'E-posta', flex: 1 },
        {
            field: 'role',
            headerName: 'Rol',
            width: 180,
            renderCell: (params) => (
                <Select
                    value={params.value}
                    onChange={(e: SelectChangeEvent<string>) => handleRoleChange(params.id as string, e.target.value)}
                    sx={{ width: '100%' }}
                    size="small"
                >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="businessOwner">İşletmeci</MenuItem>
                    <MenuItem value="waiter">Garson</MenuItem>
                    <MenuItem value="customer">Müşteri</MenuItem>
                </Select>
            ),
        },
    ];

    return (
        <Box>
             <Typography variant="h6" mb={2}>Tüm Kullanıcılar</Typography>
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid rows={rows} columns={columns} loading={loading} />
            </Box>
        </Box>
    );
};

export default UserManagement;
