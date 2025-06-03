import React from 'react';
import styled from 'styled-components';

interface TitleInputModalProps {
    isOpen: boolean;
    title?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onConfirm: () => void;
    onClose: () => void;
    error?: string;
}

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.3);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ModalBox = styled.div`
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    padding: 32px 28px 24px 28px;
    min-width: 340px;
    max-width: 90vw;
    display: flex;
    flex-direction: column;
    align-items: stretch;
`;

const ModalTitle = styled.h3`
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 18px;
    color: #222;
    text-align: center;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid #e1e1e1;
    border-radius: 8px;
    font-size: 16px;
    margin-bottom: 16px;
    box-sizing: border-box;
    &:focus {
        border-color: #3498db;
        outline: none;
    }
`;

const ErrorText = styled.div`
    color: #e74c3c;
    font-size: 14px;
    margin-bottom: 10px;
    text-align: center;
`;

const ButtonRow = styled.div`
    display: flex;
    gap: 12px;
    justify-content: center;
`;

const ModalButton = styled.button`
    padding: 10px 22px;
    border-radius: 8px;
    border: none;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    background: #3498db;
    color: #fff;
    transition: background 0.2s;
    &:hover {
        background: #2980b9;
    }
    &:first-child {
        background: #f1f5f9;
        color: #333;
        border: 1px solid #e1e1e1;
        &:hover {
            background: #e2e8f0;
        }
    }
`;

const TitleInputModal: React.FC<TitleInputModalProps> = ({
    isOpen, title = '일정 제목 입력', value, onChange, onConfirm, onClose, error
}) => {
    if (!isOpen) return null;
    return (
        <ModalOverlay>
            <ModalBox>
                <ModalTitle>{title}</ModalTitle>
                <Input
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder="일정 제목을 입력하세요"
                    maxLength={30}
                    autoFocus
                />
                {error && <ErrorText>{error}</ErrorText>}
                <ButtonRow>
                    <ModalButton type="button" onClick={onClose}>취소</ModalButton>
                    <ModalButton type="button" onClick={onConfirm}>확인</ModalButton>
                </ButtonRow>
            </ModalBox>
        </ModalOverlay>
    );
};

export default TitleInputModal; 