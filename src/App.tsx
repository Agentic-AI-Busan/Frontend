import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import styled, { createGlobalStyle } from 'styled-components'
import LoginPage from './pages/LoginSingup/loginPage'
import SignupPage from './pages/LoginSingup/signupPage'
import MainPage from './pages/mainPage'
import SelectionPage from './pages/Selection/selectRestaurant'
import QuestionPage from './pages/Question/questionPage'
import MyPage from './pages/Mypage/profileCorrection'
import ScheduleMap from './pages/Schedule/scheduleMap'
import ScheduleEdit from './pages/Schedule/schduleEdit'
import ErrorPage from './pages/errorPage'
import JoinAgreePage from './pages/LoginSingup/joinAgreePage'
import JoinRegisterPage from './pages/LoginSingup/joinRegisterPage'
import LoadingPage from './pages/loadingPage'
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
    min-height: 100vh;
    height: ${props => props.$isMapPage ? '100vh' : 'auto'};
    overflow: ${props => props.$isMapPage ? 'hidden' : 'auto'};
`;

const MainContent = styled.main<ContainerProps>`
    flex: 1;
    // padding: 20px;
    overflow: ${props => props.$isMapPage ? 'hidden' : 'auto'};
`;

// 전역 스타일 정의
const GlobalStyle = createGlobalStyle<{ $isMapPage: boolean }>`
  html, body, #root {
    margin: 0;
    padding: 0;
    overflow: ${props => props.$isMapPage ? 'hidden' : 'auto'};
    height: ${props => props.$isMapPage ? '100%' : 'auto'};
  }
`;

function App() {
  // useLocation 훅을 사용하여 현재 경로 확인
  const location = useLocation();
  const isFullScreenPage = location.pathname === '/map' || location.pathname === '/editing';

  return (
    <>
      <GlobalStyle $isMapPage={isFullScreenPage} />
      <AppContainer $isMapPage={isFullScreenPage}>
        <Navbar />
        <MainContent $isMapPage={isFullScreenPage}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/selection" element={<SelectionPage />} />
            <Route path="/question" element={<QuestionPage />} />
            <Route path="/myPage" element={<MyPage />} />
            <Route path="/scheduleMap" element={<ScheduleMap />} />
            <Route path="/scheduleEdit" element={<ScheduleEdit />} />
            <Route path="/joinAgree" element={<JoinAgreePage />} />
            <Route path="/joinRegister" element={<JoinRegisterPage />} />
            <Route path="/loading" element={<LoadingPage />} />
            <Route path="/selectionAdd" element={<SelectionAdd />} />
            <Route path="/myGuide" element={<MyGuidePage />} />
            <Route path="/selectionDestination" element={<SelectionDestination />} />
            <Route path="/selectionRestaurant" element={<SelectionRestaurant />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/editing" element={<EditingPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </MainContent>
        {!isFullScreenPage && <Footer />}
      </AppContainer>
    </>
  )
}

export default App
