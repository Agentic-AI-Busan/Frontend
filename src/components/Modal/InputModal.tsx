import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import ModalFrame from './ModalFrame';

interface InputModalProps {
    isOpen: boolean;
    onClose: () => void;
    label: string;
    onChange: (value: string) => void;
}

const ModalContent = styled.div`
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const ModalTitle = styled.h3`
    font-size: 1rem;
    color: #333;
    margin: 0;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.6rem 0.8rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: #3498db;
    }

    &.error {
        border-color: #e74c3c;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.25rem;
`;

const Button = styled.button`
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s ease;

    &.cancel {
        background-color: #fff;
        color: #666;
        border: 1px solid #e0e0e0;
        
        &:hover {
            background-color: #f5f5f5;
        }
    }

    &.confirm {
        background-color: #3498db;
        color: white;
        
        &:hover {
            background-color: #2980b9;
        }

        &:disabled {
            background-color: #a8d8f7;
            cursor: not-allowed;
        }
    }
`;

const InputModal: React.FC<InputModalProps> = ({ isOpen, onClose, label, onChange }) => {
    const [inputValue, setInputValue] = useState('');
    const [hasError, setHasError] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // 모달이 닫힐 때 상태 초기화
    useEffect(() => {
        if (!isOpen) {
            setInputValue('');
            setHasError(false);
            setIsValid(false);
        } else {
            // 모달이 열릴 때 자동 포커스
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const validatePhoneNumber = (value: string): boolean => {
        const phoneRegex = /^[0-9]{3}-[0-9]{4}-[0-9]{4}$/;
        return phoneRegex.test(value);
    };

    const formatPhoneNumber = (value: string): string => {
        const numbers = value.replace(/[^0-9]/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        if (label === "전화번호") {
            // 숫자와 하이픈만 입력 가능
            if (!/^[0-9-]*$/.test(value)) return;
            
            // 전화번호 형식으로 변환
            value = formatPhoneNumber(value);
            
            // 유효성 검사
            const isValidInput = value.length === 0 || validatePhoneNumber(value);
            setHasError(!isValidInput);
            setIsValid(validatePhoneNumber(value));
        } else {
            // 닉네임 유효성 검사
            setHasError(value.trim().length === 0);
            setIsValid(value.trim().length > 0);
        }
        
        setInputValue(value);
    };

    const handleConfirm = () => {
        if (!isValid) return;
        
        onChange(inputValue);
        setInputValue('');
        setHasError(false);
        setIsValid(false);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && isValid) {
            handleConfirm();
        }
    };

    return (
        <ModalFrame
            isOpen={isOpen}
            onClose={onClose}
            title=""
            size="small"
        >
            <ModalContent>
                <ModalTitle>{label} 변경
                </ModalTitle>
                <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={`변경할 ${label}을(를) 입력해주세요.`}
                    className={hasError ? 'error' : ''}
                    maxLength={label === "전화번호" ? 13 : undefined}
                />
                <ButtonGroup>
                    <Button className="cancel" onClick={onClose}>취소</Button>
                    <Button 
                        className="confirm" 
                        onClick={handleConfirm}
                        disabled={!isValid}
                    >
                        확인
                    </Button>
                </ButtonGroup>
            </ModalContent>
        </ModalFrame>
    );
};

export default InputModal; 