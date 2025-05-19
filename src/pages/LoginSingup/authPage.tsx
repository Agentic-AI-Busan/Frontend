import type React from "react"
import { useState, useRef } from "react"
import styled, { keyframes } from "styled-components"
import { useNavigate } from "react-router-dom"
import { loginUser, getUserProfile } from "../../services/api"
import { useUser } from "../../contexts/UserContext"

import mainImage from "../../assets/images/main_image.png"

// Background animations
const floatCircle = keyframes`
  0% {
    transform: scale(1) translateY(0em);
  }
  30% {
    transform: scale(1.2) translateY(4em);
  }
  40% {
    transform: scale(1) translateY(2em);
  }
  40% {
    transform: scale(1.4) translateY(6em);
  }
  40% {
    transform: scale(1.2) translateY(4em);
  }
  100% {
    transform: scale(1) translateY(0em);
  }
`

const rotateTriangle = keyframes`
  0% {
    transform: rotate(-100deg) translateX(0em);
  }
  30% {
    transform: rotate(-110deg) translateX(4em);
  }
  40% {
    transform: rotate(-110deg) translateX(2em);
  }
  40% {
    transform: rotate(-110deg) translateX(6em);
  }
  40% {
    transform: rotate(-110deg) translateX(4em);
  }
  100% {
    transform: rotate(-100deg) translateX(0em);
  }
`

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
  min-height: 100vh;
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
  height: 600px;
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

const SwitchPanel = styled.div<{ isLogin: boolean }>`
  position: absolute;
  width: inherit;
  height: inherit;
  z-index: 100;
  clip-path: ${(props) =>
    props.isLogin ? "inset(0px 0px 0px 550px)" : "inset(0px 550px 0px 0px)"};
  background: url(${mainImage}) center/cover no-repeat;
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
    clip-path: ${(props) =>
      props.isLogin ? "inset(0px 0px 0px 100% round 16px)" : "inset(0px 100% 0px 0px round 16px)"};
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

const SignContent = styled.div<{ isLogin: boolean }>`
  display: grid;
  padding: 0em 3em;
  box-sizing: border-box;
  max-width: 350px;
  height: inherit;
  float: ${(props) => (props.isLogin ? "right" : "none")};
  animation: ${(props) => (props.isLogin ? fadeX : fadeY)} 0.6s ease-out;
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
    font-size: 28px;
    text-align: center;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  span {
    color: white;
    line-height: 1.7;
    letter-spacing: 0.02em;
    font-weight: 300;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
`

const Toggle = styled.div<{ isLogin: boolean }>`
  width: 350px;
  text-align: center;
  transform: translateX(${(props) => (props.isLogin ? "550px" : "0px")});
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
    transform: translateX(${(props) => (props.isLogin ? "100%" : "0px")});
  }
`

const Ornaments = styled.div`
  pointer-events: none;
  z-index: 1;
  
  .circle {
    position: absolute;
    left: -180px;
    bottom: -160px;
    z-index: -2;
  }
  
  .triangle {
    position: absolute;
    right: -180px;
    top: -160px;
    z-index: -2;
  }
  
  .group {
    transition: transform 1s;
    
    polygon:nth-child(odd) {
      animation: ${rotateTriangle} 25s ease-in-out infinite;
    }
    
    polygon:nth-child(even) {
      animation: ${rotateTriangle} 14s ease-in-out infinite;
    }
  }
`

const FormPanel = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
`

const FormLogo = styled.img`
  max-width: 30px;
  position: absolute;
  margin: 1.5em;
`

const FormSignIn = styled.div<{ isVisible: boolean }>`
  width: 550px;
  position: absolute;
  height: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: inset(0px 0px 0px 0px round 16px);
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  pointer-events: ${(props) => (props.isVisible ? "auto" : "none")};
  transition: opacity 0.3s ease;
  
  @media (max-width: 700px) {
    width: 100%;
  }
`

const FormSignUp = styled.div<{ isVisible: boolean }>`
  width: 550px;
  position: absolute;
  height: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  right: 0px;
  clip-path: inset(0px 0px 0px 0px round 16px);
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  pointer-events: ${(props) => (props.isVisible ? "auto" : "none")};
  transition: opacity 0.3s ease;
  
  @media (max-width: 700px) {
    width: 100%;
  }
`

const Holder = styled.div`
  width: 380px;
  padding: 40px 0;
`

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`

const FormTitle = styled.h3`
  color: #3498db;
  font-weight: 700;
  margin: 0 0 12px 0;
  font-size: 28px;
  text-align: center;
`

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const InputGroup = styled.div`
  position: relative;
`

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
  font-weight: 500;
`

const FormInput = styled.input`
  width: 100%;
  height: 50px;
  border-radius: 12px;
  border: 1.5px solid #e1e1e1;
  padding: 0 16px;
  font-size: 16px;
  background: #f8f9fa;
  transition: all 0.3s ease;
  
  &:focus {
    border: 1.5px solid #BBDEFB;
    outline: none;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
`

const FormRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
`

const RememberMe = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  
  input {
    margin-right: 8px;
    cursor: pointer;
  }
`

const ForgotLink = styled.a`
  color: #3498db;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: #2980b9;
    text-decoration: underline;
  }
`

const SubmitButton = styled.button`
  width: 100%;
  height: 50px;
  border-radius: 12px;
  background: #3498db;
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  margin-top: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #2980b9;
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }
  
  &:active {
    transform: translateY(1px);
  }
`

const FormFooter = styled.div`
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
  
  a {
    color: #3498db;
    text-decoration: none;
    margin-left: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s ease;
    
    &:hover {
      color: #2980b9;
      text-decoration: underline;
    }
  }
`

// Background elements
const CircleBg = styled.svg`
  position: absolute;
  left: -180px;
  bottom: -160px;
  z-index: -2;
  animation: ${floatCircle} 55s infinite;
`

const TriangleBg = styled.svg`
  position: absolute;
  right: -180px;
  top: -160px;
  z-index: -2;
  animation: ${rotateTriangle} 24s infinite;
`

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const { setUser } = useUser()
  const navigate = useNavigate()
  const loginIdRef = useRef<HTMLInputElement>(null)
  const loginPwRef = useRef<HTMLInputElement>(null)
  const signupIdRef = useRef<HTMLInputElement>(null)
  const signupPwRef = useRef<HTMLInputElement>(null)
  const confirmPwRef = useRef<HTMLInputElement>(null)

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = loginIdRef.current?.value || ""
    const password = loginPwRef.current?.value || ""
    const success = await loginUser(email, password)
    if (success) {
      const profile = await getUserProfile()
      if (profile && profile.result) {
        setUser(profile.result)
        navigate("/")
      }
    } else {
      alert("로그인에 실패했습니다. 아이디/비밀번호를 확인하세요.")
    }
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    const username = signupIdRef.current?.value || ""
    const password = signupPwRef.current?.value || ""
    const confirmPassword = confirmPwRef.current?.value || ""

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.")
      return
    }

    // Implement your signup logic here
    console.log("Signup submitted", { username, password })

    // After successful signup, switch to login
    setIsLogin(true)
  }

  return (
    <PageWrapper>
      <SignContainer>
        {/* 스위치 패널 */}
        <SwitchPanel isLogin={isLogin}>
          <SwitchLogo src="/images/t_logo.png" alt="Logo" />
          <Group>
            <TextGroup>
              {isLogin ? (
                // Signup Info
                <SignContent isLogin={true}>
                  <Container>
                    <h3>계정이 없으신가요?</h3>
                    <span>회원가입을 통해 서비스를 이용해보세요.</span>
                    <br />
                  </Container>
                </SignContent>
              ) : (
                // Login Info
                <SignContent isLogin={false}>
                  <Container>
                    <h3>이미 계정이 있으신가요?</h3>
                    <span>로그인하여 서비스를 이용해보세요.</span>
                    <br />
                  </Container>
                </SignContent>
              )}
            </TextGroup>
            <Toggle isLogin={isLogin}>
              <button onClick={toggleMode}>{isLogin ? "회원가입" : "로그인"}</button>
            </Toggle>
          </Group>
          <Ornaments>
            <svg className="circle" height="300" width="300">
              <circle cx="150" cy="150" r="150" fill="#ffffff2b" />
            </svg>
            <svg className="triangle" height="400" width="400">
              <polygon points="200,0 000,400 400,400" fill="#ffffff2b" />
            </svg>
            <svg className="group" width="900" height="600">
              <polygon points="749 571,682 497,779 476" fill="#ffffff2b" />
              <polygon points="884 329,872 349,845 335,862 307" fill="#ffffff2b" />
              <polygon points="590 209,633 223,622 242,587 233" fill="#ffffff2b" />
              <polygon points="252 60,237 84,210 72,226 49" fill="#ffffff2b" />
              <polygon points="222 445,269 482,254 497,203 460" fill="#ffffff2b" />
              <polygon points="385 349,278 369,312 282" fill="#ffffff2b" />
            </svg>
          </Ornaments>
        </SwitchPanel>

        {/* 입력 필드 */}
        <FormPanel>
          <FormLogo src="/images/t_logo.png" alt="Logo" />

          {/* 로그인 */}
          <FormSignIn isVisible={isLogin}>
            <Holder>
              <FormHeader>
                <FormTitle>로그인</FormTitle>
              </FormHeader>

              <StyledForm onSubmit={handleLogin}>
                <InputGroup>
                  <InputLabel htmlFor="userId">아이디</InputLabel>
                  <FormInput
                    type="text"
                    id="userId"
                    name="username"
                    placeholder="아이디를 입력하세요"
                    ref={loginIdRef}
                    autoComplete="username"
                    pattern="[A-Za-z]*"
                    title="영어만 입력 가능합니다"
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <InputLabel htmlFor="password">비밀번호</InputLabel>
                  <FormInput
                    type="password"
                    id="password"
                    name="password"
                    placeholder="비밀번호를 입력하세요"
                    ref={loginPwRef}
                    autoComplete="current-password"
                    required
                  />
                  <FormRow>
                    <RememberMe>
                      <input type="checkbox" id="remember" />
                      아이디 저장
                    </RememberMe>
                    <ForgotLink href="/find-password">비밀번호 찾기</ForgotLink>
                  </FormRow>
                </InputGroup>

                <SubmitButton type="submit">로그인</SubmitButton>

                <FormFooter>
                  계정이 없으신가요?
                  <a onClick={toggleMode}>회원가입</a>
                </FormFooter>
              </StyledForm>
            </Holder>
          </FormSignIn>

          {/* 회원가입 */}
          <FormSignUp isVisible={!isLogin}>
            <Holder>
              <FormHeader>
                <FormTitle>회원가입</FormTitle>
              </FormHeader>

              <StyledForm onSubmit={handleSignup}>
                <InputGroup>
                  <InputLabel htmlFor="signupUserId">아이디</InputLabel>
                  <FormInput
                    type="text"
                    id="signupUserId"
                    name="username"
                    placeholder="아이디를 입력하세요"
                    ref={signupIdRef}
                    autoComplete="username"
                    pattern="[A-Za-z]*"
                    title="영어만 입력 가능합니다"
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <InputLabel htmlFor="signupPassword">비밀번호</InputLabel>
                  <FormInput
                    type="password"
                    id="signupPassword"
                    name="password"
                    placeholder="비밀번호를 입력하세요"
                    ref={signupPwRef}
                    autoComplete="new-password"
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <InputLabel htmlFor="confirmPassword">비밀번호 확인</InputLabel>
                  <FormInput
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="비밀번호를 다시 입력하세요"
                    ref={confirmPwRef}
                    autoComplete="new-password"
                    required
                  />
                </InputGroup>

                <SubmitButton type="submit">회원가입</SubmitButton>

                <FormFooter>
                  이미 계정이 있으신가요?
                  <a onClick={toggleMode}>로그인</a>
                </FormFooter>
              </StyledForm>
            </Holder>
          </FormSignUp>
        </FormPanel>
      </SignContainer>

      {/* 배경 애니메이션 */}
      <CircleBg height="300" width="300">
        <circle cx="150" cy="150" r="150" fill="#fbd348" />
      </CircleBg>
      <TriangleBg height="400" width="400">
        <polygon points="200,0 000,400 400,400" fill="#e35e6a" />
      </TriangleBg>
    </PageWrapper>
  )
}

export default AuthPage
