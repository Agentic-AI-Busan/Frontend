import React, { useState } from 'react';
import styled from 'styled-components';
import SelectionModal from '../../components/Modal/SelectionModal';
import SelectionSidebar from '../../components/SelectionSidebar';

// 페이지 레이아웃 컴포넌트를 중앙 정렬로 수정
const ContentWrapper = styled.div`
    width: 1500px;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: auto;
    padding: 1rem 0;
    
    @media (max-width: 1440px) {
        width: 70%;
    }
`;

// 상단 헤더 컴포넌트
const PageHeader = styled.div`
    width: 100%;
    padding: 20px 30px;
    text-align: center;
    position: relative;
    background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    
    &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 120px;
        height: 3px;
        background: linear-gradient(90deg, #0066cc, #00a3ff);
        border-radius: 2px;
    }
`;

const HeaderTitle = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0 0 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: -0.5px;
    
    strong {
        color: #0066cc;
        font-weight: 700;
        margin-right: 8px;
        position: relative;
        padding-bottom: 3px;
        
        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, #0066cc, #00a3ff);
            border-radius: 2px;
        }
    }
`;

const HeaderSubtitle = styled.p`
    font-size: 14px;
    color: #666;
    margin: 0;
    font-weight: 400;
    opacity: 0.8;
    letter-spacing: -0.3px;
`;

// 여행 목록 섹션 스타일 컴포넌트
const TravelSection = styled.div`
    display: flex;
    gap: 30px;
    width: 100%;
    padding: 15px 0;
    
    @media (max-width: 992px) {
        flex-direction: column;
    }
`;

// 메인 리스트 컨테이너 컴포넌트
const TravelListContainer = styled.div`
    flex: 1;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-width: 70%;
    transition: all 0.3s ease;
    
    &:hover {
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    }
`;

const TravelGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 20px;
    margin: 0;
    overflow-y: auto;
    height: 610px;
    
    @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
    
    /* 스크롤바 스타일링 */
    &::-webkit-scrollbar {
        width: 8px;
        background: transparent;
        transition: all 0.3s ease;
    }
    
    &::-webkit-scrollbar-track {
        background: transparent;
        transition: all 0.3s ease;
    }
    
    &::-webkit-scrollbar-thumb {
        background: transparent;
        border-radius: 4px;
        transition: all 0.3s ease;
    }
    
    &:hover::-webkit-scrollbar-thumb {
        background: #ccc;
    }
    
    &:hover::-webkit-scrollbar-thumb:hover {
        background: #aaa;
    }
`;

// 여행 카드 컴포넌트
const TravelCard = styled.div`
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    height: 295px;
    background: #fff;
    display: flex;
    flex-direction: column;
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 20px rgba(0, 0, 0, 0.25);
        cursor: pointer;
        
        img {
            transform: scale(1.05);
        }
    }
`;

const TravelCardImage = styled.div`
    display: block;
    height: 180px;
    overflow: hidden;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 30px;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent);
    }
    
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
    }
`;

const TravelCardContent = styled.div`
    padding: 15px 16px 0;
    flex-grow: 1;
    
    strong {
        display: block;
        font-size: 18px;
        color: #333;
        margin: 0 0 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    div {
        display: block;
        font-size: 14px;
        color: #666;
        margin: 0 0 8px;
        line-height: 1.4;
        max-height: 40px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
`;

const CardButtonWrapper = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: 10px 13px 15px;
    position: relative;
    margin-top: auto;
`;

const SelectButton = styled.button`
    display: inline-block;
    padding: 8px 18px;
    background: #f0f0f0;
    color: #333;
    border-radius: 20px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-right: 5px;
    
    &:hover {
        background: #0066cc;
        color: white;
        box-shadow: 0 4px 8px rgba(0, 102, 204, 0.3);
    }
    
    &:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 102, 204, 0.3);
    }
`;

interface TravelItem {
    id: number;
    image: string;
    title: string;
    description: string;
}

interface SelectedItem {
    id: number;
    title: string;
}

interface SelectMainProps {
    items: TravelItem[];
    selectedItems: SelectedItem[];
    onSelectItem: (id: number) => void;
    onRemoveItem: (id: number) => void;
    onSave: () => void;
    headerTitle: string;
    sidebarTitle: string;
    userName: string;
    buttonText: string;
}

const SelectMain: React.FC<SelectMainProps> = ({
    items,
    selectedItems,
    onSelectItem,
    onRemoveItem,
    onSave,
    headerTitle,
    sidebarTitle,
    userName,
    buttonText
}) => {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedTravelItem, setSelectedTravelItem] = useState<TravelItem | null>(null);

    // 삭제 버튼 클릭 시 실행되는 함수
    const handleDelete = (id: number, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setDeletingId(id);
        setTimeout(() => {
            onRemoveItem(id);
            setDeletingId(null);
        }, 500);
    };

    // 저장 버튼 클릭 시 실행되는 함수
    const handleSave = () => {
        onSave();
    };

    // 여행 카드 클릭 시 실행되는 함수
    const handleCardClick = (item: TravelItem) => {
        setSelectedTravelItem(item);
        setIsModalOpen(true);
    };

    // 모달 닫기 함수
    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedTravelItem(null);
    };

    // 모달 선택 함수
    const handleModalSelect = () => {
        if (selectedTravelItem) {
            onSelectItem(selectedTravelItem.id);
            handleModalClose();
        }
    };

    const handleSelectButtonClick = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectItem(id);
    };

    return (
        <ContentWrapper>
            <TravelSection>
                <TravelListContainer>
                    <PageHeader>
                        <HeaderTitle>
                            <strong>{userName}</strong> {headerTitle}
                        </HeaderTitle>
                        <HeaderSubtitle>원하시는 {headerTitle.includes('여행지') ? '여행지' : '음식점'}를 선택해 주세요</HeaderSubtitle>
                    </PageHeader>
                    
                    <TravelGrid>
                        {items.map((item) => (
                            <TravelCard 
                                key={item.id} 
                                onClick={() => handleCardClick(item)}
                                role="button"
                                aria-label={`여행지: ${item.title}`}
                            >
                                <TravelCardImage>
                                    <img 
                                        src={item.image} 
                                        alt={`${item.title} 이미지`} 
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'https://via.placeholder.com/300x180?text=이미지+없음';
                                        }} 
                                    />
                                </TravelCardImage>

                                <TravelCardContent>
                                    <strong>{item.title}</strong>
                                    <div>{item.description}</div>
                                </TravelCardContent>

                                <CardButtonWrapper>
                                    <SelectButton 
                                        onClick={(e) => handleSelectButtonClick(item.id, e)}
                                        aria-label={`${item.title} 선택하기`}
                                    >
                                        선택
                                    </SelectButton>
                                </CardButtonWrapper>
                            </TravelCard>
                        ))}
                    </TravelGrid>
                </TravelListContainer>

                <SelectionSidebar 
                    type="travel"
                    title={sidebarTitle}
                    items={selectedItems}
                    isComplete={false}
                    deletingItemId={deletingId}
                    onDelete={handleDelete}
                    onShowSearch={() => {}}
                    onComplete={handleSave}
                    onReset={() => {}}
                    showAddButton={false}
                    buttonText={buttonText}
                />
            </TravelSection>

            {selectedTravelItem && (
                <SelectionModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    selectedTravelItem={selectedTravelItem}
                    onSelect={handleModalSelect}
                />
            )}
        </ContentWrapper>
    );
};

export default SelectMain;
