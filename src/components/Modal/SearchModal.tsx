import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ModalFrame from './ModalFrame';
// import travel_img3 from '../../assets/images/travel_img3.jpg'; // 더 이상 사용하지 않음

// 검색 입력 폼 스타일 컴포넌트
const SearchForm = styled.div`
    display: flex;
    flex-direction: column; // 입력 필드를 세로로 배치
    gap: 15px; // 입력 필드 간 간격
    align-items: stretch; // 자식 요소들이 컨테이너 너비에 맞게 늘어나도록
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
    margin-top: 15px;
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
// const SearchResults = styled.div`
//     flex: 1;
//     overflow-y: auto;
//     height: 400px; /* 고정된 높이 설정 */
//     padding: 20px;
//     scrollbar-width: thin;
//     
//     &::-webkit-scrollbar {
//         width: 6px;
//     }
//     
//     &::-webkit-scrollbar-thumb {
//         background-color: #d8d8d8;
//         border-radius: 3px;
//     }
// `;

// 검색 결과 아이템 스타일 컴포넌트
// const SearchResultItem = styled.div`
//     display: flex;
//     align-items: center;
//     padding: 16px;
//     background: #fff;
//     border-radius: 12px;
//     margin-bottom: 12px;
//     box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
//     cursor: pointer;
//     transition: all 0.3s;
//     border: 1px solid #f0f0f0;
//     
//     &:hover {
//         transform: translateY(-2px);
//         box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//         border-color: #3498db;
//     }
// `;

// 검색 결과 이미지 스타일 컴포넌트
// const ResultImage = styled.div<{ imageUrl?: string }>`
//     width: 60px;
//     height: 60px;
//     min-width: 60px;
//     border-radius: 8px;
//     background-color: #f0f0f0;
//     background-image: url(${props => props.imageUrl || travel_img3});
//     background-size: cover;
//     background-position: center;
//     margin-right: 16px;
//     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
// `;

// 검색 결과 정보 컨테이너 스타일 컴포넌트
// const ResultInfo = styled.div`
//     flex: 1;
//     display: flex;
//     flex-direction: column;
// `;

// 장소 이름 스타일 컴포넌트
// const PlaceName = styled.h3`
//     margin: 0 0 8px 0;
//     font-size: 16px;
//     font-weight: 600;
//     color: #2c3e50;
// `;

// 장소 주소 스타일 컴포넌트
// const PlaceAddress = styled.p`
//     margin: 0;
//     font-size: 14px;
//     color: #7f8c8d;
// `;

// 추가 버튼 스타일 컴포넌트
// const AddButton = styled.button`
//     display: inline-flex;
//     align-items: center;
//     justify-content: center;
//     padding: 8px 16px;
//     background: #f0f0f0;
//     color: #333;
//     border: 1px solid #dddddd;
//     border-radius: 20px;
//     font-size: 14px;
//     font-weight: 600;
//     cursor: pointer;
//     transition: all 0.3s;
//     
//     &:hover {
//         background: #3498db;
//         color: #fff;
//         border-color: #3498db;
//         box-shadow: 0 6px 12px rgba(52, 152, 219, 0.3);
//     }
// `;

// 검색 결과 없음 컴포넌트
// const NoResults = styled.div`
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     height: 100%;
//     padding: 32px;
//     text-align: center;
//     color: #7f8c8d;
//     background: #f9f9f9;
//     border-radius: 12px;
//     font-size: 15px;
//     // margin: 20px 0;
// `;

export interface Place {
    id: number;
    name: string;
    address: string;
    imageUrl?: string;
    coordinates?: { lat: number; lng: number };
    type?: string;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddPlace: (place: Place) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onAddPlace }) => {
    const [placeName, setPlaceName] = useState(''); // 숙소 이름 상태 추가
    const [placeAddress, setPlaceAddress] = useState(''); // 기존 searchTerm을 placeAddress로 변경

    // 숙소 이름 변경 핸들러
    const handlePlaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlaceName(e.target.value);
    };

    // 주소 변경 핸들러
    const handlePlaceAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlaceAddress(e.target.value);
    };

    // 장소 추가 핸들러 (기존 handleSearch에서 변경)
    const handleAddDirectPlace = () => {
        const name = placeName.trim();
        const address = placeAddress.trim();

        if (!name) {
            alert('숙소 이름을 입력해주세요.');
            return;
        }
        if (!address) {
            alert('숙소 위치 (주소)를 입력해주세요.');
            return;
        }
        
        const newPlace: Place = {
            id: Date.now(), 
            name: name, 
            address: address,
            imageUrl: undefined, 
            coordinates: { lat: 0, lng: 0 }, 
            type: '숙소', 
        };
        
        onAddPlace(newPlace); 
        onClose(); 
    };

    // Enter 키로 추가 실행 (두 입력 필드 중 하나에서 Enter를 누르면 실행되도록 할 수 있으나, 우선 버튼 클릭으로만 처리)
    // 또는 마지막 입력 필드에서 Enter 시 추가되도록 할 수 있음
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAddDirectPlace();
        }
    };

    // 모달이 닫힐 때 상태 초기화
    useEffect(() => {
        if (!isOpen) {
            setPlaceName(''); // 숙소 이름 초기화
            setPlaceAddress(''); // 주소 초기화
        }
    }, [isOpen]);

    return (
        <ModalFrame
            isOpen={isOpen}
            onClose={onClose}
            title="숙소 정보" // 모달 제목 변경
            size="medium"
        >
            <SearchForm>
                <SearchInput
                    type="text"
                    placeholder="숙소 이름을 입력하세요"
                    value={placeName}
                    onChange={handlePlaceNameChange}
                    // onKeyDown={handleKeyDown} // 필요시 Enter 키 핸들러 연결
                />
                <SearchInput
                    type="text"
                    placeholder="숙소 위치 (주소)를 입력해주세요" // 플레이스홀더 변경
                    value={placeAddress}
                    onChange={handlePlaceAddressChange}
                    onKeyDown={handleKeyDown} // 마지막 입력 필드에서 Enter시 추가
                />
                <SearchButton onClick={handleAddDirectPlace}>추가</SearchButton>
            </SearchForm>
            
            {/* 검색 결과 목록 UI 제거 */}
            {/* 
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
            */}
        </ModalFrame>
    );
};

export default SearchModal;
