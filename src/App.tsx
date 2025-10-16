import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import BusinessOwner from "./pages/BusinessOwner"; // Yeni sayfayı import et
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// MUI
import { Container } from "@mui/material";

function App() {

  return (
    <>
      <Navbar />
      <Container component="main" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          {/* Herkese Açık Rotalar */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Sadece Giriş Yapmış Kullanıcıların Erişebileceği Rotalar */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
         
          {/* Sadece 'admin' Rolündeki Kullanıcıların Erişebileceği Rota */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
          
          {/* Sadece 'işletmeci' Rolündeki Kullanıcıların Erişebileceği Rota */}
          <Route path="/business" element={<ProtectedRoute allowedRoles={['işletmeci']}><BusinessOwner /></ProtectedRoute>} />

        </Routes>
      </Container>
    </>
  );
}

export default App;
