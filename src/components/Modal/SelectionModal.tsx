import React from 'react';
import styled from 'styled-components';
import ModalFrame from './ModalFrame';
import SimpleMapContent from '../Map/SimpleMapContent';

interface TravelItem {
    id: number;
    image: string;
    title: string;
    description: string;
    location?: string;
    coordinates?: { lat: number; lng: number };
}

interface SelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTravelItem: TravelItem | null;
    onSelect: () => void;
}

// 모달 컨텐츠 스타일 컴포넌트 - 가로 레이아웃으로 변경
const ModalContent = styled.div`
    display: flex;
    flex-direction: row;
    height: 100%;
    max-height: 90vh;
    overflow: hidden;
    padding: 2rem;
`;

// 지도 컨테이너
const MapContainer = styled.div`
    width: 40%;
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    height: 460px;
    margin-right: 20px;
    // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

// 정보 컨테이너 (오른쪽)
const InfoContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
`;

// 이미지 헤더 컨테이너
const ImageHeaderContainer = styled.div`
    position: relative;
    margin-bottom: 10px;
    width: 100%;
    height: 240px;
    border-radius: 16px;
    overflow: hidden;
`;

// 모달 이미지 스타일 컴포넌트
const ModalImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 16px;
`;

// 이미지 오버레이
const ImageOverlay = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.5) 40%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0.1) 85%, rgba(0, 0, 0, 0.05) 100%);
    padding: 20px;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
`;

const ModalTitle = styled.h2`
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const ModalLocation = styled.div`
    font-size: 15px;
    display: flex;
    align-items: center;
    color: rgba(255, 255, 255, 1);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    
    svg {
        margin-right: 5px;
    }
`;

// 모달 내용 컨테이너
const ModalBody = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
`;

// 정보 섹션
const InfoSection = styled.div`
    margin-bottom: 20px;
    flex-grow: 1;
`;

// 섹션 제목
const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 12px;
    color: #333;
    position: relative;
    display: flex;
    align-items: center;
    
    &::before {
        content: '';
        width: 4px;
        height: 18px;
        background-color: #3498db;
        border-radius: 2px;
        margin-right: 8px;
        display: inline-block;
    }
    
    &::after {
        content: none;
    }
`;

// 모달 설명 스타일 컴포넌트
const ModalDescription = styled.p`
    font-size: 15px;
    line-height: 1.7;
    color: #444;
    margin: 0;
`;

// 액션 영역
const ActionSection = styled.div`
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: auto;
    padding-top: 20px;
`;

// 모달 버튼 스타일 컴포넌트
const ModalButton = styled.button`
    padding: 10px 20px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
    font-size: 15px;
    font-weight: 500;
    transition: all 0.3s;
    background-color: #3498db;
    color: white;
    box-shadow: 0 3px 10px rgba(52, 152, 219, 0.3);
    
    &:hover {
        background-color: #3498db;
        box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
        transform: translateY(-2px);
    }
`;

// 취소 버튼 스타일 컴포넌트
const CancelButton = styled.button`
    padding: 10px 20px;
    border-radius: 20px;
    border: 1px solid #e0e0e0;
    cursor: pointer;
    font-size: 15px;
    font-weight: 500;
    transition: all 0.3s;
    background-color: #ffffff;
    color: #666;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    z-index: 10;
    
    &:hover {
        background-color: #f8f9fa;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
    }
`;

const SelectionModal: React.FC<SelectionModalProps> = ({
    isOpen,
    onClose,
    selectedTravelItem,
    onSelect
}) => {
    // 부산 대표 좌표 (기본값으로 사용)
    const defaultCoordinates = { lat: 35.1796, lng: 129.0756 }; // 부산 해운대 좌표
    
    // 간단한 지도 표시용 장소 데이터 생성 (SimpleNaverMap용)
    const mapPlaces = selectedTravelItem
        ? [{
            id: selectedTravelItem.id,
            name: selectedTravelItem.title,
            lat: selectedTravelItem.coordinates?.lat || defaultCoordinates.lat,
            lng: selectedTravelItem.coordinates?.lng || defaultCoordinates.lng,
            location: selectedTravelItem.location || '부산 해운대',
        }]
        : [];

    return (
        <ModalFrame
            isOpen={isOpen}
            onClose={onClose}
            title=""
            size='large'
        >
            {selectedTravelItem && (
                <ModalContent>
                    {/* 왼쪽 지도 영역 */}
                    <MapContainer>
                        <SimpleMapContent 
                            places={mapPlaces}
                            center={selectedTravelItem.coordinates || defaultCoordinates}
                            zoom={15}
                        />
                    </MapContainer>

                    {/* 오른쪽 정보 영역 */}
                    <InfoContainer>
                        <ImageHeaderContainer>
                            <ModalImage src={selectedTravelItem.image} alt={selectedTravelItem.title} />
                            <ImageOverlay>
                                <ModalTitle>{selectedTravelItem.title}</ModalTitle>
                                <ModalLocation>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                                    </svg>
                                    {selectedTravelItem.location || (selectedTravelItem.coordinates ? "" : "부산 해운대 (기본 위치)")}
                                </ModalLocation>
                            </ImageOverlay>
                        </ImageHeaderContainer>
                        
                        <ModalBody>
                            <InfoSection>
                                <SectionTitle>상세 정보</SectionTitle>
                                <ModalDescription>{selectedTravelItem.description}</ModalDescription>
                            </InfoSection>
                            
                            <ActionSection>
                                <CancelButton onClick={onClose}>취소하기</CancelButton>
                                <ModalButton onClick={onSelect}>선택하기</ModalButton>
                            </ActionSection>
                        </ModalBody>
                    </InfoContainer>
                </ModalContent>
            )}
        </ModalFrame>
    );
};

export default SelectionModal;
