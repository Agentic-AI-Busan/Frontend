import React from 'react';
import styled, { keyframes } from 'styled-components';

// 애니메이션 keyframe 정의
const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

// 삭제 애니메이션 추가
const collapseItem = keyframes`
    0% {
        max-height: 60px;
        opacity: 1;
        transform: translateX(0);
    }
    50% {
        max-height: 60px;
        opacity: 0.5;
        transform: translateX(-10px);
    }
    100% {
        max-height: 0;
        opacity: 0;
        transform: translateX(-20px);
        padding: 0;
        margin: 0;
        border: none;
    }
`;

// 사이드바 타이틀 스타일 컴포넌트
const SidebarTitle = styled.strong<{ isComplete?: boolean }>`
    display: block;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    padding: 15px 0;
    margin-bottom: 10px;
    color: ${props => props.isComplete ? '#5a5a5a' : '#2c3e50'};
    letter-spacing: 0.5px;
    border-bottom: 2px solid ${props => props.isComplete ? '#d8d8d8' : '#3498db'};
`;

// 사이드바 여행지 목록 스타일 컴포넌트 - 스크롤바 숨김
const SelectedItemsList = styled.div`
    flex: 1;
    overflow-y: auto;
    margin-bottom: 80px;
    padding-right: 5px;
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
        display: none;
    }
`;

// 선택된 여행지 사이드바 스타일 컴포넌트
const SidebarContainer = styled.div<{ isComplete?: boolean }>`
    width: 350px;
    height: calc(100vh - 150px);
    background: ${props => props.isComplete ? '#f5f5f5' : '#ffffff'};
    border-radius: 16px;
    box-shadow: ${props => props.isComplete 
        ? '0 10px 30px rgba(0, 0, 0, 0.08)' 
        : '0 10px 30px rgba(0, 0, 0, 0.05)'};
    padding: 20px;
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all 0.4s ease;
    border: 1px solid ${props => props.isComplete ? '#e0e0e0' : 'rgba(0, 0, 0, 0.08)'};
    
    &:hover {
        box-shadow: ${props => props.isComplete 
            ? '0 15px 35px rgba(0, 0, 0, 0.1)' 
            : '0 15px 35px rgba(0, 0, 0, 0.08)'};
    }
    
    @media (max-width: 992px) {
        width: 100%;
        height: auto;
        min-height: 350px;
    }
`;

// 사이드바 여행지 아이템 스타일 컴포넌트
const SelectedItem = styled.div<{ isDeleting?: boolean; isComplete?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    margin: 10px 0;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.isComplete ? '#666' : '#2c3e50'};
    background: ${props => props.isComplete ? '#f8f8f8' : '#ffffff'};
    border: 1px solid ${props => props.isComplete ? '#e0e0e0' : '#f0f0f0'};
    opacity: ${props => props.isComplete ? 0.8 : 1};
    animation: ${props => props.isDeleting ? collapseItem : fadeIn} 0.4s ease-out forwards;
    transform-origin: top;
    max-height: ${props => props.isDeleting ? '0' : '60px'};
    transition: ${props => props.isDeleting ? 'none' : 'all 0.3s ease'};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    
    &:hover {
        background: ${props => props.isComplete ? '#f8f8f8' : '#fafafa'};
        border-color: ${props => props.isComplete ? '#e0e0e0' : '#e8e8e8'};
    }
`;

// 사이드바 여행지 아이템 삭제 버튼 스타일 컴포넌트
const DeleteButton = styled.a<{ isComplete?: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    background: ${props => props.isComplete ? '#e0e0e0' : 'white'};
    color: ${props => props.isComplete ? '#999' : '#e74c3c'};
    border: 1px solid ${props => props.isComplete ? '#ccc' : '#e74c3c'};
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;
    opacity: ${props => props.isComplete ? 0.6 : 1};
    pointer-events: ${props => props.isComplete ? 'none' : 'auto'};
    
    &:hover {
        background: ${props => props.isComplete ? '#e0e0e0' : '#e74c3c'};
        color: ${props => props.isComplete ? '#999' : 'white'};
    }
`;

// 추가 + 버튼 스타일 컴포넌트
const AddPlaceButton = styled.button<{ isComplete?: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 14px 0;
    margin-top: 15px;
    background: ${props => props.isComplete ? '#e0e0e0' : 'rgba(52, 152, 219, 0.1)'};
    color: ${props => props.isComplete ? '#999' : '#3498db'};
    border: 2px dashed ${props => props.isComplete ? '#ccc' : '#3498db'};
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    cursor: ${props => props.isComplete ? 'not-allowed' : 'pointer'};
    transition: all 0.3s;
    opacity: ${props => props.isComplete ? 0.6 : 1};
    pointer-events: ${props => props.isComplete ? 'none' : 'auto'};
    
    &:hover {
        background: ${props => props.isComplete ? '#e0e0e0' : 'rgba(52, 152, 219, 0.2)'};
        transform: translateY(-2px);
    }
`;

// 완료 버튼 스타일 컴포넌트
const CompleteButton = styled.button<{ isComplete?: boolean }>`
    display: block;
    width: calc(100% - 50px);
    padding: 15px;
    background: ${props => props.isComplete ? '#888' : '#3498db'};
    color: #fff;
    border: none;
    border-radius: 30px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    cursor: ${props => props.isComplete ? 'default' : 'pointer'};
    transition: all 0.3s;
    position: absolute;
    left: 25px;
    align-self: center;
    bottom: 25px;
    box-shadow: ${props => props.isComplete 
        ? '0 4px 10px rgba(0, 0, 0, 0.1)' 
        : '0 6px 15px rgba(52, 152, 219, 0.2)'};
    
    &:hover {
        background: ${props => props.isComplete ? '#888' : '#2980b9'};
        box-shadow: ${props => props.isComplete 
            ? '0 4px 10px rgba(0, 0, 0, 0.1)' 
            : '0 8px 20px rgba(52, 152, 219, 0.3)'};
    }
    
    &:disabled {
        background: #ccc;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        cursor: not-allowed;
    }
`;

// 다시 선택하기 버튼 스타일 컴포넌트
const ResetButton = styled.button`
    display: block;
    width: calc(100% - 50px);
    padding: 12px 20px;
    background: #e74c3c;
    color: #fff;
    border: none;
    border-radius: 30px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.3s;
    position: absolute;
    left: 25px;
    top: 50%;
    transform: translateY(-50%);
    box-shadow: 0 6px 15px rgba(231, 76, 60, 0.2);
    
    &:hover {
        background: #c0392b;
        box-shadow: 0 8px 20px rgba(231, 76, 60, 0.3);
        transform: translateY(calc(-50% - 2px));
    }
`;

interface PlaceItem {
    id: number;
    title: string;
}

interface SelectionSidebarProps {
    type: 'travel' | 'restaurant';
    title: string;
    items: PlaceItem[];
    isComplete: boolean;
    deletingItemId: number | null;
    onDelete: (id: number) => void;
    onShowSearch: () => void;
    onComplete: () => void;
    onReset: () => void;
    showAddButton?: boolean;
    buttonText: string;
}

const SelectionSidebar: React.FC<SelectionSidebarProps> = ({
    type,
    title,
    items,
    isComplete,
    deletingItemId,
    onDelete,
    onShowSearch,
    onComplete,
    onReset,
    showAddButton,
    buttonText
}) => {
    const addButtonText = type === 'travel' ? '+ 여행지 추가하기' : '+ 음식점 추가하기';

    return (
        <SidebarContainer isComplete={isComplete} className={`${type}_spot`}>
            <SidebarTitle isComplete={isComplete}>
                {title}
            </SidebarTitle>

            <SelectedItemsList>
                {items.map(item => (
                    <SelectedItem 
                        key={`${type}-${item.id}`} 
                        isDeleting={deletingItemId === item.id}
                        isComplete={isComplete}
                    >
                        <span>{item.title}</span>
                        <DeleteButton 
                            href="#" 
                            onClick={(e) => {
                                e.preventDefault();
                                onDelete(item.id);
                            }}
                            isComplete={isComplete}
                        >
                            삭제
                        </DeleteButton>
                    </SelectedItem>
                ))}
                {showAddButton !== false && (
                    <AddPlaceButton 
                        isComplete={isComplete}
                        onClick={onShowSearch}
                        disabled={isComplete}
                    >
                        {addButtonText}
                    </AddPlaceButton>
                )}
            </SelectedItemsList>

            {!isComplete ? (
                <CompleteButton 
                    onClick={onComplete}
                    disabled={items.length === 0}
                    isComplete={isComplete}
                >
                    {buttonText}
                </CompleteButton>
            ) : (
                <ResetButton onClick={onReset}>
                    다시 선택하기
                </ResetButton>
            )}
        </SidebarContainer>
    );
};

export default SelectionSidebar; 