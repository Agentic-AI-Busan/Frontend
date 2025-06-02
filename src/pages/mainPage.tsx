import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import nullPlaceImage from '../assets/images/null_place.png';
import MainBanner from '../assets/images/MainBanner.jpg';
import Footer from '../components/Footer';
import BusanLogo from '../assets/images/BUSAN.svg';
import SelectionModal from '../components/Modal/SelectionModal';

// API 응답 데이터 타입 정의
interface TripPlan {
    attractionId: number;
    name: string;
    imageUrl: string;
    address: string;
    operatingHours: string;
    title: string;
    latitude: number;
    longitude: number;
    phoneNumber?: string;
}

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0;
    min-height: 100vh;
`;

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    flex: 1;
`;

const BannerImage = styled.div`
    width: 100vw;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    height: 600px;
    background-image: url(${MainBanner});
    background-size: cover;
    background-position: bottom;
    margin-bottom: 40px;
    display: flex;
    justify-content: right;
    align-items: flex-end;
    padding: 50px;
`;

const SloganText = styled.p`
    position: absolute;
    top: 6%;
    left: 6%;
    transform: translateY(-50%);
    color: white;
    font-size: 3em;
    font-weight: 700;
    text-align: center;
    line-height: 1.4;
    letter-spacing: 0.1em;
    text-shadow: 0 1px 3px rgba(0,0,0,0.4), 
                 0 3px 8px rgba(0,0,0,0.3), 
                 0 0 12px rgba(0,0,0,0.2);
    z-index: 10;
    width: auto;

    @media (max-width: 768px) {
        font-size: 2em;
        top: 18%;
        left: 12%;
        letter-spacing: 0.04em;
    }

    @media (max-width: 480px) {
        font-size: 1.6em;
        top: 20%;
        left: 12%;
        letter-spacing: 0.03em;
    }
`;

const LogoImage = styled.img`
    position: absolute;
    top: 27%;
    left: 6%;
    transform: translateY(-50%);
    width: 300px;
    height: auto;
    z-index: 10;

    @media (max-width: 768px) {
        top: 25%;
        left: 12%;
        width: 150px;
    }

    @media (max-width: 480px) {
        top: 28%;
        left: 12%;
        width: 120px;
    }
`;

const StartGuideButton = styled.button`
    padding: 12px 28px;
    font-size: 1.1em; 
    font-weight: 600;
    color: white;
    background-color: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(5px);
    text-shadow: 0 1px 3px rgba(0,0,0,0.3);

    &:hover {
        background-color: rgba(255, 255, 255, 0.3);
        border-color: white;
        transform: translateY(-2px) scale(1.03);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
    }

    &:active {
        transform: translateY(0) scale(1);
        box-shadow: 0 5px 10px rgba(0,0,0,0.15);
    }
`;

const Title = styled.h1`
    display: block;
    text-align: center;
    font-size: 2em;
    font-weight: 600;
    padding-bottom: 15px;
    margin-bottom: 10px;
    color: #2c3e50;
    letter-spacing: 0.5px;
    width: 100%;
`;

const SubtitleContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px; // SubTitle과 RefreshButton 사이 간격
    margin-bottom: 40px; // CardGrid와의 간격 확보
`;

const SubTitle = styled.p`
    font-size: 1.1em;
    color: #555;
    text-align: center;
    line-height: 1.5;
    margin: 0; // SubtitleContainer에서 마진 관리
`;

const RefreshButton = styled.button`
    padding: 8px 15px;
    font-size: 0.9em;
    font-weight: 500;
    color: #3498db;
    background-color: transparent;
    border: 1px solid #3498db;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background-color: #3498db;
        color: white;
        box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
    }

    &:active {
        transform: scale(0.98);
    }
`;

const CardGrid = styled.div`
    margin-top: 40px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 40px;
    width: 100%;
    max-width: 1300px;

    @media (max-width: 1200px) {
        grid-template-columns: repeat(3, 1fr);
    }
    @media (max-width: 992px) {
        grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const Card = styled.div`
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #eaeaea;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    background: #fff;
    display: flex;
    flex-direction: column;
    min-height: 320px;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        border-color: #d9e8f6;
        
        img {
        transform: scale(1.07);
        }
        cursor: pointer;
    }
`;

const CardImageContainer = styled.div`
    height: 200px;
    overflow: hidden;
    background-color: #f0f0f0;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
`;

const CardContent = styled.div`
    padding: 20px; 
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    h3 {
        font-size: 1.15em; 
        font-weight: 600;
        color: #2c3e50; 
        margin: 0 0 12px;
        letter-spacing: 0.3px; 
        position: relative; 
        padding-left: 12px; 
        white-space: nowrap; 
        overflow: hidden;
        text-overflow: ellipsis;

        &::before { 
            content: '';
            position: absolute;
            left: 0;
            top: 50%; 
            transform: translateY(-50%); 
            height: 70%; 
            width: 3px;
            background-color: #bdc3c7; 
            border-radius: 1.5px; 
        }
    }

    p {
        font-size: 0.92em; 
        color: #4a5568; 
        line-height: 1.6; 
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3; 
        -webkit-box-orient: vertical;
        min-height: calc(0.92em * 1.6 * 1); 
        max-height: calc(0.92em * 1.6 * 3); 
    }
`;

const MainPage = () => {
    const navigate = useNavigate();
    const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
    const [allAttractions, setAllAttractions] = useState<TripPlan[]>([]); // 전체 목록 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCardData, setSelectedCardData] = useState<TripPlan | null>(null);

    // 배열을 섞는 함수 (Fisher-Yates shuffle)
    const shuffleArray = (array: TripPlan[]) => {
        const newArray = [...array]; // 원본 배열 변경 방지
        let currentIndex = newArray.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [newArray[currentIndex], newArray[randomIndex]] = [
                newArray[randomIndex], newArray[currentIndex]];
        }
        return newArray;
    };

    useEffect(() => {
        const fetchTripPlans = async () => {
            try {
                const response = await fetch('/api/trip-plans/popular'); 
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const responseData = await response.json(); 
                const attractions: TripPlan[] = responseData.result.attractions; 
                setAllAttractions(attractions); // 전체 목록 저장
                setTripPlans(shuffleArray(attractions).slice(0, 20)); // 섞어서 20개 표시
            } catch (error) {
                console.error("Error fetching popular trip plans:", error);
                setAllAttractions([]);
                setTripPlans([]);
            }
        };
        fetchTripPlans();
    }, []);

    const handleRefresh = () => {
        if (allAttractions.length > 0) {
            setTripPlans(shuffleArray(allAttractions).slice(0, 20));
        }
    };

    const handleStartGuide = () => {
        navigate('/question');
    };

    const handleCardClick = (plan: TripPlan) => {
        setSelectedCardData(plan);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCardData(null);
    };

    return (
        <PageContainer>
            <ContentWrapper>
                <BannerImage>
                    <SloganText>당신의 부산여행, 조금 더 특별하게</SloganText>
                    <LogoImage src={BusanLogo} alt="Busan Logo" />
                    <StartGuideButton onClick={handleStartGuide}>가이드 시작하기</StartGuideButton>
                </BannerImage>
                <Title>부산의 다양한 매력을 느껴보세요!</Title>
                <SubtitleContainer>
                    <SubTitle>지금 가장 인기 있는 부산의 명소들을 20곳을 확인해 보세요.</SubTitle>
                    <RefreshButton onClick={handleRefresh}>새로운 명소 보기</RefreshButton>
                </SubtitleContainer>
                <CardGrid>
                    {tripPlans.length > 0 ? (
                        tripPlans.map((plan) => (
                            <Card key={plan.attractionId} onClick={() => handleCardClick(plan)}>
                                <CardImageContainer>
                                    <img src={plan.imageUrl || nullPlaceImage} alt={plan.name} />
                                </CardImageContainer>
                                <CardContent>
                                    <h3>{plan.name}</h3>
                                    <p>{plan.title}</p>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        [...Array(20)].map((_, index) => (
                            <Card key={`skeleton-${index}`}>
                                <CardImageContainer>
                                    <img src={nullPlaceImage} alt={`여행지 예시 ${index + 1}`} />
                                </CardImageContainer>
                                <CardContent>
                                    <h3>{`여행지 카드 ${index + 1}`}</h3>
                                    <p>여기에 간단한 여행지 설명이 들어갑니다.</p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </CardGrid>
            </ContentWrapper>
            <Footer />
            {selectedCardData && (
                <SelectionModal 
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    selectedTravelItem={selectedCardData}
                    onSelect={() => {}}
                    showActionButtons={false}
                    showSingleCloseButton={true}
                />
            )}
        </PageContainer>
    )
}

export default MainPage