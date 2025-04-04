import React from 'react';
import styled from 'styled-components';
import ModalFrame from './ModalFrame';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    itemName?: string;
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

const DeleteButton = styled(Button)`
    background-color: #e74c3c;
    color: white;
    
    &:hover {
        background-color: #c0392b;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const Content = styled.div`
    text-align: center;
    padding: 10px 0;
`;

const WarningText = styled.p`
    font-size: 16px;
    color: #444;
    margin: 8px 0;
    
    &:last-child {
        font-size: 14px;
        color: #888;
        margin-top: 5px;
    }
`;

const DeleteModal: React.FC<DeleteModalProps> = ({
    isOpen,
    onClose,
    onDelete,
    itemName = '항목'
}) => {
    return (
        <ModalFrame 
            isOpen={isOpen}
            onClose={onClose}
            title="삭제 확인"
            size="small"
        >
            <Content>
                <WarningText>{itemName}을(를) 삭제하시겠습니까?</WarningText>
                <WarningText>이 작업은 되돌릴 수 없습니다.</WarningText>
            </Content>
            <ButtonContainer>
                <CancelButton onClick={onClose}>취소</CancelButton>
                <DeleteButton onClick={onDelete}>삭제</DeleteButton>
            </ButtonContainer>
        </ModalFrame>
    );
};

export default DeleteModal;
