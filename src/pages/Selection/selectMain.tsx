import React, { useState } from 'react';
import styled from 'styled-components';
import SelectionModal from '../../components/Modal/SelectionModal';
import SelectionSidebar from '../../components/SelectionSidebar';

// 페이지 레이아웃 컴포넌트를 중앙 정렬로 수정
const ContentWrapper = styled.div`
    width: 100%;
    max-width: 1450px;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: calc(100vh - 60px);
    padding: 1rem;
    box-sizing: border-box;
    
    @media (max-width: 1440px) {
        max-width: 90%;
    }
`;

// 상단 헤더 컴포넌트
const PageHeader = styled.div`
    width: 100%;
    padding: 20px 0;
    text-align: center;
    position: relative;
    margin-bottom: 20px;
    
    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(0, 102, 204, 0.5), transparent);
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
    gap: 20px;
    width: 100%;
    padding: 0;
    flex: 1;
    
    @media (max-width: 992px) {
        flex-direction: column;
        gap: 15px;
    }
`;

// 메인 리스트 컨테이너 컴포넌트
const TravelListContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 70%;
    height: 100%;
    overflow: hidden;
`;

const TravelGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 25px;
    padding: 10px 10px 10px 10px;
    margin: 0;
    overflow-y: auto;
    height: calc(100vh - 250px);
    
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
    }
    
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }
    
    &:hover::-webkit-scrollbar-thumb {
        background: #aaa;
    }
`;

// 여행 카드 컴포넌트
const TravelCard = styled.div`
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #eaeaea;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    height: 295px;
    background: #fff;
    display: flex;
    flex-direction: column;
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        border-color: #d9e8f6;
        
        img {
            transform: scale(1.07);
        }
    }
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #3498db, #4dabf7);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    &:hover::before {
        opacity: 1;
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
        height: 40px;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.25), transparent);
        z-index: 1;
    }
    
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
`;

const TravelCardContent = styled.div`
    padding: 16px 18px 0;
    flex-grow: 1;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 18px;
        right: 18px;
        height: 1px;
        background: linear-gradient(90deg, transparent, #f0f0f0, transparent);
        opacity: 0.6;
    }
    
    strong {
        display: block;
        font-size: 18px;
        color: #1a3b5d;
        margin: 0 0 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 600;
        letter-spacing: -0.3px;
        position: relative;
        padding-left: 12px;
        padding-bottom: 0;
        
        &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 3px;
            height: 100%;
            background: #3498db;
            border-radius: 1px;
            opacity: 0.85;
        }
    }

    div {
        display: block;
        font-size: 14.5px;
        color: #4b5563;
        margin: 0 0 8px;
        line-height: 1.5;
        max-height: 44px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        word-break: keep-all;
        text-overflow: ellipsis;
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    background: #f0f0f0;
    color: #333;
    border: 1px solid #dddddd;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
        background: #3498db;
        color: #fff;
        border-color: #3498db;
        box-shadow: 0 6px 12px rgba(52, 152, 219, 0.3);
    }
`;

interface TravelItem {
    attractionId?: number;
    restaurantId?: number;
    imageUrl: string;
    name: string;
    title: string;
    address?: string;
    latitude?: number;
    longitude?: number;
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
            const itemId = selectedTravelItem.attractionId || selectedTravelItem.restaurantId;
            if (itemId !== undefined) {
                onSelectItem(itemId);
                handleModalClose();
            }
        }
    };

    const handleSelectButtonClick = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectItem(id);
    };

    // 아이템 ID를 가져오는 함수
    const getItemId = (item: TravelItem): number => {
        if (item.attractionId !== undefined) return item.attractionId;
        if (item.restaurantId !== undefined) return item.restaurantId;
        return 0; // 기본값
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
                        {items.map((item) => {
                            const itemId = getItemId(item);
                            return (
                                <TravelCard 
                                    key={itemId} 
                                    onClick={() => handleCardClick(item)}
                                    role="button"
                                    aria-label={`여행지: ${item.name}`}
                                >
                                    <TravelCardImage>
                                        <img 
                                            src={item.imageUrl} 
                                            alt={`${item.name} 이미지`} 
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'https://via.placeholder.com/300x180?text=이미지+없음';
                                            }} 
                                        />
                                    </TravelCardImage>

                                    <TravelCardContent>
                                        <strong>{item.name}</strong>
                                        <div>{item.title}</div>
                                    </TravelCardContent>

                                    <CardButtonWrapper>
                                        <SelectButton 
                                            onClick={(e) => handleSelectButtonClick(itemId, e)}
                                            aria-label={`${item.name} 선택하기`}
                                        >
                                            선택
                                        </SelectButton>
                                    </CardButtonWrapper>
                                </TravelCard>
                            );
                        })}
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
