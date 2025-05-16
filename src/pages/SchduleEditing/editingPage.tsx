import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import travel_img1 from '../../assets/images/travel_img1.jpg';
import AISidebar from '../../components/AISidebar';
import EditingCard from '../../components/EditingCard';
import { 
  getDayDarkerTextColor, 
  getDayVeryLightColor, 
  getDayMediumColor 
} from '../../components/Map/MapContent';
import SearchModal, { Place as SearchPlace } from '../../components/Modal/SearchModal';
import DeleteModal from '../../components/Modal/DeleteModal';
import SaveModal from '../../components/Modal/SaveModal';
import { authenticatedFetch } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// 타입 정의
interface VisitPlace {
    id: number;
    name: string;
    memo: string;
    time?: string;
    location?: string;
    imageUrl?: string;
    coordinates?: { lat: number; lng: number };
    placeType?: string;
    originalPlaceId?: number;
}

interface DaySchedule {
    day: number;
    date: string;
    places: VisitPlace[];
}

// AISidebar 컴포넌트에서 사용할 Place 타입을 SearchPlace와 호환되는 형태로 정의
interface RecommendPlace {
    id: number;
    name: string;
    address: string;
    imageUrl?: string;
    coordinates?: { lat: number; lng: number };
    type?: string;
}

// API 응답 관련 타입 정의
interface ScheduleItem {
    itemId: number;
    order: number;
    placeType: string;
    placeId: number;
    latitude: number;
    longitude: number;
    name: string;
    imageUrl: string;
    memo: string | null;
}

interface DayApiSchedule {
    dayNumber: number;
    date: string;
    scheduleItems: ScheduleItem[];
}

interface ApiResult {
    title: string;
    description: string | null;
    profileImage: string;
    startDate: string;
    endDate: string;
    days: DayApiSchedule[];
    numberOfPeople?: string;
    ageRange?: string;
    transportation?: string;
}

const EditingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // location.state에서 tripPlansId 가져오기
    const tripPlansId = location.state?.tripPlansId;
    console.log('[EditingPage] 현재 사용 중인 tripPlansId:', tripPlansId);

// 일정 데이터 상태
const [schedules, setSchedules] = useState<DaySchedule[]>([]);
// 로딩 상태 추가
const [isLoading, setIsLoading] = useState<boolean>(true);
// 에러 상태 추가
const [error, setError] = useState<string | null>(null);
// 여행 정보 상태 추가
const [tripInfo, setTripInfo] = useState({
    startDate: '',
    endDate: '',
    numberOfPeople: '3명',
    ageRange: '20세~25세',
    transportation: '대중교통'
});

const addRecommendedPlace = (place: RecommendPlace, targetDay?: number) => {
    const newPlace: VisitPlace = {
        id: Date.now(),
        name: place.name,
        memo: '',
        location: place.address,
        imageUrl: place.imageUrl,
        coordinates: place.coordinates,
        placeType: place.type || 'UNKNOWN',
        originalPlaceId: place.id,
    };
    
    let updatedSchedules;
    if (targetDay !== undefined) {
        const dayIndex = targetDay - 1;
        if (dayIndex >= 0 && dayIndex < schedules.length) {
            updatedSchedules = schedules.map((schedule, index) => 
                index === dayIndex 
                    ? { ...schedule, places: [...schedule.places, newPlace] }
                    : schedule
            );
            setSchedules(updatedSchedules);
        } else {
            return false; // 유효하지 않은 일차
        }
    } else {
        const placeCounts = schedules.map(day => day.places.length);
        const minPlacesCount = Math.min(...placeCounts);
        const dayWithMinPlaces = placeCounts.findIndex(count => count === minPlacesCount);
        
        updatedSchedules = schedules.map((schedule, index) => 
            index === dayWithMinPlaces 
                ? { ...schedule, places: [...schedule.places, newPlace] }
                : schedule
        );
        setSchedules(updatedSchedules);
    }

    if (tripPlansId && updatedSchedules) {
        try {
            const simplifiedSchedules = updatedSchedules.map(ds => ({ day: ds.day, places: ds.places.map(p => ({...p})) }));
            localStorage.setItem(`scheduleOrder_${tripPlansId}`, JSON.stringify(simplifiedSchedules));
        } catch (e) {
            console.error('로컬 스토리지 저장 실패 (addRecommendedPlace):', e);
        }
    }
    return true;
};

// API에서 데이터를 가져와 변환하는 함수
const processApiResult = (apiResult: unknown) => {
    console.log('처리할 API 데이터 구조:', JSON.stringify(apiResult, null, 2));
    
    // API 응답 구조 확인 및 데이터 추출
    let tripData: ApiResult;
    
    // API 응답이 { result: { ... } } 형태인지 확인
    if (apiResult && typeof apiResult === 'object' && 'result' in apiResult && apiResult.result) {
        tripData = apiResult.result as ApiResult;
    } else {
        // 바로 데이터가 있는 경우
        tripData = apiResult as ApiResult;
    }
    
    // days 배열이 존재하는지 확인
    if (!tripData || !tripData.days || !Array.isArray(tripData.days)) {
        console.error('API 응답에 days 배열이 없습니다:', tripData);
        setIsLoading(false);
        return; // 데이터가 없으면 함수 종료
    }
    
    // 여행 정보 업데이트
    if (tripData.startDate && tripData.endDate) {
        // 날짜 형식을 YYYY-MM-DD에서 YYYY.MM.DD로 변환
        const formatDate = (dateStr: string) => {
            return dateStr.replace(/-/g, '.');
        };
        
        setTripInfo(prev => ({
            ...prev,
            startDate: formatDate(tripData.startDate),
            endDate: formatDate(tripData.endDate),
            numberOfPeople: tripData.numberOfPeople || prev.numberOfPeople,
            ageRange: tripData.ageRange || prev.ageRange,
            transportation: tripData.transportation || prev.transportation
        }));
    }
    
    // 모든 place 상세 정보 요청을 관리하는 프로미스 배열
    const detailPromises: Promise<void>[] = [];
    
    // days 데이터를 schedules 형식으로 변환
    const newSchedules: DaySchedule[] = tripData.days.map(day => {
        // 날짜 형식 변환
        const dateObj = new Date(day.date);
        const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`; // M/D 형식으로 변환
        
        // 해당 일차의 장소 목록 생성 (기본 정보만 포함)
        const places: VisitPlace[] = day.scheduleItems
            .sort((a, b) => a.order - b.order) // 순서대로 정렬
            .map(item => ({
                id: item.itemId,
                name: item.name,
                memo: item.memo || '',
                time: '정보 불러오는 중...', // 실제 운영시간으로 대체될 임시값
                location: '주소 불러오는 중...', // 실제 주소로 대체될 임시값
                imageUrl: item.imageUrl || travel_img1, // 이미지가 없으면 기본 이미지 사용
                coordinates: {
                    lat: item.latitude,
                    lng: item.longitude
                },
                placeType: item.placeType,
                originalPlaceId: item.placeId
            }));

        // 각 장소에 대한 상세 정보 API 호출 프로미스 생성
        day.scheduleItems.forEach((item, placeItemIndex) => {
            // 장소 유형에 따른 API URL 결정
            let apiUrl = '';
            if (item.placeType === 'ATTRACTION') {
                apiUrl = `/api/trip-plans/attractions/${item.placeId}`;
            } else if (item.placeType === 'RESTAURANT') {
                apiUrl = `/api/trip-plans/restaurants/${item.placeId}`;
            } else {
                console.warn(`알 수 없는 장소 유형: ${item.placeType}`, item);
                return; // 알 수 없는 유형이면 API 호출 안함
            }
            
            // 상세 정보 API 호출 프로미스
            const fetchDetailPromise = async () => {
                try {
                    const response = await authenticatedFetch(apiUrl);
                    
                    if (!response.ok) {
                        throw new Error(`상세 정보 API 응답 오류: ${response.status}`);
                    }
                    
                    const detailData = await response.json();
                    
                    // API 응답 구조 확인
                    if (!detailData.isSuccess || !detailData.result) {
                        throw new Error('상세 정보 API 응답 구조가 올바르지 않습니다.');
                    }
                    
                    const detail = detailData.result;
                    const dayScheduleIndex = day.dayNumber - 1; // day는 1부터 시작하지만 배열 인덱스는 0부터 시작
                    
                    // schedules 업데이트 (운영시간 및 주소 정보)
                    setSchedules(prev => {
                        // 유효한 인덱스인지 확인
                        if (dayScheduleIndex < 0 || dayScheduleIndex >= prev.length || !prev[dayScheduleIndex] || placeItemIndex >= prev[dayScheduleIndex].places.length) {
                            return prev;
                        }
                        
                        // 심층 복사
                        const newSchedules = [...prev];
                        const newPlaces = [...newSchedules[dayScheduleIndex].places];
                        
                        // 운영시간 및 주소 업데이트
                        newPlaces[placeItemIndex] = {
                            ...newPlaces[placeItemIndex],
                            time: detail.operatingHours || '정보 없음',
                            location: detail.address || '주소 정보 없음',
                        };
                        
                        newSchedules[dayScheduleIndex] = {
                            ...newSchedules[dayScheduleIndex],
                            places: newPlaces
                        };
                        
                        return newSchedules;
                    });
                } catch (err) {
                    console.error(`${item.name} 상세 정보 가져오기 실패:`, err);
                    
                    // 오류 발생 시에도 schedules 업데이트 (오류 메시지로)
                    const dayScheduleIndexOnError = day.dayNumber - 1;
                    setSchedules(prev => {
                        // 유효한 인덱스인지 확인
                        if (dayScheduleIndexOnError < 0 || dayScheduleIndexOnError >= prev.length || !prev[dayScheduleIndexOnError] || placeItemIndex >= prev[dayScheduleIndexOnError].places.length) {
                            return prev;
                        }
                        
                        // 심층 복사
                        const newSchedules = [...prev];
                        const newPlaces = [...newSchedules[dayScheduleIndexOnError].places];
                        
                        // 기본값으로 업데이트
                        newPlaces[placeItemIndex] = {
                            ...newPlaces[placeItemIndex],
                            time: '정보를 가져올 수 없음',
                            location: '주소 정보를 가져올 수 없음',
                        };
                        
                        newSchedules[dayScheduleIndexOnError] = {
                            ...newSchedules[dayScheduleIndexOnError],
                            places: newPlaces
                        };
                        
                        return newSchedules;
                    });
                }
            };
            
            // 프로미스 배열에 추가
            detailPromises.push(fetchDetailPromise());
        });
        
        return {
            day: day.dayNumber,
            date: formattedDate,
            places
        };
    });
    
    // 기본 스케줄 데이터 설정
    setSchedules(newSchedules);
    
    // 모든 상세 정보 요청이 완료되면 로딩 상태 업데이트
    Promise.all(detailPromises)
        .then(() => {
            console.log('모든 장소 상세 정보 로딩 완료');
        })
        .catch(err => {
            console.error('일부 장소 상세 정보 로딩 실패:', err);
        })
        .finally(() => {
            setIsLoading(false);
        });
};

// 컴포넌트 마운트 시 API 호출
useEffect(() => {
    // tripPlansId 유효성 확인
    if (!tripPlansId) {
      setError('여행 계획 ID가 없습니다. 이전 페이지로 돌아가 다시 시작해주세요.');
      setIsLoading(false);
      return;
    }
    
    // API 호출
    authenticatedFetch(`/api/trip-plans/${tripPlansId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API 응답이 올바르지 않습니다: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('[EditingPage] API 응답 데이터:', data);
            let dataToProcess = data;

            const storedScheduleData = localStorage.getItem(`scheduleOrder_${tripPlansId}`);
            if (storedScheduleData) {
                try {
                    const localSchedules: DaySchedule[] = JSON.parse(storedScheduleData);
                    console.log('[EditingPage] 로컬 스토리지 데이터 발견:', localSchedules);

                    if (dataToProcess && dataToProcess.result && Array.isArray(dataToProcess.result.days)) {
                        // API에서 받아온 days 구조를 기반으로 로컬 스토리지 데이터를 병합합니다.
                        // 로컬 스토리지의 DaySchedule[]는 API의 DayApiSchedule[]와 date 형식이 다를 수 있으므로 주의.
                        // processApiResult에서 어차피 date를 M/D 형식으로 변환하므로, 여기서는 dayNumber만 일치시키고 places를 교체합니다.
                        
                        const updatedApiDays = dataToProcess.result.days.map((apiDay: DayApiSchedule) => {
                            const localDayData = localSchedules.find(ld => ld.day === apiDay.dayNumber);
                            if (localDayData && localDayData.places) {
                                // 로컬 스토리지의 places를 API 응답 형식의 scheduleItems로 변환
                                const scheduleItems: ScheduleItem[] = localDayData.places.map((p, index) => ({
                                    itemId: p.id, // VisitPlace의 id를 itemId로 사용
                                    order: index + 1,
                                    placeType: p.placeType || 'UNKNOWN',
                                    placeId: p.originalPlaceId || 0, // VisitPlace의 originalPlaceId를 placeId로 사용
                                    latitude: p.coordinates?.lat || 0,
                                    longitude: p.coordinates?.lng || 0,
                                    name: p.name,
                                    imageUrl: p.imageUrl || travel_img1,
                                    memo: p.memo || null
                                }));
                                return { ...apiDay, scheduleItems };
                            }
                            return apiDay;
                        });
                        
                        // API의 startDate, endDate 등 다른 정보는 유지하고 days만 교체
                        dataToProcess = {
                            ...dataToProcess,
                            result: {
                                ...dataToProcess.result,
                                days: updatedApiDays
                            }
                        };
                        console.log('[EditingPage] 로컬 스토리지 데이터로 병합된 데이터:', JSON.stringify(dataToProcess, null, 2));
                    }
                } catch (e) {
                    console.error('[EditingPage] 로컬 스토리지 데이터 처리 중 오류:', e);
                }
            }

            processApiResult(dataToProcess);
            
            // 스타일 정보도 함께 가져오기
            return authenticatedFetch('/api/styles');
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('스타일 정보를 가져오는데 실패했습니다.');
            }
            return response.json();
        })
        .then(styleData => {
            if (styleData.isSuccess && styleData.result && styleData.result.styleId) {
                const styleId = styleData.result.styleId;
                
                // 스타일 상세 정보 가져오기
                return authenticatedFetch(`/api/styles/${styleId}`);
            }
            throw new Error('스타일 ID를 가져오는데 실패했습니다.');
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('스타일 상세 정보를 가져오는데 실패했습니다.');
            }
            return response.json();
        })
        .then(styleDetailData => {
            if (styleDetailData.isSuccess && styleDetailData.result) {
                const styleInfo = styleDetailData.result;
                
                // 스타일 정보로 여행 정보 업데이트
                setTripInfo(prev => ({
                    ...prev,
                    numberOfPeople: styleInfo.numberOfPeople || prev.numberOfPeople,
                    ageRange: styleInfo.ageRange || prev.ageRange,
                    transportation: styleInfo.transportation || prev.transportation
                }));
            }
        })
        .catch(err => {
            console.error('API 호출 중 오류가 발생했습니다:', err);
            // 로딩 상태 종료
            setIsLoading(false);
            // 에러 상태 설정
            setError(`데이터 로딩 중 오류: ${err.message}`);
            // 빈 데이터 설정
            setSchedules([]);
        });
}, [tripPlansId]);

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

// 장소 검색 모달 상태
const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

const addPlace = (dayIndex: number) => {
    // SearchModal을 열기 위한 상태 업데이트
    setIsSearchModalOpen(true);
    setSelectedDayIndex(dayIndex);
};

// SearchModal로부터 선택된 장소를 추가하는 함수
const handleAddPlaceFromSearch = (place: SearchPlace) => {
    if (selectedDayIndex === null) return;
    
    const placeTypeFromSearch = place.type ?? 'UNKNOWN';

    const newPlace: VisitPlace = {
        id: Date.now(),
        name: place.name,
        memo: '',
        location: place.address,
        imageUrl: place.imageUrl,
        coordinates: place.coordinates,
        placeType: placeTypeFromSearch,
        originalPlaceId: place.id, 
    };
    
    const updatedSchedules = schedules.map((schedule, index) => 
        index === selectedDayIndex 
            ? { ...schedule, places: [newPlace, ...schedule.places.filter(p => p.id !== newPlace.id)] }
            : schedule
    );
    setSchedules(updatedSchedules);
    
    if (tripPlansId) {
        try {
            const simplifiedSchedules = updatedSchedules.map(ds => ({ day: ds.day, places: ds.places.map(p => ({...p})) }));
            localStorage.setItem(`scheduleOrder_${tripPlansId}`, JSON.stringify(simplifiedSchedules));
        } catch (e) {
            console.error('로컬 스토리지 저장 실패 (handleAddPlaceFromSearch):', e);
        }
    }

    setIsSearchModalOpen(false);
    setSelectedDayIndex(null);
};

const updatePlace = (dayIndex: number, placeId: number, field: keyof VisitPlace, value: string) => {
    setSchedules(prevSchedules => {
        const updatedSchedules = prevSchedules.map((schedule, i) => 
            i === dayIndex
                ? { ...schedule, places: schedule.places.map(p => p.id === placeId ? { ...p, [field]: value } : p) }
                : schedule
        );

        // 로컬 스토리지에 변경된 스케줄 저장
        if (tripPlansId) {
            try {
                const simplifiedSchedules = updatedSchedules.map(ds => ({
                    day: ds.day,
                    places: ds.places.map(p => ({ ...p })) // VisitPlace의 모든 속성 저장
                }));
                localStorage.setItem(`scheduleOrder_${tripPlansId}`, JSON.stringify(simplifiedSchedules));
                console.log('[updatePlace] 로컬 스토리지 업데이트됨:', simplifiedSchedules);
            } catch (e) {
                console.error('로컬 스토리지 저장 실패 (updatePlace):', e);
            }
        }
        return updatedSchedules;
    });
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
    
    // 드래그가 활성화되지 않은 경우 무시
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
    
    const dragged = draggedItem;
    const over = dragOverItemRef.current;
    setDraggedItem(null);
    dragOverItemRef.current = null;
    setIsDragEnabled(false);

    if (!dragged || !over || (dragged.dayIndex === over.dayIndex && dragged.placeIndex === over.placeIndex)) return;

    setSchedules(prev => {
        const newSchedules = [...prev];
        const sourcePlaces = [...newSchedules[dragged.dayIndex].places];
        const [draggedPlace] = sourcePlaces.splice(dragged.placeIndex, 1);

        if (dragged.dayIndex === over.dayIndex) {
            sourcePlaces.splice(over.placeIndex > dragged.placeIndex ? over.placeIndex -1 : over.placeIndex, 0, draggedPlace);
            newSchedules[dragged.dayIndex].places = sourcePlaces;
        } else {
            const destPlaces = [...newSchedules[over.dayIndex].places];
            destPlaces.splice(over.placeIndex, 0, draggedPlace);
            newSchedules[dragged.dayIndex].places = sourcePlaces;
            newSchedules[over.dayIndex].places = destPlaces;
        }

        if (tripPlansId) {
            try {
                const simplifiedSchedules = newSchedules.map(ds => ({ day: ds.day, places: ds.places.map(p => ({...p})) }));
                localStorage.setItem(`scheduleOrder_${tripPlansId}`, JSON.stringify(simplifiedSchedules));
            } catch (err) { console.error('로컬 스토리지 저장 실패 (handleDragEnd):', err); }
        }
        return newSchedules;
    });
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

// 삭제 모달 상태 추가
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [placeToDelete, setPlaceToDelete] = useState<{ dayIndex: number, placeId: number } | null>(null);

// 저장 모달 상태 추가
const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

// 메모 저장 함수
const saveMemo = () => {
    // 저장 모달 열기
    setIsSaveModalOpen(true);
};

// 실제 저장 기능 수행 함수
const handleSave = async () => {
    if (!tripPlansId) {
        alert('여행 계획 ID가 없어 저장할 수 없습니다.');
        setIsSaveModalOpen(false);
        return;
    }

    const storedScheduleData = localStorage.getItem(`scheduleOrder_${tripPlansId}`);
    if (!storedScheduleData) {
        alert('로컬 스토리지에 저장된 일정 데이터가 없습니다.');
        setIsSaveModalOpen(false);
        return;
    }

    let parsedSchedulesFromStorage: DaySchedule[];
    try {
        parsedSchedulesFromStorage = JSON.parse(storedScheduleData);
    } catch (e) {
        console.error('로컬 스토리지 데이터 파싱 실패:', e);
        alert('저장된 일정 데이터를 불러오는데 실패했습니다.');
        setIsSaveModalOpen(false);
        return;
    }

    interface ApiItem {
        dayNumber: number;
        orderInDay: number;
        placeType: string;
        memo: string;
        attractionId?: number;
        restaurantId?: number;
    }

    const itemsToSave: ApiItem[] = [];

    parsedSchedulesFromStorage.forEach(daySchedule => {
        daySchedule.places.forEach((place, index) => {
            // placeType과 originalPlaceId가 유효한지 먼저 확인
            if (!place.placeType || place.placeType === 'UNKNOWN' || !place.originalPlaceId) {
                console.warn(`장소 "${place.name}" (ID: ${place.id})는 placeType("${place.placeType}") 또는 originalPlaceId("${place.originalPlaceId}")가 유효하지 않아 저장에서 제외됩니다.`);
                return; // 이 장소는 저장하지 않고 다음 장소로 넘어감
            }

            const item: ApiItem = {
                dayNumber: daySchedule.day,
                orderInDay: index + 1, 
                placeType: place.placeType,
                memo: place.memo || "",
            };

            if (place.placeType === 'ATTRACTION') {
                item.attractionId = place.originalPlaceId;
            } else if (place.placeType === 'RESTAURANT') {
                item.restaurantId = place.originalPlaceId;
            } else {
                // API 명세상 ATTRACTION 또는 RESTAURANT 외 다른 타입은 ID를 포함하지 않거나 처리가 불명확하므로 제외
                console.warn(`장소 "${place.name}"의 타입 ${place.placeType}은 현재 저장 로직에서 지원되지 않아 제외됩니다.`);
                return; // 이 장소는 저장하지 않음
            }
            itemsToSave.push(item);
        });
    });

    if (itemsToSave.length === 0 && parsedSchedulesFromStorage.some(d => d.places.length > 0)) {
        alert('저장할 유효한 장소가 없습니다. 장소의 타입 및 ID를 확인해주세요.');
        setIsSaveModalOpen(false);
        return;
    }

    const payload = {
        tripPlanId: tripPlansId,
        items: itemsToSave
    };

    console.log('PUT /api/trip-plans 요청으로 전송할 데이터:', JSON.stringify(payload, null, 2));

    try {
        setIsLoading(true); // 저장 중 로딩 상태 활성화
        const response = await authenticatedFetch('/api/trip-plans', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorData = { message: response.statusText };
            try {
                errorData = await response.json();
            } catch (parseErr) {
                 console.error('API 에러 메시지 JSON 파싱 실패:', parseErr); // parseError 변수 사용
            }
            console.error('API 오류 응답:', errorData);
            throw new Error(`일정 저장에 실패했습니다: ${errorData?.message || response.status}`);
        }

        const result = await response.json();
        console.log('일정 저장 성공:', result);
        alert('일정이 성공적으로 저장되었습니다.');

    } catch (err) {
        console.error('일정 저장 API 호출 중 오류 발생:', err);
        alert(`일정 저장 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
        setIsLoading(false); // 로딩 상태 비활성화
        setIsSaveModalOpen(false);
    }
};

// 장소 삭제 함수 추가
const deletePlace = (dayIndex: number, placeId: number) => {
  // 삭제 모달 열기
  setPlaceToDelete({ dayIndex, placeId });
  setIsDeleteModalOpen(true);
};

// 실제 삭제 기능 수행 함수
const handleDelete = () => {
  if (placeToDelete) {
    setSchedules(prev => {
      const newSchedules = prev.map((schedule, index) => 
        index === placeToDelete.dayIndex
          ? {
              ...schedule,
              places: schedule.places.filter(place => place.id !== placeToDelete.placeId)
            }
          : schedule
      );

      // 로컬 스토리지에 변경된 순서 저장 (삭제 반영)
      if (tripPlansId) {
        try {
            const simplifiedSchedules = newSchedules.map(daySchedule => ({
                day: daySchedule.day,
                // 각 장소의 모든 속성을 저장하도록 변경
                places: daySchedule.places.map(place => ({ ...place })),
            }));
            localStorage.setItem(`scheduleOrder_${tripPlansId}`, JSON.stringify(simplifiedSchedules));
        } catch (e) {
            console.error('로컬 스토리지 저장 실패 (handleDelete):', e);
        }
      }
      
      return newSchedules;
    });
    
    // 모달 상태 초기화
    setIsDeleteModalOpen(false);
    setPlaceToDelete(null);
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

        // 로컬 스토리지에 변경된 순서 저장
        if (tripPlansId) {
            try {
                const simplifiedSchedules = newSchedules.map(daySchedule => ({
                    day: daySchedule.day,
                    // 각 장소의 모든 속성을 저장하도록 변경
                    places: daySchedule.places.map(place => ({ ...place })),
                }));
                localStorage.setItem(`scheduleOrder_${tripPlansId}`, JSON.stringify(simplifiedSchedules));
                // 콘솔에는 각 날짜별 장소 이름만 출력
                const placeNamesForLogging = simplifiedSchedules.map(daySchedule => (
                  `Day ${daySchedule.day}: ${daySchedule.places.map(p => p.name).join(' -> ') || '장소 없음'}`
                ));
                console.log('[handleEmptyListDrop] 로컬 스토리지 장소 순서:', placeNamesForLogging);
            } catch (e) {
                console.error('로컬 스토리지 저장 실패 (handleEmptyListDrop):', e);
            }
        }
        
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

// 데이터 로딩 중일 때 표시할 로딩 화면
if (isLoading && !isSaveModalOpen) {
    return <LoadingSpinner message="여행 일정을 불러오는 중..." />;
}

// 에러 발생 시 표시할 에러 화면
if (error) {
    return (
        <div style={{ padding: '20px', margin: '20px auto', maxWidth: '600px', textAlign: 'center', color: 'red' }}>
            <h3>오류 발생</h3>
            <p>{error}</p>
            <button 
                onClick={() => navigate(-1)}
                style={{ padding: '10px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}
            >
                이전 페이지로 돌아가기
            </button>
        </div>
    );
}

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
                        <DetailItem><DetailIcon>📅</DetailIcon> {tripInfo.startDate && tripInfo.endDate ? `${tripInfo.startDate}-${tripInfo.endDate}` : '여행 날짜 정보 없음'}</DetailItem>
                        <DetailItem><DetailIcon>��</DetailIcon> {tripInfo.numberOfPeople}</DetailItem>
                        <DetailItem><DetailIcon>👨‍👧‍👦</DetailIcon> {tripInfo.ageRange}</DetailItem>
                        <DetailItem><DetailIcon>🚆</DetailIcon> {tripInfo.transportation}</DetailItem>
                    </DestinationDetails>
                </DestinationTitle>
                <ButtonContainer>
                    <ViewMapButton onClick={() => navigate('/map', { state: { tripPlansId }})}>
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
          <PageIndicator>{currentPageIndex + 1} / {totalPages || 1}</PageIndicator>
          <NavButton onClick={nextPage} disabled={currentPageIndex === totalPages - 1 || totalPages === 0}>
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
                        if (schedule.places.length === 0) handleEmptyListDrop(e, dayIndex);
                    }}
                >
                    <AddPlaceButton onClick={() => addPlace(dayIndex)}>
                      <PlusIcon>+</PlusIcon>
                      <AddPlaceText>숙소 추가</AddPlaceText>
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
    
    <AISidebar isOpen={true} addRecommendedPlace={addRecommendedPlace}/>
    
    {/* 장소 검색 모달 추가 */}
    <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onAddPlace={handleAddPlaceFromSearch}
    />
    
    {/* 삭제 확인 모달 추가 */}
    <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
        itemName={placeToDelete ? schedules[placeToDelete.dayIndex]?.places.find(p => p.id === placeToDelete.placeId)?.name || '장소' : '장소'}
    />
    
    {/* 저장 확인 모달 추가 */}
    <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSave}
        title="일정 저장"
        // isLoading={isLoading && isSaveModalOpen} // SaveModalProps에 isLoading이 없다면 일단 주석 처리
    />
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
  background-color: #3498db;
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
    background-color: #2980b9;
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
  background-color: #ffffff;
  color: #333333;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f9fafb;
  }
  
  &:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
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
  width: 100%;
  box-sizing: border-box;
  background-color: white;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  height: 100%;
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
  width: 100%;
  padding: 14px 0;
  margin-top: 15px;
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
  border: 2px dashed #94a3b8;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(148, 163, 184, 0.2);
    transform: translateY(-2px);
  }
`;

const PlusIcon = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #64748b;
  margin-right: 8px;
`;

const AddPlaceText = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
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