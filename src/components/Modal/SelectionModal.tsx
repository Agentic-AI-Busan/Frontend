import React from 'react';
import styled from 'styled-components';
import ModalFrame from './ModalFrame';
import SimpleMapContent from '../Map/SimpleMapContent';
import nullPlaceImage from '../../assets/images/null_place.png'; // null_place.png 이미지 임포트
// import img_3 from '../../assets/images/travel_img3.jpg'

interface TravelItem {
    attractionId?: number;
    restaurantId?: number;
    imageUrl: string;
    name: string;
    title: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    operatingHours?: string;
    phoneNumber?: string;
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
    overflow: hidden;
    background-color: white;
`;

// 지도 컨테이너
const MapContainer = styled.div`
    width: 40%;
    position: relative;
    overflow: hidden;
    display: flex;
    min-height: 500px;
    padding: 30px 0 30px 30px;
    box-sizing: border-box;
`;

// 정보 컨테이너 (오른쪽)
const InfoContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 30px 30px 30px 10px;
    margin-left: 10px;
`;

// 이미지 헤더 컨테이너
const ImageHeaderContainer = styled.div`
    position: relative;
    margin-bottom: 20px;
    width: 100%;
    height: 220px;
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
    flex-grow: 1;
`;

// 섹션 제목
const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 5px;
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

// 운영시간 아이콘 컨테이너
const TimeIconContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    color: #555;
    
    svg {
        min-width: 16px;
        margin-right: 8px;
        color: #3498db;
    }
`;

// 운영시간 텍스트
const OperatingHoursText = styled.span`
    font-size: 15px;
    color: #444;
    line-height: 1.5;
`;

// 액션 영역
const ActionSection = styled.div`
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 15px;
    padding-top: 15px;
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
    const getItemId = (): number => {
        if (selectedTravelItem?.attractionId) return selectedTravelItem.attractionId;
        if (selectedTravelItem?.restaurantId) return selectedTravelItem.restaurantId;
        return 0; // 기본값
    };

    const mapPlaces = selectedTravelItem
        ? [{
            id: getItemId(),
            name: selectedTravelItem.name,
            lat: selectedTravelItem.latitude || defaultCoordinates.lat,
            lng: selectedTravelItem.longitude || defaultCoordinates.lng,
            location: selectedTravelItem.address || '부산 해운대',
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
                            center={{
                                lat: selectedTravelItem.latitude || defaultCoordinates.lat,
                                lng: selectedTravelItem.longitude || defaultCoordinates.lng
                            }}
                            zoom={15}
                            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                        />
                    </MapContainer>

                    {/* 오른쪽 정보 영역 */}
                    <InfoContainer>
                        <ImageHeaderContainer>
                            {/* <ModalImage src={selectedTravelItem.image} alt={selectedTravelItem.title} /> */}
                            <ModalImage 
                                src={selectedTravelItem.imageUrl} 
                                alt={selectedTravelItem.name} 
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null; // 무한 루프 방지
                                    target.src = nullPlaceImage; // 실패 시 대체 이미지
                                }}
                            />
                            <ImageOverlay>
                                <ModalTitle>{selectedTravelItem.name}</ModalTitle>
                                <ModalLocation>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                                    </svg>
                                    {selectedTravelItem.address || ((selectedTravelItem.latitude && selectedTravelItem.longitude) ? "" : "부산 해운대 (기본 위치)")}
                                </ModalLocation>
                            </ImageOverlay>
                        </ImageHeaderContainer>
                        
                        <ModalBody>
                            <InfoSection>
                                <SectionTitle>운영시간</SectionTitle>
                                <TimeIconContainer>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C6.486 2 2 6.486 2 12C2 17.514 6.486 22 12 22C17.514 22 22 17.514 22 12C22 6.486 17.514 2 12 2ZM12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12C20 16.411 16.411 20 12 20Z" fill="currentColor"/>
                                        <path d="M13 7H11V12.414L14.293 15.707L15.707 14.293L13 11.586V7Z" fill="currentColor"/>
                                    </svg>
                                    <OperatingHoursText>
                                        {selectedTravelItem.operatingHours || "정보 없음"}
                                    </OperatingHoursText>
                                </TimeIconContainer>
                            </InfoSection>

                            <InfoSection>
                                <SectionTitle>상세 정보</SectionTitle>
                                <ModalDescription>{selectedTravelItem.title}</ModalDescription>
                            </InfoSection>
                            
                            <ActionSection>
                                <CancelButton onClick={onClose}>취소하기</CancelButton>
                                <ModalButton onClick={onSelect}>추가하기</ModalButton>
                            </ActionSection>
                        </ModalBody>
                    </InfoContainer>
                </ModalContent>
            )}
        </ModalFrame>
    );
};

export default SelectionModal;
