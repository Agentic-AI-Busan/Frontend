import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Modal from 'react-modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import SearchPanel from '../../components/SearchPanel';
import SelectionSidebar from '../../components/SelectionSidebar';
import { authenticatedFetch } from '../../services/api';

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

const STORAGE_KEY_DESTINATIONS_PREFIX = 'selectedDestinations_';
const STORAGE_KEY_RESTAURANTS_PREFIX = 'selectedRestaurants_';

const SelectionAdd: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation(); // useLocation 훅 사용

    // 이전 페이지에서 전달된 tripPlansId 또는 기본값 '14' 사용
    const passedTripPlansId = location.state?.tripPlansId || '14';
    const currentTripPlansId = passedTripPlansId;

    const getDestinationsStorageKey = () => `${STORAGE_KEY_DESTINATIONS_PREFIX}${currentTripPlansId}`;
    const getRestaurantsStorageKey = () => `${STORAGE_KEY_RESTAURANTS_PREFIX}${currentTripPlansId}`;

    // 상태 초기화 시 localStorage 우선, 그 다음 location.state, 마지막으로 빈 배열
    const [selectedPlaces, setSelectedPlaces] = useState(() => {
        let destinations: SelectedPlaceItem[] = [];
        let restaurants: SelectedPlaceItem[] = [];

        if (currentTripPlansId) {
            const savedDestinations = localStorage.getItem(getDestinationsStorageKey());
            if (savedDestinations) destinations = JSON.parse(savedDestinations);
            
            const savedRestaurants = localStorage.getItem(getRestaurantsStorageKey());
            if (savedRestaurants) restaurants = JSON.parse(savedRestaurants);
        }
        
        // localStorage에 데이터가 없다면 location.state에서 가져오려고 시도
        if (destinations.length === 0) {
            destinations = location.state?.selectedDestinations || [];
        }
        if (restaurants.length === 0) {
            restaurants = location.state?.selectedRestaurants || [];
        }

        return { travel: destinations, restaurant: restaurants };
    });

    // selectedPlaces.travel이 변경될 때마다 localStorage에 저장
    useEffect(() => {
        if (currentTripPlansId) {
            localStorage.setItem(getDestinationsStorageKey(), JSON.stringify(selectedPlaces.travel));
        }
    }, [selectedPlaces.travel, currentTripPlansId]);

    // selectedPlaces.restaurant가 변경될 때마다 localStorage에 저장
    useEffect(() => {
        if (currentTripPlansId) {
            localStorage.setItem(getRestaurantsStorageKey(), JSON.stringify(selectedPlaces.restaurant));
        }
    }, [selectedPlaces.restaurant, currentTripPlansId]);

    // 검색을 위한 상태 관리
    const [travelSearchTerm, setTravelSearchTerm] = useState('');
    const [restaurantSearchTerm, setRestaurantSearchTerm] = useState('');
    
    // 검색 패널 표시 여부를 위한 상태 관리
    const [showTravelSearch, setShowTravelSearch] = useState(false);
    const [showRestaurantSearch, setShowRestaurantSearch] = useState(false);
    
    // 검색 결과를 위한 상태 관리 (API 연동 시 변경 필요)
    const [travelSearchResults] = useState([
        { id: 101, name: '부산타워', address: '부산 중구 용두산길 37-55' },
        { id: 102, name: '해동용궁사', address: '부산 기장군 기장읍 기장해안로 86' },
    ]);
    
    const [restaurantSearchResults] = useState([
        { id: 201, name: '자갈치 시장', address: '부산 중구 자갈치해안로 52' },
        { id: 202, name: '가야밀면', address: '부산 진구 가야대로 507' },
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
        if (isTravelComplete && isRestaurantComplete) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                setIsLoading(false);
                // 다음 페이지로 이동 시 localStorage 데이터 삭제 여부 결정 필요
                // 예: localStorage.removeItem(getDestinationsStorageKey());
                // 예: localStorage.removeItem(getRestaurantsStorageKey());
                navigate('/map');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isTravelComplete, isRestaurantComplete, navigate, currentTripPlansId]); // currentTripPlansId 의존성 추가

    // 선택 완료 핸들러 (여행지)
    const handleTravelComplete = async () => {
        if (!currentTripPlansId) {
            alert('여행 계획 ID가 유효하지 않습니다.');
            return;
        }
        setIsClosingSearch(true);
        try {
            const attractionIds = selectedPlaces.travel.map(place => place.id);
            const response = await authenticatedFetch(`/api/trip-plans/${currentTripPlansId}/attractions/final`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ attractionIds: attractionIds }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to submit attractions and parse error response.' }));
                console.error('Error submitting attractions:', errorData);
                alert(`여행지 전송에 실패했습니다: ${errorData.message || response.statusText}`);
                setIsClosingSearch(false);
                return;
            }
            const responseData = await response.json().catch(() => ({ message: 'Successfully submitted but no JSON response or failed to parse.' }));
            console.log('Successfully submitted attractions. Server response:', responseData);

            setTimeout(() => {
                setShowTravelSearch(false);
                setIsClosingSearch(false);
                setTimeout(() => {
                    setIsTravelComplete(true);
                }, 100);
            }, 400);

        } catch (error) {
            console.error('Failed to submit attractions:', error);
            alert('여행지 전송 중 오류가 발생했습니다.');
            setIsClosingSearch(false);
        }
    };

    // 선택 완료 핸들러 (음식점)
    const handleRestaurantComplete = async () => {
        if (!currentTripPlansId) {
            alert('여행 계획 ID가 유효하지 않습니다.');
            return;
        }
        setIsClosingSearch(true);
        try {
            const restaurantIds = selectedPlaces.restaurant.map(place => place.id);
            const response = await authenticatedFetch(`/api/trip-plans/${currentTripPlansId}/restaurants/final`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ restaurantIds: restaurantIds }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to submit restaurants and parse error response.' }));
                console.error('Error submitting restaurants:', errorData);
                alert(`음식점 전송에 실패했습니다: ${errorData.message || response.statusText}`);
                setIsClosingSearch(false);
                return;
            }
            const responseData = await response.json().catch(() => ({ message: 'Successfully submitted but no JSON response or failed to parse.' }));
            console.log('Successfully submitted restaurants. Server response:', responseData);

            setTimeout(() => {
                setShowRestaurantSearch(false);
                setIsClosingSearch(false);
                setTimeout(() => {
                    setIsRestaurantComplete(true);
                }, 100);
            }, 400);

        } catch (error) {
            console.error('Failed to submit restaurants:', error);
            alert('음식점 전송 중 오류가 발생했습니다.');
            setIsClosingSearch(false);
        }
    };

    // 다시 선택하기 핸들러
    const handleResetTravel = () => {
        setIsTravelComplete(false);
    };

    const handleResetRestaurant = () => {
        setIsRestaurantComplete(false);
    };

    // 삭제 핸들러 (setSelectedPlaces 호출 시 자동으로 localStorage 업데이트 됨 by useEffect)
    const handleDelete = (type: 'travel' | 'restaurant', id: number) => {
        const setter = type === 'travel' ? setDeletingTravelId : setDeletingRestaurantId;
        setter(id);
        setTimeout(() => {
            setSelectedPlaces(prev => ({
                ...prev,
                [type]: prev[type].filter(item => item.id !== id)
            }));
            setter(null);
        }, 300);
    };

    // 검색어 변경 핸들러
    const handleTravelSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTravelSearchTerm(e.target.value);
    };

    const handleRestaurantSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRestaurantSearchTerm(e.target.value);
    };

    // 검색 버튼 클릭 핸들러 (실제 검색 로직 필요)
    const handleTravelSearch = () => {
        console.log('여행지 검색:', travelSearchTerm);
    };

    const handleRestaurantSearch = () => {
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

    // 장소 추가 핸들러 (setSelectedPlaces 호출 시 자동으로 localStorage 업데이트 됨 by useEffect)
    const handleAddTravel = (place: { id: number, name: string }) => {
        if (isTravelComplete) return;
        if (!selectedPlaces.travel.some(item => item.id === place.id)) {
            setSelectedPlaces(prev => ({
                ...prev,
                travel: [...prev.travel, { id: place.id, title: place.name }]
            }));
        }
    };

    const handleAddRestaurant = (place: { id: number, name: string }) => {
        if (isRestaurantComplete) return;
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
            
            {isLoading && (
                <LoadingSpinner message="가이드가 최적의 여행 계획을 작성 중입니다..." />
            )}
        </>
    );
};

export default SelectionAdd;
