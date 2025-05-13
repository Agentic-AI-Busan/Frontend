import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import NaverMap from '../../components/Map/NaverMap';
import TravelRouteSidebar from '../../components/Map/TravelRouteSidebar';
import travel_img1 from '../../assets/images/travel_img1.jpg';
import { Place } from '../../components/Map/NaverMap';
import { getDayColor } from '../../components/Map/MapContent';
import { authenticatedFetch } from '../../services/api';

// 페이지 전체 컨테이너
const PageContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  overflow: hidden;
`;

// 지도 컨테이너 스타일
const MapContainer = styled.div`
  flex: 1;
  height: calc(100vh - 60px);
  margin: 0;
  position: absolute;
  top: 60px; // Navbar 높이만큼 아래로 이동
  left: 350px; // 왼쪽 사이드바 너비와 정확히 일치
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 5;
`;

// 일차 선택 버튼 컨테이너 스타일
const DayButtonsContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;
`;

// 일차 선택 버튼 스타일
const DayButton = styled.button<{ isActive: boolean; day: number }>`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: ${props => {
    if (props.isActive) {
      return getDayColor(props.day);
    } else {
      return 'rgba(255, 255, 255, 0.9)';
    }
  }};
  color: ${({ isActive, day }) => (isActive ? '#ffffff' : getDayColor(day))};
  border: 1px solid ${({ isActive, day }) => (isActive ? '#ffffff' : getDayColor(day))};
  font-size: 16px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${({ isActive }) => 
    isActive 
      ? '0 8px 20px rgba(0, 0, 0, 0.15)' 
      : '0 6px 15px rgba(0, 0, 0, 0.08)'
  };
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  
  &::before {
    content: "DAY";
    display: block;
    font-size: 10px;
    font-weight: 500;
    margin-bottom: 2px;
    opacity: 0.8;
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  }
`;

// 일정 편집 버튼 스타일
const EditScheduleButton = styled.button`
  position: absolute;
  bottom: 30px;
  right: 30px;
  padding: 10px 18px;
  background-color: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  z-index: 100;
  
  &:hover {
    background-color: #f1f5f9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    color: #1e40af;
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.05);
  }
  
  &::before {
    content: "✏️";
    margin-right: 8px;
    font-size: 18px;
  }
`;

// API 응답 관련 타입 정의
interface ScheduleItem {
  itemId: number;
  order: number;
  placeType: string;
  placeId: number;
  latitude: number;
  longitude: number;
  name: string;
  imageUrl: string;
  memo: string | null;
}

interface DaySchedule {
  dayNumber: number;
  date: string;
  scheduleItems: ScheduleItem[];
}

interface ApiResult {
  title: string;
  description: string | null;
  profileImage: string;
  startDate: string;
  endDate: string;
  days: DaySchedule[];
}

// 여행 루트 관련 타입 정의
interface RoutePlace {
  id: number;
  title: string;
  time: string;
  hours: string;
  location: string;
  imageUrl: string;
}

interface RouteInfo {
  distance: string;
  duration: string;
}

interface TravelRoute {
  day: number;
  date: string;
  weather: {
    condition: string;
    icon: string;
    temperature: string;
  };
  places: RoutePlace[];
  routes: RouteInfo[];
}

const MapPage = () => {
  const navigate = useNavigate();
  // 장소 데이터
  const [places, setPlaces] = useState<Place[]>([]);
  // 여행 루트 데이터
  const [travelRoutes, setTravelRoutes] = useState<TravelRoute[]>([]);
  
  // 현재 선택된 일차 상태
  const [activeDay, setActiveDay] = useState<number>(1);
  // 데이터 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // NaverMap의 focusPlace 함수를 저장할 ref
  const focusPlaceRef = useRef<((placeId: number) => void) | null>(null);

  // API 결과를 받아와서 places와 travelRoutes 상태를 설정하는 함수
  const processApiResult = (apiResult: unknown) => {
    console.log('처리할 API 데이터 구조:', JSON.stringify(apiResult, null, 2));
    
    // API 응답 구조 확인 및 데이터 추출
    let tripData: ApiResult;
    
    // API 응답이 { result: { ... } } 형태인지 확인
    if (apiResult && typeof apiResult === 'object' && 'result' in apiResult && apiResult.result) {
      tripData = apiResult.result as ApiResult;
    } else {
      // 바로 데이터가 있는 경우
      tripData = apiResult as ApiResult;
    }
    
    // days 배열이 존재하는지 확인
    if (!tripData || !tripData.days || !Array.isArray(tripData.days)) {
      console.error('API 응답에 days 배열이 없습니다:', tripData);
      setIsLoading(false);
      return; // 데이터가 없으면 함수 종료
    }
    
    const newPlaces: Place[] = [];
    const newTravelRoutes: TravelRoute[] = [];
    
    // API 응답의 days 배열을 순회
    tripData.days.forEach((day) => {
      const routeDay: TravelRoute = {
        day: day.dayNumber,
        date: new Date(day.date).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short'
        }),
        weather: {
          condition: '맑음', // 날씨 정보는 API에 없으므로 기본값 설정
          icon: '☀️',
          temperature: '20°C'
        },
        places: [],
        routes: []
      };
      
      // scheduleItems가 있는지 확인
      if (!day.scheduleItems || !Array.isArray(day.scheduleItems) || day.scheduleItems.length === 0) {
        console.warn(`${day.dayNumber}일차에 일정 항목이 없습니다.`);
        newTravelRoutes.push(routeDay); // 빈 일정으로 추가
        return; // 다음 일차로 이동
      }
      
      // 해당 일차의 일정 항목들을 순회하며 places와 routeDay.places 채우기
      const sortedItems = [...day.scheduleItems].sort((a, b) => a.order - b.order);
      
      sortedItems.forEach((item, itemIndex) => {
        // 필수 필드가 없는 경우 건너뛰기
        if (!item.itemId || !item.name || !item.latitude || !item.longitude) {
          console.warn('필수 필드가 없는 일정 항목을 건너뜁니다:', item);
          return;
        }
        
        // 새로운 Place 객체 생성
        const newPlace: Place = {
          id: item.itemId,
          name: item.name,
          lat: item.latitude,
          lng: item.longitude,
          description: item.memo || `${item.name}에 대한 설명입니다.`,
          imageUrl: item.imageUrl || travel_img1, // 이미지 URL이 없으면 기본 이미지 사용
          operatingHours: '09:00 - 18:00', // API에 없는 정보는 기본값 설정
          visitors: 100000, // 기본값
          time: `${10 + itemIndex}:00`, // 간단한 시간 설정 (더 나은 로직으로 대체 가능)
          location: `부산광역시 ${item.name} 주변`, // 위치 정보가 없으면 기본값 설정
          day: day.dayNumber // 일차 정보 설정
        };
        
        newPlaces.push(newPlace);
        
        // routeDay.places에 추가
        routeDay.places.push({
          id: item.itemId,
          title: item.name,
          time: `${10 + itemIndex}:00`,
          hours: '09:00 - 18:00',
          location: `부산광역시 ${item.name} 주변`,
          imageUrl: item.imageUrl || travel_img1
        });
        
        // 경로 정보 추가 (장소 간 거리 계산 필요)
        if (itemIndex < sortedItems.length - 1) {
          routeDay.routes.push({
            distance: '10km', // 기본값 (실제로는 두 지점 간 거리 계산 필요)
            duration: '20분' // 기본값
          });
        }
      });
      
      newTravelRoutes.push(routeDay);
    });
    
    // 데이터가 있는지 최종 확인
    if (newPlaces.length === 0 || newTravelRoutes.length === 0) {
      console.warn('변환된 장소 또는 여행 루트 데이터가 비어 있습니다.');
    }
    
    // 상태 업데이트
    setPlaces(newPlaces);
    setTravelRoutes(newTravelRoutes);
    
    // 첫 번째 일차를 활성화
    if (newTravelRoutes.length > 0) {
      setActiveDay(newTravelRoutes[0].day);
    }
    
    setIsLoading(false);
  };

  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    // 여행 계획 ID 하드코딩
    const tripPlanId = 31;
    
    // API 호출 - authenticatedFetch 사용
    authenticatedFetch(`/api/trip-plans/${tripPlanId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API 응답이 올바르지 않습니다: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('API 응답 데이터:', data);
        processApiResult(data);
      })
      .catch(error => {
        console.error('API 호출 중 오류가 발생했습니다:', error);
        // 로딩 상태 종료
        setIsLoading(false);
        // 빈 데이터 설정 - 화면에 아무것도 표시하지 않음
        setPlaces([]);
        setTravelRoutes([]);
      });
  }, []);

  // 전체 루트 보기 함수 - 특수 값(-1)을 전달하여 NaverMap에서 전체 일정 경계 맞추기
  const showFullRoute = () => {
    if (focusPlaceRef.current) {
      focusPlaceRef.current(-1); // 특수 값 -1은 경계 맞추기를 의미
    }
  };

  // 일차 선택 핸들러
  const handleDaySelect = (day: number) => {
    setActiveDay(day);
    
    // 일차 변경 후 약간의 지연을 두고 전체 루트 보기 호출
    setTimeout(showFullRoute, 300);
  };

  // 일정 편집 핸들러
  const handleEditSchedule = () => {
    navigate('/editing');
  };

  // 장소 포커스 핸들러
  const handleFocusPlace = (placeId: number) => {
    // placeId가 0이면, 호버가 끝난 것이므로 무시
    if (placeId === 0) return;

    // 선택한 장소 찾기
    const place = places.find(p => p.id === placeId);
    if (!place) return;

    // 장소의 일차가 현재 일차와 다르면, 해당 일차로 전환
    if (place.day && place.day !== activeDay) {
      setActiveDay(place.day);
    }

    // 지도 포커스 함수가 있으면 호출
    if (focusPlaceRef.current) {
      focusPlaceRef.current(placeId);
    }
  };

  // 데이터 로딩 중일 때 표시할 로딩 화면
  if (isLoading) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <h2>여행 일정을 불러오는 중...</h2>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <TravelRouteSidebar 
        routes={travelRoutes} 
        activeDay={activeDay} 
        onPlaceHover={handleFocusPlace}
      />
      <MapContainer>
        <NaverMap 
          places={places} 
          activeDay={activeDay}
          onFocusPlace={(focusFn) => {
            focusPlaceRef.current = focusFn;
          }}
        />
        
        {/* 일차 선택 버튼 */}
        <DayButtonsContainer>
          {travelRoutes.map(route => (
            <DayButton 
              key={route.day}
              day={route.day}
              isActive={activeDay === route.day}
              onClick={() => handleDaySelect(route.day)}
            >
              {route.day}
            </DayButton>
          ))}
        </DayButtonsContainer>
        
        {/* 일정 편집 버튼 */}
        <EditScheduleButton onClick={handleEditSchedule}>
          일정 편집하기
        </EditScheduleButton>
      </MapContainer>
    </PageContainer>
  );
};

export default MapPage;