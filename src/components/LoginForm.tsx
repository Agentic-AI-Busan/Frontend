"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import { loginUser, getUserProfile } from "../services/api"
import { useUser } from "../contexts/UserContext"

// Styled Components
const Holder = styled.div`
  width: 380px;
  padding: 40px 0;
  position: relative;
  
  /* 스크롤바 숨기기 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 12px;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
  padding-top: 12px;
`

const FormTitle = styled.h3`
  color: #3498db;
  font-weight: 700;
  margin: 0;
  font-size: 32px;
  text-align: center;
`

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 425px;
  align-items: center;
  justify-content: center;
`

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 16px;
  width: 100%;
`

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  color: #555;
  font-weight: 500;
`

const FormInput = styled.input<{ $error?: boolean }>`
  width: 100%;
  height: 50px;
  border-radius: 12px;
  border: 1.5px solid ${(props) => (props.$error ? "#e74c3c" : "#e1e1e1")};
  padding: 0 16px;
  font-size: 16px;
  background: ${(props) => (props.$error ? "#fff0f0" : "#f8f9fa")};
  transition: all 0.3s ease;
  box-sizing: border-box;
  
  &:focus {
    border: 1.5px solid ${(props) => (props.$error ? "#e74c3c" : "#BBDEFB")};
    outline: none;
    background: ${(props) => (props.$error ? "#fff0f0" : "#fff")};
    box-shadow: 0 0 0 3px ${(props) => (props.$error ? "rgba(231, 76, 60, 0.15)" : "rgba(66, 153, 225, 0.15)")};
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
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }
  
  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    background: #a0cfee;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`

export default function LoginForm() {
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
    rememberMe: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useUser()

  // Handle login form changes
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setLoginForm({
      ...loginForm,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await loginUser(loginForm.username, loginForm.password)
      if (success) {
        // 로그인 성공 시에만 아이디 저장 처리
        if (loginForm.rememberMe) {
          localStorage.setItem("savedUserId", loginForm.username)
        } else {
          localStorage.removeItem("savedUserId")
        }
        const profile = await getUserProfile()
        if (profile && profile.result) {
          setUser(profile.result)
          navigate("/")
        }
      } else {
        alert("로그인에 실패했습니다. 아이디/비밀번호를 확인하세요.")
      }
    } catch (error) {
      alert("로그인 중 오류가 발생했습니다.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // 컴포넌트 마운트 시 localStorage에서 아이디 불러오기
  useEffect(() => {
    const savedId = localStorage.getItem("savedUserId")
    if (savedId) {
      setLoginForm((prev) => ({ ...prev, username: savedId, rememberMe: true }))
    }
  }, [])

  return (
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
            value={loginForm.username}
            onChange={handleLoginChange}
            autoComplete="username"
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
            value={loginForm.password}
            onChange={handleLoginChange}
            autoComplete="current-password"
            required
          />
          <FormRow>
            <RememberMe>
              <input
                type="checkbox"
                id="remember"
                name="rememberMe"
                checked={loginForm.rememberMe}
                onChange={handleLoginChange}
              />
              아이디 저장
            </RememberMe>
            <ForgotLink href="/find-password">비밀번호 찾기</ForgotLink>
          </FormRow>
        </InputGroup>

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? "로그인 중..." : "로그인"}
        </SubmitButton>
      </StyledForm>
    </Holder>
  )
}
