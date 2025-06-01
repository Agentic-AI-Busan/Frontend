import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import NaverMap from '../../components/Map/NaverMap';
import TravelRouteSidebar from '../../components/Map/TravelRouteSidebar';
import null_place from '../../assets/images/null_place.png';
import { Place } from '../../components/Map/NaverMap';
import { getDayColor } from '../../components/Map/MapContent';
import { authenticatedFetch } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// 기존 Place 타입을 확장하여 주소 정보를 추가로 표시할 수 있는 필드 추가
interface PlaceWithAddress extends Place {
  addressInfo?: string; // 주소 정보를 저장할 추가 필드
}

// 로컬 스토리지에서 읽어올 데이터 타입 정의
interface LocalStoragePlace {
    id: number;
    name: string;
    memo: string;
    time?: string;
    location?: string;
    imageUrl?: string;
    coordinates?: { lat: number; lng: number };
    placeType?: string;
    originalPlaceId?: number;
}

interface SimplifiedDaySchedule {
    day: number; // editingPage의 DaySchedule.day 와 동일
    places: LocalStoragePlace[];
}

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

// 경로 정보 타입 정의
interface RouteInfo {
  distance: string;
  duration: string;
}

// 여행 루트 타입 정의
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
  summary?: {
    totalDistance?: string;
    totalTime?: string;
    startTime?: string;
    endTime?: string;
  };
}

// 두 지점 사이의 거리를 계산하는 하버사인 공식 구현 함수 (km 단위 반환)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // 킬로미터 단위
  return distance;
};

// 거리를 기반으로 예상 이동 시간을 계산하는 함수 (분 단위 반환)
const calculateDuration = (distanceKm: number): number => {
  // 평균 도시 차량 속도를 30km/h로 가정하여 시간 계산
  const averageSpeedKmPerHour = 30;
  const hours = distanceKm / averageSpeedKmPerHour;
  const minutes = hours * 60;
  return Math.round(minutes);
};

const MapPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // location.state에서 tripPlansId 가져오기
  const tripPlansId = location.state?.tripPlansId;
  console.log('[MapPage] 현재 사용 중인 tripPlansId:', tripPlansId);
  
  // 장소 데이터
  const [places, setPlaces] = useState<Place[]>([]);
  // 여행 루트 데이터
  const [travelRoutes, setTravelRoutes] = useState<TravelRoute[]>([]);
  
  // 현재 선택된 일차 상태
  const [activeDay, setActiveDay] = useState<number>(1);
  // 데이터 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // 에러 상태 추가
  const [error, setError] = useState<string | null>(null);
  
  // 사용자의 선호 시작/종료 시간 상태 추가
  const [preferredStartTime, setPreferredStartTime] = useState<string | undefined>(undefined);
  const [preferredEndTime, setPreferredEndTime] = useState<string | undefined>(undefined);
  
  // NaverMap의 focusPlace 함수를 저장할 ref
  const focusPlaceRef = useRef<((placeId: number) => void) | null>(null);

  // LocalStoragePlace[] 를 ScheduleItem[] 으로 변환하는 함수
  const convertLocalStoragePlacesToScheduleItems = (localStoragePlaces: LocalStoragePlace[]): ScheduleItem[] => {
      return localStoragePlaces.map((vp, index) => ({
          itemId: vp.id, 
          order: index + 1,
          placeType: vp.placeType || 'UNKNOWN', 
          placeId: vp.originalPlaceId || 0, 
          latitude: vp.coordinates?.lat || 0,
          longitude: vp.coordinates?.lng || 0,
          name: vp.name,
          imageUrl: vp.imageUrl || null_place,
          memo: vp.memo || '' 
      }));
  };

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
    
    // 모든 place 상세 정보 요청을 관리하는 프로미스 배열
    const detailPromises: Promise<void>[] = [];
    const newPlaces: PlaceWithAddress[] = [];
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
        // summary 기본값 설정 (장소가 없을 경우)
        routeDay.summary = {
            totalDistance: "0m",
            totalTime: "0분",
            startTime: "-",
            endTime: "-"
        };
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
        
        // 기본 Place 객체 생성 (API 호출 전 기본 정보)
        const newPlace: PlaceWithAddress = {
          id: item.itemId,
          name: item.name,
          lat: item.latitude,
          lng: item.longitude,
          description: item.memo || `${item.name}에 대한 설명입니다.`,
          imageUrl: item.imageUrl || null_place,
          operatingHours: '정보 로딩 중...', // 기본값, API 호출 후 업데이트됨
          addressInfo: '주소 로딩 중...', // 주소 정보를 별도 필드에 저장
          time: `${10 + itemIndex}:00`, // 간단한 시간 설정
          location: '주소 로딩 중...', // 기본값, API 호출 후 업데이트됨
          day: day.dayNumber
        };
        
        // 기본 RoutePlace 객체 생성
        const routePlace: RoutePlace = {
          id: item.itemId,
          title: item.name,
          time: `${10 + itemIndex}:00`,
          hours: '정보 로딩 중...',
          location: '주소 로딩 중...',
          imageUrl: item.imageUrl || null_place
        };
        
        // newPlaces 배열과 routeDay.places 배열에 추가
        newPlaces.push(newPlace);
        routeDay.places.push(routePlace);
        
        // 장소 유형에 따라 상세 정보 API 호출
        const placeIndex = newPlaces.length - 1; // 마지막 추가된 장소의 인덱스
        const routePlaceIndex = routeDay.places.length - 1; // 마지막 추가된 루트 장소의 인덱스
        
        // 상세 정보 API 호출 프로미스 생성
        const fetchDetailPromise = async () => {
          try {
            let apiUrl = '';
            
            // 장소 유형에 따라 API URL 결정
            if (item.placeType === 'ATTRACTION') {
              apiUrl = `/api/trip-plans/attractions/${item.placeId}`;
            } else if (item.placeType === 'RESTAURANT') {
              apiUrl = `/api/trip-plans/restaurants/${item.placeId}`;
            } else {
              console.warn(`알 수 없는 장소 유형: ${item.placeType}`, item);
              return; // 알 수 없는 유형이면 API 호출 안함
            }
            
            // API 호출
            const response = await authenticatedFetch(apiUrl);
            
            if (!response.ok) {
              throw new Error(`상세 정보 API 응답 오류: ${response.status}`);
            }
            
            const detailData = await response.json();
            console.log(`${item.name} 상세 정보:`, detailData);
            
            // API 응답 구조 확인
            if (!detailData.isSuccess || !detailData.result) {
              throw new Error('상세 정보 API 응답 구조가 올바르지 않습니다.');
            }
            
            const detail = detailData.result;
            
            // 상세 정보로 장소 객체 업데이트
            if (item.placeType === 'ATTRACTION') {
              // 관광지 상세 정보 업데이트
              newPlaces[placeIndex].operatingHours = detail.operatingHours || '정보 없음';
              newPlaces[placeIndex].location = detail.address || '주소 정보 없음';
              // 주소 정보를 별도 필드에 저장 (정보창 표시용)
              newPlaces[placeIndex].addressInfo = detail.address || '주소 정보 없음';
              routeDay.places[routePlaceIndex].hours = detail.operatingHours || '정보 없음';
              routeDay.places[routePlaceIndex].location = detail.address || '주소 정보 없음';
            } else if (item.placeType === 'RESTAURANT') {
              // 음식점 상세 정보 업데이트
              newPlaces[placeIndex].operatingHours = detail.operatingHours || '정보 없음';
              newPlaces[placeIndex].location = detail.address || '주소 정보 없음';
              // 주소 정보를 별도 필드에 저장 (정보창 표시용)
              newPlaces[placeIndex].addressInfo = detail.address || '주소 정보 없음';
              routeDay.places[routePlaceIndex].hours = detail.operatingHours || '정보 없음';
              routeDay.places[routePlaceIndex].location = detail.address || '주소 정보 없음';
            }
          } catch (error) {
            console.error(`${item.name} 상세 정보 가져오기 실패:`, error);
            // 오류 발생 시 기본값 설정
            newPlaces[placeIndex].operatingHours = '정보를 가져올 수 없음';
            newPlaces[placeIndex].location = '주소 정보를 가져올 수 없음';
            // 주소 정보를 별도 필드에 저장 (정보창 표시용)
            newPlaces[placeIndex].addressInfo = '주소 정보를 가져올 수 없음';
            routeDay.places[routePlaceIndex].hours = '정보를 가져올 수 없음';
            routeDay.places[routePlaceIndex].location = '주소 정보를 가져올 수 없음';
          }
        };
        
        // 프로미스 배열에 추가
        detailPromises.push(fetchDetailPromise());
        
        // 경로 정보 추가 (장소 간 거리 계산)
        if (itemIndex < sortedItems.length - 1) {
          // 현재 장소와 다음 장소의 위도/경도 가져오기
          const currentLat = item.latitude;
          const currentLng = item.longitude;
          const nextLat = sortedItems[itemIndex + 1].latitude;
          const nextLng = sortedItems[itemIndex + 1].longitude;
          
          // 두 지점 간 거리 계산 (km)
          const distanceKm = calculateDistance(currentLat, currentLng, nextLat, nextLng);
          
          // 거리에 따른 예상 소요 시간 계산 (분)
          const durationMinutes = calculateDuration(distanceKm);
          
          // 거리와 시간을 사용자 친화적인 형태로 변환
          const formattedDistance = distanceKm < 1 
            ? `${Math.round(distanceKm * 1000)}m` 
            : `${distanceKm.toFixed(1)}km`;
          
          const formattedDuration = durationMinutes < 60 
            ? `${durationMinutes}분` 
            : `${Math.floor(durationMinutes / 60)}시간 ${durationMinutes % 60}분`;
          
          routeDay.routes.push({
            distance: formattedDistance,
            duration: formattedDuration
          });
        }
      });
      
      // 총 이동 거리 및 시간 계산
      let totalDistanceMeters = 0;
      let totalDurationMinutes = 0;

      routeDay.routes.forEach(route => {
        // 거리 파싱 (예: "1.2km" -> 1200, "500m" -> 500)
        if (route.distance.endsWith('km')) {
          totalDistanceMeters += parseFloat(route.distance.replace('km', '')) * 1000;
        } else if (route.distance.endsWith('m')) {
          totalDistanceMeters += parseFloat(route.distance.replace('m', ''));
        }

        // 시간 파싱 (예: "1시간 30분" -> 90, "45분" -> 45)
        let currentDurationMinutes = 0;
        const durationStr = route.duration || ""; // null 또는 undefined 방지

        const hourMatch = durationStr.match(/(\d+)\s*시간/);
        if (hourMatch && hourMatch[1]) {
            currentDurationMinutes += parseInt(hourMatch[1], 10) * 60;
        }

        const minuteMatch = durationStr.match(/(\d+)\s*분/);
        if (minuteMatch && minuteMatch[1]) {
            currentDurationMinutes += parseInt(minuteMatch[1], 10);
        }
        
        // currentDurationMinutes가 유효한 숫자인 경우에만 더함
        if (!isNaN(currentDurationMinutes)) {
            totalDurationMinutes += currentDurationMinutes;
        } else {
            console.warn(`[MapPage] 시간 파싱 중 NaN 발생: route.duration = "${route.duration}", 파싱된 분 = ${currentDurationMinutes}`);
        }
      });

      // 총 거리 포맷팅
      const formattedTotalDistance = totalDistanceMeters < 1000
        ? `${Math.round(totalDistanceMeters)}m`
        : `${(totalDistanceMeters / 1000).toFixed(1)}km`;

      // 총 시간 포맷팅
      const formattedTotalDuration = totalDurationMinutes < 60
        ? `${totalDurationMinutes}분`
        : `${Math.floor(totalDurationMinutes / 60)}시간 ${totalDurationMinutes % 60}분`;
        
      // 시작 및 종료 시간 설정 (기존 로직 활용 또는 API 데이터 기반)
      const firstPlaceTime = routeDay.places[0]?.time || "-";
      const lastPlaceTime = routeDay.places[routeDay.places.length - 1]?.time || "-";

      routeDay.summary = {
        totalDistance: formattedTotalDistance,
        totalTime: formattedTotalDuration,
        startTime: firstPlaceTime,
        endTime: lastPlaceTime,
      };
      
      newTravelRoutes.push(routeDay);
    });
    
    // 모든 상세 정보 요청이 완료되면 상태 업데이트
    Promise.all(detailPromises)
      .then(() => {
        console.log('모든 장소 상세 정보 로딩 완료');
      })
      .catch(error => {
        console.error('일부 장소 상세 정보 로딩 실패:', error);
      })
      .finally(() => {
        // 데이터가 있는지 최종 확인
        if (newPlaces.length === 0 || newTravelRoutes.length === 0) {
          console.warn('변환된 장소 또는 여행 루트 데이터가 비어 있습니다.');
        }
        
        // 상태 업데이트
        setPlaces(newPlaces as Place[]);
        setTravelRoutes(newTravelRoutes);
        
        // 첫 번째 일차를 활성화
        if (newTravelRoutes.length > 0) {
          setActiveDay(newTravelRoutes[0].day);
        }
        
        setIsLoading(false);
      });
  };

  // 컴포넌트 마운트 시 API 호출 및 localStorage에서 선호 시간 로드
  useEffect(() => {
    // localStorage에서 선호 시작/종료 시간 불러오기
    const storedStartTime = localStorage.getItem('preferredStartTime');
    const storedEndTime = localStorage.getItem('preferredEndTime');

    if (storedStartTime) {
      setPreferredStartTime(storedStartTime);
    }
    if (storedEndTime) {
      setPreferredEndTime(storedEndTime);
    }

    // tripPlansId 유효성 확인
    if (!tripPlansId) {
      setError('여행 계획 ID가 없습니다. 이전 페이지로 돌아가 다시 시작해주세요.');
      setIsLoading(false);
      return;
    }
    
    // API 호출 - authenticatedFetch 사용
    authenticatedFetch(`/api/trip-plans/${tripPlansId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API 응답이 올바르지 않습니다: ${response.status}`);
            }
            return response.json();
        })
        .then(apiData => {
            console.log('[MapPage] API 응답 데이터:', apiData);
            let dataToProcess = apiData; // 최종적으로 processApiResult에 전달될 데이터

            const storedScheduleData = localStorage.getItem(`scheduleOrder_${tripPlansId}`);
            if (storedScheduleData) {
                try {
                    const localSchedules: SimplifiedDaySchedule[] = JSON.parse(storedScheduleData);
                    console.log('[MapPage] 로컬 스토리지 데이터 발견:', localSchedules);

                    if (dataToProcess && dataToProcess.result && Array.isArray(dataToProcess.result.days)) {
                        const originalApiDays: DaySchedule[] = dataToProcess.result.days;

                        const updatedApiDays = originalApiDays.map(apiDay => {
                            const localDayData = localSchedules.find(ld => ld.day === apiDay.dayNumber);
                            if (localDayData && localDayData.places) {
                                return {
                                    ...apiDay, 
                                    scheduleItems: convertLocalStoragePlacesToScheduleItems(localDayData.places)
                                };
                            }
                            return apiDay;
                        });

                        dataToProcess = {
                            ...dataToProcess,
                            result: {
                                ...dataToProcess.result,
                                days: updatedApiDays
                            }
                        };
                        console.log('[MapPage] 로컬 스토리지 데이터로 병합된 데이터:', JSON.stringify(dataToProcess, null, 2));
                    }
                } catch (e) {
                    console.error('[MapPage] 로컬 스토리지 데이터 처리 중 오류:', e);
                }
            } else {
                console.log('[MapPage] 로컬 스토리지 데이터 없음. API 데이터 사용.');
            }
            
            processApiResult(dataToProcess);
        })
        .catch(error => {
            console.error('[MapPage] API 호출 중 오류가 발생했습니다:', error);
            setIsLoading(false);
            setError(`데이터 로딩 중 오류: ${error.message}`);
            setPlaces([]);
            setTravelRoutes([]);
        });
  }, [tripPlansId]);

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
    navigate('/editing', { state: { tripPlansId: tripPlansId } });
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
    return <LoadingSpinner message="여행 일정을 불러오는 중..." />;
  }

  // 에러 발생 시 표시할 에러 화면
  if (error) {
    return (
      <div style={{ padding: '20px', margin: '20px auto', maxWidth: '600px', textAlign: 'center', color: 'red' }}>
        <h3>오류 발생</h3>
        <p>{error}</p>
        <button 
          onClick={() => navigate(-1)}
          style={{ padding: '10px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}
        >
          이전 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <PageContainer>
      <TravelRouteSidebar 
        routes={travelRoutes} 
        activeDay={activeDay} 
        onPlaceHover={handleFocusPlace}
        preferredStartTime={preferredStartTime}
        preferredEndTime={preferredEndTime}
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