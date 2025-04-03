import React from 'react';
import styled from 'styled-components';

interface ModalFrameProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    size?: 'small' | 'medium' | 'large';
}

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div<{ size?:'small' | 'medium' | 'large' }>`
    background-color: white;
    // padding: 2rem;
    border-radius: 8px;
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
    overflow: visible;
    
    ${props => {
        switch (props.size) {
            case 'small':
                return `
                    width: 300px;
                    max-width: 90%;
                `;
            case 'medium':
                return `
                    width: 450px;
                    max-width: 90%;
                `;
            case 'large':
                return `
                    width: 800px;
                    max-width: 90%;
                `;
        }
    }}
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    text-align: center;
`;



const ModalFrame: React.FC<ModalFrameProps> = ({
    isOpen,
    onClose,
    children,
    title,
    size = 'large'
}) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent size={size} onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    {title && <ModalTitle>{title}</ModalTitle>}
                </ModalHeader>
                {children}
            </ModalContent>
        </ModalOverlay>
    );
};

export default ModalFrame;
