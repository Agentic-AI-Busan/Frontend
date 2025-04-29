import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Modal from 'react-modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import SearchPanel from '../../components/SearchPanel';
import SelectionSidebar from '../../components/SelectionSidebar';

// 메인 컨테이너 스타일 컴포넌트
const MainContainer = styled.div`
    display: flex;
    gap: 20px;
    justify-content: center;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    padding: 10px 20px 20px;
    position: fixed;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    
    @media (max-width: 992px) {
        flex-direction: column;
        align-items: center;
        overflow-y: auto;
    }
`;

// 사이드바 래퍼 컴포넌트 추가
const SidebarsWrapper = styled.div<{ showTravelSearch?: boolean; showRestaurantSearch?: boolean }>`
    display: flex;
    gap: 20px;
    justify-content: center;
    transition: transform 0.4s ease-out;
    
    ${props => props.showTravelSearch && `
        transform: translateX(50px);
    `}
    
    ${props => props.showRestaurantSearch && `
        transform: translateX(-50px);
    `}
    
    @media (max-width: 992px) {
        flex-direction: column;
        transform: none;
    }
`;

Modal.setAppElement('#root'); // 모달을 위한 설정

// 선택된 항목의 타입을 정의 (id와 title 포함)
interface SelectedPlaceItem {
  id: number;
  title: string;
}

const SelectionAdd: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation(); // useLocation 훅 사용

    // 이전 페이지에서 전달받은 상태 읽기
    const passedDestinations: SelectedPlaceItem[] = location.state?.selectedDestinations || [];
    const passedRestaurants: SelectedPlaceItem[] = location.state?.selectedRestaurants || [];

    // 상태 초기화 시 전달받은 데이터 사용
    const [selectedPlaces, setSelectedPlaces] = useState({
        travel: passedDestinations,
        restaurant: passedRestaurants
    });

    // 검색을 위한 상태 관리
    const [travelSearchTerm, setTravelSearchTerm] = useState('');
    const [restaurantSearchTerm, setRestaurantSearchTerm] = useState('');
    
    // 검색 패널 표시 여부를 위한 상태 관리
    const [showTravelSearch, setShowTravelSearch] = useState(false);
    const [showRestaurantSearch, setShowRestaurantSearch] = useState(false);
    
    // 검색 결과를 위한 상태 관리
    const [travelSearchResults] = useState([
        { id: 101, name: '부산타워', address: '부산 중구 용두산길 37-55' },
        { id: 102, name: '해동용궁사', address: '부산 기장군 기장읍 기장해안로 86' },
        { id: 103, name: '태종대', address: '부산 영도구 전망로 24' },
        { id: 104, name: '감천문화마을', address: '부산 사하구 감내2로 203' },
        { id: 105, name: '오륙도', address: '부산 남구 오륙도로 137' }
    ]);
    
    const [restaurantSearchResults] = useState([
        { id: 201, name: '자갈치 시장', address: '부산 중구 자갈치해안로 52' },
        { id: 202, name: '가야밀면', address: '부산 진구 가야대로 507' },
        { id: 203, name: '삼진어묵', address: '부산 남구 분포로 66' },
        { id: 204, name: '송정 가마솥 국밥', address: '부산 해운대구 송정구서로 21' },
        { id: 205, name: '원조할매국밥', address: '부산 동구 중앙대로 526' }
    ]);

    // 선택 완료 상태 관리
    const [isTravelComplete, setIsTravelComplete] = useState(false);
    const [isRestaurantComplete, setIsRestaurantComplete] = useState(false);
    
    // 로딩 상태 관리
    const [isLoading, setIsLoading] = useState(false);
    
    // 삭제 애니메이션을 위한 상태 관리
    const [deletingTravelId, setDeletingTravelId] = useState<number | null>(null);
    const [deletingRestaurantId, setDeletingRestaurantId] = useState<number | null>(null);

    const [isClosingSearch, setIsClosingSearch] = useState(false);

    // 두 선택이 모두 완료되었을 때 로딩 시작
    useEffect(() => {
        // 컴포넌트 마운트 시, 전달받은 데이터가 있으면 완료 상태로 간주할 수 있음
        if (passedDestinations.length > 0) {
          // setIsTravelComplete(true); // 필요에 따라 초기 완료 상태 설정
        }
        if (passedRestaurants.length > 0) {
          // setIsRestaurantComplete(true);
        }

        if (isTravelComplete && isRestaurantComplete) {
            setIsLoading(true);
            
            // 3초 후에 로딩 종료 및 다음 페이지로 이동
            const timer = setTimeout(() => {
                setIsLoading(false);
                navigate('/map');
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [isTravelComplete, isRestaurantComplete, navigate, passedDestinations.length, passedRestaurants.length]);

    // 선택 완료 핸들러
    const handleTravelComplete = () => {
        setIsClosingSearch(true);
        setTimeout(() => {
            // 검색 패널을 먼저 닫고
            setShowTravelSearch(false);
            setIsClosingSearch(false);
            
            // 약간의 지연 후 완료 상태로 전환하여 사이드바가 자연스럽게 중앙으로 이동하도록 함
            setTimeout(() => {
                setIsTravelComplete(true);
            }, 100);
        }, 400);
    };

    const handleRestaurantComplete = () => {
        setIsClosingSearch(true);
        setTimeout(() => {
            // 검색 패널을 먼저 닫고
            setShowRestaurantSearch(false);
            setIsClosingSearch(false);
            
            // 약간의 지연 후 완료 상태로 전환하여 사이드바가 자연스럽게 중앙으로 이동하도록 함
            setTimeout(() => {
                setIsRestaurantComplete(true);
            }, 100);
        }, 400);
    };

    // 다시 선택하기 핸들러
    const handleResetTravel = () => {
        setIsTravelComplete(false);
    };

    const handleResetRestaurant = () => {
        setIsRestaurantComplete(false);
    };

    const handleDelete = (type: 'travel' | 'restaurant', id: number) => {
        if (type === 'travel') {
            setDeletingTravelId(id);
            setTimeout(() => {
                setSelectedPlaces(prev => ({
                    ...prev,
                    [type]: prev[type].filter(item => item.id !== id)
                }));
                setDeletingTravelId(null);
            }, 300);
        } else {
            setDeletingRestaurantId(id);
            setTimeout(() => {
                setSelectedPlaces(prev => ({
                    ...prev,
                    [type]: prev[type].filter(item => item.id !== id)
                }));
                setDeletingRestaurantId(null);
            }, 300);
        }
    };

    // 검색어 변경 핸들러
    const handleTravelSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTravelSearchTerm(e.target.value);
        // 실제 구현에서는 여기서 API 호출이나 필터링 로직을 추가
    };

    const handleRestaurantSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRestaurantSearchTerm(e.target.value);
        // 실제 구현에서는 여기서 API 호출이나 필터링 로직을 추가
    };

    // 검색 버튼 클릭 핸들러
    const handleTravelSearch = () => {
        // 실제 구현에서는 여기서 API 호출이나 필터링 로직을 추가
        console.log('여행지 검색:', travelSearchTerm);
    };

    const handleRestaurantSearch = () => {
        // 실제 구현에서는 여기서 API 호출이나 필터링 로직을 추가
        console.log('음식점 검색:', restaurantSearchTerm);
    };

    // 여행지/음식점 추가 버튼 핸들러
    const handleShowTravelSearch = () => {
        setShowTravelSearch(true);
        setShowRestaurantSearch(false);
    };
    
    const handleShowRestaurantSearch = () => {
        setShowRestaurantSearch(true);
        setShowTravelSearch(false);
    };

    // 장소 추가 핸들러
    const handleAddTravel = (place: { id: number, name: string }) => {
        if (isTravelComplete) return; // 선택 완료 상태면 추가하지 않음
        // 중복 체크
        if (!selectedPlaces.travel.some(item => item.id === place.id)) {
            setSelectedPlaces(prev => ({
                ...prev,
                travel: [...prev.travel, { id: place.id, title: place.name }]
            }));
        }
    };

    const handleAddRestaurant = (place: { id: number, name: string }) => {
        if (isRestaurantComplete) return; // 선택 완료 상태면 추가하지 않음
        // 중복 체크
        if (!selectedPlaces.restaurant.some(item => item.id === place.id)) {
            setSelectedPlaces(prev => ({
                ...prev,
                restaurant: [...prev.restaurant, { id: place.id, title: place.name }]
            }));
        }
    };

    return (
        <>
            <MainContainer>
                {/* 여행지 검색 컨테이너 - 버튼 클릭시에만 표시 */}
                {showTravelSearch && (
                    <SearchPanel
                        type="travel"
                        isClosing={isClosingSearch}
                        isComplete={isTravelComplete}
                        searchTerm={travelSearchTerm}
                        onSearchChange={handleTravelSearchChange}
                        onSearch={handleTravelSearch}
                        searchResults={travelSearchResults}
                        onAddPlace={handleAddTravel}
                    />
                )}

                <SidebarsWrapper showTravelSearch={showTravelSearch} showRestaurantSearch={showRestaurantSearch}>
                    {/* 선택한 여행지 사이드바 */}
                    <SelectionSidebar
                        type="travel"
                        title="성수립님이 선택한 여행지입니다."
                        items={selectedPlaces.travel}
                        isComplete={isTravelComplete}
                        deletingItemId={deletingTravelId}
                        onDelete={(id) => handleDelete('travel', id)}
                        onShowSearch={handleShowTravelSearch}
                        onComplete={handleTravelComplete}
                        onReset={handleResetTravel}
                        buttonText="여행지 선택 완료"
                    />
                    
                    {/* 선택한 음식점 사이드바 */}
                    <SelectionSidebar
                        type="restaurant"
                        title="성수립님이 선택한 음식점입니다."
                        items={selectedPlaces.restaurant}
                        isComplete={isRestaurantComplete}
                        deletingItemId={deletingRestaurantId}
                        onDelete={(id) => handleDelete('restaurant', id)}
                        onShowSearch={handleShowRestaurantSearch}
                        onComplete={handleRestaurantComplete}
                        onReset={handleResetRestaurant}
                        buttonText="음식점 선택 완료"
                    />
                </SidebarsWrapper>

                {/* 음식점 검색 컨테이너 - 버튼 클릭시에만 표시 */}
                {showRestaurantSearch && (
                    <SearchPanel
                        type="restaurant"
                        isClosing={isClosingSearch}
                        isComplete={isRestaurantComplete}
                        searchTerm={restaurantSearchTerm}
                        onSearchChange={handleRestaurantSearchChange}
                        onSearch={handleRestaurantSearch}
                        searchResults={restaurantSearchResults}
                        onAddPlace={handleAddRestaurant}
                    />
                )}
            </MainContainer>
            
            {/* 로딩 스피너 */}
            {isLoading && (
                <LoadingSpinner message="가이드가 최적의 여행 계획을 작성 중입니다..." />
            )}
        </>
    );
};

export default SelectionAdd;
