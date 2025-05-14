import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import styled, { createGlobalStyle } from 'styled-components'
import { useEffect, useState } from 'react'
import { getUserProfile } from './services/api'
import LoginPage from './pages/LoginSingup/loginPage'
import SignupPage from './pages/LoginSingup/signupPage'
import MainPage from './pages/mainPage'
import QuestionPage from './pages/Question/questionPage'
import MyPage from './pages/Mypage/profileCorrection'
import ErrorPage from './pages/errorPage'
import JoinAgreePage from './pages/LoginSingup/joinAgreePage'
import JoinRegisterPage from './pages/LoginSingup/joinRegisterPage'
import SelectionAdd from './pages/Selection/selectionAdd'
import MyGuidePage from './pages/Mypage/myGuidePage'
import SelectionDestination from './pages/Selection/selectDestination'
import SelectionRestaurant from './pages/Selection/selectRestaurant'
import MapPage from './pages/SchduleEditing/mapPage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import EditingPage from './pages/SchduleEditing/editingPage'

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

interface User {
    name: string;
    nickname: string;
    email: string;
    birthDay: string;
    gender: string;
    profileImage: string;
    phoneNumber: string;
}

const AppContent = () => {
  const location = useLocation();
  const isMainPage = location.pathname === '/';
  const isFullScreenPage = location.pathname === '/map' || location.pathname === '/editing';
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (location.pathname === '/login' || location.pathname === '/signup') {
        localStorage.clear();
        sessionStorage.clear();
        setUser(null);
        return;
      }

      const userData = await getUserProfile();
      if (userData) {
        setUser(userData.result);
      }
    };

    fetchUserProfile();
  }, [location.pathname]);

  return (
    <>
      <GlobalStyle $isMapPage={isFullScreenPage} />
      <AppContainer $isMapPage={isFullScreenPage}>
        <Navbar userName={user?.name} />
        <MainContent $isMapPage={isFullScreenPage}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/question" element={<QuestionPage />} />
            <Route path="/myPage" element={<MyPage />} />
            <Route path="/joinAgree" element={<JoinAgreePage />} />
            <Route path="/joinRegister" element={<JoinRegisterPage />} />
            <Route path="/selectionAdd" element={<SelectionAdd />} />
            <Route path="/myGuide" element={<MyGuidePage />} />
            <Route path="/selectionDestination" element={<SelectionDestination />} />
            <Route path="/selectionRestaurant" element={<SelectionRestaurant />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/editing" element={<EditingPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </MainContent>
        {isMainPage && <Footer />}
      </AppContainer>
    </>
  );
};

function App() {
  return <AppContent />;
}

export default App;
