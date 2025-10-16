import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, User } from '../contexts/AuthContext'; // Geliştirilmiş User tipini de alıyoruz

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[]; // Hangi rollerin erişebileceğini belirten opsiyonel bir dizi
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  // AuthContext hala kullanıcıyı yüklüyorsa, beklemekte fayda var.
  // Bu, sayfanın anlık olarak login'e yönlendirilmesini önler.
  if (loading) {
    return null; // Veya bir yükleniyor animasyonu gösterilebilir
  }

  // 1. Giriş yapmış bir kullanıcı var mı?
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. Belirli rollerin erişimine izin veriliyor mu ve kullanıcının rolü bu rollerden biri mi?
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role || '')) {
    // Kullanıcının rolü yetersizse, anasayfaya veya "Yetkisiz Erişim" sayfasına yönlendir
    return <Navigate to="/" replace />; 
  }

  // Tüm kontrollerden geçerse, istenen sayfayı göster
  return children;
};

export default ProtectedRoute;
