import React, {useEffect, useState, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import flatpickr from 'flatpickr';
import { Korean } from 'flatpickr/dist/l10n/ko';
import 'flatpickr/dist/flatpickr.min.css';
import styled, { createGlobalStyle } from 'styled-components';
import LoadingSpinner from '../../components/LoadingSpinner';

import profileImg from "../../assets/images/profile_img.png";
import icoNext from "../../assets/images/ico_cal_next.png";

const GlobalStyle = createGlobalStyle`
    html, body {
        overflow: hidden;
        margin: 0;
        padding: 0;
        height: 100%;
    }
`;

const Wrapper = styled.div`
    width: 100%;
    height: calc(100vh - 90px);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    overflow: hidden;
    justify-content: center;
    padding: 20px 0;

    @media (max-width: 768px) {
        height: calc(100vh - 60px);
        padding: 10px 0;
    }
`;

const GuideWrap = styled.div`
    display: flex;
    gap: 24px;
    padding: 24px;
    height: calc(100vh - 120px);
    max-width: 1440px;
    margin: 0 auto;
    width: 85%;
    overflow: hidden;
    align-self: center;

    @media (max-width: 1200px) {
        width: 95%;
        height: calc(100vh - 100px);
    }

    @media (max-width: 768px) {
        flex-direction: column;
        padding: 16px;
        gap: 16px;
        height: calc(100vh - 80px);
        width: 100%;
    }

    @media (max-width: 480px) {
        padding: 12px;
        height: calc(100vh - 60px);
    }
`;

const ChatSection = styled.div`
    flex: 2.8;
    border: 1px solid #eee;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    @media (max-width: 768px) {
        flex: 1;
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
    
    @media (max-width: 768px) {
        padding: 16px;
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
    
    &.response img {
        border-color: #E3F2FD;
    }
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
    border-top: 1px solid #eee;
    padding: 14px 20px;
    flex-shrink: 0;
    background: #fff;
    height: 80px; /* 고정 높이 */
    display: flex;
    align-items: center;
    position: relative;
`;

const ChatInputWrapper = styled.div`
    display: flex;
    width: 100%;
    flex-direction: column;
    background: #f5f5f5;
    border-radius: 12px;
    padding: 6px 16px;
    gap: 2px;
    border: 2px solid transparent;
    box-shadow: none;
    transition: all 0.2s ease;
    position: relative;

    &:focus-within {
        border-color: #BBDEFB;
        box-shadow: 0 0 0 1px #BBDEFB;
    }

    .calendar-wrapper {
        position: absolute;
        bottom: 100%;
        left: 0;
        margin-bottom: 8px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        z-index: 100;

        .flatpickr-calendar {
            border: none;
            box-shadow: none;
            margin: 0;
            padding: 0;
            background: transparent;
        }
    }
`;

const InputArea = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    border: none;
    
`;

const ToolsArea = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: none;
`;

const SendForm = styled.input`
    width: 100%;
    border: none !important;
    outline: none !important;
    background: transparent;
    font-size: 16px !important;
    font-weight: 400;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1;
    color: #333;
    padding: 0;
    margin: 10px;
    box-shadow: none !important;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;

    &:focus,
    &:hover,
    &:active {
        outline: none !important;
        border: none !important;
        box-shadow: none !important;
    }

    &:disabled {
        color: #999;
        cursor: not-allowed;
        background: transparent;
        border: none !important;
        outline: none !important;
    }

    &::placeholder {
        color: #999;
        font-size: 13px;
        font-weight: 400;
    }
`;


const Button = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: url(${icoNext}) no-repeat center;
    background-size: 24px;
    color: transparent;
    border-radius: 50%;
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    text-align: center;
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
    padding: 0;
    opacity: 1;
    visibility: visible;
    transform: scale(1);
    position: absolute;
    right: 4px;
    bottom: 4px;

    &:hover:not(:disabled) {
        background: url(${icoNext}) no-repeat center rgba(0, 0, 0, 0.05);
        background-size: 24px;
    }

    &:disabled {
        opacity: 0;
        visibility: hidden;
        transform: scale(0.8);
        transition: all 0.2s ease;
    }

    &.round_big {
        position: static;
        width: 100%;
        padding: 15px;
        border-radius: 12px;
        height: auto;
        font-size: 14px;
        background: none;
        color: #333;
        opacity: 1;
        visibility: visible;
        transform: none;

        &:disabled {
            opacity: 0.6;
            visibility: visible;
            transform: none;
        }
    }
`;

const LoadingContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
    z-index: 1000;
`;

const ResponseSection = styled.div`
    flex: 1.2;
    border: 1px solid #eee;
    border-radius: 12px;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    position: relative;

    @media (max-width: 768px) {
        flex: 1;
        height: 40vh;
    }
`;

const ResponseList = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 30px;
    height: calc(100% - 60px);
    overflow-y: auto;
    scroll-behavior: smooth;
    
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
    
    li {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        margin-bottom: 20px;
        width: 100%;

        &:last-child {
            margin-bottom: 0;
        }

        &.visible {
            opacity: 1;
            transform: translateY(0);
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

const ResponseField = styled.div`
    background: #f8f9fa;
    border-radius: 12px;
    padding: 12px 16px;
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
    gap: 8px;

    ${ResponseField} {
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

const BlindText = styled.span`
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    border: 0;
`;


const getQuestion = (userName: string) => [
    "안녕하세요!",
    `이번 여행에서 ${userName}님의 가이드를 맞게된 ###입니다!`,
    `여행 가이드에 앞서 몇가지 질문을 받아 ${userName}님의 취향을 분석하여 최적의 가이드를 진행하려고 합니다!`,
    `${userName}님의 여행기간은 언제인가요?`,
    `함께 여행가는 인원을 말씀해주세요!`,
    `함께 여행가는 인원들의 연령대를 말씀해주세요!`,
    `${userName}님은 어떤 종류의 활동을 선호하시나요?`,
    `${userName}님은 어떤 종류의 음식을 선호하시나요?`,
    `${userName}님은 못먹는 종류의 음식이 있으신가요?`,
    `${userName}님은 어떤 교통수단을 이용하시나요?`,
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

const QuestionPage: React.FC = () => {
    const navigate = useNavigate();
    // 상태 관리
    const question = getQuestion("김수연");
    const userName = "김수연";
    const [chatHistory, setChatHistory] = useState<Message[]>([]); // 채팅 기록
    const [defaultQuestions, setDefaultQuestions] = useState<Message[]>([]); // 기본 질문들
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [inputValue, setInputValue] = useState("");
    const [isQuestionInProgress, setIsQuestionInProgress] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    
    // 사용자 응답 데이터 관리
    const [userAnswers, setUserAnswers] = useState({
        destination: "부산",
        dateRange: {
            start: "",
            end: ""
        },
        numberOfPeople: "",
        ageRange: "",
        activities: "",
        foodPreferences: "",
        foodRestrictions: "",
        additionalRequests: "",
        transport: ""
    });

    // 임시 날짜 범위 저장
    const [tempDateRange, setTempDateRange] = useState({
        start: "",
        end: ""
    });

    // 보여질 섹션 관리
    const [visibleSections, setVisibleSections] = useState<string[]>(["destination"]);

    const inputRef = React.useRef<HTMLInputElement>(null);
    const messageEndRef = React.useRef<HTMLDivElement>(null);
    const responseListRef = useRef<HTMLUListElement>(null);

    // 채팅창 자동 스크롤
    const scrollToBottom = () => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ 
                behavior: "smooth", 
                block: "end"
            });
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
            !chatHistory.some(msg => msg.content === "calendar");
        
        if (isDateQuestion && !isQuestionInProgress) {
            setIsQuestionInProgress(true);
            
            setChatHistory(prev => [...prev, {
                content: "calendar",
                timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                isResponse: false
            }]);

            setTimeout(() => {
                const calendarElement = document.querySelector('.calendar-message');
                if (calendarElement) {
                    flatpickr(calendarElement, {
                        locale: Korean,
                        mode: "range",
                        inline: true,
                        dateFormat: "Y-m-d",
                        onChange: (selectedDates) => {
                            if (selectedDates.length === 2) {
                                const startDate = selectedDates[0].toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
                                const endDate = selectedDates[1].toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
                                const dateRange = `${startDate} ~ ${endDate}`;

                                // 임시로 날짜 데이터 저장
                                setTempDateRange({
                                    start: startDate,
                                    end: endDate
                                });

                                // 캘린더 비활성화
                                const calendarElement = document.querySelector('.flatpickr-calendar');
                                if (calendarElement) {
                                    calendarElement.classList.add('disabled');
                                }

                                // 확인 메시지 표시
                                setChatHistory(prev => [...prev, {
                                    content: `선택하신 기간이 ${dateRange} 맞으신가요? 맞으시다면 '네'를 입력해주세요.`,
                                    timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                                    isResponse: false
                                }]);
                                setIsQuestionInProgress(false);
                            }
                        }
                    });
                }
            }, 100);
        }
    }, [defaultQuestions, isQuestionInProgress]);

    // 다음 질문 표시 (캘린더 이후 질문들)
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
            } else if (currentQuestion.includes("함께 여행가는 인원을 말씀해주세요")) {
                setVisibleSections(prev => [...prev, "numberOfPeople"]);
                setUserAnswers(prev => ({ ...prev, numberOfPeople: response }));
            } else if (currentQuestion.includes("함께 여행가는 인원들의 연령대를 말씀해주세요")) {
                setVisibleSections(prev => [...prev, "ageRange"]);
                setUserAnswers(prev => ({ ...prev, ageRange: response }));
            } else if (currentQuestion.includes("활동을 선호하시나요")) {
                setVisibleSections(prev => [...prev, "activities"]);
                setUserAnswers(prev => ({ ...prev, activities: response }));
            } else if (currentQuestion.includes("음식을 선호하시나요")) {
                setVisibleSections(prev => [...prev, "foodPreferences"]);
                setUserAnswers(prev => ({ ...prev, foodPreferences: response }));
            } else if (currentQuestion.includes("못먹는 종류의 음식이 있으신가요")) {
                setVisibleSections(prev => [...prev, "foodRestrictions"]);
                setUserAnswers(prev => ({ ...prev, foodRestrictions: response }));
            } else if (currentQuestion.includes("교통수단을 이용하시나요")) {
                setVisibleSections(prev => [...prev, "transport"]);
                setUserAnswers(prev => ({ ...prev, transport: response }));
            } else if (currentQuestion.includes("추가적으로 반영하고 싶은 내용이 있나요")) {
                setVisibleSections(prev => [...prev, "additionalRequests"]);
                setUserAnswers(prev => ({ ...prev, additionalRequests: response }));
            } 
        }, 500); // 500ms 지연으로 자연스러운 업데이트
    };

    // 메시지 전송 처리
    const handleSendMessage = () => {
        if (inputValue.trim() !== "" && !isQuestionInProgress && !isComplete) {
            setIsQuestionInProgress(true);
            const currentTime = new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' });
            const currentQuestion = question[currentQuestionIndex - 1];
            
            // 사용자 응답 추가
            setChatHistory(prev => [...prev, {
                content: inputValue,
                timestamp: currentTime,
                isResponse: true
            }]);

            // 날짜 확인 응답 처리
            if (tempDateRange.start && tempDateRange.end && inputValue.toLowerCase() === '네') {
                // 확정된 날짜를 userAnswers에 저장
                setUserAnswers(prev => ({
                    ...prev,
                    dateRange: tempDateRange
                }));

                // 섹션 표시 업데이트
                handleUserResponse(inputValue, currentQuestion);

                // 캘린더 비활성화
                const calendarElement = document.querySelector('.flatpickr-calendar');
                if (calendarElement) {
                    calendarElement.classList.add('disabled');
                }

                // 다음 질문으로 진행
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        content: question[currentQuestionIndex],
                        timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                        isResponse: false
                    }]);
                    setCurrentQuestionIndex(prev => prev + 1);
                    setIsQuestionInProgress(false);
                    // 임시 저장된 날짜 초기화
                    setTempDateRange({ start: "", end: "" });
                }, 1000);
            } else if (tempDateRange.start && tempDateRange.end) {
                // '네'가 아닌 다른 응답인 경우 캘린더 재선택 안내
                setIsQuestionInProgress(true);
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        content: "날짜를 다시 선택해주세요.",
                        timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                        isResponse: false
                    }]);
                    
                    // 캘린더 초기화 및 재생성
                    const calendar = document.querySelector('.calendar-message');
                    if (calendar) {
                        const fp = flatpickr(calendar, {
                            locale: Korean,
                            mode: "range",
                            inline: true,
                            dateFormat: "Y-m-d",
                            onChange: (selectedDates) => {
                                if (selectedDates.length === 2) {
                                    const startDate = selectedDates[0].toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
                                    const endDate = selectedDates[1].toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
                                    const dateRange = `${startDate} ~ ${endDate}`;

                                    // 임시로 날짜 데이터 저장
                                    setTempDateRange({
                                        start: startDate,
                                        end: endDate
                                    });

                                    // 캘린더 비활성화
                                    const calendarElement = calendar.querySelector('.flatpickr-calendar');
                                    if (calendarElement) {
                                        calendarElement.classList.add('disabled');
                                    }

                                    // 확인 메시지 표시
                                    setChatHistory(prev => [...prev, {
                                        content: `선택하신 기간이 ${dateRange} 맞으신가요? 맞으시다면 '네'를 입력해주세요.`,
                                        timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                                        isResponse: false
                                    }]);
                                    setIsQuestionInProgress(false);
                                }
                            }
                        });
                        fp.clear();
                        
                        // 캘린더 활성화
                        const calendarElement = calendar.querySelector('.flatpickr-calendar');
                        if (calendarElement) {
                            calendarElement.classList.remove('disabled');
                        }
                    }
                    setTempDateRange({ start: "", end: "" });
                    
                    // 캘린더 위치로 스크롤
                    const calendarMessage = document.querySelector('.calendar-message');
                    if (calendarMessage) {
                        const calendarContainer = calendarMessage.closest('.Message');
                        if (calendarContainer) {
                            calendarContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                }, 1000);
            } else {
                // 일반적인 질문 처리
                handleUserResponse(inputValue, currentQuestion);

                if (currentQuestion.includes("추가적으로 반영하고 싶은 내용이 있나요?")) {
                    setTimeout(() => {
                        setChatHistory(prev => [...prev, {
                            content: question[currentQuestionIndex],
                            timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                            isResponse: false
                        }]);

                        setTimeout(() => {
                            setChatHistory(prev => [...prev, {
                                content: question[currentQuestionIndex + 1],
                                timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                                isResponse: false
                            }]);
                            
                            // 마지막 질문 이후 1초 뒤에 로딩 스피너 표시
                            setTimeout(() => {
                                setIsComplete(true);
                            }, 1000);
                        }, 1000);
                    }, 1000);
                } else {
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
            }

            setInputValue("");
        }
    };

    // 이전 메시지와 현재 메시지가 같은 사람의 메시지인지 확인하는 함수
    const shouldShowPhoto = (messages: Message[], currentIndex: number) => {
        if (currentIndex === 0) return true;
        const currentMessage = messages[currentIndex];
        const previousMessage = messages[currentIndex - 1];
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

    // 응답 섹션 스크롤 처리 개선
    useEffect(() => {
        const scrollToBottom = () => {
            if (responseListRef.current) {
                const list = responseListRef.current;
                const lastChild = list.lastElementChild;
                
                if (lastChild) {
                    const listHeight = list.clientHeight;
                    const contentHeight = list.scrollHeight;
                    const scrollPosition = contentHeight - listHeight;
                    
                    if (scrollPosition > 0) {
                        list.scrollTo({
                            top: scrollPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        };

        // 섹션이 추가될 때마다 스크롤
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 300); // 애니메이션 완료를 위해 시간 증가

        return () => {
            clearTimeout(timer);
        };
    }, [visibleSections]);

    // 마지막 질문 이후 로딩 처리
    useEffect(() => {
        if (isComplete) {
            // 3초 후에 로딩 종료 및 다음 페이지로 이동
            const timer = setTimeout(() => {
                navigate('/selectionDestination');
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [isComplete, navigate]);

    return (
        <>
            <GlobalStyle />
        <Wrapper>
                {isComplete && (
                    <LoadingContainer>
                        <LoadingSpinner message={`${userName}님의 성향에 맞는 추천 여행지를 준비하고 있습니다. 잠시만 기다려주세요.`}/>
                    </LoadingContainer>
                )}
                <GuideWrap>
                    <ChatSection>
                        <MessagesChat>
                            {defaultQuestions.map((msg, index) => (
                                <Message key={index}>
                                    <Photo style={{ visibility: shouldShowPhoto(defaultQuestions, index) ? 'visible' : 'hidden' }}>
                                    <img src={profileImg} alt="" />
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
                                    <Photo className={msg.isResponse ? "response" : ""} style={{ visibility: shouldShowPhoto(chatHistory, index) ? 'visible' : 'hidden' }}>
                                    <img src={profileImg} alt="" />
                                </Photo>
                                    <ChatText className={msg.isResponse ? "response" : ""}>
                                        <MessageWrapper className={msg.isResponse ? "response" : ""}>
                                            {msg.content === "calendar" ? (
                                                <Text className="calendar">
                                                    <div className="calendar-message" />
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
                                            if (e.key === "Enter" && !e.shiftKey && !isQuestionInProgress && !isComplete) {
                                                e.preventDefault();
                                                if (!inputValue.trim()) return;
                                                handleSendMessage();
                                            }
                                        }}
                                        disabled={isQuestionInProgress || isComplete}
                                        placeholder={
                                            isComplete ? '질문이 완료되었습니다.' :
                                            isQuestionInProgress ? '질문이 진행 중입니다...' : 
                                            '메시지 입력...'
                                        }/>
                                </InputArea>
                                <ToolsArea>
                                    
                                    <Button 
                                        onClick={handleSendMessage} 
                                        disabled={isQuestionInProgress || isComplete}>
                                        <BlindText>입력</BlindText>
                                    </Button>
                                </ToolsArea>
                            </ChatInputWrapper>
                        </FooterChat>
                    </ChatSection>
                    <ResponseSection>
                        <ResponseList ref={responseListRef}>
                            {visibleSections.includes("destination") && (
                            <li className="visible">
                                <strong>여행지</strong>
                                    <ResponseField className={!userAnswers.destination ? "empty" : ""}>
                                        <p>{userAnswers.destination || "아직 입력되지 않았습니다."}</p>
                                    </ResponseField>
                                </li>
                            )}
                            {visibleSections.includes("dateRange") && (
                                <li className="visible">
                                    <strong>여행 기간</strong>
                                    <DateRangeField>
                                        <ResponseField className={!userAnswers.dateRange.start ? "empty" : ""}>
                                            <p>{userAnswers.dateRange.start || "시작일을 선택해주세요."}</p>
                                        </ResponseField>
                                        <ResponseField className={!userAnswers.dateRange.end ? "empty" : ""}>
                                            <p>{userAnswers.dateRange.end || "종료일을 선택해주세요."}</p>
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
                            {visibleSections.includes("activities") && (
                                <li className="visible">
                                    <strong>선호 활동</strong>
                                    <ResponseField className={!userAnswers.activities ? "empty" : ""}>
                                        <p>{userAnswers.activities || "아직 입력되지 않았습니다."}</p>
                                    </ResponseField>
                                </li>
                            )}
                            {visibleSections.includes("foodPreferences") && (
                                <li className="visible">
                                    <strong>선호하는 음식</strong>
                                    <ResponseField className={!userAnswers.foodPreferences ? "empty" : ""}>
                                        <p>{userAnswers.foodPreferences || "아직 입력되지 않았습니다."}</p>
                                    </ResponseField>
                            </li>
                            )}
                            {visibleSections.includes("foodRestrictions") && (
                                <li className="visible">
                                    <strong>못 먹는 음식</strong>
                                    <ResponseField className={!userAnswers.foodRestrictions ? "empty" : ""}>
                                        <p>{userAnswers.foodRestrictions || "아직 입력되지 않았습니다."}</p>
                                    </ResponseField>
                            </li>
                            )}
                            {visibleSections.includes("transport") && (
                                <li className="visible">
                                    <strong>교통수단</strong>
                                    <ResponseField className={!userAnswers.transport ? "empty" : ""}>
                                        <p>{userAnswers.transport || "아직 입력되지 않았습니다."}</p>
                                    </ResponseField>
                            </li>
                            )}
                            {visibleSections.includes("additionalRequests") && (
                                <li className="visible">
                                    <strong>추가 요청사항</strong>
                                    <ResponseField className={!userAnswers.additionalRequests ? "empty" : ""}>
                                        <p>{userAnswers.additionalRequests || "아직 입력되지 않았습니다."}</p>
                                    </ResponseField>
                            </li>
                            )}
                        </ResponseList>
                    </ResponseSection>
                </GuideWrap>
        </Wrapper>
        </>
    );
};

export default QuestionPage;