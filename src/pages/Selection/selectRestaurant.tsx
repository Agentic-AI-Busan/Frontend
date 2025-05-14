import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SelectMain from './selectMain';
import { authenticatedFetch } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

interface ApiRestaurant {
  restaurantId: number;
  name: string;
  imageUrl: string;
  address: string;
  operatingHours: string;
  title: string;
  latitude: number;
  longitude: number;
}

interface TravelItem {
  restaurantId: number;
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
const STORAGE_KEY_RESTAURANTS_PREFIX = 'selectedRestaurants_';

const SelectRestaurant: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 페이지(selectDestination)에서 전달된 tripPlansId를 우선 사용, 없으면 기본값 '14' 사용
  // 또는 location.state에서 selectedDestinations가 없을 경우를 대비하여 tripPlansId를 가져옴
  const passedTripPlansId = location.state?.tripPlansId || '14'; 
  const tripPlansId = passedTripPlansId;

  const getDestinationsStorageKey = () => `${STORAGE_KEY_DESTINATIONS_PREFIX}${tripPlansId}`;
  const getRestaurantsStorageKey = () => `${STORAGE_KEY_RESTAURANTS_PREFIX}${tripPlansId}`;

  // selectedDestinations는 location.state 또는 localStorage에서 가져옴
  const initialSelectedDestinations = (): SelectedItem[] => {
    const stateDestinations = location.state?.selectedDestinations;
    if (stateDestinations && stateDestinations.length > 0) {
      return stateDestinations;
    }
    if (tripPlansId) {
        const savedDestinations = localStorage.getItem(getDestinationsStorageKey());
        if (savedDestinations) return JSON.parse(savedDestinations);
    }
    return [];
  };
  const selectedDestinations = initialSelectedDestinations();

  const { user } = useUser();
  const userName = user?.name || "Undefined";
  const [restaurantItems, setRestaurantItems] = useState<TravelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // localStorage에서 선택된 음식점 초기 데이터 로드
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(() => {
    if (!tripPlansId) return [];
    const savedItems = localStorage.getItem(getRestaurantsStorageKey());
    return savedItems ? JSON.parse(savedItems) : [];
  });

  // selectedItems(음식점)가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (tripPlansId) {
      localStorage.setItem(getRestaurantsStorageKey(), JSON.stringify(selectedItems));
    }
  }, [selectedItems, tripPlansId]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!tripPlansId) {
        setError('여행 계획 ID가 없습니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await authenticatedFetch(`/api/trip-plans/${tripPlansId}/restaurants`, {
          method: 'GET',
        });

        if (!response.ok) {
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
          } catch {
            console.log('Error response body is not valid JSON for restaurants.');
          }
          throw new Error(errorMsg);
        }
        const data = await response.json();

        if (data.isSuccess && data.result && data.result.restaurants) {
          const fetchedItems: TravelItem[] = data.result.restaurants.map((item: ApiRestaurant) => ({
            restaurantId: item.restaurantId,
            imageUrl: item.imageUrl,
            name: item.name,
            title: item.title,
            address: item.address,
            latitude: item.latitude,
            longitude: item.longitude,
            operatingHours: item.operatingHours
          }));
          setRestaurantItems(fetchedItems);
        } else {
          throw new Error(data.message || 'Restaurant API 응답 형식이 올바르지 않습니다.');
        }
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        if (err instanceof Error && err.message === 'Authentication required') {
            setError('로그인이 필요합니다.');
        } else {
            setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
        }
        setRestaurantItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [tripPlansId]);

  const handleSelectItem = (id: number) => {
    const isAlreadySelected = selectedItems.some(item => item.id === id);
    if (!isAlreadySelected) {
      const itemToAdd = restaurantItems.find(item => item.restaurantId === id);
      if (itemToAdd) {
        setSelectedItems(prevItems => [...prevItems, { id: itemToAdd.restaurantId, title: itemToAdd.name }]);
      }
    }
  };

  const handleRemoveItem = (id: number) => {
    setSelectedItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const handleSave = () => {
    console.log('Saving restaurants:', selectedItems);
    // selectedDestinations는 localStorage 또는 이전 state에서, selectedItems(음식점)는 현재 state(localStorage와 동기화됨)에서 가져옴
    navigate(`/selectionAdd`, {
      state: {
        selectedDestinations: selectedDestinations, 
        selectedRestaurants: selectedItems,
        tripPlansId: tripPlansId // 다음 페이지에서도 tripPlansId를 사용할 수 있도록 전달
      }
    });
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>오류: {error}</div>;
  }

  return (
    <SelectMain
      items={restaurantItems}
      selectedItems={selectedItems} // 현재 페이지에서 선택/관리하는 음식점 목록
      onSelectItem={handleSelectItem}
      onRemoveItem={handleRemoveItem}
      onSave={handleSave}
      headerTitle="님의 성향이 반영된 음식점 추천 목록입니다."
      sidebarTitle={`${userName}님이 선택한 음식점입니다.`}
      userName={userName}
      buttonText="음식점 선택 완료"
    />
  );
};

export default SelectRestaurant;