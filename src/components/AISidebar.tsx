import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import SelectionModal from './Modal/SelectionModal';
// import img_3 from '../assets/images/travel_img3.jpg'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: number;
    text: string;
    isUser: boolean;
    isLoading?: boolean;
}

// Place 인터페이스 추가
interface Place {
    id: number;
    name: string;
    address: string;
    imageUrl?: string;
    coordinates?: { lat: number; lng: number };
}

// AISidebar 내부에서 사용하는 추천 장소 인터페이스
interface AISidebarTravelItem {
    id: number;
    image: string;
    title: string;
    description: string;
    location?: string;
    coordinates?: { lat: number; lng: number };
    operatingHours?: string;
}

// SelectionModal과 호환되는 TravelItem 인터페이스
interface ModalTravelItem {
    id: number; // AISidebarTravelItem의 id와 동일하게 사용
    attractionId?: number;
    restaurantId?: number;
    imageUrl: string;
    name: string;
    title: string; // AISidebarTravelItem의 description에 해당
    address?: string;
    latitude?: number;
    longitude?: number;
    operatingHours?: string;
    phoneNumber?: string;
}

// Chatbot API 요청 본문 타입
interface ChatRequestBody {
    query: string;
    chat_history: string[][]; // 변경된 타입: [질문, 응답] 쌍의 배열
}

// Chatbot API 응답 타입
interface ChatApiResponse {
    query: string;
    category: string;
    response: string;
    sources: Array<{ content_id: number }>;
    chat_history_length: number;
}

interface AISidebarProps {
    isOpen: boolean;
    addRecommendedPlace?: (place: Place, targetDay?: number) => boolean;
}

const AISidebar: React.FC<AISidebarProps> = ({ isOpen, addRecommendedPlace }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "안녕하세요! 부산 여행 계획을 도와드릴게요. 어떤 점이 궁금하신가요?", isUser: false },
    ]);
    const [newMessage, setNewMessage] = useState('');
    
    // SelectionModal 관련 상태
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [selectedTravelItem, setSelectedTravelItem] = useState<ModalTravelItem | null>(null);
    
    // 스크롤을 위한 ref
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 스크롤을 맨 아래로 이동시키는 함수
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // messages 상태가 변경될 때마다 스크롤을 맨 아래로 이동
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    // 테스트용 추천 장소 데이터 (AISidebarTravelItem 사용)
    const recommendedPlaces: AISidebarTravelItem[] = []; // 더미 데이터 제거, 빈 배열로 초기화

// 메시지 보내기 함수
const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const userMessage: Message = {
        id: Date.now(),
        text: newMessage,
        isUser: true
    };

    // 사용자 메시지를 먼저 messages 상태에 추가하고 화면에 표시
    setMessages(prev => [...prev, userMessage]);
    const currentNewMessage = newMessage; // 비동기 상태 업데이트 대비
    setNewMessage('');

    // AI 응답 대기 메시지 추가
    const loadingMessageId = userMessage.id + 1; // 사용자 메시지 ID와 다르게 설정
    const loadingMessage: Message = {
        id: loadingMessageId, 
        text: 'AI가 답변을 작성중입니다...',
        isUser: false,
        isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    // API 요청을 위한 chat_history 구성 (string[][])
    const filteredMessages = messages.filter(msg => msg.id !== 1); // 초기 AI 메시지 제외
    const newChatHistory: string[][] = [];
    for (let i = 0; i < filteredMessages.length; i += 2) {
        if (filteredMessages[i]?.isUser && filteredMessages[i+1] && !filteredMessages[i+1]?.isUser) {
            newChatHistory.push([filteredMessages[i].text, filteredMessages[i+1].text]);
        }
        // 만약 마지막 메시지가 사용자 메시지이고 AI 응답이 아직 없다면, 이 부분은 history에 포함되지 않습니다.
    }

    try {
        const response = await fetch('http://43.201.16.128/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: currentNewMessage,
                chat_history: newChatHistory
            } as ChatRequestBody),
        });

        // 응답을 받으면 "작성중..." 메시지 제거
        setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId)); // msg.id (number)와 loadingMessageId (number) 비교

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'API 응답 처리 중 오류 발생' }));
            console.error('API Error:', response.status, errorData);
            const aiErrorMessage: Message = {
                id: Date.now() + 1, // 새로운 ID
                text: `오류가 발생했습니다: ${errorData.message || response.statusText}. 다시 시도해주세요.`,
                isUser: false
            };
            setMessages(prev => [...prev, aiErrorMessage]);
            return;
        }

        const data: ChatApiResponse = await response.json();
        const aiResponse: Message = {
            id: Date.now() + 1, // 새로운 ID
            text: data.response,
            isUser: false
        };
        setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
        // 오류 발생 시 "작성중..." 메시지 제거
        setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId)); // msg.id (number)와 loadingMessageId (number) 비교
        
        console.error('Failed to send message or parse response:', error);
        const aiErrorMessage: Message = {
            id: Date.now() + 1, // 새로운 ID
            text: '메시지 전송 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.',
            isUser: false
        };
        setMessages(prev => [...prev, aiErrorMessage]);
    }
};

const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};

// 장소 추천 메시지 표시
// const showRecommendations = () => { ... }; // 이 함수 전체를 삭제합니다.

// 추천 장소 선택 처리 함수
const handleSelectRecommendation = (item: AISidebarTravelItem) => {
    // SelectionModal에서 사용할 형태로 변환
    const modalItem: ModalTravelItem = {
        id: item.id,
        name: item.title, 
        imageUrl: item.image, 
        title: item.description, 
        address: item.location,
        latitude: item.coordinates?.lat,
        longitude: item.coordinates?.lng,
        operatingHours: item.operatingHours,
        // ModalTravelItem에만 있는 필드는 undefined 또는 기본값으로 설정
        // attractionId, restaurantId, phoneNumber 등은 여기서 설정하지 않거나,
        // item에 해당 정보가 있다면 매핑합니다. 현재 AISidebarTravelItem에는 해당 필드가 없습니다.
    };
    setSelectedTravelItem(modalItem);
    setIsSelectionModalOpen(true);
};

// 장소 추가 처리 함수
const handleAddSelectedPlace = () => {
    if (!selectedTravelItem || !addRecommendedPlace) return;
    
    // 모달 닫기
    setIsSelectionModalOpen(false);
    
    // 일차 선택 메시지 추가
    const dayQuestion: Message = {
        id: Date.now(),
        text: '몇 일차에 추가할까요? 숫자만 입력하세요. 미입력시 자동 배치됩니다.',
        isUser: false
    };
    
    setMessages(prev => [...prev, dayQuestion]);
    
    // 버튼 메시지 추가
    setTimeout(() => {
        const buttonMessage: Message = {
            id: Date.now() + 1,
            text: `<add-place id=${selectedTravelItem.id}>`, // id는 ModalTravelItem의 id를 사용
            isUser: false
        };
        setMessages(prev => [...prev, buttonMessage]);
    }, 500);
};

// 장소 추가 실행 함수
const executeAddPlace = (placeId: number, day?: number) => {
    // recommendedPlaces에서 AISidebarTravelItem을 찾아야 함
    // selectedTravelItem은 ModalTravelItem 타입이므로 직접 비교 X
    const originalRecommendedPlace = recommendedPlaces.find(place => place.id === placeId);

    if (!originalRecommendedPlace || !addRecommendedPlace) return;
    
    // AISidebar Place 형식으로 변환
    const placeToAdd: Place = {
        id: originalRecommendedPlace.id,
        name: originalRecommendedPlace.title,
        address: originalRecommendedPlace.location || '',
        imageUrl: originalRecommendedPlace.image,
        coordinates: originalRecommendedPlace.coordinates
    };
    
    // 장소 추가
    const result = addRecommendedPlace(placeToAdd, day);
    
    // 결과 메시지 추가
    const resultMessage: Message = {
        id: Date.now(),
        text: result 
            ? `${day ? day + '일차' : '적절한 일차'}에 ${originalRecommendedPlace.title}가 추가되었습니다.` 
            : '장소 추가에 실패했습니다.',
        isUser: false
    };
    
    setMessages(prev => [...prev, resultMessage]);
};

// 메시지 렌더링 함수
const renderMessage = (message: Message) => {
    // 추천 카드 메시지 처리
    if (message.text === '<recommendation-cards>') {
        return (
            <MessageBubble key={message.id} isUser={message.isUser}>
                <RecommendationCards>
                    {recommendedPlaces.map(place => ( 
                        <RecommendationCard 
                            key={place.id}
                            onClick={() => handleSelectRecommendation(place)}
                        >
                            <CardImage src={place.image} alt={place.title} />
                            <CardContent>
                                <CardTitle>{place.title}</CardTitle>
                                <CardLocation>{place.location}</CardLocation>
                            </CardContent>
                        </RecommendationCard>
                    ))}
                </RecommendationCards>
            </MessageBubble>
        );
    }
    
    // 장소 추가 버튼 메시지 처리
    if (message.text.includes('<add-place id=')) {
        const placeId = parseInt(message.text.match(/id=(\d+)/)?.[1] || '0');
        return (
            <MessageBubble key={message.id} isUser={message.isUser}>
                어느 일차에 추가할까요?
                <ActionButtonsContainer>
                    <ActionButton onClick={() => executeAddPlace(placeId, 1)}>1일차에 추가</ActionButton>
                    <ActionButton onClick={() => executeAddPlace(placeId, 2)}>2일차에 추가</ActionButton>
                    <ActionButton onClick={() => executeAddPlace(placeId, 3)}>3일차에 추가</ActionButton>
                    <ActionButton onClick={() => executeAddPlace(placeId, 4)}>4일차에 추가</ActionButton>
                    <ActionButton onClick={() => executeAddPlace(placeId)}>자동 배치</ActionButton>
                </ActionButtonsContainer>
            </MessageBubble>
        );
    }
    
    // 일반 메시지 (사용자 또는 AI)
    if (message.isUser) {
        // 사용자가 보낸 메시지
        return (
            <MessageBubble key={message.id} isUser={message.isUser}>
                {message.text}
            </MessageBubble>
        );
    } else {
        // AI가 보낸 메시지 (마크다운 렌더링 적용)
        return (
            <MessageBubble key={message.id} isUser={message.isUser} isLoading={message.isLoading}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                </ReactMarkdown>
            </MessageBubble>
        );
    }
};

return (
    <ChatPanelContainer isOpen={isOpen}>
    <ChatHeader>
        <ChatTitle>
        <AIAvatar>AI</AIAvatar>
        여행 어시스턴트
        </ChatTitle>
    </ChatHeader>
    
    <MessagesContainer>
        {messages.map((message) => renderMessage(message))}
        <div ref={messagesEndRef} /> {/* 스크롤 대상 ref */} 
    </MessagesContainer>
    
    <ChatInputContainer>
        <ChatInput 
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="질문을 입력해 주세요..."
        />
        <SendButton onClick={sendMessage}>
        <SendIconSVG viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </SendIconSVG>
        </SendButton>
    </ChatInputContainer>
    
    {/* 장소 상세 정보 모달 */}
    <SelectionModal 
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        selectedTravelItem={selectedTravelItem}
        onSelect={handleAddSelectedPlace}
    />
    </ChatPanelContainer>
);
};

// 추천 카드 관련 스타일
const RecommendationCards = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
`;

const RecommendationCard = styled.div`
    display: flex;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.2s;
    background-color: white;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
`;

const CardImage = styled.img`
    width: 70px;
    height: 70px;
    padding: 5px;
    border-radius: 12px;
    object-fit: cover;
`;

const CardContent = styled.div`
    padding: 10px;
    flex: 1;
`;

const CardTitle = styled.h4`
    margin: 0 0 5px 0;
    font-size: 14px;
    font-weight: 600;
`;

const CardLocation = styled.p`
    margin: 0;
    font-size: 12px;
    color: #666;
`;

// 버튼 컨테이너
const ActionButtonsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 10px;
`;

const ActionButton = styled.button`
    padding: 8px 12px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: #2980b9;
    }
`;

// 스타일 컴포넌트
const ChatPanelContainer = styled.div<{ isOpen: boolean }>`
    width: ${props => props.isOpen ? '400px' : '60px'};
    height: calc(100vh - 60px); /* 네비게이션 바 높이 고려 */
    background-color: white;
    border-left: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    overflow: hidden;
    position: relative;
`;

const ChatHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 24px;
    border-bottom: 1px solid #e2e8f0;
    background-color: #f8fafc;
`;

const ChatTitle = styled.h3`
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
`;

const AIAvatar = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background-color: white;
    color: #3498db;
    border-radius: 50%;
    font-size: 16px;
    font-weight: 700;
    margin-right: 14px;
    border: 2px solid #3498db;
`;

const MessagesContainer = styled.div`
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const MessageBubble = styled.div<{ isUser: boolean; isLoading?: boolean }>`
    max-width: 85%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
    align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
    background-color: ${props => props.isUser ? '#3b82f6' : '#f1f5f9'};
    color: ${props => {
        if (props.isUser) return 'white';
        if (props.isLoading) return '#757575';
        return '#1e293b';
    }};
    opacity: ${props => props.isLoading && !props.isUser ? 0.85 : 1};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    
    ${props => props.isUser ? 
        'border-bottom-right-radius: 4px;' : 
        'border-bottom-left-radius: 4px;'
    }

    // AI 메시지 내부의 마크다운 렌더링 요소 스타일 조정
    ${props => !props.isUser && `
        p, ul, ol {
            margin-top: 0;
            margin-bottom: 0;
        }
        // 연속되는 블록 요소들 사이에 일관된 간격 추가
        p:not(:last-child),
        ul:not(:last-child),
        ol:not(:last-child) {
            // margin-bottom: 0px;
        }
        // 목록 들여쓰기 유지
        ul, ol {
            padding-left: 20px; // 일반적인 목록 들여쓰기, 필요시 조정
            margin-top: 10px;
            margin-bottom: 20px;
        }
        // li 요소 자체의 마진이 문제라면 추가 조정 가능
        li {
            margin-top: 10px;
            margin-bottom: 10px; 
        }
    `}
`;

const ChatInputContainer = styled.div`
    display: flex;
    padding: 16px 20px;
    border-top: 1px solid #e2e8f0;
    background-color: #f8fafc;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
`;

const ChatInput = styled.textarea`
    flex: 1;
    padding: 14px 20px;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    font-size: 15px;
    resize: none;
    height: 50px;
    transition: all 0.2s ease;
    font-family: inherit;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    
    &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
        height: 70px;
    }
    
    &::placeholder {
        color: #94a3b8;
    }
`;

const SendButton = styled.button`
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
    align-self: flex-end;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
    
    &:hover {
        background-color: #2980b9;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const SendIconSVG = styled.svg`
    width: 20px;
    height: 20px;
    transform: rotate(-45deg);
`;

export default AISidebar;