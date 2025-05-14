import React, { useState, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Modal from 'react-modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import SearchPanel from '../../components/SearchPanel';
import SelectionSidebar from '../../components/SelectionSidebar';
import { authenticatedFetch } from '../../services/api';
import SelectionModal from '../../components/Modal/SelectionModal';
import { useUser } from '../../contexts/UserContext';
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

// 검색 결과로부터 받는 여행지 검색 결과 항목의 예상 타입
interface ApiSearchAttraction {
    attractionId: number;
    name: string;
    address: string;
    imageUrl?: string;
}

// 검색 결과로부터 받는 음식점 검색 결과 항목의 예상 타입
interface ApiSearchRestaurant {
    restaurantId: number;
    name: string;
    address: string;
    imageUrl?: string;
}

// SearchPanel에 전달될 공통 검색 결과 항목 타입
interface SearchResultItem {
    id: number;
    name: string;
    address: string;
    imageUrl?: string;
}

// 상세 정보 API 응답 (여행지)
interface ApiAttractionDetail {
    attractionId: number;
    name: string;
    address: string;
    imageUrl?: string;
    phone?: string;
    title?: string;
    operatingHours?: string;
    latitude?: number;
    longitude?: number;
}

// 상세 정보 API 응답 (음식점)
interface ApiRestaurantDetail {
    restaurantId: number;
    name: string;
    address: string;
    imageUrl?: string;
    phone?: string;
    title?: string;
    operatingHours?: string;
    latitude?: number;
    longitude?: number;
}

// SelectionModal에 전달될 데이터 타입
interface ModalDisplayData {
    id: number; // 공통 ID
    type: 'travel' | 'restaurant';
    name: string;
    imageUrl?: string;
    address?: string;
    phone?: string; 
    title?: string; 
    operatingHours?: string;
    latitude?: number;
    longitude?: number;
}

const STORAGE_KEY_DESTINATIONS_PREFIX = 'selectedDestinations_';
const STORAGE_KEY_RESTAURANTS_PREFIX = 'selectedRestaurants_';

const SelectionAdd: React.FC = () => {
    const { user } = useUser();
    const userName = user?.name || "Undefined";
    const navigate = useNavigate();
    const location = useLocation(); // useLocation 훅 사용

    // 이전 페이지에서 전달된 tripPlansId
    const passedTripPlansId = location.state?.tripPlansId;
    const currentTripPlansId = passedTripPlansId;
    console.log('[SelectionAdd] 현재 사용 중인 tripPlansId:', currentTripPlansId);

    // 에러 상태 추가
    const [error, setError] = useState<string | null>(null);

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
    
    // 여행지 검색 결과 상태
    const [travelSearchResults, setTravelSearchResults] = useState<SearchResultItem[]>([]);
    const [isSearchingTravel, setIsSearchingTravel] = useState(false);
    const [travelSearchError, setTravelSearchError] = useState<string | null>(null);
    
    // 음식점 검색 결과 상태 (API로부터 받아옴)
    const [restaurantSearchResults, setRestaurantSearchResults] = useState<SearchResultItem[]>([]); // 빈 배열로 초기화
    const [isSearchingRestaurant, setIsSearchingRestaurant] = useState(false);
    const [restaurantSearchError, setRestaurantSearchError] = useState<string | null>(null);

    // 선택 완료 상태 관리
    const [isTravelComplete, setIsTravelComplete] = useState(false);
    const [isRestaurantComplete, setIsRestaurantComplete] = useState(false);
    
    // 로딩 상태 관리
    const [isLoading, setIsLoading] = useState(false);
    
    // 삭제 애니메이션을 위한 상태 관리
    const [deletingTravelId, setDeletingTravelId] = useState<number | null>(null);
    const [deletingRestaurantId, setDeletingRestaurantId] = useState<number | null>(null);

    const [isClosingSearch, setIsClosingSearch] = useState(false);

    // 모달 관련 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<ModalDisplayData | null>(null);
    const [isLoadingModalData, setIsLoadingModalData] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    // 두 선택이 모두 완료되었을 때 로딩 시작
    useEffect(() => {
        if (isTravelComplete && isRestaurantComplete) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                setIsLoading(false);
                // 다음 페이지로 이동하며 tripPlansId 전달
                navigate('/map', { state: { tripPlansId: currentTripPlansId } });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isTravelComplete, isRestaurantComplete, navigate, currentTripPlansId]);

    useEffect(() => {
        if (!currentTripPlansId) {
            setError('여행 계획 ID가 없습니다. 첫 페이지로 돌아가 다시 시작해주세요.');
            return;
        }
    }, [currentTripPlansId]);

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

    // 여행지 검색 버튼 클릭 핸들러
    const handleTravelSearch = async () => {
        if (!travelSearchTerm.trim()) {
            setTravelSearchResults([]);
            setTravelSearchError(null);
            return;
        }
        setIsSearchingTravel(true);
        setTravelSearchError(null);
        try {
            const response = await authenticatedFetch(`/api/trip-plans/attractions/search?keyword=${encodeURIComponent(travelSearchTerm)}`);
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch { /* ignore */ }
                throw new Error(errorMsg);
            }
            const data = await response.json();
            if (data.isSuccess && data.result && Array.isArray(data.result.attractions)) {
                // ApiSearchAttraction에서 SearchResultItem으로 매핑 시, SearchPanel의 props에 맞게 필드 조정
                const formattedResults: SearchResultItem[] = data.result.attractions.map((item: ApiSearchAttraction) => ({
                    id: item.attractionId,
                    name: item.name,
                    address: item.address,
                    imageUrl: item.imageUrl,
                }));
                setTravelSearchResults(formattedResults);
            } else {
                setTravelSearchResults([]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '여행지 검색 중 오류가 발생했습니다.';
            setTravelSearchError(errorMessage);
            setTravelSearchResults([]);
        } finally {
            setIsSearchingTravel(false);
        }
    };

    // 음식점 검색 버튼 클릭 핸들러
    const handleRestaurantSearch = async () => {
        if (!restaurantSearchTerm.trim()) {
            setRestaurantSearchResults([]);
            setRestaurantSearchError(null);
            return;
        }
        setIsSearchingRestaurant(true);
        setRestaurantSearchError(null);
        try {
            const response = await authenticatedFetch(`/api/trip-plans/restaurants/search?keyword=${encodeURIComponent(restaurantSearchTerm)}`, {
                method: 'GET',
            });

            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch {
                    console.log('Error response body is not valid JSON for restaurant search.');
                }
                throw new Error(errorMsg);
            }
            const data = await response.json();

            if (data.isSuccess && data.result && Array.isArray(data.result.restaurants)) {
                 // ApiSearchRestaurant에서 SearchResultItem으로 매핑 시, SearchPanel의 props에 맞게 필드 조정
                const formattedResults: SearchResultItem[] = data.result.restaurants.map((restaurant: ApiSearchRestaurant) => ({
                    id: restaurant.restaurantId,
                    name: restaurant.name,
                    address: restaurant.address,
                    imageUrl: restaurant.imageUrl,
                }));
                setRestaurantSearchResults(formattedResults);
            } else {
                setRestaurantSearchResults([]); 
            }
        } catch (err) {
            console.error("Error fetching restaurant search results:", err);
            const errorMessage = err instanceof Error ? err.message : '음식점 검색 중 오류가 발생했습니다.';
            setRestaurantSearchError(errorMessage);
            setRestaurantSearchResults([]);
        } finally {
            setIsSearchingRestaurant(false);
        }
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

    // 상세 정보 로드 및 모달 표시 함수
    const handleLoadAndShowPlaceDetails = async (id: number, type: 'travel' | 'restaurant') => {
        setIsLoadingModalData(true);
        setModalError(null);
        setModalData(null);

        try {
            const endpoint = type === 'travel' 
                ? `/api/trip-plans/attractions/${id}` 
                : `/api/trip-plans/restaurants/${id}`;
            const response = await authenticatedFetch(endpoint);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to fetch details and parse error response.' }));
                throw new Error(errorData.message || `Failed to fetch ${type} details`);
            }
            
            const result = await response.json();
            // API 응답 구조가 { isSuccess: boolean, result: DetailObject } 형태라고 가정
            if (result.isSuccess && result.result) {
                const detailData = result.result;
                const commonModalData: ModalDisplayData = {
                    id: type === 'travel' ? (detailData as ApiAttractionDetail).attractionId : (detailData as ApiRestaurantDetail).restaurantId,
                    type: type,
                    name: detailData.name,
                    imageUrl: detailData.imageUrl,
                    address: detailData.address,
                    phone: detailData.phone, // phone 필드 사용
                    title: detailData.title,
                    operatingHours: detailData.operatingHours,
                    latitude: detailData.latitude,
                    longitude: detailData.longitude,
                };
                setModalData(commonModalData);
                setIsModalOpen(true);
            } else {
                throw new Error(`Could not retrieve details for the selected ${type}.`);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '상세 정보를 불러오는 중 오류가 발생했습니다.';
            setModalError(errorMessage);
            // 에러 발생 시에도 모달을 열어 에러 메시지를 보여줄 수 있음 (선택 사항)
            // setIsModalOpen(true); 
        } finally {
            setIsLoadingModalData(false);
        }
    };

    // 모달에서 장소 "추가하기" 버튼 클릭 시 핸들러
    const handleAddPlaceFromModal = () => {
        if (modalData) {
            if (modalData.type === 'travel') {
                handleAddTravel({ id: modalData.id, name: modalData.name });
            } else {
                handleAddRestaurant({ id: modalData.id, name: modalData.name });
            }
        }
        setIsModalOpen(false); // 모달 닫기
        setModalData(null); // 모달 데이터 초기화
    };

    return (
        <>
            {error && (
                <div style={{ padding: '20px', margin: '20px auto', maxWidth: '600px', textAlign: 'center', color: 'red' }}>
                    {error}
                </div>
            )}
            {!error && (
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
                            isLoading={isSearchingTravel}
                            error={travelSearchError}
                            onItemSelect={handleLoadAndShowPlaceDetails}
                        />
                    )}

                <SidebarsWrapper showTravelSearch={showTravelSearch} showRestaurantSearch={showRestaurantSearch}>
                    <SelectionSidebar
                        type="travel"
                        title={`${userName}님이 선택한 여행지입니다.`}
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
                        title={`${userName}님이 선택한 음식점입니다.`}
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
                            isLoading={isSearchingRestaurant}
                            error={restaurantSearchError}
                            onItemSelect={handleLoadAndShowPlaceDetails}
                        />
                    )}
                </MainContainer>
            )}
            
            {isLoading && (
                <LoadingSpinner message="가이드가 최적의 여행 계획을 작성 중입니다..." />
            )}

            {/* SelectionModal 렌더링 */}
            {isModalOpen && modalData && (
                <SelectionModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setModalData(null);
                        setModalError(null);
                    }}
                    selectedTravelItem={{
                        // SelectionModal의 TravelItem이 id, name, imageUrl, title, address, operatingHours, latitude, longitude, phone 등을 직접 받을 수 있도록 가정
                        ...(modalData.type === 'travel' ? { attractionId: modalData.id } : { restaurantId: modalData.id }),
                        name: modalData.name,
                        imageUrl: modalData.imageUrl || '', // null일 경우 빈 문자열 또는 폴백 이미지 경로
                        title: modalData.title || '', // title이 undefined일 경우 name 또는 빈 문자열 사용
                        address: modalData.address,
                        operatingHours: modalData.operatingHours,
                        latitude: modalData.latitude,
                        longitude: modalData.longitude,
                        phoneNumber: modalData.phone, // phone을 phoneNumber로 변경
                    }}
                    onSelect={handleAddPlaceFromModal}
                    // isLoading, error 등의 prop도 SelectionModal에 필요하다면 추가
                />
            )}
            {/* 모달 로딩 또는 에러 상태를 표시할 수 있습니다. */}
            {isLoadingModalData && <LoadingSpinner message="상세 정보 로딩 중..." />}
            {!isLoadingModalData && modalError && !isModalOpen && (
                <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.2)', zIndex: 1001 }}>
                    <p>오류: {modalError}</p>
                    <button onClick={() => setModalError(null)}>닫기</button>
                </div>
            )}
        </>
    );
};

export default SelectionAdd;
