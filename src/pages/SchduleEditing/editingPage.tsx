import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import travel_img1 from '../../assets/images/travel_img1.jpg';
import AISidebar from '../../components/AISidebar';
import EditingCard from '../../components/EditingCard';
import { 
  getDayColor, 
  getDayDarkerTextColor, 
  getDayVeryLightColor, 
  getDayMediumColor 
} from '../../components/Map/MapContent';

interface VisitPlace {
    id: number;
    name: string;
    memo: string;
    time?: string;
    location?: string;
    imageUrl?: string;
}

interface DaySchedule {
    day: number;
    date: string;
    places: VisitPlace[];
}

const EditingPage = () => {
    const navigate = useNavigate();

// 초기 여행 데이터
const [schedules, setSchedules] = useState<DaySchedule[]>([
        { 
        day: 1, 
        date: '8/24',
        places: [
            { id: 1, name: '부산역', memo: '', time: '09:00', location: '부산광역시 동구 중앙대로 206', imageUrl: travel_img1 },
            { id: 2, name: '해운대해수욕장', memo: '', time: '11:00', location: '부산광역시 해운대구 해운대해변로 264', imageUrl: travel_img1 },
            { id: 3, name: '광안대교', memo: '', time: '13:00', location: '부산광역시 수영구 광안해변로 219', imageUrl: travel_img1 }
        ] 
        },
        { 
        day: 2, 
        date: '8/24',
        places: [
            { id: 4, name: '감천문화마을', memo: '', time: '10:00', location: '부산광역시 사하구 감천2길 203', imageUrl: travel_img1 },
            { id: 5, name: '자갈치시장', memo: '', time: '13:00', location: '부산광역시 중구 자갈치로 52', imageUrl: travel_img1 },
            { id: 6, name: '부산타워', memo: '', time: '15:00', location: '부산광역시 중구 용두산길 37-55', imageUrl: travel_img1 }
        ] 
        },
        { 
        day: 3, 
        date: '8/24',
        places: [
            { id: 7, name: '용두산공원', memo: '', time: '09:30', location: '부산광역시 중구 용두산길 37-55', imageUrl: travel_img1 },
            { id: 8, name: '국제시장', memo: '', time: '11:30', location: '부산광역시 중구 신창동4가 37-1', imageUrl: travel_img1 },
            { id: 9, name: '부산아쿠아리움', memo: '', time: '14:00', location: '부산광역시 해운대구 해운대해변로 266', imageUrl: travel_img1 }
        ] 
        },
        { 
        day: 4, 
        date: '8/24',
        places: [
            { id: 10, name: '해운대 블루라인파크', memo: '', time: '10:00', location: '부산광역시 해운대구 달맞이길 62번길 47', imageUrl: travel_img1 },
            { id: 11, name: '기장군 장안사', memo: '', time: '13:00', location: '부산광역시 기장군 장안읍 장안리 583', imageUrl: travel_img1 },
            { id: 12, name: '기장군 해변열차', memo: '', time: '15:30', location: '부산광역시 기장군 기장읍 기장해안로 205', imageUrl: travel_img1 }
        ] 
        },
]);

// 드래그 관련 상태
const [draggedItem, setDraggedItem] = useState<{ dayIndex: number, placeIndex: number } | null>(null);
const dragOverItemRef = useRef<{ dayIndex: number, placeIndex: number } | null>(null);
// 드래그 활성화 상태 추가
const [isDragEnabled, setIsDragEnabled] = useState<boolean>(false);
// 드래그 오버 중인 항목 상태 추가
const [dragOverItem, setDragOverItem] = useState<{ dayIndex: number, placeIndex: number, position?: 'top' | 'bottom' } | null>(null);


const [currentPageIndex, setCurrentPageIndex] = useState(0);
const totalPages = Math.ceil(schedules.length / 2);

const nextPage = () => {
  if (currentPageIndex < totalPages - 1) {
    setCurrentPageIndex(currentPageIndex + 1);
  }
};

const prevPage = () => {
  if (currentPageIndex > 0) {
    setCurrentPageIndex(currentPageIndex - 1);
  }
};

const addPlace = (dayIndex: number) => {
    const newPlace: VisitPlace = {
    id: Date.now(),
    name: '',
    memo: '',
    };
    
    setSchedules(prev => prev.map((schedule, index) => 
    index === dayIndex 
        ? { ...schedule, places: [...schedule.places, newPlace] }
        : schedule
    ));
};

const updatePlace = (dayIndex: number, placeId: number, field: keyof VisitPlace, value: string) => {
    setSchedules(prev => prev.map((schedule, index) => 
    index === dayIndex
        ? {
            ...schedule,
            places: schedule.places.map(place =>
            place.id === placeId ? { ...place, [field]: value } : place
            ),
        }
        : schedule
    ));
};

// 드래그 활성화 토글 함수
const handleDragStart = (e: React.DragEvent, dayIndex: number, placeIndex: number) => {
    // 드래그가 활성화되지 않은 경우 드래그 취소
    if (!isDragEnabled) {
        e.preventDefault();
        return;
    }
    
    e.dataTransfer.setData('text/plain', JSON.stringify({ dayIndex, placeIndex }));
    setDraggedItem({ dayIndex, placeIndex });
    
    // 드래그 효과 설정
    if (e.dataTransfer.effectAllowed) {
        e.dataTransfer.effectAllowed = 'move';
    }
    
    // 드래그 이미지 설정
    setTimeout(() => {
        if (e.target instanceof HTMLElement) {
            e.target.classList.add('dragging');
        }
    }, 0);
};

// 드래그 오버 핸들러
const handleDragOver = (e: React.DragEvent, dayIndex: number, placeIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 드래그가 활성화되지 않은 경우 처리하지 않음
    if (!isDragEnabled || !draggedItem) return;
    
    // 드롭 효과 설정
    if (e.dataTransfer.dropEffect) {
        e.dataTransfer.dropEffect = 'move';
    }
    
    // 마우스 위치 확인
    if (e.currentTarget instanceof HTMLElement) {
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseY = e.clientY;
        const elementMiddleY = rect.top + rect.height / 2;
        
        // 마우스가 요소의 위쪽 절반에 있으면 현재 위치에, 아래쪽 절반에 있으면 다음 위치에 드롭
        if (mouseY < elementMiddleY) {
            // 위쪽 - 현재 위치에 삽입
            dragOverItemRef.current = { dayIndex, placeIndex };
            // 드래그 오버 상태 업데이트 (UI 표시용)
            setDragOverItem({ dayIndex, placeIndex, position: 'top' });
        } else {
            // 아래쪽 - 다음 위치에 삽입
            dragOverItemRef.current = { dayIndex, placeIndex: placeIndex + 1 };
            // 드래그 오버 상태 업데이트 (UI 표시용)
            setDragOverItem({ dayIndex, placeIndex, position: 'bottom' });
        }
    } else {
        // 요소를 가져올 수 없는 경우 기본 동작
        dragOverItemRef.current = { dayIndex, placeIndex };
        // 드래그 오버 상태 업데이트 (UI 표시용)
        setDragOverItem({ dayIndex, placeIndex });
    }
};

// 드래그 종료 핸들러
const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    
    // 드래그 중인 클래스 제거
    if (e.target instanceof HTMLElement) {
        e.target.classList.remove('dragging');
    }
    
    // 드래그 오버 상태 초기화
    setDragOverItem(null);
    
    const draggedDayIndex = draggedItem?.dayIndex;
    const draggedPlaceIndex = draggedItem?.placeIndex;
    
    // draggedItem이 없으면 종료
    if (draggedDayIndex === undefined || draggedPlaceIndex === undefined || !dragOverItemRef.current) {
        setDraggedItem(null);
        return;
    }
    
    const { dayIndex: dragOverDayIndex, placeIndex: dragOverPlaceIndex } = dragOverItemRef.current;
    
    // 유효하지 않은 인덱스이거나 같은 위치면 종료
    if (
        draggedDayIndex === dragOverDayIndex && draggedPlaceIndex === dragOverPlaceIndex
    ) {
        setDraggedItem(null);
        dragOverItemRef.current = null;
        return;
    }
    
    // 아이템 순서 변경 로직
    setSchedules(prev => {
        const newSchedules = [...prev];
        
        // 같은 날짜 내 순서 변경인 경우
        if (draggedDayIndex === dragOverDayIndex) {
            const places = [...newSchedules[draggedDayIndex].places];
            
            // 원본 배열 범위 검사
            if (draggedPlaceIndex >= places.length) {
                return prev;
            }
            
            const draggedPlace = places[draggedPlaceIndex];
            
            // 유효한 dragOverPlaceIndex 확인
            const validDragOverPlaceIndex = Math.min(dragOverPlaceIndex, places.length);
            
            // 드래그된 항목 제거 후 새 위치에 추가
            places.splice(draggedPlaceIndex, 1);
            places.splice(validDragOverPlaceIndex > draggedPlaceIndex ? validDragOverPlaceIndex - 1 : validDragOverPlaceIndex, 0, draggedPlace);
            
            newSchedules[draggedDayIndex].places = places;
        } 
        // 다른 날짜로 이동하는 경우
        else {
            // 현재 보이는 일정만 처리 (숨겨진 일정에 대한 드래그 앤 드롭은 무시)
            const displayedDays = [currentPageIndex * 2, currentPageIndex * 2 + 1];
            
            // 대상 일차가 현재 보이는 일정이 아니면 작업 중단
            if (!displayedDays.includes(dragOverDayIndex) || dragOverDayIndex >= newSchedules.length) {
                return prev;
            }
            
            // 소스 일차가 배열 범위를 벗어나면 작업 중단
            if (draggedDayIndex >= newSchedules.length) {
                return prev;
            }
            
            const sourcePlaces = [...newSchedules[draggedDayIndex].places];
            const destPlaces = [...newSchedules[dragOverDayIndex].places];
            
            // 드래그된 항목의 인덱스가 유효한지 확인
            if (draggedPlaceIndex >= sourcePlaces.length) {
                return prev;
            }
            
            // 드래그된 항목 가져오기
            const draggedPlace = sourcePlaces[draggedPlaceIndex];
            
            // 유효한 dragOverPlaceIndex 확인
            const validDragOverPlaceIndex = Math.min(dragOverPlaceIndex, destPlaces.length);
            
            // 원래 날짜에서 제거
            sourcePlaces.splice(draggedPlaceIndex, 1);
            
            // 새 날짜에 추가
            destPlaces.splice(validDragOverPlaceIndex, 0, draggedPlace);
            
            newSchedules[draggedDayIndex].places = sourcePlaces;
            newSchedules[dragOverDayIndex].places = destPlaces;
        }
        
        return newSchedules;
    });
    
    // 드래그 상태 초기화
    setDraggedItem(null);
    dragOverItemRef.current = null;
    setIsDragEnabled(false); // 드래그 완료 후 드래그 모드 해제
};

// 드래그 리브 핸들러 추가
const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 이벤트가 부모로 버블링되는 경우, 마우스가 실제로 요소를 떠났는지 확인
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
        return;
    }
    
    // 필요한 경우 드래그 오버 상태 초기화
    // (다른 요소로 이동한 경우에는 해당 요소의 dragOver 이벤트가 발생하므로 여기서는 처리하지 않음)
};

// 드롭 핸들러
const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 드래그가 활성화되지 않은 경우 처리하지 않음
    if (!isDragEnabled || !draggedItem) return;
    
    // 드래그 중인 클래스 제거
    const elements = document.querySelectorAll('.dragging');
    elements.forEach(el => el.classList.remove('dragging'));
    
    // 드래그 종료 핸들러를 호출하여 위치 변경 처리
    handleDragEnd(e);
};

// 메모 저장 함수
const saveMemo = () => {
    console.log('메모 저장됨:', schedules);
    // 로컬 스토리지나 API를 통해 서버에 저장하는 로직 추가
    alert('메모가 저장되었습니다.');
};

// 장소 삭제 함수 추가
const deletePlace = (dayIndex: number, placeId: number) => {
  if (window.confirm('이 장소를 삭제하시겠습니까?')) {
    setSchedules(prev => prev.map((schedule, index) => 
      index === dayIndex
        ? {
            ...schedule,
            places: schedule.places.filter(place => place.id !== placeId)
          }
        : schedule
    ));
  }
};

// 옵션 버튼 마우스 이벤트 핸들러
const handleOptionsMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // 버블링 방지
    setIsDragEnabled(true);
};

const handleOptionsMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation(); // 버블링 방지
    if (draggedItem) return; // 드래그 진행 중이면 드래그 모드 유지
    setIsDragEnabled(false);
};

// 아이템이 없는 리스트에 드롭할 수 있도록 하는 함수
const handleEmptyListDrop = (e: React.DragEvent, dayIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 드래그가 활성화되지 않은 경우 처리하지 않음
    if (!isDragEnabled || !draggedItem) return;
    
    const { dayIndex: draggedDayIndex, placeIndex: draggedPlaceIndex } = draggedItem;
    
    // 같은 날짜이고 리스트가 비어있지 않으면 종료
    if (draggedDayIndex === dayIndex && schedules[dayIndex].places.length > 0) {
        return;
    }
    
    // 현재 보이는 일정만 처리 (숨겨진 일정에 대한 드래그 앤 드롭은 무시)
    const displayedDays = [currentPageIndex * 2, currentPageIndex * 2 + 1];
    
    // 대상 일차가 현재 보이는 일정이 아니면 작업 중단
    if (!displayedDays.includes(dayIndex) || dayIndex >= schedules.length || draggedDayIndex >= schedules.length) {
        return;
    }
    
    // draggedPlaceIndex가 유효한지 확인
    if (draggedPlaceIndex >= schedules[draggedDayIndex].places.length) {
        return;
    }
    
    // 아이템 이동 처리
    setSchedules(prev => {
        const newSchedules = [...prev];
        const sourcePlaces = [...newSchedules[draggedDayIndex].places];
        const destPlaces = [...newSchedules[dayIndex].places];
        
        // 드래그된 항목 가져오기
        const draggedPlace = sourcePlaces[draggedPlaceIndex];
        
        // 원래 날짜에서 제거
        sourcePlaces.splice(draggedPlaceIndex, 1);
        
        // 새 날짜에 추가 (빈 리스트의 경우 항상 첫 번째 위치에 추가)
        destPlaces.push(draggedPlace);
        
        newSchedules[draggedDayIndex].places = sourcePlaces;
        newSchedules[dayIndex].places = destPlaces;
        
        return newSchedules;
    });
    
    // 드래그 상태 초기화
    setDraggedItem(null);
    setDragOverItem(null);
    dragOverItemRef.current = null;
    setIsDragEnabled(false); // 드래그 완료 후 드래그 모드 해제
};

// 추가: 텍스트 필드에서 드래그 시작되지 않도록 하는 함수
const preventDragHandler = (e: React.DragEvent) => {
    e.stopPropagation();
};

return (
    <PageLayout>
    <MainContainer>
        <MainContent>
        <DestinationHeader>
            <DestinationInfo>
            <DestinationInfoHeader>
                <DestinationTitle>
                    <DestinationName>BUSAN</DestinationName>
                    <DestinationDetails>
                        <DetailItem><DetailIcon>📅</DetailIcon> 2024.8.24-2024.8.28</DetailItem>
                        <DetailItem><DetailIcon>👥</DetailIcon> 3명</DetailItem>
                        <DetailItem><DetailIcon>👨‍👧‍👦</DetailIcon> 20세~25세</DetailItem>
                        <DetailItem><DetailIcon>🚆</DetailIcon> 대중교통</DetailItem>
                    </DestinationDetails>
                </DestinationTitle>
                <ButtonContainer>
                    <ViewMapButton onClick={() => navigate('/map')}>
                        <MapIcon>🗺️</MapIcon> 지도로 확인하기
                    </ViewMapButton>
                    <SaveButtonSmall onClick={saveMemo}>저장하기</SaveButtonSmall>
                </ButtonContainer>
            </DestinationInfoHeader>
            </DestinationInfo>
        </DestinationHeader>
        
        <NavigationButtons>
          <NavButton onClick={prevPage} disabled={currentPageIndex === 0}>
            <NavIcon>◀</NavIcon> 이전 일정
          </NavButton>
          <PageIndicator>{currentPageIndex + 1} / {totalPages}</PageIndicator>
          <NavButton onClick={nextPage} disabled={currentPageIndex === totalPages - 1}>
            다음 일정 <NavIcon>▶</NavIcon>
          </NavButton>
        </NavigationButtons>
        
        <ScheduleContainer>
            {schedules.map((schedule, dayIndex) => (
            <DayContainer 
                key={dayIndex} 
                active={dayIndex === currentPageIndex * 2 || dayIndex === currentPageIndex * 2 + 1}
                dayNumber={schedule.day}
            >
                <DayHeader>
                <DayTitle>
                    <DayNumber>{schedule.day}</DayNumber>
                    <DayText>일차</DayText>
                    <DayDate dayNumber={schedule.day}>{schedule.date}</DayDate>
                </DayTitle>
                </DayHeader>
                
                <PlacesList
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // 드래그 모드가 아닌 경우 무시
                        if (!isDragEnabled || !draggedItem) return;
                        
                        // PlacesList가 비어있는 경우 여기에 드랍할 수 있도록 설정
                        if (schedule.places.length === 0) {
                            dragOverItemRef.current = { dayIndex, placeIndex: 0 };
                            setDragOverItem({ dayIndex, placeIndex: 0, position: 'top' });
                        }
                    }}
                    onDrop={(e) => {
                        if (schedule.places.length === 0) {
                            handleEmptyListDrop(e, dayIndex);
                        }
                    }}
                >
                    <AddPlaceButton onClick={() => addPlace(dayIndex)}>
                    <PlusIcon>+</PlusIcon>
                    <AddPlaceText>장소 추가</AddPlaceText>
                    </AddPlaceButton>
                    {schedule.places.map((place, placeIndex) => (
                      <EditingCard
                        key={place.id}
                        place={place}
                        dayNumber={schedule.day}
                        placeIndex={placeIndex}
                        dayIndex={dayIndex}
                        isDragEnabled={isDragEnabled}
                        draggedItem={draggedItem}
                        dragOverItem={dragOverItem}
                        updatePlace={updatePlace}
                        deletePlace={deletePlace}
                        handleDragStart={handleDragStart}
                        handleDragOver={handleDragOver}
                        handleDragEnd={handleDragEnd}
                        handleDragLeave={handleDragLeave}
                        handleDrop={handleDrop}
                        handleOptionsMouseDown={handleOptionsMouseDown}
                        handleOptionsMouseUp={handleOptionsMouseUp}
                        preventDragHandler={preventDragHandler}
                      />
                    ))}
                </PlacesList>
            </DayContainer>
            ))}
        </ScheduleContainer>
        </MainContent>
    </MainContainer>
    
    <AISidebar isOpen={true}/>
    </PageLayout>
);
};

// 스타일 컴포넌트
const PageLayout = styled.div`
  display: flex;
  width: 100%;
  height: calc(100vh - 60px); /* 네비게이션 바 높이 고려 */
  background-color: #f8fafc;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  overflow: hidden;
  position: fixed;
  top: 60px; /* 네비게이션 바 높이만큼 아래로 */
  left: 0;
  right: 0;
  bottom: 0;
`;

const MainContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const SaveButtonSmall = styled.button`
  padding: 10px 18px;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  
  &::before {
    content: '💾';
    margin-right: 8px;
    font-size: 16px;
  }
  
  &:hover {
    background-color: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
  }
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const DestinationHeader = styled.div`
  margin-bottom: 24px;
`;

const DestinationInfo = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const DestinationInfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const DestinationTitle = styled.div`
  flex: 1;
`;

const DestinationName = styled.h2`
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #0f172a;
`;

const DestinationDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #f1f5f9;
  border-radius: 100px;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
`;

const DetailIcon = styled.span`
  margin-right: 6px;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:disabled {
    background-color: #cbd5e1;
    cursor: not-allowed;
  }
`;

const NavIcon = styled.span`
  margin: 0 6px;
`;

const PageIndicator = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #475569;
`;

const ScheduleContainer = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0; /* flex item이 제대로 축소되도록 */
  width: 100%;
  box-sizing: border-box;
`;

const DayContainer = styled.div<{ active: boolean; dayNumber: number }>`
  display: ${props => props.active ? 'block' : 'none'};
  margin-bottom: 10px;
  width: 100%;
  box-sizing: border-box;
  border-top: 5px solid ${props => getDayColor(props.dayNumber)};
  border-bottom: 5px solid ${props => getDayColor(props.dayNumber)};
  border-radius: 12px;
  background-color: white;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  height: 100%;
  /* 스크롤바 제거 */
  overflow-y: visible;
  transition: transform 0.2s, box-shadow 0.2s;  
`;

const DayHeader = styled.div`
  margin-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: #e2e8f0;
    border-radius: 2px;
  }
`;

const DayTitle = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const DayNumber = styled.span`
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-right: 2px;
`;

const DayText = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #475569;
  margin: 0 12px 0 4px;
  transform: translateY(3px);
`;

const DayDate = styled.span<{ dayNumber: number }>`
  display: inline-block;
  font-size: 15px;
  font-weight: 600;
  color: ${props => getDayDarkerTextColor(props.dayNumber)};
  background-color: ${props => getDayVeryLightColor(props.dayNumber)};
  padding: 5px 14px;
  border-radius: 20px;
  margin-left: 6px;
  border: 1px solid ${props => getDayMediumColor(props.dayNumber)};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const PlacesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: auto;
  position: relative;
`;

const AddPlaceButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 13px;
  background-color: #f8fafc;
  border: 2px dashed #94a3b8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  
  &:hover {
    background-color: #e2e8f0;
    border-color: #64748b;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const PlusIcon = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #475569;
  margin-right: 8px;
`;

const AddPlaceText = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #475569;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ViewMapButton = styled.button`
  display: flex;
  align-items: center;
  padding: 10px 18px;
  background-color: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background-color: #f1f5f9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    color: #1e40af;
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.05);
  }
`;

const MapIcon = styled.span`
  margin-right: 8px;
  font-size: 16px;
`;

export default EditingPage;