import { Place, NaverMapTypes } from './NaverMap';
import travel_img1 from '../../assets/images/travel_img1.jpg';

// =============== 정보창 스타일 정의 ===============
const infoWindowStyles = {
    container: `
        width: 300px;
        font-family: 'Noto Sans KR', sans-serif;
        opacity: 0;
        animation: infoWindowFadeIn 0.3s ease-out forwards;
        animation-delay: 0.05s;
        will-change: opacity;
        background: #ffffff;
        overflow: initial;
        box-shadow: 0 10px 25px rgba(0,0,0,0.08);
    `,
    imageContainer: `
        width: 100%;
        height: 180px;
        background-size: cover;
        background-position: center;
        position: relative;
    `,
    imageOverlay: `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 75%;
        background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.4) 60%, transparent);
    `,
    titleContainer: `
        position: absolute;
        bottom: 16px;
        left: 24px;
        right: 24px;
    `,
    title: `
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
        text-shadow: 0 2px 6px rgba(0,0,0,0.4);
        line-height: 1.3;
        letter-spacing: -0.02em;
    `,
    contentContainer: `
        padding: 16px 20px;
        background: #ffffff;
        position: relative;
    `,
    description: `
        margin: 0 0 14px 0;
        font-size: 14px;
        line-height: 1.7;
        color: #2D3748;
        font-weight: 400;
        letter-spacing: -0.01em;
        position: relative;
        padding-left: 14px;
        margin-top: 8px;
    `,
    memoLabel: `
        font-size: 14px;
        font-weight: 600;
        color: #4A5568;
        padding-left: 14px;
        padding-top: 3px;
        padding-bottom: 2px;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        border-left: 2px solid #E2E8F0;
        line-height: 1.2;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
    `,
    memoContainer: `
        position: relative;
        margin-bottom: 14px;
        padding-top: 14px;
        border-top: 1px solid #E2E8F0;
        margin-top: 16px;
    `,
    infoSection: `
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-top: 0;
    `,
    infoItem: `
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #4A5568;
        background: #F7FAFC;
        padding: 10px 14px;
        border-radius: 10px;
        transition: all 0.2s ease;
    `,
    iconBox: `
        width: 34px;
        height: 34px;
        background: #ffffff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 14px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    `,
    icon: `
        font-size: 18px;
    `,
    infoLabel: `
        font-size: 12px;
        color: #718096;
        margin-bottom: 4px;
    `,
    infoValue: `
        font-size: 13px;
        color: #2D3748;
        font-weight: 500;
    `,
    animation: `
        @keyframes infoWindowFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
        }
    `
};

// =============== 마커 및 정보창 스타일 옵션 ===============

/**
 * 정보창 앵커 스타일
 */
export const anchorStyle = {
    anchor: `
        position: absolute;
        bottom: -15px;
        left: 122px;
        transform: translateX(-60%);
        width: 35px;
        height: 35px;
        background-color: #ffffff;
        transform: rotate(45deg);
        box-shadow: 5px 5px 10px rgba(0,0,0,0.08);
        z-index: -1;
    `
}

/**
 * 정보창 스타일 옵션
 */
export const infoWindowStyle = {
    maxWidth: 340,
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
    borderWidth: 0,
    padding: 0,
    pixelOffset: {
        x: 10,
        y: -24  // 앵커를 포함할 공간 확보를 위해 y값 조정
    },
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
};

// 마커 색상 정의 - 앱 전체에서 사용하는 일차별 색상
export const dayColors = {
    primary: {
        day1: '#C53030', // 진한 빨간색
        day2: '#2F855A', // 진한 초록색
        day3: '#805AD5', // 진한 보라색
        day4: '#D69E2E', // 진한 주황색
        day5: '#DD6B20', // 진한 주황색
    },
    dark: {
        day1: '#9B2C2C', // 빨간색 어두운 버전
        day2: '#276749', // 초록색 어두운 버전
        day3: '#6B46C1', // 보라색 어두운 버전
        day4: '#B7791F', // 주황색 어두운 버전
        day5: '#C05621', // 주황색 어두운 버전
    },
    light: {
        day1: '#FFF5F5', // 빨간색 배경
        day2: '#F0FFF4', // 초록색 배경
        day3: '#FAF5FF', // 보라색 배경
        day4: '#FFFAF0', // 주황색 배경
        day5: '#FFFAF0', // 주황색 배경
    },
    text: {
        day1: '#C53030', // 빨간색 텍스트
        day2: '#2F855A', // 초록색 텍스트
        day3: '#805AD5', // 보라색 텍스트
        day4: '#D69E2E', // 주황색 텍스트
        day5: '#DD6B20', // 주황색 텍스트
    },
    darkerText: {
        day1: '#9B2C2C', // 진한 빨간색
        day2: '#276749', // 진한 초록색
        day3: '#6B46C1', // 진한 보라색
        day4: '#B7791F', // 진한 주황색
        day5: '#C05621', // 진한 주황색
    },
    veryLight: {
        day1: '#FED7D7', // 연한 빨간색
        day2: '#C6F6D5', // 연한 초록색
        day3: '#E9D8FD', // 연한 보라색
        day4: '#FEEBC8', // 연한 주황색
        day5: '#FEEBC8', // 연한 주황색
    },
    medium: {
        day1: '#FC8181', // 중간 빨간색
        day2: '#68D391', // 중간 초록색
        day3: '#B794F4', // 중간 보라색
        day4: '#F6AD55', // 중간 주황색
        day5: '#F6AD55', // 중간 주황색
    }
};

/**
 * 일차(day) 번호에 따라 해당하는 색상 반환하는 유틸리티 함수
 */
// 기본 색상 가져오기
export const getDayColor = (day: number): string => {
    const colorKey = `day${day}` as keyof typeof dayColors.primary;
    return dayColors.primary[colorKey] || dayColors.primary.day1;
};

// 어두운 버전 색상 가져오기
export const getDayDarkColor = (day: number): string => {
    const colorKey = `day${day}` as keyof typeof dayColors.dark;
    return dayColors.dark[colorKey] || dayColors.dark.day1;
};

// 밝은 배경 색상 가져오기
export const getDayLightColor = (day: number): string => {
    const colorKey = `day${day}` as keyof typeof dayColors.light;
    return dayColors.light[colorKey] || dayColors.light.day1;
};

// 텍스트 색상 가져오기
export const getDayTextColor = (day: number): string => {
    const colorKey = `day${day}` as keyof typeof dayColors.text;
    return dayColors.text[colorKey] || dayColors.text.day1;
};

// 더 어두운 텍스트 색상 가져오기
export const getDayDarkerTextColor = (day: number): string => {
    const colorKey = `day${day}` as keyof typeof dayColors.darkerText;
    return dayColors.darkerText[colorKey] || dayColors.darkerText.day1;
};

// 매우 연한 배경색 가져오기
export const getDayVeryLightColor = (day: number): string => {
    const colorKey = `day${day}` as keyof typeof dayColors.veryLight;
    return dayColors.veryLight[colorKey] || dayColors.veryLight.day1;
};

// 중간 강도 테두리 색상 가져오기
export const getDayMediumColor = (day: number): string => {
    const colorKey = `day${day}` as keyof typeof dayColors.medium;
    return dayColors.medium[colorKey] || dayColors.medium.day1;
};

// 마커 스타일 옵션
export const markerStyle = {
    day1: {
        fillColor: dayColors.primary.day1,
        fillOpacity: 0.8,
        strokeWeight: 2,
        strokeColor: '#ffffff',
        strokeOpacity: 0.8,
        textColor: '#ffffff',
        textSize: 14,
        textWeight: 'bold',
    },
    day2: {
        fillColor: dayColors.primary.day2,
        fillOpacity: 0.8,
        strokeWeight: 2,
        strokeColor: '#ffffff',
        strokeOpacity: 0.8,
        textColor: '#ffffff',
        textSize: 14,
        textWeight: 'bold',
    },
    day3: {
        fillColor: dayColors.primary.day3,
        fillOpacity: 0.8,
        strokeWeight: 2,
        strokeColor: '#ffffff',
        strokeOpacity: 0.8,
        textColor: '#ffffff',
        textSize: 14,
        textWeight: 'bold',
    },
    day4: {
        fillColor: dayColors.primary.day4,
        fillOpacity: 0.8,
        strokeWeight: 2,
        strokeColor: '#ffffff',
        strokeOpacity: 0.8,
        textColor: '#ffffff',
        textSize: 14,
        textWeight: 'bold',
    },
    day5: {
        fillColor: dayColors.primary.day5,
        fillOpacity: 0.8,
        strokeWeight: 2,
        strokeColor: '#ffffff',
        strokeOpacity: 0.8,
        textColor: '#ffffff',
        textSize: 14,
        textWeight: 'bold',
    },
};

// =============== 유틸리티 함수 ===============

/**
 * 네이버 맵 정보창에 표시될 HTML 컨텐츠를 생성하는 함수
 * @param place 장소 정보
 * @returns 정보창에 표시될 HTML 문자열
 */
export const generateInfoWindowContent = (place: Place): string => {
    return `
        <div style="${infoWindowStyles.container}">
            <style>${infoWindowStyles.animation}</style>
            <div style="width:100%; position:relative;">
                <!-- 커스텀 앵커 추가 -->
                <div style="${anchorStyle.anchor}"></div>
                <div style="${infoWindowStyles.imageContainer} background-image:url('${place.imageUrl || travel_img1}');">
                    <div style="${infoWindowStyles.imageOverlay}"></div>
                    <div style="${infoWindowStyles.titleContainer}">
                        <h3 style="${infoWindowStyles.title}">${place.name}</h3>
                    </div>
                </div>
                <div style="${infoWindowStyles.contentContainer}">
                    <div style="${infoWindowStyles.infoSection}">
                        <div style="${infoWindowStyles.infoItem}">
                            <div style="${infoWindowStyles.iconBox}">
                                <span style="${infoWindowStyles.icon}">🕒</span>
                            </div>
                            <div>
                                <div style="${infoWindowStyles.infoLabel}">운영시간</div>
                                <div style="${infoWindowStyles.infoValue}">${place.operatingHours || '운영시간 정보 없음'}</div>
                            </div>
                        </div>
                        <div style="${infoWindowStyles.infoItem}">
                            <div style="${infoWindowStyles.iconBox}">
                                <span style="${infoWindowStyles.icon}">📍</span>
                            </div>
                            <div>
                                <div style="${infoWindowStyles.infoLabel}">주소</div>
                                <div style="${infoWindowStyles.infoValue}">${place.location || '주소 정보 없음'}</div>
                            </div>
                        </div>
                    </div>
                    <div style="${infoWindowStyles.memoContainer}">
                        <div style="${infoWindowStyles.memoLabel}">MEMO</div>
                        <p style="${infoWindowStyles.description}">${place.description}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
};

/**
 * 정보창 생성 함수
 * @returns Naver 맵 InfoWindow 설정 객체
 */
export const createInfoWindow = () => {
    if (!window.naver || !window.naver.maps) return null;
    
    // naver.maps를 NaverMapTypes.NaverMapsApi로 명시적 타입 캐스팅
    const naverMaps = (window.naver.maps as unknown) as NaverMapTypes.NaverMapsApi;
    
    return new naverMaps.InfoWindow({
        content: '',
        maxWidth: infoWindowStyle.maxWidth,
        backgroundColor: infoWindowStyle.backgroundColor,
        borderColor: infoWindowStyle.borderColor,
        borderWidth: infoWindowStyle.borderWidth,
        pixelOffset: new naverMaps.Point(
            infoWindowStyle.pixelOffset.x, 
            infoWindowStyle.pixelOffset.y
        ),
        disableAnchor: true,  // 기본 앵커 비활성화
        zIndex: 150,
        cssStyle: {
            boxShadow: infoWindowStyle.boxShadow
        }
    });
};

/**
 * 마커 생성 함수
 * @param map 표시할 지도 객체
 * @param position 위치 (위도, 경도)
 * @param title 마커 제목
 * @param day 일차
 * @param order 순서
 * @param color 마커 색상 (옵션)
 * @returns Naver 맵 Marker 객체
 */
export const createMarker = (
    map: NaverMapTypes.Map,
    position: { lat: number; lng: number },
    title: string,
    day: number,
    order: number,
    color?: string
) => {
    if (!window.naver || !window.naver.maps) return null;
    
    // naver.maps를 NaverMapTypes.NaverMapsApi로 명시적 타입 캐스팅
    const naverMaps = (window.naver.maps as unknown) as NaverMapTypes.NaverMapsApi;
    
    // 색상이 제공되면 해당 색상 사용, 아니면 기본 일차별 색상 사용
    const markerColor = color || getDayColor(day);
    
    const markerOptions = {
        position: new naverMaps.LatLng(position.lat, position.lng),
        map: map,
        title: title,
        icon: {
            content: `<div class="marker-wrapper" style="
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            ">
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 32px;
                    height: 32px;
                    background-color: ${markerColor};
                    border: 2px solid #ffffff;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ffffff;
                    font-weight: bold;
                    font-size: 14px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    box-sizing: border-box;
                    text-align: center;
                ">${order}</div>
            </div>`,
            size: new naverMaps.Size(32, 32),
            anchor: new naverMaps.Point(16, 16)
        }
    };
    
    return new naverMaps.Marker(markerOptions);
};
