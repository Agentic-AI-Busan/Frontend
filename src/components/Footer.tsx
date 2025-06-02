import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
    margin-top: 100px;
    margin-bottom: 50px;
    padding: 20px 0;
    background-color: #ffffff;
    border-top: 1.5px solid #e9ecef;
    height: 85px;
`;

const FooterMenu = styled.div`
    margin-bottom: 25px;
    
    ul {
        display: flex;
        justify-content: center;
        list-style: none;
        padding: 0;
    }
    
    li {
        margin: 0 15px;
        position: relative;
        
        &:not(:last-child)::after {
            content: '';
            position: absolute;
            right: -15px;
            top: 50%;
            transform: translateY(-50%);
            height: 12px;
            width: 1px;
            background-color: #dee2e6;
        }
    }
    
    a {
        color: #495057;
        text-decoration: none;
        font-size: 14px;
        &:hover {
            color: #212529;
            text-decoration: underline;
        }
    }
`;

const Copyright = styled.p`
    text-align: center;
    color: #6c757d;
    font-size: 13px;
`;

const Footer: React.FC = () => {
    return (
        <FooterContainer>
            <FooterMenu>
                <ul>
                    <li><a href="#">개인정보보호방침</a></li>
                    <li><a href="#">고객센터</a></li>
                </ul>
            </FooterMenu>
            <Copyright>Copyright 2025. Capstone All rights reserved.</Copyright>
        </FooterContainer>
    );
};

export default Footer; 