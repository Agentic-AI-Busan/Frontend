import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import logoImage from '../assets/images/t_logo.png';
import userImage from '../assets/images/Butterfly.jpeg';

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
        color: #007bff;
        border-radius: 4px;
    }
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

const Navbar: React.FC<NavbarProps> = ({ userName = 'Seongsurib' }) => {
    const navigate = useNavigate();
    
    const handleNavigation = (path: string) => {
        navigate(path);
    };
    
    return (
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
                <UserButton onClick={() => handleNavigation('/my_profile')}>
                    <img src={userImage} alt="user"></img>{userName}
                </UserButton>
            </MenuWrapper>
        </HeaderContainer>
    );
};

export default Navbar; 