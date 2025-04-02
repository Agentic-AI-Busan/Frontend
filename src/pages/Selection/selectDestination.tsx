import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SelectMain from './selectMain';
import travelImage1 from '../../assets/images/travel_img1.jpg';
import travelImage2 from '../../assets/images/travel_img2.jpg';
import travelImage3 from '../../assets/images/travel_img3.jpg';

interface TravelItem {
  id: number;
  image: string;
  title: string;
  description: string;
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
      id: 1,
      image: travelImage1,
      title: '광안대교',
      description: '광안리의 밤은 당신의 낮보다 아름답다'
    },
    {
      id: 2,
      image: travelImage2,
      title: '마린시티',
      description: '바다에서 불어오는 바람을 가장 먼저 맞는 곳'
    },
    {
      id: 3,
      image: travelImage3,
      title: '해운대해수욕장',
      description: '부산하면 가장 먼저 떠오르는 것, 바다!'
    },
    {
      id: 4,
      image: travelImage1,
      title: '우리집',
      description: '하루종일 자고 싶다'
    },
    {
      id: 5,
      image: travelImage2,
      title: '너네집',
      description: '할거 존나 많아'
    },
    {
      id: 6,
      image: travelImage3,
      title: '캡스톤 시발',
      description: '존나하기 싫다'
    },
    {
      id: 7,
      image: travelImage3,
      title: '캡스톤 시발',
      description: '존나하기 싫다'
    }
  ]);

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const handleSelectItem = (id: number) => {
    const isAlreadySelected = selectedItems.some(item => item.id === id);
    if (!isAlreadySelected) {
      const itemToAdd = travelItems.find(item => item.id === id);
      if (itemToAdd) {
        setSelectedItems([...selectedItems, { id: itemToAdd.id, title: itemToAdd.title }]);
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
    />
  );
};

export default SelectDestination;
