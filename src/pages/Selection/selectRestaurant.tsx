import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SelectMain from './selectMain';
import travelImage1 from '../../assets/images/travel_img1.jpg';
import travelImage2 from '../../assets/images/travel_img2.jpg';
import travelImage3 from '../../assets/images/travel_img3.jpg';

interface TravelItem {
  restaurantId: number;
  imageUrl: string;
  name: string;
  title: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface SelectedItem {
  id: number;
  title: string;
}

const SelectRestaurant: React.FC = () => {
  const navigate = useNavigate();
  const [userName] = useState<string>("성수립");
  const [restaurantItems] = useState<TravelItem[]>([
    {
      restaurantId: 1,
      imageUrl: travelImage1,
      name: '부산 어묵',
      title: '부산의 대표적인 길거리 음식'
    },
    {
      restaurantId: 2,
      imageUrl: travelImage2,
      name: '돼지국밥',
      title: '부산 사람들의 소울푸드'
    },
    {
      restaurantId: 3,
      imageUrl: travelImage3,
      name: '해운대 회센터',
      title: '신선한 회를 즐길 수 있는 곳'
    }
  ]);

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
    // 음식점 저장 로직 구현
    console.log('Saving restaurants:', selectedItems);
    // selectionAdd 페이지로 이동
    navigate('/selectionAdd');
  };

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