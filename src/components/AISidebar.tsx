import React, { useState } from 'react';
import styled from 'styled-components';
import SelectionModal from './Modal/SelectionModal';
import img_3 from '../assets/images/travel_img3.jpg'

interface Message {
    id: number;
    text: string;
    isUser: boolean;
}

// Place 인터페이스 추가
interface Place {
    id: number;
    name: string;
    address: string;
    imageUrl?: string;
    coordinates?: { lat: number; lng: number };
}

// 추천 장소를 위한 TravelItem 인터페이스
interface TravelItem {
    id: number;
    image: string;
    title: string;
    description: string;
    location?: string;
    coordinates?: { lat: number; lng: number };
    operatingHours?: string;
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
    const [selectedTravelItem, setSelectedTravelItem] = useState<TravelItem | null>(null);
    
    // 테스트용 추천 장소 데이터
    const recommendedPlaces: TravelItem[] = [
        {
            id: 1,
            image: 'https://via.placeholder.com/400x200',
            title: '해동용궁사',
            description: '부산의 대표적인 해안 사참로, 아름다운 바다 풍경을 감상할 수 있어요. 동해 바다가 내려다보이는 절벽 위에 자리 잡고 있어 경치가 장관입니다.',
            location: '부산광역시 기장군 기장읍 용궁길 86',
            coordinates: { lat: 35.188904, lng: 129.224002 },
            operatingHours: '04:00 - 19:00 (3월~10월), 04:30 - 18:00 (11월~2월)'
        },
        {
            id: 2,
            image: 'https://via.placeholder.com/400x200',
            title: '청사포 다릿돌 전망대',
            description: '해운대 해수욕장에서 멀지 않은 곳에 위치한 전망대로, 아름다운 해안선과 일출을 감상할 수 있는 장소입니다.',
            location: '부산광역시 해운대구 청사포로 116',
            coordinates: { lat: 35.159111, lng: 129.195889 },
            operatingHours: '항상 개방'
        },
        {
            id: 3,
            image: 'https://via.placeholder.com/400x200',
            title: '태종대',
            description: '부산 영도구 끝자락에 위치한 해안 절벽 공원으로, 울창한 숲과 바다가 어우러진 아름다운 경치를 자랑합니다.',
            location: '부산광역시 영도구 전망로 24',
            coordinates: { lat: 35.051417, lng: 129.085472 },
            operatingHours: '04:00 - 24:00'
        }
    ];

// 메시지 보내기 함수
const sendMessage = () => {
    if (newMessage.trim() === '') return;
    
    // 사용자 메시지 추가
    const userMessage: Message = {
        id: Date.now(),
        text: newMessage,
        isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // AI 응답 추가 (실제로는 API 호출이 필요합니다)
    setTimeout(() => {
        // 특정 키워드가 있으면 추천 기능 제공
        if (newMessage.includes('추천') || newMessage.includes('가볼만한 곳')) {
            showRecommendations();
        } else {
            const aiResponse: Message = {
                id: Date.now() + 1,
                text: "메모에 '해운대 해수욕장은 일몰 시간에 방문하면 아름다운 풍경을 볼 수 있어요. 인근 맛집도 많으니 저녁 식사 계획을 세워보세요.'라고 추가해보시겠어요?",
                isUser: false
            };
            setMessages(prev => [...prev, aiResponse]);
        }
    }, 800);
};

const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};

// 장소 추천 메시지 표시
const showRecommendations = () => {
    const recommendMessage: Message = {
        id: Date.now(),
        text: '부산에서 꼭 가봐야 할 장소를 추천해 드릴게요:',
        isUser: false
    };
    
    setMessages(prev => [...prev, recommendMessage]);
    
    // 카드형 추천 메시지 표시
    setTimeout(() => {
        const cardMessage: Message = {
            id: Date.now() + 1,
            text: '<recommendation-cards>',
            isUser: false
        };
        setMessages(prev => [...prev, cardMessage]);
    }, 500);
};

// 추천 장소 선택 처리 함수
const handleSelectRecommendation = (item: TravelItem) => {
    setSelectedTravelItem(item);
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
            text: `<add-place id=${selectedTravelItem.id}>`,
            isUser: false
        };
        setMessages(prev => [...prev, buttonMessage]);
    }, 500);
};

// 장소 추가 실행 함수
const executeAddPlace = (placeId: number, day?: number) => {
    // 선택한 장소 찾기
    const selectedPlace = recommendedPlaces.find(place => place.id === placeId);
    if (!selectedPlace || !addRecommendedPlace) return;
    
    // AISidebar Place 형식으로 변환
    const placeToAdd: Place = {
        id: selectedPlace.id,
        name: selectedPlace.title,
        address: selectedPlace.location || '',
        imageUrl: selectedPlace.image,
        coordinates: selectedPlace.coordinates
    };
    
    // 장소 추가
    const result = addRecommendedPlace(placeToAdd, day);
    
    // 결과 메시지 추가
    const resultMessage: Message = {
        id: Date.now(),
        text: result 
            ? `${day ? day + '일차' : '적절한 일차'}에 ${selectedPlace.title}가 추가되었습니다.` 
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
                            <CardImage src={img_3} alt={place.title} />
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
    
    // 일반 메시지
    return (
        <MessageBubble key={message.id} isUser={message.isUser}>
            {message.text}
        </MessageBubble>
    );
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

const MessageBubble = styled.div<{ isUser: boolean }>`
    max-width: 85%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
    align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
    background-color: ${props => props.isUser ? '#3b82f6' : '#f1f5f9'};
    color: ${props => props.isUser ? 'white' : '#1e293b'};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    
    ${props => props.isUser ? 
        'border-bottom-right-radius: 4px;' : 
        'border-bottom-left-radius: 4px;'
    }
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
