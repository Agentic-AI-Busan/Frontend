import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SelectMain from './selectMain';
import { authenticatedFetch } from '../../services/api'; // authenticatedFetch 임포트
import LoadingSpinner from '../../components/LoadingSpinner';
import { useUser } from '../../contexts/UserContext';

interface ApiAttraction {
  attractionId: number;
  name: string;
  imageUrl: string;
  address: string;
  operatingHours: string;
  title: string;
  latitude: number;
  longitude: number;
}

interface TravelItem {
  attractionId: number;
  name: string;
  imageUrl: string;
  address?: string;
  operatingHours?: string;
  title: string;
  latitude?: number;
  longitude?: number;
}

interface SelectedItem {
  id: number;
  title: string;
}

const STORAGE_KEY_DESTINATIONS_PREFIX = 'selectedDestinations_';

const SelectDestination: React.FC = () => {
  const { user } = useUser();
  const userName = user?.name || "Undefined";
  const navigate = useNavigate();
  const location = useLocation();

  const passedTripPlansId = location.state?.tripPlansId || '14'; 
  const tripPlansId = passedTripPlansId;

  const [travelItems, setTravelItems] = useState<TravelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getStorageKey = () => `${STORAGE_KEY_DESTINATIONS_PREFIX}${tripPlansId}`;

  // localStorage에서 초기 데이터 로드
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(() => {
    if (!tripPlansId) return [];
    const savedItems = localStorage.getItem(getStorageKey());
    return savedItems ? JSON.parse(savedItems) : [];
  });

  // selectedItems가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    console.log('Current tripPlansId:', tripPlansId);
    if (tripPlansId) {
      localStorage.setItem(getStorageKey(), JSON.stringify(selectedItems));
    }
  }, [selectedItems, tripPlansId]);

  useEffect(() => {
    const fetchAttractions = async () => {
      // tripPlansId가 유효하지 않으면 API 호출 중단
      if (!tripPlansId) {
        setError('여행 계획 ID가 없습니다.');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        // authenticatedFetch 사용
        const response = await authenticatedFetch(`/api/trip-plans/${tripPlansId}/attractions`, {
          method: 'GET', // GET 요청 명시 (기본값이지만 명확성을 위해)
        });

        if (!response.ok) {
              // authenticatedFetch에서 401은 처리했을 수 있음, 다른 에러 처리
              // 400 Bad Request 같은 에러는 여기서 서버 응답 본문을 확인하는 것이 좋음
              let errorMsg = `HTTP error! status: ${response.status}`;
              try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg; // 서버가 보내는 에러 메시지 사용
              } catch { // 사용하지 않는 변수 e 제거
                  // 응답 본문이 JSON이 아닐 수 있음
                  console.log('Error response body is not valid JSON.');
              }
              throw new Error(errorMsg);
            }
            const data = await response.json();

            if (data.isSuccess && data.result && data.result.attractions) {
              const fetchedItems: TravelItem[] = data.result.attractions.map((attraction: ApiAttraction) => ({
                attractionId: attraction.attractionId,
                imageUrl: attraction.imageUrl,
                name: attraction.name,
                title: attraction.title,
                address: attraction.address,
                latitude: attraction.latitude,
                longitude: attraction.longitude,
                operatingHours: attraction.operatingHours
              }));
              setTravelItems(fetchedItems);
            } else {
              throw new Error(data.message || 'API 응답 형식이 올바르지 않습니다.');
            }
          } catch (err) {
            console.error("Error fetching attractions:", err);
            // authenticatedFetch에서 발생시킨 'Unauthorized' 에러 등을 구분하여 처리 가능
            if (err instanceof Error && err.message === 'Unauthorized') {
                setError('로그인이 필요합니다.');
               // 로그인 페이지로 리다이렉트 등 추가 처리
            } else {
                setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
            }
            setTravelItems([]);
          } finally {
            setLoading(false);
          }
        };

        fetchAttractions();
      }, [tripPlansId]); // tripPlansId 변경 시 fetchAttractions 다시 호출

  const handleSelectItem = (id: number) => {
    const isAlreadySelected = selectedItems.some(item => item.id === id);
    if (!isAlreadySelected) {
      const itemToAdd = travelItems.find(item => item.attractionId === id);
      if (itemToAdd) {
        setSelectedItems(prevItems => [...prevItems, { id: itemToAdd.attractionId, title: itemToAdd.name }]);
      }
    }
  };

  const handleRemoveItem = (id: number) => {
    setSelectedItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // handleSave에서 navigate 경로 수정 및 상태 전달
  const handleSave = () => {
    console.log('Saving destinations:', selectedItems);
    // selectedItems를 state로 전달 (localStorage에도 이미 저장됨)
    navigate(`/selectionRestaurant`, { state: { selectedDestinations: selectedItems, tripPlansId: tripPlansId } });
  };

  // 로딩 중일 때 표시할 UI
  if (loading) {
    return <LoadingSpinner message="여행지 추천 목록을 불러오는 중..." />;
  }

  // 에러 발생 시 표시할 UI
  if (error) {
    return <div>오류: {error}</div>;
  }

  return (
    <SelectMain
      items={travelItems}
      selectedItems={selectedItems}
      onSelectItem={handleSelectItem}
      onRemoveItem={handleRemoveItem}
      onSave={handleSave}
      headerTitle="님의 성향이 반영된 여행지 추천 목록입니다."
      sidebarTitle={`${userName}님이 선택한 여행지입니다.`}
      userName={userName}
      buttonText="여행지 선택 완료"
    />
  );
};

export default SelectDestination;
