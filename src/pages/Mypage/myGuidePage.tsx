import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import card_image from '../../assets/images/card_image.jpg';
import { useNavigate } from 'react-router-dom';
import { getUserTripPlans, editUserTripPlan, deleteUserTripPlan } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

const Container = styled.div`
    width: 100%;
    min-height: 90vh;
    background-color: #f8f9fa;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 60px;
`;

const MainContent = styled.main`
    min-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 40px;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 215px);
`;

const TitleWrapper = styled.div`
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

const MainTitle = styled.h2`
    font-size: 24px;
    font-weight: 500;
    color: #333;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: -0.5px;

    span {
        color: #0066cc;
        font-weight: 600;
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

const GuideList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
    flex: 1;
`;

const GuideItem = styled.div`
    display: flex;
    gap: 20px;
    background-color: white;
    padding: 0;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #e1e1e1;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    overflow: hidden;
    cursor: pointer;
    height: 250px;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 0;
    }
`;

const GuideImage = styled.div`
    width: 280px;
    height: 100%;
    overflow: hidden;
    flex-shrink: 0;
    position: relative;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    @media (max-width: 768px) {
        width: 100%;
        height: 100%;
    }
`;

const GuideInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    position: relative;
`;

const GuideTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    flex-wrap: wrap;

    h3 {
        font-size: 24px;
        font-weight: 700;
        color: #1a3b5d;
        margin: 0;
        padding-left: 12px;
        position: relative;
        cursor: pointer;

        &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            width: 3px;
            height: 80%;
            background: #3498db;
            border-radius: 1px;
            opacity: 0.85;
        }

        &:hover {
            color: #3498db;
        }
    }

    span {
        color: #666;
        font-size: 15px;
        display: flex;
        align-items: center;

        &::before {
            content: '';
            display: inline-block;
            width: 4px;
            height: 4px;
            background-color: #666;
            border-radius: 50%;
            margin-right: 16px;
        }
    }
`;

const DDay = styled.div`
    background-color: #3498db;
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.5px;
`;

const GuideDescription = styled.div<{ isEditing: boolean }>`
    flex: 1;
    color: #666;
    font-size: 15px;
    line-height: 1.7;
    margin-bottom: 20px;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
    position: relative;
    cursor: ${props => props.isEditing ? 'text' : 'inherit'};

    ${props => props.isEditing ? `
        background-color: #f8f9fa;
        border: 1px solid #ddd;
        
        &:focus {
            outline: none;
            border-color: #3498db;
            box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
    ` : `
        border: 1px solid transparent;
        
        &:hover {
            background-color: #f8f9fa;
        }

        &::after {
            content: '클릭하여 메모를 수정하세요';
            position: absolute;
            right: 8px;
            bottom: -20px;
            font-size: 12px;
            color: #999;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        &:hover::after {
            opacity: 1;
        }
    `}
`;

const EditableInput = styled.input`
    width: 100%;
    padding: 8px;
    border: none;
    background: none;
    font-size: 15px;
    line-height: 1.7;
    font-family: inherit;
    color: inherit;
    outline: none;
    box-sizing: border-box;

    &::placeholder {
        color: #999;
        transition: opacity 0.2s ease;
    }

    &:focus::placeholder {
        opacity: 0;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: auto;
`;

const Button = styled.button`
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;

    &.edit {
        background-color: #f8f9fa;
        color: #333;
        border: 1px solid #ddd;
        
        &:hover {
            background-color: #e9ecef;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
    }

    &.delete {
        background-color: white;
        color: #e74c3c;
        border: 1px solid #e74c3c;
        
        &:hover {
            background-color: #e74c3c;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
        }
    }
`;

const LocationInfo = styled.div`
    display: flex;
    align-items: center;
    color: #666;
    font-size: 15px;
    margin-bottom: 16px;

    svg {
        margin-right: 8px;
        color: #3498db;
    }
`;

const PaginationWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 0;
    gap: 20px;
    margin-top: auto;
`;

const EmptyGuide = styled.div`
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 16px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const PageButton = styled.button<{ isActive?: boolean }>`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid ${props => props.isActive ? '#3498db' : '#ddd'};
    background-color: ${props => props.isActive ? '#3498db' : 'white'};
    color: ${props => props.isActive ? 'white' : '#666'};
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background-color: ${props => props.isActive ? '#3498db' : '#f8f9fa'};
        transform: translateY(-2px);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
        transform: none;
    }
`;

const ArrowButton = styled(PageButton)`
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
        width: 20px;
        height: 20px;
    }

    &:hover {
        background-color: #f8f9fa;
    }
`;

const TitleInput = styled.input`
    font-size: 24px;
    font-weight: 700;
    color: #1a3b5d;
    margin: 0;
    padding: 4px 12px;
    border: 1px solid #3498db;
    border-radius: 4px;
    width: 100%;
    max-width: 300px;
    background-color: white;
    
    &:focus {
        outline: none;
        border-color: #2980b9;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

interface TripPlan {
    tripPlanId: number;
    tripPlanName: string;
    tripPlanStatus: string;
    startDate: string;
    endDate: string;
    dayDiff: number;
    imageUrl: string;
    memo: string | null;
    city: string;
}

const MyGuidePage: React.FC = () => {
    const { user } = useUser();
    const userName = user?.nickname || user?.name;
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState("");
    const [editingTitleId, setEditingTitleId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState("");

    const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(2);

    useEffect(() => {
        const updateItemsPerPage = () => {
            const windowHeight = window.innerHeight;
            const topPadding = 60 + 20 + 40;
            const availableHeight = windowHeight - topPadding - 100;

            const cardHeight = 250;
            const cardGap = 24;

            let count = Math.floor((availableHeight + cardGap) / (cardHeight + cardGap));
            if (window.innerWidth <= 768) count = 1;

            setItemsPerPage(Math.max(1, count));
        };
        updateItemsPerPage();
        window.addEventListener('resize', updateItemsPerPage);
        return () => window.removeEventListener('resize', updateItemsPerPage);
    }, []);

    useEffect(() => {
        const fetchTripPlans = async () => {
            const plans = await getUserTripPlans();
            if (plans) {
                const userTripPlans = plans.tripPlans.map((plan: TripPlan) => ({
                    ...plan,
                    memo: plan.memo === "string"  || plan.memo === null ? "메모를 작성해 주세요..." : plan.memo
                }));
                setTripPlans(userTripPlans);
            }
        }
        fetchTripPlans();
    }, []);
    
    const totalPages = Math.ceil((tripPlans?.length || 0) / itemsPerPage);
    
    // 현재 페이지에 표시할 아이템들
    const currentItems = Array.isArray(tripPlans) ? tripPlans.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    ) : [];

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // 일정 삭제 핸들러
    const handleDelete = async (id: number) => {
            if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
                setTripPlans(prevItems => {
                    const newItems = prevItems.filter(item => item.tripPlanId !== id);
                    // 현재 페이지의 마지막 아이템을 삭제했을 때 이전 페이지로 이동
                    const newTotalPages = Math.ceil(newItems.length / itemsPerPage);
                    if (currentPage > newTotalPages && newTotalPages > 0) {
                        setCurrentPage(newTotalPages);
                    }
                    return newItems;
                });

            const success = await deleteUserTripPlan(id);
            if (success) {
                console.log('일정 삭제 성공');
            } else {
                console.log('일정 삭제 실패');
            }
        }
    };

    // 메모 수정 시작
    const handleStartEdit = (item: TripPlan) => {
        if (item.memo === "메모를 작성해 주세요...") {
            setEditingText("");
        } else {
            setEditingText(item.memo || "");
        }
        setEditingId(item.tripPlanId);
    };

    // 메모 수정 완료
    const handleFinishEdit = async () => {
        if (editingId === null) return;
        const plan = tripPlans.find(item => item.tripPlanId === editingId);
        if (!plan) return;

        // 입력값이 비어있으면 기존 memo 사용, 기존 memo도 없으면 기본값
        const finalText = editingText.trim() === "" 
            ? (plan.memo && plan.memo !== "string" ? plan.memo : "메모를 작성해 주세요...") 
            : editingText;

        try {
            const success = await editUserTripPlan(editingId, plan.tripPlanName, finalText);
            if (success) {
                setTripPlans(prevItems =>
                    prevItems.map(item =>
                        item.tripPlanId === editingId
                            ? { ...item, memo: finalText }
                            : item
                    )
                );
                console.log('메모 수정 성공');
            } else {
                console.log('메모 수정 실패');
            }
        } catch (e) {
            console.log('메모 수정 실패: ', e);
        }
        setEditingId(null);
        setEditingText("");
    };

    // 메모 수정 취소
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingText("");
    };

    // 키보드 이벤트 처리
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.shiftKey) {
            // Shift + Enter는 줄바꿈 허용
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            handleFinishEdit();
        }
        if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    // 제목 수정 시작
    const handleStartTitleEdit = (item: TripPlan) => {
        console.log('현재 수정 중인 제목 ID:', item.tripPlanId);
        setEditingTitle(item.tripPlanName);
        setEditingTitleId(item.tripPlanId);
    };

    // 제목 수정 완료
    const handleFinishTitleEdit = async () => {
        if (editingTitleId === null) return;

        const plan = tripPlans.find(plan => plan.tripPlanId === editingTitleId);
        if (!plan) return;
        
        const finalTitle = editingTitle.trim() === "" ? plan.tripPlanName : editingTitle;
        if (finalTitle === "") return; // 빈 제목은 저장하지 않음
        
        setTripPlans(prevItems =>
            prevItems.map(item =>
                item.tripPlanId === editingTitleId
                    ? { ...item, tripPlanName: finalTitle }
                    : item
            )
        );

        const success = await editUserTripPlan(editingTitleId, finalTitle, plan.memo || "");
        if (success) {
            console.log('여행 정보 수정 성공');
        } else {
            console.log('여행 정보 수정 실패');
        }
        
        setEditingTitleId(null);
        setEditingTitle("");
    };

    // 제목 수정 취소
    const handleCancelTitleEdit = () => {
        setEditingTitleId(null);
        setEditingTitle("");
    };

    // 제목 수정 키보드 이벤트
    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleFinishTitleEdit();
        }
        if (e.key === 'Escape') {
            handleCancelTitleEdit();
        }
    };

    // 가이드 클릭 핸들러
    const handleGuideClick = (id: number) => {
        navigate(`/map`, { state: { tripPlansId: id } });
    };

    // 이벤트 버블링 방지
    const handleDescriptionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <Container>
            <TitleWrapper>
                <MainTitle><span>{userName}</span>님의 가이드 목록입니다</MainTitle>
            </TitleWrapper>
            <MainContent>
                <GuideList>
                    {currentItems.map((item) => (
                        <GuideItem 
                            key={item.tripPlanId}
                            onClick={() => handleGuideClick(item.tripPlanId)}
                        >
                            <GuideImage>
                                <img src={card_image} alt={item.tripPlanName} />
                            </GuideImage>
                            <GuideInfo>
                                <GuideTitle>
                                    {editingTitleId === item.tripPlanId ? (
                                        <TitleInput
                                            value={editingTitle}
                                            onChange={(e) => setEditingTitle(e.target.value)}
                                            onBlur={handleFinishTitleEdit}
                                            onKeyDown={handleTitleKeyDown}
                                            placeholder="여행 제목을 입력하세요"
                                            autoFocus
                                            onClick={e => e.stopPropagation()}
                                        />
                                    ) : (
                                        <h3 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('클릭된 아이템:', item);
                                                handleStartTitleEdit(item);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {item.tripPlanName}
                                        </h3>
                                    )}
                                    <span>{`${item.startDate} ~ ${item.endDate}`}</span>
                                    <DDay>{item.dayDiff === 0 ? 'D-Day' : `D${item.dayDiff > 0 ? '+' : ''}${item.dayDiff}`}</DDay>
                                </GuideTitle>
                                <LocationInfo>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"/>
                                    </svg>
                                    {item.city}
                                </LocationInfo>
                                <GuideDescription 
                                    isEditing={editingId === item.tripPlanId}
                                    onClick={(e) => {
                                        handleDescriptionClick(e);
                                        if (!editingId) handleStartEdit(item);
                                    }}
                                >
                                    {editingId === item.tripPlanId ? (
                                        <EditableInput
                                            type="text"
                                            value={editingText}
                                            onChange={(e) => setEditingText(e.target.value)}
                                            onBlur={handleFinishEdit}
                                            onKeyDown={handleKeyDown}
                                            placeholder="메모를 작성해 주세요..."
                                            autoFocus
                                            maxLength={50}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    ) : (
                                        item.memo
                                    )}
                                </GuideDescription>
                                <ButtonGroup onClick={e => e.stopPropagation()}>
                                    <Button 
                                        className="delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(item.tripPlanId);
                                        }}
                                    >
                                        삭제
                                    </Button>
                                </ButtonGroup>
                            </GuideInfo>
                        </GuideItem>
                    ))}
                </GuideList>
                {tripPlans.length === 0 ? (
                    <EmptyGuide>
                        등록된 가이드가 없습니다.
                    </EmptyGuide>
                ) : (
                    <PaginationWrapper>
                        <ArrowButton 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                            </svg>
                        </ArrowButton>
                        {[...Array(totalPages)].map((_, index) => (
                            <PageButton
                                key={index + 1}
                                onClick={() => handlePageChange(index + 1)}
                                isActive={currentPage === index + 1}
                            >
                                {index + 1}
                            </PageButton>
                        ))}
                        <ArrowButton 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                            </svg>
                        </ArrowButton>
                    </PaginationWrapper>
                )}
            </MainContent>
        </Container>
    );
};

export default MyGuidePage;