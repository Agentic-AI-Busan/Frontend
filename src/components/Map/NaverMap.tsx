import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
    generateInfoWindowContent, 
    createInfoWindow, 
    createMarker,
    getDayColor
} from './MapContent';

// 장소 정보 타입
export interface Place {
    id: number;
    name: string;
    lat: number;
    lng: number;
    description: string;
    imageUrl?: string;
    operatingHours?: string;
    visitors?: number;
    time: string;
    location: string;
    day?: number; // 장소가 속한 일차
}

// 네이버 맵 타입 네임스페이스
/* eslint-disable */
export namespace NaverMapTypes {
    export interface Map {
        setCenter(latLng: LatLng): void;
        getCenter(): LatLng;
        setZoom(zoom: number): void;
        fitBounds(bounds: LatLngBounds): void;
        panTo(latLng: LatLng, options?: {duration: number, easing: string}): void;
    }
    
    export interface LatLng {
        lat(): number;
        lng(): number;
    }
    
    export interface LatLngBounds {
        // 경계 객체
        getCenter(): LatLng;
    }
    
    export interface Marker {
        setMap(map: Map | null): void;
        getPosition(): LatLng;
    }
    
    export interface InfoWindow {
        setContent(content: string): void;
        open(map: Map, marker: Marker): void;
        close(): void;
    }
    
    export interface Polyline {
        setMap(map: Map | null): void;
    }
    
    export interface Event {
        addListener(instance: object, eventName: string, handler: Function): EventListener;
        removeListener(listener: EventListener): void;
        trigger(instance: object, eventName: string): void;
    }
    
    export interface EventListener {
        // 이벤트 리스너
    }
    
    export interface Size {
        width: number;
        height: number;
    }
    
    export interface Point {
        x: number;
        y: number;
    }

    // 네이버 맵스 API 타입 정의
    export interface NaverMapsApi {
        Map: new (elementId: HTMLElement | string, options: object) => Map;
        LatLng: new (lat: number, lng: number) => LatLng;
        LatLngBounds: new (sw: LatLng, ne: LatLng) => LatLngBounds;
        Marker: new (options: object) => Marker;
        InfoWindow: new (options: object) => InfoWindow;
        Polyline: new (options: object) => Polyline;
        Event: Event;
        Size: new (width: number, height: number) => Size;
        Point: new (x: number, y: number) => Point;
    }
}
/* eslint-enable */

// 지도 컨테이너 스타일
const MapContainer = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
`;

const MapElement = styled.div`
    width: 100%;
    height: 100%;
`;

interface NaverMapProps {
    places: Place[];
    center?: { lat: number; lng: number };
    zoom?: number;
    activeDay?: number;
    onFocusPlace?: ((focusFunction: (placeId: number) => void) => void);
}

const NaverMap: React.FC<NaverMapProps> = ({ 
    places,
    center = { lat: 35.1152, lng: 129.04211 }, // 기본값: 부산역
    zoom = 13,
    activeDay = 1,
    onFocusPlace
}) => {
    const mapRef = useRef<NaverMapTypes.Map | null>(null);
    const mapElement = useRef<HTMLDivElement>(null);
    const infoWindowRef = useRef<NaverMapTypes.InfoWindow | null>(null);
    const polylineRef = useRef<NaverMapTypes.Polyline | null>(null);
    const markersRef = useRef<NaverMapTypes.Marker[]>([]);
    const activeMarkerRef = useRef<NaverMapTypes.Marker | null>(null); // 현재 활성화된 마커

    // 네이버 맵스 객체를 위한 타입 안전 접근 도우미 함수
    const getNaverMaps = (): NaverMapTypes.NaverMapsApi => {
        return ((window.naver as unknown) as { maps: NaverMapTypes.NaverMapsApi }).maps;
    };

    // 현재 일차에 해당하는 장소들의 경계에 맞게 지도 포커스 맞추기
    const fitBoundsToActivePlaces = (activePlaces: Place[]) => {
        if (!mapRef.current || activePlaces.length === 0) return;
        
        if (activePlaces.length === 1) {
            // 장소가 하나만 있는 경우 해당 위치로 중심 이동
            const naverMaps = getNaverMaps();
            const latLng = new naverMaps.LatLng(activePlaces[0].lat, activePlaces[0].lng);
            mapRef.current.panTo(latLng, {duration: 700, easing: 'easeOutCubic'});
            
            // 애니메이션 완료 후 줌 레벨 변경
            setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.setZoom(14);
                }
            }, 700);
            
            return;
        }
        
        // 모든 장소의 위도/경도 범위 계산
        let minLat = activePlaces[0].lat;
        let maxLat = activePlaces[0].lat;
        let minLng = activePlaces[0].lng;
        let maxLng = activePlaces[0].lng;
        
        activePlaces.forEach(place => {
            minLat = Math.min(minLat, place.lat);
            maxLat = Math.max(maxLat, place.lat);
            minLng = Math.min(minLng, place.lng);
            maxLng = Math.max(maxLng, place.lng);
        });
        
        // 경계를 약간 확장하여 여유 공간 확보
        const padding = 0.01; // 약 1km 정도의 패딩
        minLat -= padding;
        maxLat += padding;
        minLng -= padding;
        maxLng += padding;
        
        // 중간 위치를 계산하여 먼저 이동
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        const naverMaps = getNaverMaps();
        const centerLatLng = new naverMaps.LatLng(centerLat, centerLng);
        
        mapRef.current.panTo(centerLatLng, {duration: 700, easing: 'easeOutCubic'});
        
        // 애니메이션 완료 후 경계 맞추기
        setTimeout(() => {
            if (mapRef.current) {
                // 지도를 경계에 맞게 조정
                const bounds = new naverMaps.LatLngBounds(
                    new naverMaps.LatLng(minLat, minLng),
                    new naverMaps.LatLng(maxLat, maxLng)
                );
                
                mapRef.current.fitBounds(bounds);
            }
        }, 700);
    };

    // 정보창 닫기 함수
    const closeInfoWindow = () => {
        if (infoWindowRef.current) {
            infoWindowRef.current.close();
            activeMarkerRef.current = null; // 활성화된 마커 초기화
        }
    };

    useEffect(() => {
        // 네이버 맵 스크립트 로드 함수
        const loadNaverMapScript = () => {
            if (window.naver && window.naver.maps) {
                initializeMap();
                return;
            }

            // 전역 콜백 함수 정의
            window.initMap = initializeMap;

            const script = document.createElement('script');
            script.src = 'https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=ho9ttd9dfm&submodules=geocoder&callback=initMap';
            script.async = true;
            document.head.appendChild(script);

            return () => {
                if (script && script.parentNode) {
                    document.head.removeChild(script);
                }
                window.initMap = undefined;
            };
        };

        // 지도 초기화 함수
        const initializeMap = () => {
            if (!mapElement.current || !window.naver || !window.naver.maps) return;

            // 기본 지도 생성
            const naverMaps = getNaverMaps();
            const mapOptions = {
                center: new naverMaps.LatLng(center.lat, center.lng),
                zoom: zoom,
                // 로고 컨트롤 (왼쪽 하단 Naver Corp 텍스트) 숨기기
                logoControl: false,
                // 데이터 저작권 컨트롤 (오른쪽 하단 Naver 마크) 숨기기
                mapDataControl: false,
                // 스케일 컨트롤 (오른쪽 아래 km 표시) 숨기기
                scaleControl: false,
                // 줌 컨트롤 (오른쪽 확대/축소 버튼) 숨기기
                zoomControl: false,
                // 지도 이동 애니메이션 활성화
                disableKineticPan: false,
                // 스크롤 휠 확대/축소 감도 조절 (값이 낮을수록 스크롤 시 확대/축소 정도가 작아짐, 기본값은 1)
                scrollWheel: 0.3,
                // 스크롤 휠 한 번에 확대/축소되는 단계 제한 (값이 작을수록 부드러운 확대/축소, 기본값은 3)
                scrollWheelZoom: 0.3
            };

            const map = new naverMaps.Map(mapElement.current, mapOptions);
            mapRef.current = map;

            // 정보창 생성
            const infoWindow = createInfoWindow();
            if (!infoWindow) return;
            infoWindowRef.current = infoWindow;

            // 지도 클릭 이벤트 추가
            naverMaps.Event.addListener(map, 'click', () => {
                closeInfoWindow();
            });

            // 이전 Polyline 제거
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
            }

            // 이전 마커들 제거
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];

            // 현재 일차에 해당하는 장소들만 필터링
            const activePlaces = places.filter(place => place.day === activeDay);

            // 현재 일차 장소들에 맞게 지도 경계 조정
            fitBoundsToActivePlaces(activePlaces);

            // 마커들을 순서대로 연결하는 Polyline 생성
            const path = activePlaces.map(place => 
                new naverMaps.LatLng(place.lat, place.lng)
            );

            // 현재 일차에 맞는 색상 가져오기
            const dayColor = getDayColor(activeDay);

            const polylineOptions = {
                path: path,
                strokeColor: dayColor, // 일차별 색상 적용
                strokeWeight: 5,
                strokeOpacity: 0.8,
                strokeStyle: 'dashed',
                map: map
            };

            const polyline = new naverMaps.Polyline(polylineOptions);
            polylineRef.current = polyline;

            // 장소마다 마커 생성 및 정보창 연결
            activePlaces.forEach((place, index) => {
                const marker = createMarker(
                    map, 
                    { lat: place.lat, lng: place.lng }, 
                    place.name,
                    activeDay,
                    index + 1,
                    dayColor // 일차별 색상 전달
                );
                if (!marker) return;

                markersRef.current.push(marker);

                // 마커 클릭 이벤트 처리
                naverMaps.Event.addListener(marker, 'click', () => {
                    // 이미 열려있는 마커를 다시 클릭한 경우 정보창 닫기
                    if (activeMarkerRef.current === marker) {
                        closeInfoWindow();
                        return;
                    }
                    
                    // 다른 마커를 클릭한 경우 정보창 열기
                    const contentString = generateInfoWindowContent(place);
                    infoWindow.setContent(contentString);
                    infoWindow.open(map, marker);
                    
                    // 활성화된 마커 업데이트
                    activeMarkerRef.current = marker;
                });
            });
        };

        const cleanup = loadNaverMapScript();
        return cleanup;
    }, [center, zoom, places, activeDay]);

    // 특정 장소로 포커스를 맞추는 함수
    const focusPlace = (placeId: number) => {
        if (!mapRef.current || !infoWindowRef.current) return;
        
        // 특수 값 -1은 전체 루트 표시를 의미함
        if (placeId === -1) {
            const activePlaces = places.filter(p => p.day === activeDay);
            fitBoundsToActivePlaces(activePlaces);
            return;
        }
        
        // 현재 보이는 활성 장소들 중에서 찾기
        const place = places.find(p => p.id === placeId && p.day === activeDay);
        if (!place) return;

        // 해당 위치로 지도 중심 이동 (애니메이션 적용)
        // 위도에서 약간 뺀 값으로 설정하여 지도 중심이 마커보다 조금 아래에 오도록 함
        // 위도가 작아질수록 지도는 남쪽(아래쪽)으로 이동
        const offsetLat = place.lat + 0.015; // 약간 아래쪽으로 조정
        const naverMaps = getNaverMaps();
        const latLng = new naverMaps.LatLng(offsetLat, place.lng);
        mapRef.current.panTo(latLng, {duration: 500, easing: 'easeOutCubic'});
        
        // 해당 마커 찾기
        const marker = markersRef.current.find(m => {
            const position = m.getPosition();
            return position.lat() === place.lat && position.lng() === place.lng;
        });

        if (marker) {
            // 이미 열려있는 마커를 다시 선택한 경우 상태 유지
            if (activeMarkerRef.current === marker) {
                return;
            }
            
            // 정보창 내용 설정 및 표시
            const contentString = generateInfoWindowContent(place);
            infoWindowRef.current.setContent(contentString);
            infoWindowRef.current.open(mapRef.current, marker);
            
            // 활성화된 마커 업데이트
            activeMarkerRef.current = marker;
        }
    };

    // onFocusPlace 함수 참조 전달
    useEffect(() => {
        if (typeof onFocusPlace === 'function') {
            onFocusPlace(focusPlace);
        }
    }, [onFocusPlace, places]);

    return (
        <MapContainer>
            <MapElement ref={mapElement} id="map" />
        </MapContainer>
    );
};

export default NaverMap; 