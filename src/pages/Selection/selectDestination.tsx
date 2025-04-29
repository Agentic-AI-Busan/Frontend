import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SelectMain from './selectMain';
import { authenticatedFetch } from '../../services/api'; // authenticatedFetch 임포트
// import travelImage1 from '../../assets/images/travel_img1.jpg';
// import travelImage2 from '../../assets/images/travel_img2.jpg';
// import travelImage3 from '../../assets/images/travel_img3.jpg';

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

const SelectDestination: React.FC = () => {
  const navigate = useNavigate();
  // const { tripPlansId } = useParams<{ tripPlansId: string }>(); // 원래 코드: URL 파라미터에서 가져옵니다.
  const tripPlansId = '14'; // 임시 코드: 테스트를 위해 ID를 14로 고정합니다.
  const [userName] = useState<string>("성수립");
  const [travelItems, setTravelItems] = useState<TravelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // // 더미 데이터 - API 호출 전까지 사용
  // const [travelItems] = useState<TravelItem[]>([
  //   {
  //     attractionId: 1,
  //     imageUrl: travelImage1,
  //     name: '광안대교',
  //     title: '광안리의 밤은 당신의 낮보다 아름답다'
  //   },
  //   {
  //     attractionId: 2,
  //     imageUrl: travelImage2,
  //     name: '마린시티',
  //     title: '바다에서 불어오는 바람을 가장 먼저 맞는 곳'
  //   },
  //   {
  //     attractionId: 3,
  //     imageUrl: travelImage3,
  //     name: '해운대해수욕장',
  //     title: '부산하면 가장 먼저 떠오르는 것, 바다!'
  //   },
  //   {
  //     attractionId: 4,
  //     imageUrl: travelImage1,
  //     name: '우리집',
  //     title: '하루종일 자고 싶다'
  //   },
  //   {
  //     attractionId: 5,
  //     imageUrl: travelImage2,
  //     name: '너네집',
  //     title: '할거 존나 많아'
  //   },
  //   {
  //     attractionId: 6,
  //     imageUrl: travelImage3,
  //     name: '캡스톤 시발',
  //     title: '존나하기 싫다'
  //   },
  //   {
  //     attractionId: 7,
  //     imageUrl: travelImage3,
  //     name: '캡스톤 시발',
  //     title: '존나하기 싫다'
  //   }
  // ]);

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
      }, [tripPlansId]);

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

  // handleSave에서 navigate 경로 수정 필요
  const handleSave = () => {
    console.log('Saving destinations:', selectedItems);
    // tripPlansId가 문자열이므로 실제 ID를 사용하거나 라우팅 구조에 맞게 수정
    navigate(`/selectionRestaurant`);
  };

  // 로딩 중일 때 표시할 UI
  if (loading) {
    return <div>로딩 중...</div>; // 실제 구현에서는 로딩 스피너 컴포넌트 사용 권장
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
