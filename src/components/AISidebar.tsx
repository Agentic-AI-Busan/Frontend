import React, { useState } from 'react';
import styled from 'styled-components';

interface Message {
    id: number;
    text: string;
    isUser: boolean;
}

interface AISidebarProps {
    isOpen: boolean;
}

const AISidebar: React.FC<AISidebarProps> = ({ isOpen }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "안녕하세요! 부산 여행 계획을 도와드릴게요. 어떤 점이 궁금하신가요?", isUser: false },
    ]);
    const [newMessage, setNewMessage] = useState('');

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
        const aiResponse: Message = {
            id: Date.now() + 1,
            text: "메모에 '해운대 해수욕장은 일몰 시간에 방문하면 아름다운 풍경을 볼 수 있어요. 인근 맛집도 많으니 저녁 식사 계획을 세워보세요.'라고 추가해보시겠어요?",
            isUser: false
        };
        setMessages(prev => [...prev, aiResponse]);
    }, 1000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
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
            {messages.map(message => (
            <MessageBubble key={message.id} isUser={message.isUser}>
                {message.text}
            </MessageBubble>
            ))}
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
        </ChatPanelContainer>
    );
};

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
