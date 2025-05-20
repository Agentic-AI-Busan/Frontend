"use client"
import { useState } from "react"
import styled, { keyframes } from "styled-components"
import LoginForm from "../../components/LoginForm"
import SignupForm from "../../components/SignUpForm"
import mainImage from "../../assets/images/main_image.png"

// Content fade animations
const fadeX = keyframes`
  from {
    transform: translateX(200px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

const fadeY = keyframes`
  from {
    transform: translateX(-200px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

// Styled Components
const PageWrapper = styled.div`
  min-height: 93vh;
  width: 100vw;
  background: #f4f6fb;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`

const SignContainer = styled.div`
  background: #fff;
  width: 900px;
  min-height: 600px;
  height: auto;
  margin: auto;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
  z-index: initial;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 900px) {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
`

const SwitchPanel = styled.div<{ $isLogin: boolean }>`
  position: absolute;
  width: inherit;
  height: 100%;
  z-index: 100;
  clip-path: ${(props) => (props.$isLogin ? "inset(0px 0px 0px 550px)" : "inset(0px 550px 0px 0px)")};
  background-image: url(${mainImage});
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  transition: clip-path 0.6s;
  overflow: hidden;
  display: grid;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(108, 99, 255, 0.7) 0%, rgba(63, 61, 86, 0.7) 100%);
    z-index: -1;
  }
  
  @media (max-width: 700px) {
    clip-path: ${(props) => (props.$isLogin ? "inset(0px 0px 0px 100%)" : "inset(0px 100% 0px 0px)")};
  }
`

const SwitchLogo = styled.img`
  max-width: 30px;
  position: absolute;
  margin: 1.5em;
  filter: grayscale(1) brightness(3);
`

const Group = styled.div`
  width: 100%;
  height: fit-content;
  align-self: center;
  position: absolute;
  z-index: 2;
`

const TextGroup = styled.div`
  width: -webkit-fill-available;
  display: flow-root;
`

const SignContent = styled.div<{ $isLogin: boolean }>`
  display: grid;
  padding: 0em 3em;
  box-sizing: border-box;
  max-width: 350px;
  height: inherit;
  float: ${(props) => (props.$isLogin ? "right" : "none")};
  animation: ${(props) => (props.$isLogin ? fadeX : fadeY)} 0.6s ease-out;
`

const Container = styled.div`
  height: fit-content;
  align-self: center;
  text-align: center;
  
  h3 {
    color: white;
    font-weight: 700;
    margin: 0em;
    margin-bottom: 1em;
    font-size: 32px;
    text-align: center;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  span {
    color: white;
    line-height: 1.7;
    letter-spacing: 0.02em;
    font-weight: 350;
    font-size: 18px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
`

const Toggle = styled.div<{ $isLogin: boolean }>`
  width: 350px;
  text-align: center;
  transform: translateX(${(props) => (props.$isLogin ? "550px" : "0px")});
  transition: all 0.6s ease;
  margin-top: 3em;
  
  button {
    background: transparent;
    border: 1px solid white;
    color: white;
    padding: 16px 60px;
    border-radius: 50px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.85em;
    margin-bottom: 0em;
    cursor: pointer;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    
    &:focus {
      outline: 0;
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    &:active {
      transform: translateY(1px);
    }
  }
  
  @media (max-width: 700px) {
    transform: translateX(${(props) => (props.$isLogin ? "100%" : "0px")});
  }
`

const Ornaments = styled.div`
  pointer-events: none;
  z-index: 1;
`

const FormPanel = styled.div`
  position: absolute;
  width: inherit;
  height: 100%;
`

const FormLogo = styled.img`
  max-width: 30px;
  position: absolute;
  margin: 1.5em;
`

const FormSignIn = styled.div<{ $isVisible: boolean }>`
  width: 550px;
  position: absolute;
  height: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: inset(0px 0px 0px 0px round 16px);
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  pointer-events: ${(props) => (props.$isVisible ? "auto" : "none")};
  transition: opacity 0.3s ease;
  z-index: ${(props) => (props.$isVisible ? 1 : -1)};
  
  @media (max-width: 700px) {
    width: 100%;
  }
`

const FormSignUp = styled.div<{ $isVisible: boolean }>`
  width: 550px;
  position: absolute;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  right: 0px;
  clip-path: inset(0px 0px 0px 0px round 16px);
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  pointer-events: ${(props) => (props.$isVisible ? "auto" : "none")};
  transition: opacity 0.3s ease;
  z-index: ${(props) => (props.$isVisible ? 1 : -1)};
  
  /* 스크롤바 숨기기 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  
  @media (max-width: 700px) {
    width: 100%;
  }
`

export default function AuthPage() {
  // UI state
  const [isLogin, setIsLogin] = useState(true)

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  return (
    <PageWrapper>
      <SignContainer>
        {/* Switch Panel (Changes sides) with Background Image */}
        <SwitchPanel $isLogin={isLogin}>
          <SwitchLogo src="/images/t_logo.png" alt="Logo" />
          <Group>
            <TextGroup>
              <SignContent $isLogin={isLogin}>
                <Container>
                  <h3>{isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}</h3>
                  <span>
                    {isLogin
                      ? "회원가입을 통해 서비스를 이용해보세요."
                      : "로그인하여 서비스를 이용해보세요."}
                  </span>
                </Container>
              </SignContent>
            </TextGroup>
            <Toggle $isLogin={isLogin}>
              <button onClick={toggleMode}>{isLogin ? "회원가입" : "로그인"}</button>
            </Toggle>
          </Group>
          <Ornaments />
        </SwitchPanel>

        {/* Form Panel */}
        <FormPanel>
          <FormLogo src="/images/t_logo.png" alt="Logo" />

          {/* Render only the active form */}
          <FormSignIn $isVisible={isLogin}>
            <LoginForm />
          </FormSignIn>
          <FormSignUp $isVisible={!isLogin}>
            <SignupForm key={isLogin ? 'reset' : 'active'} onSignupSuccess={() => setIsLogin(true)} />
          </FormSignUp>
        </FormPanel>
      </SignContainer>
    </PageWrapper>
  )
}
