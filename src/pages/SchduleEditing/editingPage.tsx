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
import SearchModal, { Place as ModalPlaceFromSearch } from '../../components/Modal/SearchModal';
import DeleteModal from '../../components/Modal/DeleteModal';
import SaveModal from '../../components/Modal/SaveModal';
import SelectionModal from '../../components/Modal/SelectionModal';
import { authenticatedFetch } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import nullPlaceImage from '../../assets/images/null_place.png';

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

// AISidebar 컴포넌트에서 사용할 Place 타입을 ModalPlace와 호환되는 형태로 정의
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

// SelectionModal에 전달될 아이템 타입 (기존 SelectionModal의 TravelItem과 유사하게)
interface TravelItemForSelection {
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

const EditingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tripPlansId = location.state?.tripPlansId;
    console.log('[EditingPage] 현재 사용 중인 tripPlansId:', tripPlansId);

    const [schedules, setSchedules] = useState<DaySchedule[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [tripInfo, setTripInfo] = useState({
        startDate: '',
        endDate: '',
        numberOfPeople: '',
        ageRange: '',
        transportation: ''
    });

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
    const [selectedPlaceType, setSelectedPlaceType] = useState<'ATTRACTION' | 'RESTAURANT' | null>(null);

    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [selectedPlaceForDetail, setSelectedPlaceForDetail] = useState<ModalPlaceFromSearch | null>(null);

    const processApiResult = (apiResult: unknown) => {
        console.log('처리할 API 데이터 구조:', JSON.stringify(apiResult, null, 2));
        
        let tripData: ApiResult;
        
        if (apiResult && typeof apiResult === 'object' && 'result' in apiResult && apiResult.result) {
            tripData = apiResult.result as ApiResult;
        } else {
            tripData = apiResult as ApiResult;
        }
        
        if (!tripData || !tripData.days || !Array.isArray(tripData.days)) {
            console.error('API 응답에 days 배열이 없습니다:', tripData);
            setIsLoading(false);
            return;
        }
        
        if (tripData.startDate && tripData.endDate) {
            const formatDate = (dateStr: string) => {
                return dateStr.replace(/-/g, '.');
            };
            
            setTripInfo(prev => ({
                ...prev,
                startDate: prev.startDate || formatDate(tripData.startDate),
                endDate: prev.endDate || formatDate(tripData.endDate),
                numberOfPeople: prev.numberOfPeople || tripData.numberOfPeople || '',
                ageRange: prev.ageRange || tripData.ageRange || '',
                transportation: prev.transportation || tripData.transportation || ''
            }));
        }
        
        const detailPromises: Promise<void>[] = [];
        
        const newSchedules: DaySchedule[] = tripData.days.map(day => {
            const dateObj = new Date(day.date);
            const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            
            const places: VisitPlace[] = day.scheduleItems
                .sort((a, b) => a.order - b.order)
                .map(item => ({
                    id: item.itemId,
                    name: item.name,
                    memo: item.memo || '',
                    time: '정보 불러오는 중...',
                    location: '주소 불러오는 중...',
                    imageUrl: item.imageUrl || travel_img1,
                    coordinates: {
                        lat: item.latitude,
                        lng: item.longitude
                    },
                    placeType: item.placeType,
                    originalPlaceId: item.placeId
                }));

            day.scheduleItems.forEach((item, placeItemIndex) => {
                let apiUrl = '';
                if (item.placeType === 'ATTRACTION') {
                    apiUrl = `/api/trip-plans/attractions/${item.placeId}`;
                } else if (item.placeType === 'RESTAURANT') {
                    apiUrl = `/api/trip-plans/restaurants/${item.placeId}`;
                } else {
                    console.warn(`알 수 없는 장소 유형: ${item.placeType}`, item);
                    return;
                }
                
                const fetchDetailPromise = async () => {
                    try {
                        const response = await authenticatedFetch(apiUrl);
                        
                        if (!response.ok) {
                            throw new Error(`상세 정보 API 응답 오류: ${response.status}`);
                        }
                        
                        const detailData = await response.json();
                        
                        if (!detailData.isSuccess || !detailData.result) {
                            throw new Error('상세 정보 API 응답 구조가 올바르지 않습니다.');
                        }
                        
                        const detail = detailData.result;
                        const dayScheduleIndex = day.dayNumber - 1;
                        
                        setSchedules(prev => {
                            const currentSchedules = prev;
                            if (dayScheduleIndex < 0 || dayScheduleIndex >= currentSchedules.length || !currentSchedules[dayScheduleIndex] || placeItemIndex >= currentSchedules[dayScheduleIndex].places.length) {
                                return currentSchedules;
                            }
                            
                            const newSchedulesState = [...currentSchedules];
                            const newPlaces = [...newSchedulesState[dayScheduleIndex].places];
                            
                            newPlaces[placeItemIndex] = {
                                ...newPlaces[placeItemIndex],
                                time: detail.operatingHours || '정보 없음',
                                location: detail.address || '주소 정보 없음',
                            };
                            
                            newSchedulesState[dayScheduleIndex] = {
                                ...newSchedulesState[dayScheduleIndex],
                                places: newPlaces
                            };
                            
                            return newSchedulesState;
                        });
                    } catch (err) {
                        console.error(`${item.name} 상세 정보 가져오기 실패:`, err);
                        const dayScheduleIndexOnError = day.dayNumber - 1;
                        setSchedules(prev => {
                            const currentSchedules = prev;
                            if (dayScheduleIndexOnError < 0 || dayScheduleIndexOnError >= currentSchedules.length || !currentSchedules[dayScheduleIndexOnError] || placeItemIndex >= currentSchedules[dayScheduleIndexOnError].places.length) {
                                return currentSchedules;
                            }
                            const newSchedulesState = [...currentSchedules];
                            const newPlaces = [...newSchedulesState[dayScheduleIndexOnError].places];
                            newPlaces[placeItemIndex] = {
                                ...newPlaces[placeItemIndex],
                                time: '정보를 가져올 수 없음',
                                location: '주소 정보를 가져올 수 없음',
                            };
                            newSchedulesState[dayScheduleIndexOnError] = {
                                ...newSchedulesState[dayScheduleIndexOnError],
                                places: newPlaces
                            };
                            return newSchedulesState;
                        });
                    }
                };
                detailPromises.push(fetchDetailPromise());
            });
            
            return {
                day: day.dayNumber,
                date: formattedDate,
                places
            };
        });
        
        setSchedules(newSchedules);

        const storedScheduleData = localStorage.getItem(`scheduleOrder_${tripPlansId}`);
        if (!storedScheduleData) {
            try {
                const initialSchedules = newSchedules.map(ds => ({ day: ds.day, places: ds.places.map(p => ({...p})) }));
                localStorage.setItem(`scheduleOrder_${tripPlansId}`, JSON.stringify(initialSchedules));
                console.log('[processApiResult] 로컬 스토리지 저장 성공');
            } catch (e) {
                console.error('[processApiResult] 로컬 스토리지 저장 실패:', e);
            }
        }
        
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

    useEffect(() => {
        if (!tripPlansId) {
          setError('여행 계획 ID가 없습니다. 이전 페이지로 돌아가 다시 시작해주세요.');
          setIsLoading(false);
          return;
        }

        // 로컬 스토리지에서 여행 정보 우선 로드
        const localStartDate = localStorage.getItem('startDate');
        const localEndDate = localStorage.getItem('endDate');
        const localNumberOfPeople = localStorage.getItem('numberOfPeople');
        const localAgeRange = localStorage.getItem('ageRange');
        const localTransportation = localStorage.getItem('transportation');

        if (localStartDate && localEndDate) {
            const formatDate = (dateStr: string) => dateStr.replace(/-/g, '.');
            setTripInfo(prev => ({
                ...prev,
                startDate: formatDate(localStartDate),
                endDate: formatDate(localEndDate),
            }));
        }
        if (localNumberOfPeople) {
            setTripInfo(prev => ({ ...prev, numberOfPeople: localNumberOfPeople }));
        }
        if (localAgeRange) {
            setTripInfo(prev => ({ ...prev, ageRange: localAgeRange }));
        }
        if (localTransportation) {
            setTripInfo(prev => ({ ...prev, transportation: localTransportation }));
        }
        
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
                            const updatedApiDays = dataToProcess.result.days.map((apiDay: DayApiSchedule) => {
                                const localDayData = localSchedules.find(ld => ld.day === apiDay.dayNumber);
                                if (localDayData && localDayData.places) {
                                    const scheduleItems: ScheduleItem[] = localDayData.places.map((p, index) => ({
                                        itemId: p.id, 
                                        order: index + 1,
                                        placeType: p.placeType || 'UNKNOWN',
                                        placeId: p.originalPlaceId || 0, 
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
                            
                            dataToProcess = {
                                ...dataToProcess,
                                result: {
                                    ...dataToProcess.result,
                                    days: updatedApiDays
                                }
                            };
                        }
                    } catch (e) {
                        console.error('[EditingPage] 로컬 스토리지 데이터 처리 중 오류:', e);
                    }
                }
                processApiResult(dataToProcess);
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
                    setTripInfo(prev => ({
                        ...prev,
                        numberOfPeople: prev.numberOfPeople || styleInfo.numberOfPeople || '',
                        ageRange: prev.ageRange || styleInfo.ageRange || '',
                        transportation: prev.transportation || styleInfo.transportation || ''
                    }));
                }
            })
            .catch(err => {
                console.error('API 호출 중 오류가 발생했습니다:', err);
                setError(`데이터 로딩 중 오류: ${err.message}`);
                setIsLoading(false);
                setSchedules([]);
            });
    }, [tripPlansId]);

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
                return false;
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

    const [draggedItem, setDraggedItem] = useState<{ dayIndex: number, placeIndex: number } | null>(null);
    const dragOverItemRef = useRef<{ dayIndex: number, placeIndex: number } | null>(null);
    const [isDragEnabled, setIsDragEnabled] = useState<boolean>(false);
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

    const openSearchModalForDay = (dayIndex: number, placeType: 'ATTRACTION' | 'RESTAURANT') => {
        setSelectedDayIndex(dayIndex);
        setSelectedPlaceType(placeType);
        setIsSearchModalOpen(true);
    };

    const handlePlaceSelectFromSearch = (place: ModalPlaceFromSearch) => {
        setSelectedPlaceForDetail(place);
        setIsSelectionModalOpen(true);
        setIsSearchModalOpen(false);
    };

    const mapPlaceToTravelItem = (place: ModalPlaceFromSearch | null): TravelItemForSelection | null => {
        if (!place) return null;
        return {
            attractionId: place.type === 'ATTRACTION' ? place.originalPlaceId : undefined,
            restaurantId: place.type === 'RESTAURANT' ? place.originalPlaceId : undefined,
            imageUrl: place.imageUrl || nullPlaceImage,
            name: place.name,
            title: place.name,
            address: place.address,
            latitude: place.coordinates?.lat,
            longitude: place.coordinates?.lng,
            operatingHours: '정보 없음',
            phoneNumber: '정보 없음',
        };
    };

    const handleAddPlaceFromSelectionModal = () => {
        if (!selectedPlaceForDetail || selectedDayIndex === null || selectedPlaceType === null) return;
        
        const placeToAdd = selectedPlaceForDetail;
        const newPlace: VisitPlace = {
            id: Date.now(),
            name: placeToAdd.name,
            memo: '',
            location: placeToAdd.address,
            imageUrl: placeToAdd.imageUrl || nullPlaceImage,
            coordinates: placeToAdd.coordinates,
            placeType: selectedPlaceType,
            originalPlaceId: placeToAdd.originalPlaceId || placeToAdd.id,
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
                console.error('로컬 스토리지 저장 실패 (handleAddPlaceFromSelectionModal):', e);
            }
        }

        setIsSelectionModalOpen(false);
        setSelectedPlaceForDetail(null);
    };

    const updatePlace = (dayIndex: number, placeId: number, field: keyof VisitPlace, value: string) => {
        setSchedules(prevSchedules => {
            const updatedSchedules = prevSchedules.map((schedule, i) => 
                i === dayIndex
                    ? { ...schedule, places: schedule.places.map(p => p.id === placeId ? { ...p, [field]: value } : p) }
                    : schedule
            );

            if (tripPlansId) {
                try {
                    const simplifiedSchedules = updatedSchedules.map(ds => ({
                        day: ds.day,
                        places: ds.places.map(p => ({ ...p }))
                    }));
                    localStorage.setItem(`scheduleOrder_${tripPlansId}`, JSON.stringify(simplifiedSchedules));
                } catch (e) {
                    console.error('로컬 스토리지 저장 실패 (updatePlace):', e);
                }
            }
            return updatedSchedules;
        });
    };

    const handleDragStart = (e: React.DragEvent, dayIndex: number, placeIndex: number) => {
        if (!isDragEnabled) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('text/plain', JSON.stringify({ dayIndex, placeIndex }));
        setDraggedItem({ dayIndex, placeIndex });
        if (e.dataTransfer.effectAllowed) {
            e.dataTransfer.effectAllowed = 'move';
        }
        setTimeout(() => {
            if (e.target instanceof HTMLElement) {
                e.target.classList.add('dragging');
            }
        }, 0);
    };

    const handleDragOver = (e: React.DragEvent, dayIndex: number, placeIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragEnabled || !draggedItem) return;
        if (e.dataTransfer.dropEffect) {
            e.dataTransfer.dropEffect = 'move';
        }
        if (e.currentTarget instanceof HTMLElement) {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseY = e.clientY;
            const elementMiddleY = rect.top + rect.height / 2;
            if (mouseY < elementMiddleY) {
                dragOverItemRef.current = { dayIndex, placeIndex };
                setDragOverItem({ dayIndex, placeIndex, position: 'top' });
            } else {
                dragOverItemRef.current = { dayIndex, placeIndex: placeIndex + 1 };
                setDragOverItem({ dayIndex, placeIndex, position: 'bottom' });
            }
        } else {
            dragOverItemRef.current = { dayIndex, placeIndex };
            setDragOverItem({ dayIndex, placeIndex });
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.target instanceof HTMLElement) {
            e.target.classList.remove('dragging');
        }
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

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
            return;
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragEnabled || !draggedItem) return;
        const elements = document.querySelectorAll('.dragging');
        elements.forEach(el => el.classList.remove('dragging'));
        handleDragEnd(e);
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [placeToDelete, setPlaceToDelete] = useState<{ dayIndex: number, placeId: number } | null>(null);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const saveMemo = () => {
        setIsSaveModalOpen(true);
    };

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
                if (!place.placeType || place.placeType === 'UNKNOWN' || !place.originalPlaceId) {
                    console.warn(`장소 "${place.name}" (ID: ${place.id})는 placeType("${place.placeType}") 또는 originalPlaceId("${place.originalPlaceId}")가 유효하지 않아 저장에서 제외됩니다.`);
                    return;
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
                    console.warn(`장소 "${place.name}"의 타입 ${place.placeType}은 현재 저장 로직에서 지원되지 않아 제외됩니다.`);
                    return;
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
            setIsLoading(true);
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
                     console.error('API 에러 메시지 JSON 파싱 실패:', parseErr);
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
            setIsLoading(false);
            setIsSaveModalOpen(false);
        }
    };

    const deletePlace = (dayIndex: number, placeId: number) => {
      setPlaceToDelete({ dayIndex, placeId });
      setIsDeleteModalOpen(true);
    };

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

          if (tripPlansId) {
            try {
                const simplifiedSchedules = newSchedules.map(daySchedule => ({
                    day: daySchedule.day,
                    places: daySchedule.places.map(place => ({ ...place })),
                }));
                localStorage.setItem(`scheduleOrder_${tripPlansId}`, JSON.stringify(simplifiedSchedules));
            } catch (e) {
                console.error('로컬 스토리지 저장 실패 (handleDelete):', e);
            }
          }
          
          return newSchedules;
        });
        
        setIsDeleteModalOpen(false);
        setPlaceToDelete(null);
      }
    };

    const handleOptionsMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDragEnabled(true);
    };

    const handleOptionsMouseUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (draggedItem) return;
        setIsDragEnabled(false);
    };

    const handleEmptyListDrop = (e: React.DragEvent, dayIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragEnabled || !draggedItem) return;
        const { dayIndex: draggedDayIndex, placeIndex: draggedPlaceIndex } = draggedItem;
        if (draggedDayIndex === dayIndex && schedules[dayIndex].places.length > 0) {
            return;
        }
        const displayedDays = [currentPageIndex * 2, currentPageIndex * 2 + 1];
        if (!displayedDays.includes(dayIndex) || dayIndex >= schedules.length || draggedDayIndex >= schedules.length) {
            return;
        }
        if (draggedPlaceIndex >= schedules[draggedDayIndex].places.length) {
            return;
        }
        setSchedules(prev => {
            const newSchedules = [...prev];
            const sourcePlaces = [...newSchedules[draggedDayIndex].places];
            const destPlaces = [...newSchedules[dayIndex].places];
            const draggedPlace = sourcePlaces[draggedPlaceIndex];
            sourcePlaces.splice(draggedPlaceIndex, 1);
            destPlaces.push(draggedPlace);
            newSchedules[draggedDayIndex].places = sourcePlaces;
            newSchedules[dayIndex].places = destPlaces;

            if (tripPlansId) {
                try {
                    const simplifiedSchedules = newSchedules.map(daySchedule => ({
                        day: daySchedule.day,
                        places: daySchedule.places.map(place => ({ ...place })),
                    }));
                    localStorage.setItem(`scheduleOrder_${tripPlansId}`, JSON.stringify(simplifiedSchedules));
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
        setDraggedItem(null);
        setDragOverItem(null);
        dragOverItemRef.current = null;
        setIsDragEnabled(false);
    };

    const preventDragHandler = (e: React.DragEvent) => {
        e.stopPropagation();
    };

    if (isLoading && !isSaveModalOpen && !isSelectionModalOpen) {
        return <LoadingSpinner message="여행 일정을 불러오는 중..." />;
    }

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
                            <DetailItem><DetailIcon>👥</DetailIcon> {tripInfo.numberOfPeople}</DetailItem>
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
                        onDragOver={(e: React.DragEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isDragEnabled || !draggedItem) return;
                            if (schedule.places.length === 0) {
                                dragOverItemRef.current = { dayIndex, placeIndex: 0 };
                                setDragOverItem({ dayIndex, placeIndex: 0, position: 'top' });
                            }
                        }}
                        onDrop={(e: React.DragEvent) => {
                            if (schedule.places.length === 0) handleEmptyListDrop(e, dayIndex);
                        }}
                    >
                        <AddPlaceButtonContainer>
                          <AddSpecificPlaceButton onClick={() => openSearchModalForDay(dayIndex, 'ATTRACTION')}>
                          <PlusIcon>+</PlusIcon>
                            <AddPlaceText>여행지 추가</AddPlaceText>
                          </AddSpecificPlaceButton>
                          <AddSpecificPlaceButton onClick={() => openSearchModalForDay(dayIndex, 'RESTAURANT')}>
                            <PlusIcon>+</PlusIcon>
                            <AddPlaceText>음식점 추가</AddPlaceText>
                          </AddSpecificPlaceButton>
                        </AddPlaceButtonContainer>
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
        
        <SearchModal
            isOpen={isSearchModalOpen}
            onClose={() => {
                setIsSearchModalOpen(false);
                setSelectedDayIndex(null);
                setSelectedPlaceType(null);
            }}
            onItemSelect={handlePlaceSelectFromSearch}
            placeType={selectedPlaceType}
        />

        <SelectionModal 
            isOpen={isSelectionModalOpen}
            onClose={() => {
                setIsSelectionModalOpen(false);
                setSelectedPlaceForDetail(null);
            }}
            selectedTravelItem={mapPlaceToTravelItem(selectedPlaceForDetail)}
            onSelect={handleAddPlaceFromSelectionModal}
        />
        
        <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onDelete={handleDelete}
            itemName={placeToDelete ? schedules[placeToDelete.dayIndex]?.places.find(p => p.id === placeToDelete.placeId)?.name || '장소' : '장소'}
        />
        
        <SaveModal
            isOpen={isSaveModalOpen}
            onClose={() => setIsSaveModalOpen(false)}
            onSave={handleSave}
            title="일정 저장"
        />
        </PageLayout>
    );
};

const PageLayout = styled.div`
  display: flex;
  width: 100%;
  height: calc(100vh - 60px);
  background-color: #f8fafc;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  overflow: hidden;
  position: fixed;
  top: 60px;
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
  min-height: 0;
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

const AddPlaceButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const AddSpecificPlaceButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1; 
  padding: 14px 0;
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