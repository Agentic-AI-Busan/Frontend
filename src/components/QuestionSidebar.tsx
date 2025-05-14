import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

// SidebarContainer와 동일한 스타일 적용
const ResponseSection = styled.div<{ isComplete?: boolean }>`
    width: 350px;
    height: calc(100vh - 150px);
    background: ${props => props.isComplete ? '#f5f5f5' : '#ffffff'};
    border-radius: 16px;
    box-shadow: ${props => props.isComplete 
        ? '0 10px 30px rgba(0, 0, 0, 0.08)' 
        : '0 10px 30px rgba(0, 0, 0, 0.05)'};
    padding: 20px 20px 15px 20px;
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all 0.4s ease;
    border: 1px solid ${props => props.isComplete ? '#e0e0e0' : 'rgba(0, 0, 0, 0.08)'};
    
    &:hover {
        box-shadow: ${props => props.isComplete 
            ? '0 15px 35px rgba(0, 0, 0, 0.1)' 
            : '0 15px 35px rgba(0, 0, 0, 0.08)'};
    }
    
    @media (max-width: 992px) {
        width: 100%;
        height: auto;
        min-height: 350px;
    }
`;

// SelectedItemsList와 동일한 스크롤바 스타일 적용
const ResponseList = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: column;
    padding: 0 0 5px 0;
    margin: 20px 0 10px 0;
    flex: 1;
    overflow-y: auto;
    scroll-behavior: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
        display: none;
    }
    
    li {
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.2s ease;
        margin-bottom: 15px;
        width: 100%;

        &:last-child {
            margin-bottom: 0px;
        }

        &.visible {
            opacity: 1;
            transform: translateY(0);
            transition-delay: calc(0.01s * var(--item-index, 0));
        }

        strong {
            display: block;
            font-size: 15px;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
            padding-left: 4px;
        }
    }
`;

// SidebarTitle 스타일 추가
const SidebarTitle = styled.strong<{ isComplete?: boolean }>`
    display: block;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    padding: 10px 0;
    margin-bottom: 5px;
    color: ${props => props.isComplete ? '#5a5a5a' : '#2c3e50'};
    letter-spacing: 0.5px;
    border-bottom: 2px solid ${props => props.isComplete ? '#d8d8d8' : '#3498db'};
`;

const ResponseField = styled.div`
    background: #f8f9fa;
    border-radius: 12px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    border: 1px solid #eee;
    transition: all 0.2s ease;
    
    p {
        margin: 0;
        font-size: 14px;
        line-height: 1.4;
        color: #333;
        word-break: break-all;
    }

    &.empty {
        background: #fff;
        p {
            color: #adb5bd;
            font-size: 13px;
        }
    }
`;

const DateRangeField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;

    div.response-field {
        position: relative;
        padding-left: 48px;

        &::before {
            content: '';
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            background: #666;
            border-radius: 50%;
            transition: all 0.2s ease;
        }

        &:first-child::before {
            background: #1976D2;
        }

    &:hover {
            border-color: #dee2e6;
            background: #fff;
        }

        &.empty:hover {
            background: #f8f9fa;
        }
    }
`;

interface UserAnswers {
    city: string;
    startDate: string;
    endDate: string;
    preferActivity: string;
    preferFood: string;
    dislikedFood: string;
    requirement: string;
    ageRange: string;
    numberOfPeople: string;
    transportation: string;
}

interface QuestionSidebarProps {
    userAnswers: UserAnswers;
    visibleSections: string[];
    isComplete?: boolean;
}

// 기본 컴포넌트 정의
const QuestionSidebar: React.FC<QuestionSidebarProps> = ({ 
    userAnswers, 
    visibleSections,
    isComplete = false 
}) => {
    const responseListRef = useRef<HTMLUListElement>(null);

    // visibleSections나 userAnswers가 변경될 때마다 맨 아래로 스크롤
    useEffect(() => {
        if (!responseListRef.current) return;
        
        // 스크롤을 맨 아래로 강제 이동하는 함수 (부드러운 애니메이션 없이)
        const scrollDown = () => {
            if (responseListRef.current) {
                // 즉시 스크롤 (애니메이션 없음)
                responseListRef.current.scrollTop = responseListRef.current.scrollHeight;
            }
        };
        
        // 애니메이션 시작 전 스크롤 위치 계산용
        scrollDown();
        
        // 애니메이션이 완료된 직후에 다시 스크롤
        // 계산: 기본 트랜지션 시간(0.2s) + 가장 긴 딜레이(0.01s * 최대 10개 = 0.1s) + 마진(0.05s)
        const scrollTimer = setTimeout(scrollDown, 400);
        
        // 클린업 함수
        return () => {
            clearTimeout(scrollTimer);
        };
    }, [visibleSections, userAnswers]);
    
    // li 요소에 인덱스 속성 추가 (애니메이션용)
    useEffect(() => {
        if (responseListRef.current) {
            const items = responseListRef.current.querySelectorAll('li');
            items.forEach((item, index) => {
                (item as HTMLElement).style.setProperty('--item-index', index.toString());
            });
        }
    }, [visibleSections]);

    return (
        <ResponseSection isComplete={isComplete}>
            <SidebarTitle isComplete={isComplete}>응답 내용</SidebarTitle>
            <ResponseList ref={responseListRef}>
                {visibleSections.includes("city") && (
                <li className="visible">
                    <strong>여행지</strong>
                        <ResponseField className={!userAnswers.city ? "empty" : ""}>
                            <p>{userAnswers.city || "아직 입력되지 않았습니다."}</p>
                        </ResponseField>
                    </li>
                )}
                {visibleSections.includes("dateRange") && (
                    <li className="visible">
                        <strong>여행 기간</strong>
                        <DateRangeField>
                            <ResponseField className={!userAnswers.startDate ? "empty" : ""}>
                                <p>{userAnswers.startDate || "시작일을 선택해주세요."}</p>
                            </ResponseField>
                            <ResponseField className={!userAnswers.endDate ? "empty" : ""}>
                                <p>{userAnswers.endDate || "종료일을 선택해주세요."}</p>
                            </ResponseField>
                        </DateRangeField>
                    </li>
                )}
                {visibleSections.includes("numberOfPeople") && (
                    <li className="visible">
                        <strong>여행 인원</strong>
                        <ResponseField className={!userAnswers.numberOfPeople ? "empty" : ""}>
                            <p>{userAnswers.numberOfPeople || "아직 입력되지 않았습니다."}</p>
                        </ResponseField>
                    </li>
                )}
                {visibleSections.includes("ageRange") && (
                    <li className="visible">
                        <strong>여행 인원 연령대</strong>
                        <ResponseField className={!userAnswers.ageRange ? "empty" : ""}>
                            <p>{userAnswers.ageRange || "아직 입력되지 않았습니다."}</p>
                        </ResponseField>
                    </li>
                )}
                {visibleSections.includes("preferActivity") && (
                    <li className="visible">
                        <strong>선호 활동</strong>
                        <ResponseField className={!userAnswers.preferActivity ? "empty" : ""}>
                            <p>{userAnswers.preferActivity || "아직 입력되지 않았습니다."}</p>
                        </ResponseField>
                    </li>
                )}
                {visibleSections.includes("preferFood") && (
                    <li className="visible">
                        <strong>선호하는 음식</strong>
                        <ResponseField className={!userAnswers.preferFood ? "empty" : ""}>
                            <p>{userAnswers.preferFood || "아직 입력되지 않았습니다."}</p>
                        </ResponseField>
                </li>
                )}
                {visibleSections.includes("dislikedFood") && (
                    <li className="visible">
                        <strong>못 먹는 음식</strong>
                        <ResponseField className={!userAnswers.dislikedFood ? "empty" : ""}>
                            <p>{userAnswers.dislikedFood || "아직 입력되지 않았습니다."}</p>
                        </ResponseField>
                </li>
                )}
                {visibleSections.includes("transportation") && (
                    <li className="visible">
                        <strong>교통수단</strong>
                        <ResponseField className={!userAnswers.transportation ? "empty" : ""}>
                            <p>{userAnswers.transportation || "아직 입력되지 않았습니다."}</p>
                        </ResponseField>
                </li>
                )}
                {visibleSections.includes("requirement") && (
                    <li className="visible">
                        <strong>추가 요청사항</strong>
                        <ResponseField className={!userAnswers.requirement ? "empty" : ""}>
                            <p>{userAnswers.requirement || "아직 입력되지 않았습니다."}</p>
                        </ResponseField>
                </li>
                )}
            </ResponseList>
        </ResponseSection>
    );
};

// props의 객체를 깊게 비교하는 함수
const arePropsEqual = (prevProps: QuestionSidebarProps, nextProps: QuestionSidebarProps) => {
    // isComplete이 다르면 리렌더링
    if (prevProps.isComplete !== nextProps.isComplete) return false;
    
    // visibleSections 배열 비교
    if (prevProps.visibleSections.length !== nextProps.visibleSections.length) return false;
    for (let i = 0; i < prevProps.visibleSections.length; i++) {
        if (prevProps.visibleSections[i] !== nextProps.visibleSections[i]) return false;
    }
    
    // userAnswers 객체의 각 필드 비교
    const prevAnswers = prevProps.userAnswers;
    const nextAnswers = nextProps.userAnswers;
    return prevAnswers.city === nextAnswers.city &&
        prevAnswers.startDate === nextAnswers.startDate &&
        prevAnswers.endDate === nextAnswers.endDate &&
        prevAnswers.preferActivity === nextAnswers.preferActivity &&
        prevAnswers.preferFood === nextAnswers.preferFood &&
        prevAnswers.dislikedFood === nextAnswers.dislikedFood &&
        prevAnswers.requirement === nextAnswers.requirement &&
        prevAnswers.ageRange === nextAnswers.ageRange &&
        prevAnswers.numberOfPeople === nextAnswers.numberOfPeople &&
        prevAnswers.transportation === nextAnswers.transportation;
};

// React.memo를 사용해 최적화된 컴포넌트 내보내기
export default React.memo(QuestionSidebar, arePropsEqual);
