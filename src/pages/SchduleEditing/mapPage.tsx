import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import NaverMap from '../../components/Map/NaverMap';
import TravelRouteSidebar from '../../components/Map/TravelRouteSidebar';
import travel_img1 from '../../assets/images/travel_img1.jpg';
import { Place } from '../../components/Map/NaverMap';
import { getDayColor } from '../../components/Map/MapContent';

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

const MapPage = () => {
  const navigate = useNavigate();
  // 장소 데이터
  const [places] = useState<Place[]>([
    { 
      id: 1,
      name: '부산역', 
      lat: 35.1152, 
      lng: 129.04211, 
      description: '부산의 관문, KTX와 도시철도가 연결되는 교통 중심지입니다.',
      imageUrl: travel_img1,
      operatingHours: '24시간',
      visitors: 150000,
      time: '09:00',
      location: '부산광역시 동구 중앙대로 206',
      day: 1 // 1일차
    },
    { 
      id: 2,
      name: '해운대해수욕장', 
      lat: 35.1588, 
      lng: 129.1603, 
      description: '부산 대표 해수욕장으로 아름다운 해변과 다양한 축제가 열립니다.',
      imageUrl: travel_img1,
      operatingHours: '24시간',
      visitors: 250000,
      time: '11:00',
      location: '부산광역시 해운대구 해운대해변로 264',
      day: 1 // 1일차
    },
    { 
      id: 3,
      name: '광안대교', 
      lat: 35.1478, 
      lng: 129.1331, 
      description: '밤에 아름다운 조명이 켜지는 부산의 랜드마크 다리입니다.',
      imageUrl: travel_img1,
      operatingHours: '24시간',
      visitors: 180000,
      time: '13:00',
      location: '부산광역시 수영구 광안해변로 219',
      day: 1 // 1일차
    },
    { 
      id: 4,
      name: '감천문화마을', 
      lat: 35.0979, 
      lng: 129.0112, 
      description: '알록달록한 계단식 마을로 예술과 문화가 공존하는 곳입니다.',
      imageUrl: travel_img1,
      operatingHours: '09:00 - 18:00',
      visitors: 120000,
      time: '15:00',
      location: '부산광역시 사하구 감천2길 203',
      day: 2 // 2일차
    },
    { 
      id: 5,
      name: '자갈치시장', 
      lat: 35.0968, 
      lng: 129.0307, 
      description: '부산 최대의 수산시장으로 신선한 해산물을 맛볼 수 있습니다.',
      imageUrl: travel_img1,
      operatingHours: '02:00 - 22:00',
      visitors: 200000,
      time: '17:00',
      location: '부산광역시 중구 자갈치로 52',
      day: 2 // 2일차
    },
    {
      id: 6,
      name: '부산타워',
      lat: 35.0977,
      lng: 129.0364,
      description: '부산의 상징적인 타워로 야간 조명이 아름다운 관광지입니다.',
      imageUrl: travel_img1,
      operatingHours: '09:00 - 22:00',
      visitors: 180000,
      time: '10:00',
      location: '부산광역시 중구 용두산길 37-55',
      day: 2 // 2일차
    },
    {
      id: 7,
      name: '용두산공원',
      lat: 35.0987,
      lng: 129.0367,
      description: '부산 시내를 한눈에 볼 수 있는 전망대가 있는 공원입니다.',
      imageUrl: travel_img1,
      operatingHours: '24시간',
      visitors: 150000,
      time: '11:30',
      location: '부산광역시 중구 용두산길 37-55',
      day: 3 // 3일차
    },
    {
      id: 8,
      name: '국제시장',
      lat: 35.1027,
      lng: 129.0557,
      description: '부산의 대표적인 전통시장으로 다양한 상품을 구매할 수 있습니다.',
      imageUrl: travel_img1,
      operatingHours: '08:00 - 20:00',
      visitors: 220000,
      time: '13:30',
      location: '부산광역시 중구 신창동4가 37-1',
      day: 3 // 3일차
    },
    {
      id: 9,
      name: '부산아쿠아리움',
      lat: 35.1587,
      lng: 129.1607,
      description: '해운대에 위치한 대형 수족관으로 다양한 해양생물을 볼 수 있습니다.',
      imageUrl: travel_img1,
      operatingHours: '10:00 - 19:00',
      visitors: 190000,
      time: '10:00',
      location: '부산광역시 해운대구 해운대해변로 266',
      day: 3 // 3일차
    },
    {
      id: 10,
      name: '해운대 블루라인파크',
      lat: 35.1589,
      lng: 129.1612,
      description: '해운대 해변을 따라 달리는 스카이캡슐이 있는 관광지입니다.',
      imageUrl: travel_img1,
      operatingHours: '09:00 - 22:00',
      visitors: 160000,
      time: '12:00',
      location: '부산광역시 해운대구 달맞이길 62번길 47',
      day: 4 // 4일차
    },
    {
      id: 11,
      name: '기장군 장안사',
      lat: 35.1234,
      lng: 129.2589,
      description: '부산 기장군에 위치한 천년고찰로 아름다운 자연과 함께 있습니다.',
      imageUrl: travel_img1,
      operatingHours: '08:00 - 18:00',
      visitors: 90000,
      time: '14:00',
      location: '부산광역시 기장군 장안읍 장안리 583',
      day: 4 // 4일차
    },
    {
      id: 12,
      name: '기장군 해변열차',
      lat: 35.3234,
      lng: 129.2589,
      description: '기장군 해변을 따라 달리는 관광열차입니다.',
      imageUrl: travel_img1,
      operatingHours: '09:00 - 18:00',
      visitors: 80000,
      time: '15:30',
      location: '부산광역시 기장군 기장읍 기장해안로 205',
      day: 4 // 4일차
    }
  ]);

  // 임시 여행 루트 데이터
  const [travelRoutes] = useState([
    {
      day: 1,
      date: '2024년 3월 15일 (금)',
      weather: {
        condition: '맑음',
        icon: '☀️',
        temperature: '18°C'
      },
      places: [
        { 
          id: 1, 
          title: '부산역', 
          time: '09:00',
          hours: '24시간',
          location: '부산광역시 동구 중앙대로 206',
          imageUrl: travel_img1
        },
        { 
          id: 2, 
          title: '해운대해수욕장', 
          time: '11:00',
          hours: '24시간',
          location: '부산광역시 해운대구 해운대해변로 264',
          imageUrl: travel_img1
        },
        { 
          id: 3, 
          title: '광안대교', 
          time: '13:00',
          hours: '24시간',
          location: '부산광역시 수영구 광안해변로 219',
          imageUrl: travel_img1
        }
      ],
      routes: [
        {
          distance: '15.3km',
          duration: '35분'
        },
        {
          distance: '7.2km',
          duration: '20분'
        }
      ]
    },
    {
      day: 2,
      date: '2024년 3월 16일 (토)',
      weather: {
        condition: '구름조금',
        icon: '⛅',
        temperature: '17°C'
      },
      places: [
        { 
          id: 4, 
          title: '감천문화마을', 
          time: '10:00',
          hours: '09:00 - 18:00',
          location: '부산광역시 사하구 감천2길 203',
          imageUrl: travel_img1
        },
        { 
          id: 5, 
          title: '자갈치시장', 
          time: '13:00',
          hours: '02:00 - 22:00',
          location: '부산광역시 중구 자갈치로 52',
          imageUrl: travel_img1
        },
        { 
          id: 6, 
          title: '부산타워', 
          time: '15:00',
          hours: '09:00 - 22:00',
          location: '부산광역시 중구 용두산길 37-55',
          imageUrl: travel_img1
        }
      ],
      routes: [
        {
          distance: '8.5km',
          duration: '25분'
        },
        {
          distance: '1.2km',
          duration: '5분'
        }
      ]
    },
    {
      day: 3,
      date: '2024년 3월 17일 (일)',
      weather: {
        condition: '맑음',
        icon: '☀️',
        temperature: '19°C'
      },
      places: [
        { 
          id: 7, 
          title: '용두산공원', 
          time: '09:30',
          hours: '24시간',
          location: '부산광역시 중구 용두산길 37-55',
          imageUrl: travel_img1
        },
        { 
          id: 8, 
          title: '국제시장', 
          time: '11:30',
          hours: '08:00 - 20:00',
          location: '부산광역시 중구 신창동4가 37-1',
          imageUrl: travel_img1
        },
        { 
          id: 9, 
          title: '부산아쿠아리움', 
          time: '14:00',
          hours: '10:00 - 19:00',
          location: '부산광역시 해운대구 해운대해변로 266',
          imageUrl: travel_img1
        }
      ],
      routes: [
        {
          distance: '1.3km',
          duration: '8분'
        },
        {
          distance: '12.7km',
          duration: '30분'
        }
      ]
    },
    {
      day: 4,
      date: '2024년 3월 18일 (월)',
      weather: {
        condition: '맑음',
        icon: '☀️',
        temperature: '20°C'
      },
      places: [
        { 
          id: 10, 
          title: '해운대 블루라인파크', 
          time: '10:00',
          hours: '09:00 - 22:00',
          location: '부산광역시 해운대구 달맞이길 62번길 47',
          imageUrl: travel_img1
        },
        { 
          id: 11, 
          title: '기장군 장안사', 
          time: '13:00',
          hours: '08:00 - 18:00',
          location: '부산광역시 기장군 장안읍 장안리 583',
          imageUrl: travel_img1
        },
        { 
          id: 12, 
          title: '기장군 해변열차', 
          time: '15:30',
          hours: '09:00 - 18:00',
          location: '부산광역시 기장군 기장읍 기장해안로 205',
          imageUrl: travel_img1
        }
      ],
      routes: [
        {
          distance: '18.2km',
          duration: '40분'
        },
        {
          distance: '10.5km',
          duration: '22분'
        }
      ]
    }
  ]);
  
  // 현재 선택된 일차 상태
  const [activeDay, setActiveDay] = useState<number>(1);
  
  // NaverMap의 focusPlace 함수를 저장할 ref
  const focusPlaceRef = useRef<((placeId: number) => void) | null>(null);

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
    // placeId가 0이면 호버가 끝난 것이므로 무시
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