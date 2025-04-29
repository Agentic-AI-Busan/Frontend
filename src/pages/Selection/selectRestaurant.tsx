import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SelectMain from './selectMain';
import { authenticatedFetch } from '../../services/api';

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

const SelectRestaurant: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedDestinations = location.state?.selectedDestinations || [];
  const tripPlansId = '14';
  const [userName] = useState<string>("성수립");
  const [restaurantItems, setRestaurantItems] = useState<TravelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const handleSelectItem = (id: number) => {
    const isAlreadySelected = selectedItems.some(item => item.id === id);
    if (!isAlreadySelected) {
      const itemToAdd = restaurantItems.find(item => item.restaurantId === id);
      if (itemToAdd) {
        setSelectedItems([...selectedItems, { id: itemToAdd.restaurantId, title: itemToAdd.name }]);
      }
    }
  };

  const handleRemoveItem = (id: number) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const handleSave = () => {
    console.log('Saving restaurants:', selectedItems);
    navigate(`/selectionAdd`, {
      state: {
        selectedDestinations: selectedDestinations,
        selectedRestaurants: selectedItems
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
      selectedItems={selectedItems}
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