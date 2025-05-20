import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import logoImage from '../assets/images/t_logo.png';
import userImage from '../assets/images/default_profile_img.jpeg';
import CheckModal from './Modal/CheckModal';
import { useUser } from '../contexts/UserContext';

interface NavbarProps {
    userName?: string;
}

const HeaderContainer = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px 25px;
    background-color: #ffffff;
    height: 60px;
    z-index: 100;
`;

const Logo = styled.h1`
    img {
        height: 40px;
        width: auto;
    }
`;

const MenuWrapper = styled.nav`
    display: flex;
    align-items: center;
`;

const MenuList = styled.ul`
    display: flex;
    list-style: none;
    margin-right: 30px;
`;

const MenuItem = styled.li`
    margin: 0 25px;
`;

const MenuButton = styled.button`
    background: none;
    border: none;
    color: #808080;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    padding: 10px 12px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1.5;
    height: 40px;
    
    &:hover {
        color: #3498db;
        border-radius: 4px;
    }
`;

const UserButtonWrapper = styled.div`
    position: relative;
    display: inline-block;
`;

const UserButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: #333;
    font-weight: 500;
    cursor: pointer;
    padding: 8px 12px;
    transition: all 0.3s ease;
    line-height: 1.5;
    height: 40px;
    white-space: nowrap;
    
    img {
        display: inline-block;
        width: 24px;
        height: 24px;
        background-color: #e9ecef;
        border-radius: 50%;
        margin-right: 8px;
    }
    
    &:hover {
        color: #007bff;
    }
`;

const DropdownMenu = styled.div<{ isVisible: boolean }>`
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 8px 0;
    min-width: 100%;
    opacity: ${props => props.isVisible ? 1 : 0};
    visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
    transform: translateY(${props => props.isVisible ? '0' : '-10px'});
    transition: all 0.2s ease;
    z-index: 1000;
`;

const DropdownItem = styled.button`
    display: flex;
    align-items: center;
    width: 100%;
    padding: 12px 16px;
    border: none;
    background: none;
    color: #333;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    svg {
        margin-right: 8px;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
    }

    &:hover {
        background-color: #f8f9fa;
        color: #007bff;
    }
`;

const Navbar: React.FC<NavbarProps> = () => {
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const [showDropdown, setShowDropdown] = useState(false);
    const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
    
    const handleNavigation = (path: string) => {
        navigate(path);
        setShowDropdown(false);
    };

    const handleUserButtonClick = () => {
        if (!user) {
            navigate('/auth');
        }
    };

    const handleLogout = () => {
        console.log('로그아웃 처리');
        const savedUserId = localStorage.getItem('savedUserId');
        localStorage.clear();
        if (savedUserId) {
            localStorage.setItem('savedUserId', savedUserId);
        }
        sessionStorage.clear();
        setUser(null);
        setIsCheckModalOpen(false);
        alert('로그아웃 되었습니다.');
        navigate('/auth');
    };

    
    return (
        <>
            <HeaderContainer>
                <Logo>
                    <Link to="/">
                    <img src={logoImage} alt="logo" />
                </Link>
            </Logo>
            <MenuWrapper>
                <MenuList>
                    <MenuItem>
                        <MenuButton onClick={() => handleNavigation('/service')}>
                            서비스 소개
                        </MenuButton>
                    </MenuItem>
                    <MenuItem>
                        <MenuButton onClick={() => handleNavigation('/guide')}>
                            여행지 검색
                        </MenuButton>
                    </MenuItem>
                    <MenuItem>
                        <MenuButton onClick={() => handleNavigation('/question')}>
                            가이드 시작하기
                        </MenuButton>
                    </MenuItem>
                </MenuList>
                <UserButtonWrapper 
                    onMouseEnter={() => user && setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                >
                    <UserButton onClick={handleUserButtonClick}>
                        <img src={user?.profileImage || userImage} alt="user" />
                        {user?.nickname || '로그인하기'}
                    </UserButton>
                    {user && (
                        <DropdownMenu isVisible={showDropdown}>
                            <DropdownItem onClick={() => handleNavigation('/myPage')}>
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                                사용자 정보
                            </DropdownItem>
                            <DropdownItem onClick={() => handleNavigation('/myGuide')}>
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                                </svg>
                                나의 여행
                            </DropdownItem>
                            <DropdownItem onClick={() => setIsCheckModalOpen(true)}>
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                                </svg>
                                로그아웃
                            </DropdownItem>
                        </DropdownMenu>
                    )}
                </UserButtonWrapper>
            </MenuWrapper>
        </HeaderContainer>

        {/* 로그아웃 확인 모달 추가 */}
        <CheckModal
            isOpen={isCheckModalOpen}
            onClose={() => setIsCheckModalOpen(false)}
            onConfirm={handleLogout}
            title="로그아웃"
            message="로그아웃 하시겠습니까?"
        />
    </>
    );
};

export default Navbar; 