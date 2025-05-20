import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  // 사용자가 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
  if (!user) {
    // 현재 위치를 state로 전달하여 로그인 후 원래 가려던 페이지로 돌아감
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 인증된 사용자는 원래 가려던 페이지로 이동
  return <>{children}</>;
};

export default ProtectedRoute; 