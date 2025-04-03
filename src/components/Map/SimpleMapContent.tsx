import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface Coordinates {
    lat: number;
    lng: number;
}

interface Place {
    id: number;
    name: string;
    lat: number;
    lng: number;
    location: string;
}

interface SimpleMapContentProps {
    center?: Coordinates;
    zoom?: number;
    places?: Place[];
}

// 네이버 맵 타입 정의
export interface NaverMap {
    setCenter(latLng: NaverLatLng): void;
    getCenter(): NaverLatLng;
    setZoom(zoom: number): void;
}

export interface NaverLatLng {
    lat(): number;
    lng(): number;
}

export interface NaverMarker {
    setMap(map: NaverMap | null): void;
    getPosition(): NaverLatLng;
}

export interface NaverSize {
    width: number;
    height: number;
}

export interface NaverPoint {
    x: number;
    y: number;
}

export interface NaverEventListener {
    eventName: string;
}

declare global {
    interface Window {
        naver: {
            maps: {
                Map: new (elementId: HTMLElement | string, options: object) => NaverMap;
                LatLng: new (lat: number, lng: number) => NaverLatLng;
                Marker: new (options: object) => NaverMarker;
                Size: new (width: number, height: number) => NaverSize;
                Point: new (x: number, y: number) => NaverPoint;
                Event: {
                    addListener: (instance: object, eventName: string, handler: () => void) => NaverEventListener;
                };
            }
        };
        initMap?: () => void;
    }
}

const MapContainer = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
`;

const MapElement = styled.div`
    width: 100%;
    height: 100%;
`;

const SimpleMapContent: React.FC<SimpleMapContentProps> = ({
    center = { lat: 35.1796, lng: 129.0756 }, // 부산 해운대 좌표 기본값
    zoom = 15,
    places = []
}) => {
    const mapRef = useRef<NaverMap | null>(null);
    const mapElement = useRef<HTMLDivElement>(null);
    const markersRef = useRef<NaverMarker[]>([]);

    // 마커 생성 함수
    const createMarker = (map: NaverMap, position: Coordinates, title: string) => {
        if (!window.naver || !window.naver.maps) return null;
        
        const markerOptions = {
            position: new window.naver.maps.LatLng(position.lat, position.lng),
            map: map,
            title: title,
            icon: {
                content: `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                ">
                    <div style="
                        width: 30px;
                        height: 30px;
                        background-color: #3498db;
                        border: 2px solid #ffffff;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
                        position: relative;
                        margin-bottom: 4px;
                    ">
                        <div style="
                            width: 15px;
                            height: 15px;
                            background-color: #ffffff;
                            border-radius: 50%;
                        "></div>
                    </div>
                    <div style="
                        margin-top: 8px;
                        background-color: rgba(255, 255, 255, 0.9);
                        padding: 6px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: bold;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                        white-space: nowrap;
                    ">${title}</div>
                </div>`,
                size: new window.naver.maps.Size(40, 60),
                anchor: new window.naver.maps.Point(15, 42)
            }
        };
        
        return new window.naver.maps.Marker(markerOptions);
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
            const mapOptions = {
                center: new window.naver.maps.LatLng(center.lat, center.lng),
                zoom: zoom,
                logoControl: false,
                mapDataControl: false,
                scaleControl: false,
                zoomControl: false,
                disableKineticPan: false
            };

            const map = new window.naver.maps.Map(mapElement.current, mapOptions);
            mapRef.current = map;

            // 이전 마커들 제거
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];

            // 각 장소마다 마커 생성
            places.forEach(place => {
                const marker = createMarker(
                    map, 
                    { lat: place.lat, lng: place.lng }, 
                    place.name
                );
                if (marker) {
                    markersRef.current.push(marker);
                }
            });
        };

        const cleanup = loadNaverMapScript();
        return cleanup;
    }, [center, zoom, places]);

    return (
        <MapContainer>
            <MapElement ref={mapElement} id="map" />
        </MapContainer>
    );
};

export default SimpleMapContent; 