import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SelectMain from './selectMain';
import travelImage1 from '../../assets/images/travel_img1.jpg';
import travelImage2 from '../../assets/images/travel_img2.jpg';
import travelImage3 from '../../assets/images/travel_img3.jpg';

interface TravelItem {
  attractionId: number;
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

const SelectDestination: React.FC = () => {
  const navigate = useNavigate();
  const [userName] = useState<string>("성수립");
  const [travelItems] = useState<TravelItem[]>([
    {
      attractionId: 1,
      imageUrl: travelImage1,
      name: '광안대교',
      title: '광안리의 밤은 당신의 낮보다 아름답다'
    },
    {
      attractionId: 2,
      imageUrl: travelImage2,
      name: '마린시티',
      title: '바다에서 불어오는 바람을 가장 먼저 맞는 곳'
    },
    {
      attractionId: 3,
      imageUrl: travelImage3,
      name: '해운대해수욕장',
      title: '부산하면 가장 먼저 떠오르는 것, 바다!'
    },
    {
      attractionId: 4,
      imageUrl: travelImage1,
      name: '우리집',
      title: '하루종일 자고 싶다'
    },
    {
      attractionId: 5,
      imageUrl: travelImage2,
      name: '너네집',
      title: '할거 존나 많아'
    },
    {
      attractionId: 6,
      imageUrl: travelImage3,
      name: '캡스톤 시발',
      title: '존나하기 싫다'
    },
    {
      attractionId: 7,
      imageUrl: travelImage3,
      name: '캡스톤 시발',
      title: '존나하기 싫다'
    }
  ]);

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const handleSelectItem = (id: number) => {
    const isAlreadySelected = selectedItems.some(item => item.id === id);
    if (!isAlreadySelected) {
      const itemToAdd = travelItems.find(item => item.attractionId === id);
      if (itemToAdd) {
        setSelectedItems([...selectedItems, { id: itemToAdd.attractionId, title: itemToAdd.name }]);
      }
    }
  };

  const handleRemoveItem = (id: number) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const handleSave = () => {
    // 여행지 저장 로직 구현
    console.log('Saving destinations:', selectedItems);
    // 음식점 선택 페이지로 이동
    navigate('/selectionRestaurant');
  };

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
