import React, { useRef } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/api';

import mainImage from '../../assets/images/main_image.png';
import googleImage from '../../assets/images/ico_google2.png';

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: #f4f6fb;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Wrapper = styled.div`
    width: 100%;
    height: calc(100vh - 90px);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    overflow: hidden;
    justify-content: center;
    align-items: center;
    padding: 20px 0;

    @media (max-width: 768px) {
        height: calc(100vh - 60px);
        padding: 10px 0;
    }
`;

const SplitContainer = styled.div`
  width: 900px;
  height: 600px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(44, 62, 80, 0.12);
  display: flex;
  overflow: hidden;
  @media (max-width: 900px) {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
`;

const Left = styled.div`
  flex: 1.1;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 56px 48px;
  @media (max-width: 700px) {
    padding: 32px 16px;
  }
`;

const Right = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #6c63ff 0%, #3f3d56 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  @media (max-width: 700px) {
    display: none;
  }
`;

const Logo = styled.img`
  width: 56px;
  margin-bottom: 24px;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  border-radius: 10px;
  border: 1.5px solid #e1e1e1;
  padding: 0 16px;
  font-size: 16px;
  background: #f8f9fa;
  transition: border 0.2s;
  &:focus {
    border: 1.5px solid #BBDEFB;
    outline: none;
    background: #fff;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RememberMe = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #444;
  input {
    margin-right: 6px;
  }
`;

const Forgot = styled(Link)`
  color: #3498db;
  font-size: 14px;
  text-decoration: underline;

  &:hover {
    color: #2980b9;
  }
`;

const Button = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 10px;
  background: #3498db;
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  border: none;
  margin-top: 8px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(79,70,229,0.08);
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  &:hover {
    background: #2980b9;
    box-shadow: 0 4px 16px rgba(79,70,229,0.13);
  }
`;

const Divider = styled.div`
  width: 100%;
  text-align: center;
  color: #aaa;
  font-size: 14px;
  margin: 25px 0 25px 0;
  position: relative;
  border-bottom: 1px solid #eee;
  line-height: 0.1em;
  span {
    background: #fff;
    padding: 0 10px;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  height: 44px;
  border-radius: 8px;
  border: 1.5px solid #e1e1e1;
  background: #fff;
  color: #222;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: border 0.2s, box-shadow 0.2s;
  &:hover {
    border: 1.5px solid #BBDEFB;
    box-shadow: 0 2px 8px rgba(108,99,255,0.08);
  }
  img {
    width: 22px;
    height: 22px;
  }
`;

const RegisterRow = styled.div`
  width: 100%;
  text-align: center;
  font-size: 15px;
  margin-top: 18px;
  color: #444;
  a {
    color: #3498db;
    text-decoration: underline;
    margin-left: 4px;
    font-weight: 500;

    &:hover {
        color: #2980b9;
    }
  }
`;

const Pattern = styled.div`
  width: 100%;
  height: 100%;
  background: url(${mainImage}) center/cover no-repeat;
`;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const idRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = idRef.current?.value || '';
    const password = pwRef.current?.value || '';
    const success = await loginUser(email, password);
    if (success) {
      navigate('/');
    } else {
      alert('로그인에 실패했습니다. 아이디/비밀번호를 확인하세요.');
    }
  };

  return (
    <PageWrapper>
      <Wrapper>
        <SplitContainer>
            <Left>
            <Logo src="/images/t_logo.png" alt="LOGO" />
            
            <Form onSubmit={handleLogin}>
                <div>
                <Input
                    type="text"
                    id="userId"
                    name="username"
                    placeholder="Enter your mail address"
                    ref={idRef}
                    autoComplete="username"
                    pattern="[A-Za-z]*"
                    title="영어만 입력 가능합니다"
                    required
                />
                </div>
                <div>
                <Input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter password"
                    ref={pwRef}
                    autoComplete="current-password"
                    required
                />
                </div>
                <Row>
                <RememberMe>
                    <input type="checkbox" />
                    아이디 저장
                </RememberMe>
                <Forgot to="/find-password">비밀번호 찾기</Forgot>
                </Row>
                <Button type="submit">로그인</Button>
            </Form>
            <Divider><span>간편 로그인</span></Divider>
            <GoogleButton type="button">
                <img src={googleImage} alt="Google" />
                구글로 로그인
            </GoogleButton>
            <RegisterRow>
                계정이 없으신가요?
                <Link to="/signup">회원가입</Link>
            </RegisterRow>
            </Left>
            <Right>
                <Pattern />
            </Right>
        </SplitContainer>
      </Wrapper>
    </PageWrapper>
  );
};

export default LoginPage;