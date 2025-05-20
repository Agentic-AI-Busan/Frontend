import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import styled, { createGlobalStyle } from 'styled-components'
import AuthPage from './pages/LoginSingup/authPage'
import MainPage from './pages/mainPage'
import QuestionPage from './pages/Question/questionPage'
import MyPage from './pages/Mypage/profileCorrection'
import ErrorPage from './pages/errorPage'
import SelectionAdd from './pages/Selection/selectionAdd'
import MyGuidePage from './pages/Mypage/myGuidePage'
import SelectionDestination from './pages/Selection/selectDestination'
import SelectionRestaurant from './pages/Selection/selectRestaurant'
import MapPage from './pages/SchduleEditing/mapPage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import EditingPage from './pages/SchduleEditing/editingPage'
import { UserProvider } from './contexts/UserContext'
import ProtectedRoute from './components/ProtectedRoute'

// styled-components를 위한 타입 정의
interface ContainerProps {
  $isMapPage: boolean;
}

const AppContainer = styled.div<ContainerProps>`
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
`;

const MainContent = styled.main<ContainerProps>`
    flex: 1;
    overflow: ${props => props.$isMapPage ? 'hidden' : 'auto'};
    position: relative;
    height: calc(100vh - 60px); // 네비게이션 바 높이(60px)를 제외한 높이
`;

// 전역 스타일 정의
const GlobalStyle = createGlobalStyle<{ $isMapPage: boolean }>`
  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100vh;
    overflow: hidden;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

const AppContent = () => {
  const location = useLocation();
  const isMainPage = location.pathname === '/';
  const isFullScreenPage = location.pathname === '/map' || location.pathname === '/editing';
  const isAuthPage = location.pathname === '/auth';

  return (
    <>
      <GlobalStyle $isMapPage={isFullScreenPage} />
      <AppContainer $isMapPage={isFullScreenPage}>
        <Navbar/>
        <MainContent $isMapPage={isFullScreenPage}>
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* 보호된 라우트 */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            } />
            <Route path="/question" element={
              <ProtectedRoute>
                <QuestionPage />
              </ProtectedRoute>
            } />
            <Route path="/myPage" element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            } />
            <Route path="/selectionAdd" element={
              <ProtectedRoute>
                <SelectionAdd />
              </ProtectedRoute>
            } />
            <Route path="/myGuide" element={
              <ProtectedRoute>
                <MyGuidePage />
              </ProtectedRoute>
            } />
            <Route path="/selectionDestination" element={
              <ProtectedRoute>
                <SelectionDestination />
              </ProtectedRoute>
            } />
            <Route path="/selectionRestaurant" element={
              <ProtectedRoute>
                <SelectionRestaurant />
              </ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            } />
            <Route path="/editing" element={
              <ProtectedRoute>
                <EditingPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </MainContent>
        {isMainPage && !isAuthPage && <Footer />}
      </AppContainer>
    </>
  );
};

const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
