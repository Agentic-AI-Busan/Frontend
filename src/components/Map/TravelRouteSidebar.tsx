import React from 'react';
import styled, { keyframes } from 'styled-components';
import { 
    getDayColor, 
    getDayLightColor, 
    getDayTextColor 
} from './MapContent';

// 애니메이션 keyframe
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

// 사이드바 컨테이너
const SidebarContainer = styled.div`
    width: 400px;
    height: calc(100vh - 60px);
    background: #ffffff;
    border-right: 1px solid #e0e0e0;
    padding: 20px;
    padding-bottom: 140px;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    z-index: 10;
    overflow-y: auto;
    scrollbar-width: thin;
    
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
        background-color: #d8d8d8;
        border-radius: 3px;
    }
`;

// 사이드바 헤더
const SidebarHeader = styled.div`
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    position: relative;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
`;

// 여행 일자 뱃지
const DayBadge = styled.div<{ day: number }>`
    background-color: ${props => getDayColor(props.day)};
    color: white;
    font-weight: 600;
    font-size: 16px;
    padding: 8px 16px;
    border-radius: 20px;
    box-shadow: 0 2px 4px rgba(52, 152, 219, 0.2);
`;

// 여행 날짜 표시
const TravelDate = styled.div`
    font-size: 15px;
    color: #7f8c8d;
    font-weight: 500;
`;

// 요약 정보 컨테이너
const SummaryContainer = styled.div`
    background: #f5f9fc;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
`;

// 요약 정보 제목
const SummaryTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #34495e;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    
    &:before {
        content: "📊";
        margin-right: 8px;
    }
`;

// 요약 정보 항목 컨테이너
const SummaryItems = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
`;

// 요약 정보 항목
const SummaryItem = styled.div`
    display: flex;
    flex-direction: column;
    background: white;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

// 항목 레이블
const ItemLabel = styled.span`
    font-size: 12px;
    color: #7f8c8d;
    margin-bottom: 5px;
`;

// 항목 값
const ItemValue = styled.span`
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
`;

// 일차 컨테이너
const DayContainer = styled.div`
    margin-bottom: 20px;
    background: #f9f9f9;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    animation: ${fadeIn} 0.4s ease-out forwards;
`;

// 장소 섹션 제목
const PlacesSectionTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #34495e;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    
    &:before {
        content: "📍";
        margin-right: 8px;
    }
`;

// 장소 리스트
const PlacesList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

// 장소 항목
const PlaceItem = styled.li<{ day: number }>`
    margin: 12px 0;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    font-size: 14px;
    display: flex;
    flex-direction: row;
    transition: all 0.2s;
    overflow: hidden;
    position: relative;
    
    &:hover {
        transform: translateX(3px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 4px;
        background: ${props => getDayColor(props.day)};
        border-radius: 10px 0 0 10px;
    }
`;

// 장소 이미지
const PlaceImage = styled.div<{ imageUrl: string }>`
    width: 80px;
    min-width: 80px;
    height: 80px;
    background-image: url(${props => props.imageUrl});
    background-size: cover;
    background-position: center;
`;

// 장소 정보 컨테이너 (이미지 옆 내용)
const PlaceContent = styled.div`
    padding: 12px 15px;
    flex: 1;
`;

// 장소 상단 정보 컨테이너
const PlaceTopInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
`;

// 장소 이름
const PlaceName = styled.span`
    font-weight: 600;
    color: #2c3e50;
    font-size: 15px;
`;

// 장소 시간
const PlaceTime = styled.span`
    font-size: 12px;
    color: #7f8c8d;
    font-weight: 500;
`;

// 장소 추가 정보 컨테이너
const PlaceDetails = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

// 장소 영업시간
const PlaceHours = styled.div`
    display: flex;
    align-items: center;
    
    &:before {
        content: "⏰";
        margin-right: 5px;
        font-size: 11px;
    }
`;

// 장소 위치
const PlaceLocation = styled.div`
    display: flex;
    align-items: center;
    
    &:before {
        content: "📍";
        margin-right: 5px;
        font-size: 11px;
    }
`;

// 경로 선 (장소 사이 연결 표시)
const RouteLine = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 10px 0;
`;

const RouteLineBar = styled.div<{ day: number }>`
    width: 3px;
    height: 40px;
    background: ${props => getDayColor(props.day)};
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        bottom: -3px;
        left: -3px;
        width: 9px;
        height: 9px;
        background: ${props => getDayColor(props.day)};
        border-radius: 50%;
    }
`;

// 첫 번째 선의 바(위쪽 점이 있는 선)
const RouteLineBarFirst = styled(RouteLineBar)``;

// 두 번째 선의 바(점이 없는 선)
const RouteLineBarSecond = styled(RouteLineBar)`
    &::after {
        display: none;
    }
`;

const RouteDistance = styled.div<{ day: number }>`
    position: absolute;
    right: 55%;
    top: 50%;
    transform: translateY(-60%);
    background: ${props => getDayLightColor(props.day)};
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 11px;
    color: ${props => getDayTextColor(props.day)};
    font-weight: 500;
    box-shadow: 0 1px 2px rgba(52, 152, 219, 0.2);
    text-align: right;
`;

const RouteDuration = styled.div<{ day: number }>`
    position: absolute;
    left: 55%;
    top: 50%;
    transform: translateY(-60%);
    background: ${props => getDayLightColor(props.day)};
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 11px;
    color: ${props => getDayTextColor(props.day)};
    font-weight: 500;
    box-shadow: 0 1px 2px rgba(52, 152, 219, 0.2);
    text-align: left;
`;

// 하단 버튼 컨테이너
const ActionButtonsContainer = styled.div`
    margin-top: 20px;
    margin-bottom: 50px;
    display: flex;
    justify-content: center;
    gap: 10px;
`;

// 액션 버튼
const ActionButton = styled.button`
    background: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        background: #2980b9;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
    }
    
    &:active {
        transform: translateY(0);
    }
    
    &:before {
        margin-right: 8px;
    }
`;

// 최적화 버튼
const OptimizeButton = styled(ActionButton)`
    background: #2ecc71;
    
    &:hover {
        background: #27ae60;
        box-shadow: 0 4px 8px rgba(46, 204, 113, 0.3);
    }
    
    &:before {
        content: "⚡";
    }
`;

// 공유 버튼
const ShareButton = styled(ActionButton)`
    background: #f39c12;
    
    &:hover {
        background: #e67e22;
        box-shadow: 0 4px 8px rgba(243, 156, 18, 0.3);
    }
    
    &:before {
        content: "🔗";
    }
`;

// 인터페이스 정의
interface Place {
    id: number;
    title: string;
    time: string;
    hours?: string;
    location?: string;
    imageUrl?: string;
}

interface RouteConnection {
    distance: string;
    duration: string;
}

interface RouteDay {
    day: number;
    date: string;
    weather: {
        condition: string;
        icon: string;
        temperature: string;
    };
    places: Place[];
    routes?: RouteConnection[];
    summary?: {
        totalDistance?: string;
        totalTime?: string;
        startTime?: string;
        endTime?: string;
    };
}

interface TravelRouteSidebarProps {
    routes: RouteDay[];
    activeDay: number;
    onOptimizeRoute?: () => void;
    onShareRoute?: () => void;
    onPlaceHover?: (placeId: number) => void;
}

const TravelRouteSidebar: React.FC<TravelRouteSidebarProps> = ({ 
    routes, 
    activeDay,
    onOptimizeRoute,
    onShareRoute,
    onPlaceHover
}) => {
    // 선택된 일차에 해당하는 데이터 찾기
    const selectedDayData = routes.find(day => day.day === activeDay) || routes[0];
    
    // 기본 이미지 URL
    const defaultImageUrl = "/travel_img1.jpg";
    
    // 선택된 날의 첫 장소와 마지막 장소 시간 (summary 없을 경우)
    const firstPlaceTime = selectedDayData.places[0]?.time || "";
    const lastPlaceTime = selectedDayData.places[selectedDayData.places.length - 1]?.time || "";
    
    // 요약 정보
    const summary = selectedDayData.summary || {
        totalDistance: "12.5km",
        totalTime: "2시간 30분",
        startTime: firstPlaceTime, 
        endTime: lastPlaceTime
    };
    
    return (
        <SidebarContainer>
            <SidebarHeader>
                <DayBadge day={activeDay}>Day {activeDay}</DayBadge>
                <TravelDate>{selectedDayData.date}</TravelDate>
            </SidebarHeader>
            
            <SummaryContainer>
                <SummaryTitle>일정 요약</SummaryTitle>
                <SummaryItems>
                    <SummaryItem>
                        <ItemLabel>총 이동 거리</ItemLabel>
                        <ItemValue>{summary.totalDistance}</ItemValue>
                    </SummaryItem>
                    <SummaryItem>
                        <ItemLabel>총 소요 시간</ItemLabel>
                        <ItemValue>{summary.totalTime}</ItemValue>
                    </SummaryItem>
                    <SummaryItem>
                        <ItemLabel>시작 시간</ItemLabel>
                        <ItemValue>{summary.startTime}</ItemValue>
                    </SummaryItem>
                    <SummaryItem>
                        <ItemLabel>종료 시간</ItemLabel>
                        <ItemValue>{summary.endTime}</ItemValue>
                    </SummaryItem>
                </SummaryItems>
            </SummaryContainer>
            
            <DayContainer>
                <PlacesSectionTitle>방문 장소 ({selectedDayData.places.length})</PlacesSectionTitle>
                <PlacesList>
                    {selectedDayData.places.map((place, index) => (
                        <React.Fragment key={place.id}>
                            <PlaceItem 
                                day={activeDay}
                                onMouseEnter={() => onPlaceHover?.(place.id)}
                                onMouseLeave={() => onPlaceHover?.(0)}
                            >
                                <PlaceImage imageUrl={place.imageUrl || defaultImageUrl} />
                                <PlaceContent>
                                    <PlaceTopInfo>
                                        <PlaceName>{place.title}</PlaceName>
                                        <PlaceTime>{place.time}</PlaceTime>
                                    </PlaceTopInfo>
                                    <PlaceDetails>
                                        {place.hours && <PlaceHours>{place.hours}</PlaceHours>}
                                        {place.location && <PlaceLocation>{place.location}</PlaceLocation>}
                                    </PlaceDetails>
                                </PlaceContent>
                            </PlaceItem>
                            {index !== selectedDayData.places.length - 1 && (
                                <RouteLine>
                                    <RouteLineBarFirst day={activeDay} />
                                    {selectedDayData.routes && selectedDayData.routes[index] && (
                                        <>
                                            <RouteDuration day={activeDay}>⏱️ {selectedDayData.routes[index].duration}</RouteDuration>
                                            <RouteDistance day={activeDay}>🚗 {selectedDayData.routes[index].distance}</RouteDistance>
                                        </>
                                    )}
                                    <RouteLineBarSecond day={activeDay} />
                                </RouteLine>
                            )}
                        </React.Fragment>
                    ))}
                </PlacesList>
            </DayContainer>
            
            <ActionButtonsContainer>
                <OptimizeButton onClick={onOptimizeRoute}>경로 최적화</OptimizeButton>
                <ShareButton onClick={onShareRoute}>일정 공유</ShareButton>
            </ActionButtonsContainer>
        </SidebarContainer>
    );
};

export default TravelRouteSidebar; 