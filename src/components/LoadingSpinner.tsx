import React from 'react';
import styled, { keyframes } from 'styled-components';

// 스피너 애니메이션 정의
const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

// 스피너가 나타나는 애니메이션
const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

// 스피너 컨테이너 스타일
const SpinnerContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 2000;
    animation: ${fadeIn} 0.3s ease-in-out;
`;

// 스피너 스타일
const Spinner = styled.div`
    width: 52px;
    height: 52px;
    border: 5px solid #d1d1d1;
    border-top: 5px solid #0066cc;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
    margin-bottom: 40px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

// 로딩 메시지 스타일
const LoadingMessage = styled.div`
    font-size: 20px;
    font-weight: 500;
    color: #333;
    text-align: center;
    max-width: 500px;
    word-break: keep-all;
    white-space: pre-line;
    margin-bottom: 40px;
`;

interface LoadingSpinnerProps {
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    message = '로딩 중입니다. 잠시만 기다려주세요.' 
}) => {
    return (
        <SpinnerContainer>
            <Spinner />
            <LoadingMessage>{message}</LoadingMessage>
        </SpinnerContainer>
    );
};

export default LoadingSpinner; 