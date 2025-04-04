import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ModalFrame from './ModalFrame';
import travel_img3 from '../../assets/images/travel_img3.jpg';

// 검색 입력 폼 스타일 컴포넌트
const SearchForm = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
    margin-top: 10px;
    padding: 20px;
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
    height: 400px; /* 고정된 높이 설정 */
    padding: 20px;
    scrollbar-width: thin;
    
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
        background-color: #d8d8d8;
        border-radius: 3px;
    }
`;

// 검색 결과 아이템 스타일 컴포넌트
const SearchResultItem = styled.div`
    display: flex;
    align-items: center;
    padding: 16px;
    background: #fff;
    border-radius: 12px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid #f0f0f0;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: #3498db;
    }
`;

// 검색 결과 이미지 스타일 컴포넌트
const ResultImage = styled.div<{ imageUrl?: string }>`
    width: 60px;
    height: 60px;
    min-width: 60px;
    border-radius: 8px;
    background-color: #f0f0f0;
    background-image: url(${props => props.imageUrl || travel_img3});
    background-size: cover;
    background-position: center;
    margin-right: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

// 검색 결과 정보 컨테이너 스타일 컴포넌트
const ResultInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
`;

// 장소 이름 스타일 컴포넌트
const PlaceName = styled.h3`
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
`;

// 장소 주소 스타일 컴포넌트
const PlaceAddress = styled.p`
    margin: 0;
    font-size: 14px;
    color: #7f8c8d;
`;

// 추가 버튼 스타일 컴포넌트
const AddButton = styled.button`
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
    
    &:hover {
        background: #3498db;
        color: #fff;
        border-color: #3498db;
        box-shadow: 0 6px 12px rgba(52, 152, 219, 0.3);
    }
`;

// 검색 결과 없음 컴포넌트
const NoResults = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 32px;
    text-align: center;
    color: #7f8c8d;
    background: #f9f9f9;
    border-radius: 12px;
    font-size: 15px;
    // margin: 20px 0;
`;

export interface Place {
    id: number;
    name: string;
    address: string;
    imageUrl?: string;
    coordinates?: { lat: number; lng: number };
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddPlace: (place: Place) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onAddPlace }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // 검색어 변경 핸들러
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // 검색 실행 핸들러
    const handleSearch = () => {
        if (!searchTerm.trim()) return;
        
        setIsLoading(true);
        
        // 여기서는 예시 데이터를 사용합니다
        // 실제 구현시에는 API 호출이나 데이터베이스 검색을 수행합니다
        setTimeout(() => {
            const mockResults: Place[] = [
                {
                    id: 1,
                    name: '서울 남산타워',
                    address: '서울특별시 용산구 남산공원길 105',
                    imageUrl: 'https://www.seoultower.co.kr/images/img_tower_intro.jpg',
                    coordinates: { lat: 37.551348, lng: 126.988328 }
                },
                {
                    id: 2,
                    name: '경복궁',
                    address: '서울특별시 종로구 사직로 161',
                    imageUrl: 'https://www.royalpalace.go.kr/content/images/intro/sub1_img1.jpg',
                    coordinates: { lat: 37.579617, lng: 126.977041 }
                },
                {
                    id: 3,
                    name: '명동성당',
                    address: '서울특별시 중구 명동길 74',
                    imageUrl: 'https://www.myeongdongcathedral.org/upload/main/main_img01.jpg',
                    coordinates: { lat: 37.563545, lng: 126.987607 }
                }
            ];
            
            setSearchResults(mockResults);
            setIsLoading(false);
        }, 800);
    };

    // Enter 키로 검색 실행
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 모달이 닫힐 때 상태 초기화
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setSearchResults([]);
        }
    }, [isOpen]);

    return (
        <ModalFrame
            isOpen={isOpen}
            onClose={onClose}
            title="숙소 검색"
            size="medium"
        >
            <SearchForm>
                <SearchInput
                    type="text"
                    placeholder="숙소명 또는 주소를 입력하세요"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                />
                <SearchButton onClick={handleSearch}>검색</SearchButton>
            </SearchForm>
            
            <SearchResults>
                {isLoading ? (
                    <NoResults>검색 중입니다...</NoResults>
                ) : searchResults.length > 0 ? (
                    searchResults.map(place => (
                        <SearchResultItem key={place.id}>
                            <ResultImage imageUrl={place.imageUrl} />
                            <ResultInfo>
                                <PlaceName>{place.name}</PlaceName>
                                <PlaceAddress>{place.address}</PlaceAddress>
                            </ResultInfo>
                            <AddButton onClick={() => onAddPlace(place)}>추가</AddButton>
                        </SearchResultItem>
                    ))
                ) : (
                    searchTerm && <NoResults>검색 결과가 없습니다</NoResults>
                )}
            </SearchResults>
        </ModalFrame>
    );
};

export default SearchModal;
