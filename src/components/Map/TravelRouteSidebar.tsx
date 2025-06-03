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
    width: 410px;
    height: calc(100vh - 40px);
    background: #ffffff;
    border-right: 1px solid #e0e0e0;
    padding: 20px;
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
    box-shadow: 0 2px 4px ${props => `${getDayColor(props.day)}33`};
`;

// 여행 날짜 표시
const TravelDate = styled.div`
    font-size: 16px;
    color: #7f8c8d;
    font-weight: 600;
`;

// 요약 정보 컨테이너
const SummaryContainer = styled.div`
    background: #f9f9f9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 20px;
    width: 100%;
    position: relative;
    overflow: visible;
    box-sizing: border-box;
`;

// 요약 정보 제목
const SummaryTitle = styled.div<{ day?: number }>`
    font-size: 14px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 12px;
    
    &:before {
        content: "📊";
        margin-right: 8px;
        font-size: 16px;
    }
    
    &:after {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 18px;
        background: ${props => getDayColor(props.day || 1)};
        border-radius: 2px;
    }
`;

// 요약 정보 항목 컨테이너
const SummaryItems = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    position: relative;
    z-index: 1;
`;

// 요약 정보 항목
const SummaryItem = styled.div<{ day?: number }>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #ffffff;
    padding: 14px 15px;
    border-radius: 10px;
    transition: all 0.2s ease;
    min-height: 65px;
    position: relative;
    
    &:hover {
        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
        transform: translateY(-2px);
    }
    
    &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 3px;
        background: ${props => getDayColor(props.day || 1)};
        left: 0;
        top: 0;
        border-radius: 10px 10px 0 0;
        opacity: 0.7;
    }
`;

// 항목 레이블
const ItemLabel = styled.span`
    font-size: 12px;
    color: #95a5a6;
    margin-bottom: 4px;
    font-weight: 500;
    display: flex;
    align-items: center;
`;

// 항목 값
const ItemValue = styled.span`
    font-size: 15px;
    font-weight: 600;
    color: #34495e;
    letter-spacing: -0.3px;
`;

// 일차 컨테이너
const DayContainer = styled.div`
    margin-bottom: 10px;
    background: #f9f9f9;
    border-radius: 12px;
    padding: 15px;
    width: 100%;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    animation: ${fadeIn} 0.4s ease-out forwards;
    box-sizing: border-box;
`;

// 장소 섹션 제목
const PlacesSectionTitle = styled.div<{ day?: number }>`
    font-size: 14px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 12px;
    
    &:before {
        content: "📍";
        margin-right: 8px;
        font-size: 16px;
    }
    
    &:after {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 18px;
        background: ${props => getDayColor(props.day || 1)};
        border-radius: 2px;
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
    margin: 8px 0;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    font-size: 14px;
    display: flex;
    flex-direction: row;
    align-items: center;
    transition: all 0.2s;
    overflow: hidden;
    position: relative;
    padding: 5px 10px;
    min-height: 80px;
    
    &:hover {
        transform: translateX(3px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
`;

// 방문 순서 배지
const PlaceOrderBadge = styled.div<{ day: number }>`
    position: absolute;
    top: 12px;
    right: 12px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${props => getDayColor(props.day)};
    color: white;
    font-size: 12px;
    font-weight: 700;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 2;
`;

// 장소 이미지
const PlaceImage = styled.div<{ imageUrl: string, day: number }>`
    width: 70px;
    min-width: 70px;
    height: 70px;
    padding: 0;
    margin: 5px 5px 5px 0;
    background-image: url(${props => props.imageUrl});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: center;
`;

// 장소 정보 컨테이너 (이미지 옆 내용)
const PlaceContent = styled.div`
    padding: 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 80px;
    box-sizing: border-box;
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
        content: "🕒";
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
    margin: 0;
`;

const RouteLineBar = styled.div<{ day: number }>`
    width: 3px;
    height: 30px;
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
    transform: translateY(-50%);
    background: ${props => getDayLightColor(props.day)};
    border-radius: 4px;
    border: 1px solid ${props => getDayColor(props.day)};
    padding: 4px 8px;
    font-size: 11px;
    color: ${props => getDayTextColor(props.day)};
    font-weight: 500;
    text-align: right;
`;

const RouteDuration = styled.div<{ day: number }>`
    position: absolute;
    left: 55%;
    top: 50%;
    transform: translateY(-50%);
    background: ${props => getDayLightColor(props.day)};
    border-radius: 4px;
    border: 1px solid ${props => getDayColor(props.day)};
    padding: 4px 8px;
    font-size: 11px;
    color: ${props => getDayTextColor(props.day)};
    font-weight: 500;
    text-align: left;
`;

// 인터페이스 정의
interface Place {
    id: number;
    title: string;
    hours?: string;
    time?: string;
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
    onPlaceHover?: (placeId: number) => void;
    preferredStartTime?: string;
    preferredEndTime?: string;
}

// 날씨 상태에 따른 이모지를 반환하는 함수
const getWeatherEmoji = (condition: string): string => {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('맑음') || lowerCondition.includes('sunny')) {
        return '☀️';
    } else if (lowerCondition.includes('구름') || lowerCondition.includes('cloudy')) {
        return '☁️';
    } else if (lowerCondition.includes('흐림') || lowerCondition.includes('overcast')) {
        return '🌥️';
    } else if (lowerCondition.includes('비') || lowerCondition.includes('rain')) {
        return '🌧️';
    } else if (lowerCondition.includes('눈') || lowerCondition.includes('snow')) {
        return '❄️';
    } else if (lowerCondition.includes('안개') || lowerCondition.includes('fog')) {
        return '🌫️';
    } else if (lowerCondition.includes('천둥') || lowerCondition.includes('번개') || lowerCondition.includes('thunder')) {
        return '⚡';
    } else {
        return '🌡️'; // 기본 날씨 이모지
    }
};

const TravelRouteSidebar: React.FC<TravelRouteSidebarProps> = ({ 
    routes, 
    activeDay,
    onPlaceHover,
    preferredStartTime,
    preferredEndTime
}) => {
    // 선택된 일차에 해당하는 데이터 찾기
    const selectedDayData = routes.find(day => day.day === activeDay) || routes[0];
    
    // 기본 이미지 URL
    const defaultImageUrl = "/travel_img1.jpg";
    
    // 선택된 날의 첫 장소와 마지막 장소 시간 (summary 없을 경우)
    const firstPlaceTime = selectedDayData.places[0]?.time || "";
    const lastPlaceTime = selectedDayData.places[selectedDayData.places.length - 1]?.time || "";
    
    // 요약 정보
    const summary = {
        totalDistance: selectedDayData.summary?.totalDistance || "정보 없음",
        totalTime: selectedDayData.summary?.totalTime || "정보 없음",
        startTime: preferredStartTime || selectedDayData.summary?.startTime || firstPlaceTime, 
        endTime: preferredEndTime || selectedDayData.summary?.endTime || lastPlaceTime
    };
    
    // 날씨 이모지 가져오기
    const weatherEmoji = getWeatherEmoji(selectedDayData.weather.condition);
    
    return (
        <SidebarContainer>
            <SidebarHeader>
                <DayBadge day={activeDay}>Day {activeDay}</DayBadge>
                <TravelDate>{selectedDayData.date}</TravelDate>
            </SidebarHeader>
            
            <SummaryContainer>
                <SummaryTitle day={activeDay}>일정 요약</SummaryTitle>
                <SummaryItems>
                    <SummaryItem day={activeDay}>
                        <ItemLabel>총 이동 거리</ItemLabel>
                        <ItemValue>{summary.totalDistance}</ItemValue>
                    </SummaryItem>
                    <SummaryItem day={activeDay}>
                        <ItemLabel>총 소요 시간</ItemLabel>
                        <ItemValue>{summary.totalTime}</ItemValue>
                    </SummaryItem>
                    <SummaryItem day={activeDay}>
                        <ItemLabel>날씨</ItemLabel>
                        <ItemValue>{weatherEmoji} {selectedDayData.weather.temperature} </ItemValue>
                    </SummaryItem>
                    <SummaryItem day={activeDay}>
                        <ItemLabel>방문 장소</ItemLabel>
                        <ItemValue>{selectedDayData.places.length} Places</ItemValue>
                    </SummaryItem>
                    <SummaryItem day={activeDay}>
                        <ItemLabel>시작 시간</ItemLabel>
                        <ItemValue>{summary.startTime}</ItemValue>
                    </SummaryItem>
                    <SummaryItem day={activeDay}>
                        <ItemLabel>종료 시간</ItemLabel>
                        <ItemValue>{summary.endTime}</ItemValue>
                    </SummaryItem>
                </SummaryItems>
            </SummaryContainer>
            
            <DayContainer>
                <PlacesSectionTitle day={activeDay}>방문 장소 </PlacesSectionTitle>
                <PlacesList>
                    {selectedDayData.places.map((place, index) => (
                        <React.Fragment key={place.id}>
                            <PlaceItem 
                                day={activeDay}
                                onMouseEnter={() => onPlaceHover?.(place.id)}
                                onMouseLeave={() => onPlaceHover?.(0)}
                            >
                                <PlaceOrderBadge day={activeDay}>{index + 1}</PlaceOrderBadge>
                                <PlaceImage imageUrl={place.imageUrl || defaultImageUrl} day={activeDay} />
                                <PlaceContent>
                                    <PlaceTopInfo>
                                        <PlaceName>{place.title}</PlaceName>
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
                                            <RouteDuration day={activeDay}>⏱ {selectedDayData.routes[index].duration}</RouteDuration>
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
        </SidebarContainer>
    );
};

export default TravelRouteSidebar; 