import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { authenticatedFetch } from '../../services/api';
import nullPlaceImage from '../../assets/images/null_place.png'; // 폴백 이미지

// Place 타입 정의 (AISidebar의 RecommendPlace와 유사하게, 또는 더 일반적인 형태로)
export interface Place {
    id: number;
    name: string;
    address: string;
    imageUrl?: string;
    coordinates?: { lat: number; lng: number };
    type?: string; // 'ATTRACTION' 또는 'RESTAURANT' 등
    originalPlaceId?: number; // API에서 받은 원본 ID
}

interface ApiSearchAttraction {
    attractionId: number;
    name: string;
    address: string;
    imageUrl?: string;
    // 필요에 따라 추가 필드
}

interface ApiSearchRestaurant {
    restaurantId: number;
    name: string;
    address: string;
    imageUrl?: string;
    // 필요에 따라 추가 필드
}


interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onItemSelect: (place: Place) => void;
    placeType: 'ATTRACTION' | 'RESTAURANT' | null; // 검색할 장소 유형
}

// Animations (from SearchPanel.tsx)
const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

// Styled Components (inspired by SearchPanel.tsx)
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000; 
    padding: 20px; // 모달이 화면 가장자리에 붙지 않도록
`;

const ModalContainer = styled.div<{ isClosing?: boolean }>` // Renamed from SearchContainer / ModalContent
    width: 100%;
    max-width: 500px; // SearchPanel과 유사한 크기, 혹은 조정
    height: auto; // 내용에 따라 높이 자동 조절
    max-height: calc(100vh - 100px); // 화면 높이보다 커지지 않도록
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    padding: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden; // 내부 스크롤을 위해
    border: 1px solid #f0f0f0;
    animation: ${fadeIn} 0.3s ease-out forwards; // fadeIn 애니메이션 적용
`;

const SearchTitle = styled.strong`
    display: block;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    padding: 15px 0;
    margin-bottom: 10px;
    color: #2c3e50;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #e0e0e0; // SearchPanel과 약간 다르게 단순화
`;

const SearchForm = styled.div`
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    align-items: center;
    margin-top: 10px;
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    font-size: 15px;
    outline: none;
    transition: all 0.3s;
    box-sizing: border-box;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    
    &:focus {
        border-color: #3498db;
        box-shadow: 0 4px 8px rgba(52, 152, 219, 0.1);
    }
`;

const SearchButton = styled.button`
    padding: 12px 20px;
    background: #3498db;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
    box-shadow: 0 4px 8px rgba(52, 152, 219, 0.2);
    
    &:hover {
        background: #2980b9;
        box-shadow: 0 6px 12px rgba(52, 152, 219, 0.3);
    }
    &:disabled {
        background-color: #bdc3c7;
        box-shadow: none;
    }
`;

const SearchResultsList = styled.div` // Renamed from SearchResults
    flex: 1;
    overflow-y: auto;
    padding-right: 5px;
    margin-right: -5px; // 스크롤바 공간 확보
    scrollbar-width: thin;
    scrollbar-color: #ccc #f0f0f0;
    
    &::-webkit-scrollbar {
        width: 8px;
    }
    &::-webkit-scrollbar-track {
        background: #f0f0f0;
        border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: #aaa;
    }
`;

const SearchResultItem = styled.div` // Changed from button to div for layout flexibility
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 14px 10px; // 패딩 약간 조정
    margin: 10px 0;
    border-radius: 12px;
    font-size: 15px;
    color: #2c3e50;
    background: #ffffff;
    border: 1px solid #f0f0f0;
    transition: all 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    cursor: pointer;
    text-align: left;
    
    &:hover {
        background: #fafafa;
        border-color: #e8e8e8;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04);
    }
`;

const PlaceImage = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 8px;
    overflow: hidden;
    margin-right: 16px;
    flex-shrink: 0;
    background-color: #f4f4f4;
`;

const Image = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const PlaceInfo = styled.div`
    flex: 1;
`;

const PlaceName = styled.div`
    font-weight: 600;
    margin-bottom: 6px;
    color: #2c3e50;
`;

const PlaceAddress = styled.div`
    font-size: 13px;
    color: #7f8c8d;
`;

// SelectButton (SearchPanel의 AddButton 역할)
const SelectButton = styled.button` 
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    background: #f0f0f0;
    color: #333;
    border: 1px solid #dddddd;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    margin-left: 12px;
    
    &:hover {
        background: #3498db;
        color: #fff;
        border-color: #3498db;
        box-shadow: 0 6px 12px rgba(52, 152, 219, 0.3);
    }
`;

const MessageText = styled.p`
    text-align: center;
    color: #555;
    padding: 20px;
    font-size: 14px;
`;

const ModalCloseButton = styled.button` // 기존 SearchModal의 CloseButton 과 유사
    background: none;
    border: none;
    font-size: 24px; // 크기 약간 조정
    font-weight: 300;
    color: #aaa; // 색상 조정
    cursor: pointer;
    padding: 0;
    line-height: 1;
    position: absolute;
    top: 20px;
    right: 20px;
    
    &:hover {
        color: #333;
    }
`;

const SearchModal: React.FC<SearchModalProps> = ({
    isOpen,
    onClose,
    onItemSelect,
    placeType,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchAttempted, setSearchAttempted] = useState(false);

    const modalTitleText = placeType === 'ATTRACTION' ? '여행지 검색' : '음식점 검색';
    const searchPlaceholder = placeType === 'ATTRACTION' ? '여행지를 검색하세요' : '음식점을 검색하세요';

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setSearchResults([]);
            setIsLoading(false);
            setError(null);
            setSearchAttempted(false);
        }
    }, [isOpen]);

    const handleSearch = async () => {
        if (!searchTerm.trim() || !placeType) {
            setSearchResults([]);
            setError(null);
            setSearchAttempted(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        setSearchAttempted(true);

        let apiUrl = '';
        if (placeType === 'ATTRACTION') {
            apiUrl = `/api/trip-plans/attractions/search?keyword=${encodeURIComponent(searchTerm)}`;
        } else if (placeType === 'RESTAURANT') {
            apiUrl = `/api/trip-plans/restaurants/search?keyword=${encodeURIComponent(searchTerm)}`;
        } else {
            setError('잘못된 장소 유형입니다.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await authenticatedFetch(apiUrl);
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch { /* ignore */ }
                throw new Error(errorMsg);
            }
            const data = await response.json();

            if (data.isSuccess && data.result) {
                let formattedResults: Place[] = [];
                if (placeType === 'ATTRACTION' && Array.isArray(data.result.attractions)) {
                    formattedResults = data.result.attractions.map((item: ApiSearchAttraction): Place => ({
                        id: Date.now() + Math.random(), 
                        originalPlaceId: item.attractionId,
                        name: item.name,
                        address: item.address,
                        imageUrl: item.imageUrl || undefined,
                        type: 'ATTRACTION',
                    }));
                } else if (placeType === 'RESTAURANT' && Array.isArray(data.result.restaurants)) {
                    formattedResults = data.result.restaurants.map((item: ApiSearchRestaurant): Place => ({
                        id: Date.now() + Math.random(), 
                        originalPlaceId: item.restaurantId,
                        name: item.name,
                        address: item.address,
                        imageUrl: item.imageUrl || undefined,
                        type: 'RESTAURANT',
                    }));
                }
                setSearchResults(formattedResults);
            } else {
                setSearchResults([]);
                setError(data.message || '검색 결과를 가져오는데 실패했습니다.');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.';
            setError(errorMessage);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemClick = (place: Place) => {
        onItemSelect(place); 
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = nullPlaceImage;
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalCloseButton onClick={onClose}>&times;</ModalCloseButton>
                <SearchTitle>{modalTitleText}</SearchTitle>
                <SearchForm>
                    <SearchInput
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setSearchAttempted(false); 
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        disabled={isLoading}
                    />
                    <SearchButton onClick={handleSearch} disabled={isLoading || !searchTerm.trim()}>
                        검색
                    </SearchButton>
                </SearchForm>
                <SearchResultsList>
                    {isLoading && <MessageText>검색 중입니다...</MessageText>}
                    {error && <MessageText>오류: {error}</MessageText>}
                    {searchAttempted && !isLoading && !error && searchResults.length === 0 && searchTerm.trim() !== '' && (
                        <MessageText>검색 결과가 없습니다. 다른 키워드로 시도해 보세요.</MessageText>
                    )}
                    {!isLoading && !error && searchResults.map((place) => (
                        <SearchResultItem key={place.originalPlaceId || place.id} onClick={() => handleItemClick(place)}>
                            <PlaceImage>
                                <Image 
                                    src={place.imageUrl || nullPlaceImage} 
                                    alt={place.name} 
                                    onError={handleImageError}
                                />
                            </PlaceImage>
                            <PlaceInfo>
                                <PlaceName>{place.name}</PlaceName>
                                <PlaceAddress>{place.address}</PlaceAddress>
                            </PlaceInfo>
                            {/* SearchPanel과 유사하게 보이도록 버튼 추가. onItemSelect 호출 */}
                            <SelectButton onClick={(e) => { e.stopPropagation(); handleItemClick(place); }}>선택</SelectButton>
                        </SearchResultItem>
                    ))}
                </SearchResultsList>
            </ModalContainer>
        </ModalOverlay>
    );
};

export default SearchModal;
