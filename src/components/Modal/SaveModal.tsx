import React from 'react';
import styled from 'styled-components';
import ModalFrame from './ModalFrame';

interface SaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    title?: string;
}

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 50px;
    padding: 25px;
`;

const Button = styled.button`
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    font-size: 15px;
`;

const CancelButton = styled(Button)`
    background-color: #f5f5f5;
    color: #555;
    
    &:hover {
        background-color: #e8e8e8;
        transform: translateY(-2px);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const SaveButton = styled(Button)`
    background-color: #3498db;
    color: white;
    
    &:hover {
        background-color: #2980b9;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const Content = styled.div`
    text-align: center;
    padding: 10px 0;
`;

const MessageText = styled.p`
    font-size: 16px;
    color: #444;
    margin: 15px 0;
`;

const SaveModal: React.FC<SaveModalProps> = ({
    isOpen,
    onClose,
    onSave,
    title = '저장 확인'
}) => {
    return (
        <ModalFrame 
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="small"
        >
            <Content>
                <MessageText>변경사항을 저장하시겠습니까?</MessageText>
            </Content>
            <ButtonContainer>
                <CancelButton onClick={onClose}>취소</CancelButton>
                <SaveButton onClick={onSave}>저장</SaveButton>
            </ButtonContainer>
        </ModalFrame>
    );
};

export default SaveModal;
