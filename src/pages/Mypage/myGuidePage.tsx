import React, { useState } from 'react';
import styled from 'styled-components';
// import travel_img2 from '../../assets/images/travel_img2.jpg';
// import travel_img3 from '../../assets/images/travel_img3.jpg';
import { useNavigate } from 'react-router-dom';

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
    height: 220px;
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
        height: 200px;
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

const EditableTextArea = styled.textarea`
    width: 100%;
    min-height: 100px;
    padding: 0;
    border: none;
    background: none;
    font-size: 15px;
    line-height: 1.7;
    resize: none;
    font-family: inherit;
    color: inherit;

    &:focus {
        outline: none;
    }

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

// 날짜 계산 함수
const calculateDday = (startDateStr: string): string => {
    // "YYYY.MM.DD" 형식의 날짜를 파싱
    const [startDate] = startDateStr.split(' ~ ');
    const [year, month, day] = startDate.split('.').map(Number);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return "D-Day";
    } else if (diffDays > 0) {
        return `D-${diffDays}`;
    } else {
        return `D+${Math.abs(diffDays)}`;
    }
};

// GuideItem 타입 정의
interface GuideItem {
    id: number;
    title: string;
    date: string;
    image: string;
    location: string;
    description: string;
}

const MyGuidePage: React.FC = () => {
    const [username] = useState<string>("성수립");
    const [currentPage, setCurrentPage] = useState(1);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState("");
    const navigate = useNavigate();
    
    // 더미 데이터 상태 관리
    const [guideItems, setGuideItems] = useState<GuideItem[]>([
        {
            id: 1,
            title: "대학교 친구들과",
            date: "2024.08.24 ~ 2024.08.26",
            image: '',
            location: "부산 해운대 (기본 위치)",
            description: "메모를 작성해 주세요..."
        },
        {
            id: 2,
            title: "중학교 친구들과",
            date: "2024.09.15 ~ 2024.09.17",
            image: '',
            location: "부산 해운대 (기본 위치)",
            description: "메모를 작성해 주세요..."
        },
        {
            id: 3,
            title: "대학교 친구들과",
            date: "2024.07.01 ~ 2024.07.03",
            image: '',
            location: "부산 해운대 (기본 위치)",
            description: "메모를 작성해 주세요..."
        },
        {
            id: 4,
            title: "대학교 친구들과",
            date: "2024.12.24 ~ 2024.12.26",
            image: '',
            location: "부산 해운대 (기본 위치)",
            description: "메모를 작성해 주세요..."
        }
    ]);

    const itemsPerPage = 2;
    const totalPages = Math.ceil(guideItems.length / itemsPerPage);
    
    // 현재 페이지에 표시할 아이템들
    const currentItems = guideItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // 가이드 삭제 핸들러
    const handleDelete = (id: number) => {
        if (window.confirm('정말로 이 가이드를 삭제하시겠습니까?')) {
            setGuideItems(prevItems => {
                const newItems = prevItems.filter(item => item.id !== id);
                // 현재 페이지의 마지막 아이템을 삭제했을 때 이전 페이지로 이동
                const newTotalPages = Math.ceil(newItems.length / itemsPerPage);
                if (currentPage > newTotalPages && newTotalPages > 0) {
                    setCurrentPage(newTotalPages);
                }
                return newItems;
            });
        }
    };

    // 메모 수정 시작
    const handleStartEdit = (item: GuideItem) => {
        if (item.description === "메모를 작성해 주세요...") {
            setEditingText("");
        } else {
            setEditingText(item.description);
        }
        setEditingId(item.id);
    };

    // 메모 수정 완료
    const handleFinishEdit = () => {
        if (editingId === null) return;
        
        const finalText = editingText.trim() === "" ? "메모를 작성해 주세요..." : editingText;
        
        setGuideItems(prevItems =>
            prevItems.map(item =>
                item.id === editingId
                    ? { ...item, description: finalText }
                    : item
            )
        );
        
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

    // 가이드 클릭 핸들러
    const handleGuideClick = (id: number) => {
        // navigate(`/map/${id}`);
        navigate(`/map/#`);
    };

    // 이벤트 버블링 방지
    const handleDescriptionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <Container>
            <TitleWrapper>
                <MainTitle><span>{username}</span>님의 가이드 목록입니다</MainTitle>
            </TitleWrapper>
            <MainContent>
                <GuideList>
                    {currentItems.map((item) => (
                        <GuideItem 
                            key={item.id}
                            onClick={() => handleGuideClick(item.id)}
                        >
                            <GuideImage>
                                <img src={item.image} alt={item.title} />
                            </GuideImage>
                            <GuideInfo>
                                <GuideTitle>
                                    <h3>{item.title}</h3>
                                    <span>{item.date}</span>
                                    <DDay>{calculateDday(item.date)}</DDay>
                                </GuideTitle>
                                <LocationInfo>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"/>
                                    </svg>
                                    {item.location}
                                </LocationInfo>
                                <GuideDescription 
                                    isEditing={editingId === item.id}
                                    onClick={(e) => {
                                        handleDescriptionClick(e);
                                        if (!editingId) handleStartEdit(item);
                                    }}
                                >
                                    {editingId === item.id ? (
                                        <EditableTextArea
                                            value={editingText}
                                            onChange={(e) => setEditingText(e.target.value)}
                                            onBlur={handleFinishEdit}
                                            onKeyDown={handleKeyDown}
                                            placeholder="메모를 작성해 주세요..."
                                            autoFocus
                                            onClick={e => e.stopPropagation()}
                                        />
                                    ) : (
                                        item.description
                                    )}
                                </GuideDescription>
                                <ButtonGroup onClick={e => e.stopPropagation()}>
                                    <Button 
                                        className="delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(item.id);
                                        }}
                                    >
                                        삭제
                                    </Button>
                                </ButtonGroup>
                            </GuideInfo>
                        </GuideItem>
                    ))}
                </GuideList>
                {guideItems.length === 0 ? (
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