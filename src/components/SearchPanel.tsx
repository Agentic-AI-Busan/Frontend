import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import travel_img3 from '../assets/images/travel_img3.jpg';
import SelectionModal from './Modal/SelectionModal';

// 애니메이션 keyframe 정의
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

const fadeOut = keyframes`
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(10px);
    }
`;

// 슬라이드 인 애니메이션 수정
const slideInLeft = keyframes`
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
`;

const slideInRight = keyframes`
    from {
        opacity: 0;
        transform: translateX(30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
`;

// 슬라이드 아웃 애니메이션 수정
const slideOutLeft = keyframes`
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(-30px);
    }
`;

const slideOutRight = keyframes`
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(30px);
    }
`;

// 검색 컨테이너 스타일 컴포넌트
const SearchContainer = styled.div<{ isClosing?: boolean }>`
    width: 100%;
    max-width: 400px;
    height: calc(100vh - 150px);
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    padding: 20px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    position: relative;
    z-index: 1000;
    border: 1px solid #f0f0f0;
    margin: 20px 0;
    
    @media (max-width: 992px) {
        width: 90%;
        max-width: none;
        height: auto;
        min-height: 350px;
        margin: 10px auto;
    }
`;

// 여행지 검색 컨테이너 위치 조정
const TravelSearchContainer = styled(SearchContainer)<{ isClosing?: boolean }>`
    margin-right: 0;
    animation: ${props => props.isClosing ? slideOutLeft : slideInLeft} 0.4s ease-out forwards;
    
    @media (max-width: 992px) {
        margin-right: 0;
        margin-bottom: 20px;
        animation: ${props => props.isClosing ? fadeOut : fadeIn} 0.4s ease-out forwards;
    }
`;

// 음식점 검색 컨테이너 위치 조정
const RestaurantSearchContainer = styled(SearchContainer)<{ isClosing?: boolean }>`
    margin-left: 0;
    animation: ${props => props.isClosing ? slideOutRight : slideInRight} 0.4s ease-out forwards;
    
    @media (max-width: 992px) {
        margin-left: 0;
        margin-top: 20px;
        animation: ${props => props.isClosing ? fadeOut : fadeIn} 0.4s ease-out forwards;
    }
`;

// 검색 제목 스타일 컴포넌트
const SearchTitle = styled.strong`
    display: block;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    padding: 15px 0;
    margin-bottom: 10px;
    color: #2c3e50;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #3498db;
`;

// 검색 입력 폼 스타일 컴포넌트
const SearchForm = styled.div`
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    align-items: center;
    margin-top: 10px;
`;

// 검색 입력창 스타일 컴포넌트
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

// 검색 버튼 스타일 컴포넌트
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
`;

// 검색 결과 컨테이너 스타일 컴포넌트
const SearchResults = styled.div`
    flex: 1;
    overflow-y: auto;
    padding-right: 5px;
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
        display: none;
    }
`;

// 검색 결과 아이템 스타일 컴포넌트
const SearchResultItem = styled.button`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 14px 16px;
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

// 장소 이미지 스타일 컴포넌트
const PlaceImage = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 8px;
    overflow: hidden;
    margin-right: 16px;
    flex-shrink: 0;
    background-color: #f4f4f4;
`;

// 이미지 스타일 컴포넌트
const Image = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

// 장소 정보 스타일 컴포넌트
const PlaceInfo = styled.div`
    flex: 1;
`;

// 장소 이름 스타일 컴포넌트
const PlaceName = styled.div`
    font-weight: 600;
    margin-bottom: 6px;
    color: #2c3e50;
`;

// 장소 주소 스타일 컴포넌트
const PlaceAddress = styled.div`
    font-size: 13px;
    color: #7f8c8d;
`;

// 추가 버튼 스타일 컴포넌트
const AddButton = styled.button<{ isComplete?: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    background: ${props => props.isComplete ? '#e0e0e0' : '#f0f0f0'};
    color: ${props => props.isComplete ? '#999' : '#333'};
    border: 1px solid ${props => props.isComplete ? '#d0d0d0' : '#dddddd'};
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: ${props => props.isComplete ? 'not-allowed' : 'pointer'};
    transition: all 0.3s;
    margin-left: 12px;
    
    &:hover {
        background: ${props => props.isComplete ? '#e0e0e0' : '#3498db'};
        color: ${props => props.isComplete ? '#999' : '#fff'};
        border-color: ${props => props.isComplete ? '#d0d0d0' : '#3498db'};
        box-shadow: ${props => props.isComplete
            ? '0 2px 4px rgba(0, 0, 0, 0.05)'
            : '0 6px 12px rgba(52, 152, 219, 0.3)'};
    }
`;

interface SearchPanelProps {
    type: 'travel' | 'restaurant';
    isClosing: boolean;
    isComplete: boolean;
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearch: () => void;
    searchResults: { id: number; name: string; address: string; imageUrl?: string; coordinates?: { lat: number; lng: number } }[];
    onAddPlace: (place: { id: number; name: string }) => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({
    type,
    isClosing,
    isComplete,
    searchTerm,
    onSearchChange,
    onSearch,
    searchResults,
    onAddPlace
}) => {
    const Container = type === 'travel' ? TravelSearchContainer : RestaurantSearchContainer;
    const title = type === 'travel' ? '여행지 검색' : '음식점 검색';
    const placeholder = type === 'travel' ? '여행지를 검색하세요' : '음식점을 검색하세요';
    
    // 모달 상태 관리
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<null | {
        id: number;
        title: string;
        image: string;
        description: string;
        location?: string;
        coordinates?: { lat: number; lng: number }
    }>(null);
    
    // 기본 이미지 URL
    const defaultImage = travel_img3;
    
    // 장소 선택 처리
    const handlePlaceClick = (place: { 
        id: number; 
        name: string; 
        address: string; 
        imageUrl?: string; 
        coordinates?: { lat: number; lng: number } 
    }) => {
        setSelectedPlace({
            id: place.id,
            title: place.name,
            image: place.imageUrl || defaultImage,
            description: `${place.name}는 ${place.address}에 위치한 ${type === 'travel' ? '관광지' : '음식점'}입니다.`,
            location: place.address,
            coordinates: place.coordinates
        });
        setIsModalOpen(true);
    };
    
    // 모달에서 장소 선택 시 처리
    const handleSelectPlace = () => {
        if (selectedPlace) {
            onAddPlace({ id: selectedPlace.id, name: selectedPlace.title });
        }
        setIsModalOpen(false);
    };

    return (
        <>
            <Container isClosing={isClosing}>
                <SearchTitle>{title}</SearchTitle>
                <SearchForm>
                    <SearchInput 
                        type="text" 
                        placeholder={placeholder} 
                        value={searchTerm}
                        onChange={onSearchChange}
                        onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                    />
                    <SearchButton onClick={onSearch}>검색</SearchButton>
                </SearchForm>
                <SearchResults>
                    {searchResults.map(place => (
                        <SearchResultItem 
                            key={place.id} 
                            onClick={() => handlePlaceClick(place)} 
                            type="button"
                        >
                            <PlaceImage>
                                <Image src={place.imageUrl || defaultImage} alt={place.name} />
                            </PlaceImage>
                            <PlaceInfo>
                                <PlaceName>{place.name}</PlaceName>
                                <PlaceAddress>{place.address}</PlaceAddress>
                            </PlaceInfo>
                            <AddButton onClick={(e) => {
                                e.stopPropagation();
                                onAddPlace(place);
                            }} isComplete={isComplete}>선택</AddButton>
                        </SearchResultItem>
                    ))}
                </SearchResults>
            </Container>
            
            {/* 선택한 장소 정보 모달 */}
            <SelectionModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedTravelItem={selectedPlace}
                onSelect={handleSelectPlace}
            />
        </>
    );
};

export default SearchPanel; 