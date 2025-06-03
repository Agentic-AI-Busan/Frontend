import React, {useEffect, useState, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import flatpickr from 'flatpickr';
import { Korean } from 'flatpickr/dist/l10n/ko';
import 'flatpickr/dist/flatpickr.min.css';
import styled from 'styled-components';
import { useUser } from '../../contexts/UserContext';
import { authenticatedFetch } from '../../services/api';
import QuestionSidebar from '../../components/QuestionSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';

const ContentWrapper = styled.div`
    width: 100%;
    max-width: 1450px;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: calc(100vh - 60px);
    padding: 1rem;
    box-sizing: border-box;
    
    @media (max-width: 1440px) {
        max-width: 90%;
    }
`;

const QuestionSection = styled.div`
    display: flex;
    gap: 20px;
    width: 100%;
    padding: 0;
    flex: 1;
    
    @media (max-width: 992px) {
        flex-direction: column;
        gap: 15px;
    }
`;

const ChatSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 120px);
    overflow: hidden;
    min-width: 70%;

    @media (max-width: 992px) {
        width: 100%;
        min-height: 60vh;
    }
`;

const MessagesChat = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    height: calc(100% - 80px);
    min-height: 400px;
    
    @media (max-width: 768px) {
        padding: 16px;
        min-height: 300px;
    }

    /* 스크롤바 기본 스타일 */
    &::-webkit-scrollbar {
        width: 6px;
        background: transparent;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 4px;
        margin: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: transparent;
        border-radius: 4px;
        transition: background-color 0.3s ease;
    }

    /* 호버 시 스크롤바 스타일 */
    &:hover {
        &::-webkit-scrollbar-track {
            background: #f8f8f8;
        }

        &::-webkit-scrollbar-thumb {
            background: #ddd;

            &:hover {
                background: #ccc;
            }
        }
    }
`;

const Message = styled.div`
    display: flex;
    gap: 12px;
    width: 100%;
    align-items: flex-start;
    margin-bottom: 8px;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.3s ease forwards;

    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    &.response {
        flex-direction: row-reverse;
        justify-content: flex-start;
    }

    &:last-child {
        margin-bottom: 4px;
    }
`;

const Photo = styled.div`
    img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 2px solid #fff;
    }
    
    &.response {
        display: none; /* 사용자 응답일 경우 프로필 이미지 숨김 */
    }
`;

const AIAvatar = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: white;
    color: #3498db;
    border-radius: 50%;
    font-size: 16px;
    font-weight: 700;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 2px solid #3498db;
`;

const ChatText = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: fit-content;
    max-width: 85%;
    position: relative;

    &.response {
        align-items: flex-end;
    }
`;

const Text = styled.div`
    background: #f5f5f5;
    padding: 10px 15px;
    border-radius: 10px;
    position: relative;
    display: inline-block;
    word-wrap: break-word;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    width: fit-content;
    margin: 0;

    p {
        margin: 0;
        line-height: 1.4;
    }

    &.response {
        background: #E3F2FD;
        color: #1976D2;
        border: 1px solid #BBDEFB;
    }

    &.calendar {
        padding: 0;
        background: #fff;
        border: 1px solid #eee;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        overflow: hidden;
        
        .flatpickr-calendar {
            border: none;
            box-shadow: none;
            margin: 0;
            padding: 16px;
            background: transparent;
            width: 320px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

            &.disabled {
                position: relative;

                &::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.8);
                    z-index: 999;
                    pointer-events: all;
                }

                .flatpickr-months,
                .flatpickr-weekdays,
                .flatpickr-days {
                    opacity: 0.5;
                }

                .flatpickr-day {
                    pointer-events: none;
                    
                    &.selected {
                        background: #1976D2 !important;
                        color: white !important;
                        opacity: 1;
                    }

                    &.inRange {
                        background: #1976D2 !important;
                        color: white !important;
                        opacity: 0.8;
                    }
                }

                .flatpickr-prev-month,
                .flatpickr-next-month {
                    pointer-events: none;
                    opacity: 0.5;
                }
            }

            .flatpickr-months {
                padding: 0 8px;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                height: 36px;
                position: relative;

                .flatpickr-month {
                    height: 36px;
                    color: #333;
                    position: relative;
                    overflow: visible;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                }

                .flatpickr-current-month {
                    padding: 0;
                    height: auto;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    transform: none;
                    width: auto;
                    left: auto;
                    flex-direction: row-reverse;
                    
                    .cur-month {
                        font-family: inherit;
                        margin: 0;
                        padding: 0;
                        font-weight: 600;
                    }

                    .numInputWrapper {
                        width: auto;
                        height: auto;
                        position: relative;
                        margin-right: 4px;

                        &::after {
                            content: "년";
                            margin-left: 2px;
                        }

                        input.cur-year {
                            font-size: 16px;
                            font-weight: 600;
                            color: #333;
                            padding: 0;
                            height: auto;
                            line-height: inherit;
                            font-family: inherit;
                            width: 60px;
                            text-align: center;
                        }

                        span {
                            display: none;
                        }
                    }
                }
            }

            .flatpickr-innerContainer {
                display: block;

                .flatpickr-weekdays {
                    margin: 0;
                    padding: 0 8px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    border-bottom: 1px solid #eee;
                    margin-bottom: 8px;
                    background: transparent;
                }

                .flatpickr-weekday {
                    color: #666;
                    font-size: 13px;
                    font-weight: 500;
                    height: 28px;
                    line-height: 28px;
                    flex: 1;
                    margin: 0;
                    background: transparent;
                    text-align: center;
                }

                .flatpickr-days {
                    width: 100%;
                    padding: 0 8px;

                    .dayContainer {
                        width: 100%;
                        min-width: auto;
                        max-width: none;
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-between;
                        padding: 0;
                        outline: 0;
                        width: 100%;
                    }

                    .flatpickr-day {
                        margin: 2px;
                        height: 36px;
                        line-height: 36px;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 400;
                        color: #333;
                        border: none;
                        width: calc(100% / 7 - 4px);
                        max-width: none;
                        flex-basis: calc(100% / 7 - 4px);
                        transition: all 0.2s ease;

                        &:hover:not(.selected):not(.inRange) {
                            background: #f5f5f5;
                        }

                        &.selected {
                            background: #1976D2;
                            color: white;
                            font-weight: 500;
                            position: relative;
                            z-index: 3;

                            &:hover {
                                background: #1565C0;
                            }
                        }

                        &.inRange {
                            background: #1976D2;
                            color: white;
                            border-radius: 0;
                            position: relative;
                            opacity: 0.8;
                        }

                        &.startRange {
                            border-radius: 8px;
                            border-top-right-radius: 0;
                            border-bottom-right-radius: 0;
                            opacity: 1;
                        }

                        &.endRange {
                            border-radius: 8px;
                            border-top-left-radius: 0;
                            border-bottom-left-radius: 0;
                            opacity: 1;
                        }

                        &.prevMonthDay,
                        &.nextMonthDay {
                            color: #bbb;
                        }

                        &.disabled {
                            color: #ddd;
                            cursor: not-allowed;
                            
                            &:hover {
                                background: transparent;
                            }
                        }
                    }
                }
            }
        }
    }
`;

const Time = styled.span`
    font-size: 12px;
    color: #999;
    margin-left: 8px;
    margin-right: 8px;
    margin-bottom: 3px;
    flex-shrink: 0;
`;

const MessageWrapper = styled.div`
    display: flex;
    align-items: flex-end;
    width: fit-content;
    gap: 8px;
    margin-bottom: 8px;

    &:last-child {
        margin-bottom: 0;
    }

    &.response {
        flex-direction: row-reverse;
        
        ${Time} {
            margin-right: 0;
            margin-left: 8px;
        }
    }

    &:not(.response) {
        ${Time} {
            margin-left: 0;
            margin-right: 8px;
        }
    }
`;

const FooterChat = styled.div`
    border-top: 1px solid #e2e8f0;
    padding: 16px 20px;
    flex-shrink: 0;
    height: 80px; /* 고정 높이 유지 */
    display: flex;
    align-items: center;
    position: relative;
`;

const ChatInputWrapper = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    position: relative;
`;

const InputArea = styled.div`
    flex: 1;
    width: 100%;
`;

const SendForm = styled.input`
    width: 100%;
    padding: 14px 20px;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    font-size: 15px;
    outline: none;
    background: white;
    font-weight: 400;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1;
    color: #333;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;

    &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
    }

    &:disabled {
        color: #999;
        cursor: not-allowed;
        background: #f5f5f5;
    }

    &::placeholder {
        color: #94a3b8;
        font-size: 14px;
        font-weight: 400;
    }
`;

const Button = styled.button`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #3498db;
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
    position: static;
    transform: none;
    opacity: 1;
    visibility: visible;

    &:hover:not(:disabled) {
        background-color: #2980b9;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        background-color: #cbd5e1;
        cursor: not-allowed;
        opacity: 0.6;
        box-shadow: none;
        transform: none;
    }

    svg {
        width: 20px;
        height: 20px;
        transform: rotate(-45deg);
    }

    &.round_big {
        width: 100%;
        padding: 15px;
        border-radius: 12px;
        height: auto;
        font-size: 14px;
        background: #3498db;
        color: white;
        opacity: 1;
        visibility: visible;
        transform: none;
        display: flex;
        align-items: center;
        justify-content: center;

        &:disabled {
            opacity: 0.6;
            visibility: visible;
            transform: none;
            background-color: #cbd5e1;
        }
    }
`;

const TimeConfirmButton = styled.button`
    padding: 10px 18px;
    margin-top: 10px;
    margin-right: 10px;
    cursor: pointer;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s ease;

    &:hover:not(:disabled) {
        background-color: #2980b9; // 호버 시 약간 어두운 파란색
    }

    &:disabled {
        background-color: #bdc3c7; // 비활성화 시 회색 계열
        cursor: not-allowed;
    }
`;

const getQuestion = (userName: string) => [
    "안녕하세요!",
    `이번 여행에서 ${userName}님의 가이드를 맞게된 AI 어시스턴트입니다!`,
    `여행 가이드에 앞서 몇가지 질문을 받아 ${userName}님의 취향을 분석하여 최적의 가이드를 진행하려고 합니다!`,
    `${userName}님의 여행기간은 언제인가요?`,
    `함께 여행가는 인원을 말씀해주세요!`,
    `함께 여행가는 인원들의 연령대를 말씀해주세요!`,
    `${userName}님은 어떤 종류의 활동을 선호하시나요?`,
    `${userName}님은 어떤 종류의 음식을 선호하시나요?`,
    `${userName}님은 못먹는 종류의 음식이 있으신가요?`,
    `${userName}님은 어떤 교통수단을 이용하시나요?`,
    "몇 시에 일정을 시작하시나요?",
    "몇 시에 일정을 마치길 선호하시나요?",
    "추가적으로 반영하고 싶은 내용이 있나요?",
    `${userName}님의 답변 내용을 바탕으로 여행지를 추천해드리겠습니다!`,
    "잠시만 기다려주세요!"
]

// 채팅 메시지 인터페이스
interface Message {
    content: string;
    timestamp: string;
    isResponse: boolean;  // true면 사용자 응답, false면 질문자 메시지
}

// 날짜를 YYYY-MM-DD 형식으로 변환하는 함수 추가
function formatDateToYMD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const QuestionPage: React.FC = () => {
    const { user } = useUser();
    const userName = user?.name || "Undefined";
    const navigate = useNavigate();
    // 상태 관리
    const question = getQuestion(userName);
    const [chatHistory, setChatHistory] = useState<Message[]>([]); // 채팅 기록
    const [defaultQuestions, setDefaultQuestions] = useState<Message[]>([]); // 기본 질문들
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [inputValue, setInputValue] = useState("");
    const [isQuestionInProgress, setIsQuestionInProgress] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [styleId, setStyleId] = useState<number | null>(null);
    // 사용자 응답 데이터 관리
    const [userAnswers, setUserAnswers] = useState({
        city: "",
        startDate: "",
        endDate: "",
        preferActivity: "",
        preferFood: "",
        dislikedFood: "",
        requirement: "",
        ageRange: "",
        numberOfPeople: "",
        transportation: "",
        preferredStartTime: "",
        preferredEndTime: ""
    });

    // 임시 날짜 범위 저장
    const [tempDateRange, setTempDateRange] = useState({
        start: "",
        end: ""
    });

    // 임시 선호 시간 저장
    const [tempPreferredTime, setTempPreferredTime] = useState<string>("");

    // 보여질 섹션 관리
    const [visibleSections, setVisibleSections] = useState<string[]>(["city"]);

    const inputRef = useRef<HTMLInputElement>(null);
    const messageEndRef = useRef<HTMLDivElement>(null);

    // Flatpickr 인스턴스 저장을 위한 Refs
    const datePickerRef = useRef<flatpickr.Instance | null>(null);
    const startTimePickerRef = useRef<flatpickr.Instance | null>(null);
    const endTimePickerRef = useRef<flatpickr.Instance | null>(null);

    // handleSendMessageInternal 함수를 먼저 정의합니다.
    const handleSendMessageInternal = (messageContent: string) => {
        setIsQuestionInProgress(true);
        const currentTime = new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' });
        
        // 버튼 클릭으로 인한 내부 호출이 아닐 경우(즉, 사용자가 직접 입력한 경우)에만 사용자 메시지를 채팅에 추가
        if (messageContent !== "TIME_CONFIRMED_START" && messageContent !== "TIME_CONFIRMED_END" && messageContent !== "DATE_CONFIRMED") {
            setChatHistory(prev => [...prev, {
                content: messageContent,
                timestamp: currentTime,
                isResponse: true
            }]);
        }

        const currentQuestionText = question[currentQuestionIndex -1]; 

        // 날짜 확인 응답 처리 (텍스트 '네' 또는 버튼 클릭)
        if (tempDateRange.start && tempDateRange.end && currentQuestionText?.includes("여행기간은 언제인가요") && (messageContent.toLowerCase() === '네' || messageContent === "DATE_CONFIRMED")) {
            updateUserAnswer({ startDate: tempDateRange.start, endDate: tempDateRange.end });
            localStorage.setItem('startDate', tempDateRange.start);
            localStorage.setItem('endDate', tempDateRange.end);
            handleUserResponse(messageContent === "DATE_CONFIRMED" ? `${tempDateRange.start} ~ ${tempDateRange.end}` : messageContent, currentQuestionText); 

            if(messageContent === "DATE_CONFIRMED" && tempDateRange.start && tempDateRange.end){
                setChatHistory(prev => [...prev, {
                    content: `여행 기간을 ${tempDateRange.start} ~ ${tempDateRange.end}(으)로 설정할게요.`,
                    timestamp: currentTime,
                    isResponse: true
                }]);
            }

            const calendarPickerDOM = document.querySelector('.calendar-message .flatpickr-calendar');
            if (calendarPickerDOM) calendarPickerDOM.classList.add('disabled');
            const confirmButtonDate = document.getElementById('confirm-date-btn');
            if (confirmButtonDate) confirmButtonDate.style.display = 'none';

            setTempDateRange({ start: "", end: "" });
            handleNextQuestion(); 
        } else if (tempDateRange.start && tempDateRange.end && currentQuestionText?.includes("여행기간은 언제인가요")) {
            setIsQuestionInProgress(true);
            setTimeout(() => {
                setChatHistory(prev => [...prev, { content: "날짜를 다시 선택해주세요.", timestamp: currentTime, isResponse: false }]);
                if (datePickerRef.current) {
                    datePickerRef.current.clear();
                    const calendarDOM = datePickerRef.current.calendarContainer.querySelector('.flatpickr-calendar');
                    if (calendarDOM) calendarDOM.classList.remove('disabled');
                    const confirmButtonDate = document.getElementById('confirm-date-btn');
                    if (confirmButtonDate) confirmButtonDate.style.display = 'inline-block';
                }
                setTempDateRange({ start: "", end: "" });
                setIsQuestionInProgress(false); 
            }, 1000);
        // 선호 시작 시간 확인 응답 처리 (텍스트 '네' 또는 버튼 클릭)
        } else if (tempPreferredTime && currentQuestionText?.includes("몇 시에 일정을 시작하시나요?") && (messageContent.toLowerCase() === '네' || messageContent === "TIME_CONFIRMED_START")) {
            updateUserAnswer({ preferredStartTime: tempPreferredTime });
            localStorage.setItem('preferredStartTime', tempPreferredTime);
            handleUserResponse(messageContent === "TIME_CONFIRMED_START" ? tempPreferredTime : messageContent, currentQuestionText); 
            
            if(messageContent === "TIME_CONFIRMED_START"){
                setChatHistory(prev => [...prev, {
                    content: `${tempPreferredTime}에 일정을 시작할게요.`,
                    timestamp: currentTime,
                    isResponse: true
                }]);
            }
            const startTimePickerDOM = document.querySelector('.timepicker-start-preference-message .flatpickr-calendar');
            if (startTimePickerDOM) startTimePickerDOM.classList.add('disabled');
            const confirmButtonStart = document.getElementById('confirm-time-start-btn');
            if (confirmButtonStart) confirmButtonStart.style.display = 'none';

            setTempPreferredTime("");
            handleNextQuestion(); 
        } else if (tempPreferredTime && currentQuestionText?.includes("몇 시에 일정을 시작하시나요?")) {
            setIsQuestionInProgress(true); // 입력창 계속 비활성화 상태 유지
            setTimeout(() => {
                setChatHistory(prev => [...prev, { content: "시작 시간을 다시 선택해주세요.", timestamp: currentTime, isResponse: false }]);
                if (startTimePickerRef.current) {
                    startTimePickerRef.current.clear();
                    const timepickerDOM = startTimePickerRef.current.calendarContainer.querySelector('.flatpickr-calendar');
                    if (timepickerDOM) timepickerDOM.classList.remove('disabled');
                    const confirmButtonStart = document.getElementById('confirm-time-start-btn');
                    if (confirmButtonStart) confirmButtonStart.style.display = 'inline-block'; 
                }
                setTempPreferredTime("");
                // setIsQuestionInProgress(false); // 이 줄을 제거하여 입력창을 계속 비활성화
            }, 1000);
        // 선호 종료 시간 확인 응답 처리 (텍스트 '네' 또는 버튼 클릭)
        } else if (tempPreferredTime && currentQuestionText?.includes("몇 시에 일정을 마치길 선호하시나요") && (messageContent.toLowerCase() === '네' || messageContent === "TIME_CONFIRMED_END")) {
            updateUserAnswer({ preferredEndTime: tempPreferredTime });
            localStorage.setItem('preferredEndTime', tempPreferredTime);
            handleUserResponse(messageContent === "TIME_CONFIRMED_END" ? tempPreferredTime : messageContent, currentQuestionText); 

            if(messageContent === "TIME_CONFIRMED_END"){
                setChatHistory(prev => [...prev, {
                    content: `${tempPreferredTime}에 일정을 마칠게요.`,
                    timestamp: currentTime,
                    isResponse: true
                }]);
            }
            const endTimePickerDOM = document.querySelector('.timepicker-end-preference-message .flatpickr-calendar');
            if (endTimePickerDOM) endTimePickerDOM.classList.add('disabled');
            const confirmButtonEnd = document.getElementById('confirm-time-end-btn');
            if (confirmButtonEnd) confirmButtonEnd.style.display = 'none';

            setTempPreferredTime("");
            handleNextQuestion(); 
        } else if (tempPreferredTime && currentQuestionText?.includes("몇 시에 일정을 마치길 선호하시나요")) {
            setIsQuestionInProgress(true); // 입력창 계속 비활성화 상태 유지
            setTimeout(() => {
                setChatHistory(prev => [...prev, { content: "종료 시간을 다시 선택해주세요.", timestamp: currentTime, isResponse: false }]);
                if (endTimePickerRef.current) {
                    endTimePickerRef.current.clear();
                    const timepickerDOM = endTimePickerRef.current.calendarContainer.querySelector('.flatpickr-calendar');
                    if (timepickerDOM) timepickerDOM.classList.remove('disabled');
                    const confirmButtonEnd = document.getElementById('confirm-time-end-btn');
                    if (confirmButtonEnd) confirmButtonEnd.style.display = 'inline-block';
                }
                setTempPreferredTime("");
                // setIsQuestionInProgress(false); // 이 줄을 제거하여 입력창을 계속 비활성화
            }, 1000);
        } else {
            // 위에서 모든 피커 관련 확인/재선택 로직이 처리되었으므로,
            // 여기에 도달했다면 일반 텍스트 질문이거나, 피커 질문이지만 사용자가 '네' 또는 확인 버튼 외의 입력을 한 경우.
            // 단, currentQuestionText가 undefined가 아닐 때만 일반 텍스트 질문으로 간주.
            if (currentQuestionText && !currentQuestionText.includes("여행기간은 언제인가요") && !currentQuestionText.includes("몇 시에 일정을 시작하시나요?") && !currentQuestionText.includes("몇 시에 일정을 마치길 선호하시나요")) {
                handleUserResponse(messageContent, currentQuestionText);
                handleNextQuestion(); 
            } else if (currentQuestionText) {
                // 피커 질문에 대해 '네'나 확인 버튼이 아닌 다른 텍스트가 입력된 경우,
                // 이미 각 피커 재선택 로직에서 처리했어야 하지만, 만약의 경우를 대비해 사용자 입력을 다시 유도.
                // (예: 사용자가 시간 선택 없이 바로 텍스트 입력)
                // 이 경우 isQuestionInProgress를 false로 두어 입력창을 다시 활성화.
                 setIsQuestionInProgress(false);
            } else {
                // currentQuestionText가 없는 초기 상태 또는 오류 상황
                 setIsQuestionInProgress(false);
            }
        }
    };

    const handleSendMessage = () => {
        const trimmedInput = inputValue.trim();
        if (trimmedInput !== "" && !isQuestionInProgress && !isComplete) {
            handleSendMessageInternal(trimmedInput);
            setInputValue("");
        }
    };

    const handleNextQuestion = () => {
        // currentQuestionIndex는 현재 AI가 답변을 기다리는 질문의 인덱스라고 가정.
        // 즉, question[currentQuestionIndex] 가 다음에 나올 질문임.
        if (currentQuestionIndex < question.length - 2) { // 마지막 두 개의 AI 전용 메시지 전까지
            setIsQuestionInProgress(true);
            const nextQuestionText = question[currentQuestionIndex];
            let timePickerContent: string | null = null;
            const messagesToAdd: Message[] = [];

            messagesToAdd.push({
                content: nextQuestionText,
                timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                isResponse: false
            });

            if (nextQuestionText.includes("몇 시에 일정을 시작하시나요?")) {
                timePickerContent = "timepicker_start_preference";
            } else if (nextQuestionText.includes("몇 시에 일정을 마치길 선호하시나요?")) {
                timePickerContent = "timepicker_end_preference";
            }

            if (timePickerContent) {
                messagesToAdd.push({
                    content: timePickerContent,
                    timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                    isResponse: false
                });
            }

            setTimeout(() => {
                setChatHistory(prev => [...prev, ...messagesToAdd]);
                // 다음 "질문" 텍스트의 인덱스로 업데이트
                setCurrentQuestionIndex(prev => prev + 1); 
                // 만약 다음 질문이 시간 선택과 관련된 것이 아니라면 입력창 활성화
                if (!nextQuestionText.includes("몇 시에 일정을 시작하시나요?") && !nextQuestionText.includes("몇 시에 일정을 마치길 선호하시나요?")) {
                    setIsQuestionInProgress(false);
                }
                // 시간 관련 질문이면 isQuestionInProgress는 true로 유지됨.
            }, 1000);
        } else {
            triggerCompletionSequence();
        }
    };

    const triggerCompletionSequence = () => {
        setIsQuestionInProgress(true);
        setTimeout(() => {
            setChatHistory(prev => [...prev, {
                content: question[question.length - 2], // "...답변 내용을 바탕으로..."
                timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                isResponse: false
            }]);

            setTimeout(() => {
                setChatHistory(prev => [...prev, {
                    content: question[question.length - 1], // "잠시만 기다려주세요!"
                    timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                    isResponse: false
                }]);
                
                setTimeout(() => setIsComplete(true), 1000);
            }, 1000);
        }, 1000);
    };

    // 채팅창 자동 스크롤
    const scrollToBottom = () => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ 
                behavior: "smooth", 
                block: "end"
            });
        }
    };

    // styleId 받아오기 (최초 1회)
    useEffect(() => {
        const fetchStyleId = async () => {
            try {
                const response = await authenticatedFetch(`/api/styles`, { method: 'GET' });
                const data = await response.json();
                if (data.isSuccess && data.result && typeof data.result.styleId === 'number') {
                    setStyleId(data.result.styleId);
                }
            } catch (error) {
                console.error('Error fetching styleId:', error);
            }
        };
        fetchStyleId();
    }, []);

    // styleId가 준비되면 userAnswers 불러오기
    useEffect(() => {
        const fetchUserAnswers = async () => {
            if (!styleId) return;
            try {
                const response = await authenticatedFetch(`/api/styles/${styleId}`, { method: 'GET' });
                const data = await response.json();
                if (data.isSuccess && data.result) {
                    setUserAnswers(prev => ({
                        city: data.result.city ?? prev.city,
                        startDate: data.result.startDate ?? prev.startDate,
                        endDate: data.result.endDate ?? prev.endDate,
                        preferActivity: data.result.preferActivity ?? prev.preferActivity,
                        preferFood: data.result.preferFood ?? prev.preferFood,
                        dislikedFood: data.result.dislikedFood ?? prev.dislikedFood,
                        requirement: data.result.requirement ?? prev.requirement,
                        ageRange: data.result.ageRange ?? prev.ageRange,
                        numberOfPeople: data.result.numberOfPeople ?? prev.numberOfPeople,
                        transportation: data.result.transportation ?? prev.transportation,
                        preferredStartTime: data.result.preferredStartTime ?? prev.preferredStartTime,
                        preferredEndTime: data.result.preferredEndTime ?? prev.preferredEndTime
                    }));
                }
            } catch (error) {
                console.error('Error fetching userAnswers:', error);
            }
        };
        if (styleId) fetchUserAnswers();
    }, [styleId]);

    // 답변 입력 시 POST & GET (여러 필드 동시 지원)
    const updateUserAnswer = async (fields: Record<string, string>) => {
        if (!styleId) return;
        try {
            // 로컬 상태 먼저 업데이트 (즉시 UI 반영)
            setUserAnswers(prev => ({
                ...prev,
                ...fields
            }));
            
            // 모든 답변을 누적해서 보냄
            const merged = { ...userAnswers, ...fields };
            // API 호출은 백그라운드에서 수행 (응답 대기 없음)
            authenticatedFetch(`/api/styles/${styleId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(merged)
            }).catch(error => {
                console.error('Error updating userAnswer:', error);
            });
        } catch (error) {
            console.error('Error updating userAnswer:', error);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, defaultQuestions]);

    useEffect(() => {
        if (!isQuestionInProgress) {
            scrollToBottom();
        }
    }, [isQuestionInProgress]);

    useEffect(() => {
        scrollToBottom();
    }, []);

    // 초기 질문 표시
    useEffect(() => {
        if (currentQuestionIndex < 4) {
            setIsQuestionInProgress(true);
            setTimeout(() => {
                setDefaultQuestions(prev => [...prev, {
                    content: question[currentQuestionIndex],
                    timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                    isResponse: false
                }]);
                setCurrentQuestionIndex(prev => prev + 1);
                if (currentQuestionIndex === 3) {
                    setIsQuestionInProgress(false);
                }
            }, 1000);
        }
    }, [currentQuestionIndex]);

    // 여행 기간 질문 처리
    useEffect(() => {
        const isDateQuestion = defaultQuestions.length > 0 && 
            defaultQuestions[defaultQuestions.length - 1].content.includes("여행기간은 언제인가요?") &&
            !chatHistory.some(msg => msg.content === "calendar") &&
            currentQuestionIndex === 4; // 정확히 해당 질문 순서일 때만
        
        if (isDateQuestion && !isQuestionInProgress) {
            setIsQuestionInProgress(true);
            // 다음 메시지로 캘린더 컴포넌트 추가
            setChatHistory(prev => [...prev, {
                content: "calendar", // 특수 키워드로 캘린더 메시지 식별
                timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                isResponse: false
            }]);

            // 캘린더 렌더링 (DOM 업데이트 후)
            setTimeout(() => {
                const calendarElement = document.querySelector('.calendar-message');
                if (calendarElement && !datePickerRef.current) { // 인스턴스가 없거나 파괴된 경우에만 새로 생성
                    datePickerRef.current = flatpickr(calendarElement as HTMLElement, {
                        locale: Korean,
                        mode: "range",
                        inline: true,
                        dateFormat: "Y-m-d",
                        onChange: (selectedDates) => {
                            if (selectedDates.length === 2) {
                                const startDate = formatDateToYMD(selectedDates[0]);
                                const endDate = formatDateToYMD(selectedDates[1]);
                                const dateRange = `${startDate} ~ ${endDate}`;

                                // 임시로 날짜 데이터 저장
                                setTempDateRange({
                                    start: startDate,
                                    end: endDate
                                });

                                // 캘린더 비활성화 (DOM 직접 조작)
                                const calendarDOM = calendarElement.querySelector('.flatpickr-calendar');
                                if (calendarDOM) {
                                    calendarDOM.classList.add('disabled');
                                }

                                // 확인 메시지 표시
                                setChatHistory(prev => [...prev, {
                                    content: `선택하신 기간이 ${dateRange} 맞으신가요? 맞으시다면 '네'를 입력해주세요.`,
                                    timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                                    isResponse: false
                                }]);
                                setIsQuestionInProgress(false); // 사용자 입력 활성화
                            }
                        }
                    });
                }
            }, 100); // DOM 업데이트 기다리는 시간
        }
    }, [defaultQuestions, chatHistory, currentQuestionIndex, isQuestionInProgress, question]); // chatHistory 추가

    // 선호 시작 시간 질문 처리
    useEffect(() => {
        // AI가 시작 시간 질문을 했고, 해당 타임피커 메시지가 채팅에 추가되었는지 확인
        const qStartTimeQuestionExists = chatHistory.some(msg => !msg.isResponse && msg.content.includes("몇 시에 일정을 시작하시나요?"));
        const qStartTimePickerMessageExists = chatHistory.some(msg => msg.content === "timepicker_start_preference");
        const qShouldInitializeStartTimePicker = qStartTimeQuestionExists && qStartTimePickerMessageExists && !startTimePickerRef.current;

        if (qShouldInitializeStartTimePicker) {
            setTimeout(() => {
                const timepickerElement = document.querySelector('.timepicker-start-preference-message');
                if (timepickerElement && !startTimePickerRef.current) {
                    startTimePickerRef.current = flatpickr(timepickerElement as HTMLElement, {
                        inline: true,
                        enableTime: true,
                        noCalendar: true,
                        dateFormat: "H:i",
                        minuteIncrement: 30,
                        defaultHour: 10,
                        defaultMinute: 0,
                        onReady: function(selectedDates, dateStr, instance) {
                            // 인스턴스 준비 시 기본 설정된 시간을 tempPreferredTime 상태에 저장
                            const defaultDate = new Date();
                            defaultDate.setHours(instance.config.defaultHour || 0, instance.config.defaultMinute || 0, 0, 0);
                            const initialTime = flatpickr.formatDate(defaultDate, "H:i");
                            setTempPreferredTime(initialTime);
                        },
                        onChange: (selectedDates) => {
                            if (selectedDates.length > 0) {
                                const selectedTime = flatpickr.formatDate(selectedDates[0], "H:i");
                                setTempPreferredTime(selectedTime);
                            }
                        }
                    });
                }
            }, 0);
        }
    }, [chatHistory]);

    // 선호 종료 시간 질문 처리
    useEffect(() => {
        // AI가 종료 시간 질문을 했고, 해당 타임피커 메시지가 채팅에 추가되었는지 확인
        const qEndTimeQuestionExists = chatHistory.some(msg => !msg.isResponse && msg.content.includes("몇 시에 일정을 마치길 선호하시나요?"));
        const qEndTimePickerMessageExists = chatHistory.some(msg => msg.content === "timepicker_end_preference");
        const qShouldInitializeEndTimePicker = qEndTimeQuestionExists && qEndTimePickerMessageExists && !endTimePickerRef.current;

        if (qShouldInitializeEndTimePicker) {
            setTimeout(() => {
                const timepickerElement = document.querySelector('.timepicker-end-preference-message');
                if (timepickerElement && !endTimePickerRef.current) {
                    endTimePickerRef.current = flatpickr(timepickerElement as HTMLElement, {
                        inline: true,
                        enableTime: true,
                        noCalendar: true,
                        dateFormat: "H:i",
                        minuteIncrement: 30,
                        defaultHour: 18,
                        defaultMinute: 0,
                        onReady: function(selectedDates, dateStr, instance) {
                            // 인스턴스 준비 시 기본 설정된 시간을 tempPreferredTime 상태에 저장
                            const defaultDate = new Date();
                            defaultDate.setHours(instance.config.defaultHour || 0, instance.config.defaultMinute || 0, 0, 0);
                            const initialTime = flatpickr.formatDate(defaultDate, "H:i");
                            setTempPreferredTime(initialTime);
                        },
                        onChange: (selectedDates) => {
                            if (selectedDates.length > 0) {
                                const selectedTime = flatpickr.formatDate(selectedDates[0], "H:i");
                                setTempPreferredTime(selectedTime);
                            }
                        }
                    });
                }
            }, 0);
        }
    }, [chatHistory]);

    // 다음 질문 표시 (캘린더 또는 타임피커 이후 질문들)
    useEffect(() => {
        if (currentQuestionIndex > 4 && currentQuestionIndex < question.length && !isQuestionInProgress) {
            const lastMessage = chatHistory[chatHistory.length - 1];
            
            if (!lastMessage?.isResponse) {
                return;
            }

            setIsQuestionInProgress(true);
            setTimeout(() => {
                setChatHistory(prev => [...prev, {
                    content: question[currentQuestionIndex],
                    timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                    isResponse: false
                }]);
                setCurrentQuestionIndex(prev => prev + 1);
                setIsQuestionInProgress(false);
            }, 1000);
        }
    }, [currentQuestionIndex, chatHistory]);

    // 입력창 포커스
    useEffect(() => {
        if (!isQuestionInProgress && !isComplete && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isQuestionInProgress, isComplete]);

    // 사용자 응답에 따라 섹션 표시
    const handleUserResponse = (response: string, currentQuestion: string) => {
        setTimeout(() => {
            if (currentQuestion.includes("여행기간은 언제인가요") && response === '네') {
                setVisibleSections(prev => [...prev, "dateRange"]);
                // startDate와 endDate는 handleSendMessageInternal에서 이미 저장됨
            } else if (currentQuestion.includes("함께 여행가는 인원을 말씀해주세요")) {
                setVisibleSections(prev => [...prev, "numberOfPeople"]);
                updateUserAnswer({ numberOfPeople: response });
                localStorage.setItem('numberOfPeople', response); // 로컬 스토리지에 저장
            } else if (currentQuestion.includes("함께 여행가는 인원들의 연령대를 말씀해주세요")) {
                setVisibleSections(prev => [...prev, "ageRange"]);
                updateUserAnswer({ ageRange: response });
                localStorage.setItem('ageRange', response); // 로컬 스토리지에 저장
            } else if (currentQuestion.includes("활동을 선호하시나요")) {
                setVisibleSections(prev => [...prev, "preferActivity"]);
                updateUserAnswer({ preferActivity: response });
            } else if (currentQuestion.includes("음식을 선호하시나요")) {
                setVisibleSections(prev => [...prev, "preferFood"]);
                updateUserAnswer({ preferFood: response });
            } else if (currentQuestion.includes("못먹는 종류의 음식이 있으신가요")) {
                setVisibleSections(prev => [...prev, "dislikedFood"]);
                updateUserAnswer({ dislikedFood: response });
            } else if (currentQuestion.includes("교통수단을 이용하시나요")) {
                setVisibleSections(prev => [...prev, "transportation"]);
                updateUserAnswer({ transportation: response });
                localStorage.setItem('transportation', response); // 로컬 스토리지에 저장
            } else if (currentQuestion.includes("몇 시에 일정을 시작하시나요?")) {
                setVisibleSections(prev => [...prev, "preferredStartTime"]);
                // preferredStartTime은 handleSendMessageInternal에서 이미 저장됨
            } else if (currentQuestion.includes("몇 시에 일정을 마치길 선호하시나요")) {
                setVisibleSections(prev => [...prev, "preferredEndTime"]);
                // preferredEndTime은 handleSendMessageInternal에서 이미 저장됨
            } else if (currentQuestion.includes("추가적으로 반영하고 싶은 내용이 있나요")) {
                setVisibleSections(prev => [...prev, "requirement"]);
                updateUserAnswer({ requirement: response });
            }
        }, 500);
    };

    // 이전 메시지와 현재 메시지가 같은 사람의 메시지인지 확인하는 함수
    const shouldShowPhoto = (messages: Message[], currentIndex: number): boolean => {
        if (currentIndex === 0) return true;
        const currentMessage = messages[currentIndex];
        const previousMessage = messages[currentIndex - 1];
        if (!currentMessage || !previousMessage) return true; // 방어 코드
        return currentMessage.isResponse !== previousMessage.isResponse;
    };

    // 캘린더 표시 시 스크롤 처리
    useEffect(() => {
        const isCalendarMessage = chatHistory.some(msg => msg.content === "calendar");
        if (isCalendarMessage) {
            setTimeout(() => {
                if (messageEndRef.current) {
                    messageEndRef.current.scrollIntoView({ behavior: "smooth" });
                }
            }, 100);
        }
    }, [chatHistory]);

    // 마지막 질문 이후 다음 페이지로 이동
    useEffect(() => {
        if (isComplete) {
            const checkAttractionsReady = async (tripPlanId: number) => {
                try {
                    // 추천 여행지 목록을 가져오는 API 엔드포인트로 변경
                    const response = await authenticatedFetch(`/api/trip-plans/${tripPlanId}/attractions`, { method: 'GET' });
                    const data = await response.json();

                    // API 응답 성공 및 attractions 데이터 존재 여부 확인
                    if (data.isSuccess && data.result && data.result.attractions && data.result.attractions.length > 0) {
                        setIsLoading(false);
                        navigate(`/selectionDestination`, { 
                            state: { tripPlansId: tripPlanId } 
                        });
                    } else {
                        // 데이터가 아직 준비되지 않았거나, API 응답은 성공했으나 attractions가 비어있는 경우
                        // 또는 isSuccess가 false인 경우 (예: 아직 생성 중이라 404가 뜨는 경우 등)
                        console.warn('Attractions 데이터 확인 중 또는 데이터 미비:', data.message || 'Attractions not ready');
                        setTimeout(() => checkAttractionsReady(tripPlanId), 2000); // 2초 후 재시도
                    }
                } catch (error) {
                    // 네트워크 오류 또는 기타 파싱 오류 등
                    console.error('Attractions 데이터 확인 중 오류 발생:', error);
                    setTimeout(() => checkAttractionsReady(tripPlanId), 2000); // 2초 후 재시도
                }
            };

            const loadNextPageData = async () => {
                if (styleId) {
                    setIsLoading(true); // 로딩 시작
                    try {
                        // 여행 계획 확정 API 호출 (tripPlanId 생성)
                        const response = await authenticatedFetch(`/api/styles/${styleId}/final`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        const data = await response.json();
                        let tripPlanId;
                        
                        if (data.isSuccess && data.result && data.result.tripPlanId) {
                            tripPlanId = data.result.tripPlanId;
                            console.log('[QuestionPage] 생성된 tripPlanId:', tripPlanId);
                            // tripPlanId를 사용하여 attractions 데이터 준비 상태 확인 시작
                            await checkAttractionsReady(tripPlanId); 
                        } else {
                            setIsLoading(false); // tripPlanId 못 받으면 로딩 종료
                            console.warn('tripPlanId를 받지 못했습니다.');
                            // 이 경우에는 사용자에게 알리거나, 재시도 로직을 추가할 수 있습니다.
                            // 현재 요청은 attractions 확인부터 재시도이므로, 여기서는 일단 로딩을 멈춥니다.
                            alert(data.message || 'tripPlanId를 받지 못했습니다. 여행 계획을 생성할 수 없습니다.');
                        }
                    } catch (error) {
                        setIsLoading(false); // API 호출 실패 시 로딩 종료
                        console.error('Error finalizing style (tripPlanId 생성 실패):', error);
                        alert('여행 계획을 생성하는 중 오류가 발생했습니다.');
                    }
                } else {
                    alert('스타일 ID가 없습니다. 질문을 다시 진행해주세요.');
                }
            };
            
            // 데이터 로딩 시작
            loadNextPageData();
        }
    }, [isComplete, navigate, styleId]);

    // 컴포넌트 언마운트 시 flatpickr 인스턴스 파괴
    useEffect(() => {
        return () => {
            if (datePickerRef.current) {
                datePickerRef.current.destroy();
                datePickerRef.current = null;
            }
            if (startTimePickerRef.current) {
                startTimePickerRef.current.destroy();
                startTimePickerRef.current = null;
            }
            if (endTimePickerRef.current) {
                endTimePickerRef.current.destroy();
                endTimePickerRef.current = null;
            }
        };
    }, []);

    return (
        <ContentWrapper>
            {isLoading && <LoadingSpinner message="추천 여행지 정보 생성 중입니다... \n 잠시만 기다려주세요!" />} 
            <QuestionSection style={{ filter: isLoading ? 'blur(5px)' : 'none' }}>
                <ChatSection>
                    <MessagesChat>
                        {defaultQuestions.map((msg, index) => (
                            <Message key={index}>
                                <Photo style={{ visibility: shouldShowPhoto(defaultQuestions, index) ? 'visible' : 'hidden' }}>
                                    <AIAvatar>AI</AIAvatar>
                                </Photo>
                                <ChatText>
                                    <MessageWrapper>
                                        <Text>
                                            <p>{msg.content}</p>
                                        </Text>
                                        <Time>{msg.timestamp}</Time>
                                    </MessageWrapper>
                                </ChatText>
                            </Message>
                        ))}
                        {chatHistory.map((msg, index) => (
                            <Message key={index} className={msg.isResponse ? "response" : ""}>
                                <Photo className={msg.isResponse ? "response" : ""} style={{ visibility: shouldShowPhoto(chatHistory, index) && !msg.isResponse ? 'visible' : 'hidden' }}>
                                    {!msg.isResponse && <AIAvatar>AI</AIAvatar>}
                                </Photo>
                                <ChatText className={msg.isResponse ? "response" : ""}>
                                    <MessageWrapper className={msg.isResponse ? "response" : ""}>
                                        {msg.content === "calendar" ? (
                                            <Text className="calendar">
                                                <div className="calendar-message" />
                                            </Text>
                                        ) : msg.content === "timepicker_start_preference" ? (
                                            <Text className="calendar">
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div className="timepicker-start-preference-message" />
                                                    <TimeConfirmButton 
                                                        id="confirm-time-start-btn"
                                                        onClick={() => handleSendMessageInternal("TIME_CONFIRMED_START")}
                                                    >
                                                        선택 완료
                                                    </TimeConfirmButton>
                                                </div>
                                            </Text>
                                        ) : msg.content === "timepicker_end_preference" ? (
                                            <Text className="calendar"> 
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div className="timepicker-end-preference-message" />
                                                    <TimeConfirmButton 
                                                        id="confirm-time-end-btn"
                                                        onClick={() => handleSendMessageInternal("TIME_CONFIRMED_END")}
                                                    >
                                                        선택 완료
                                                    </TimeConfirmButton>
                                                </div>
                                            </Text>
                                        ) : (
                                            <Text className={msg.isResponse ? "response" : ""}>
                                                <p>{msg.content}</p>
                                            </Text>
                                        )}
                                        <Time>{msg.timestamp}</Time>
                                    </MessageWrapper>
                                </ChatText>
                            </Message>
                        ))}
                        <div ref={messageEndRef} />
                    </MessagesChat>

                    <FooterChat>
                        <ChatInputWrapper>
                            <InputArea>
                                <SendForm
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey && !isQuestionInProgress && !isComplete && !isLoading) {
                                            e.preventDefault();
                                            if (!inputValue.trim()) return;
                                            handleSendMessage();
                                        }
                                    }}
                                    disabled={isQuestionInProgress || isComplete || isLoading}
                                    placeholder={
                                        isLoading ? '여행 계획 생성 중...' :
                                        isComplete ? '질문이 완료되었습니다.' :
                                        isQuestionInProgress ? '질문이 진행 중입니다...' : 
                                        '메시지 입력...'
                                    }
                                />
                            </InputArea>
                            <Button 
                                onClick={handleSendMessage} 
                                disabled={isQuestionInProgress || isComplete || isLoading}
                            >
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </Button>
                        </ChatInputWrapper>
                    </FooterChat>
                </ChatSection>

                <QuestionSidebar 
                    userAnswers={userAnswers}
                    visibleSections={visibleSections}
                />
            </QuestionSection>
        </ContentWrapper>
    );
};

export default QuestionPage;