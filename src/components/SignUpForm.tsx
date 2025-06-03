"use client"

import type React from "react"
import { useState, useEffect } from "react"
import styled, { keyframes } from "styled-components"
import { checkUsernameAvailability, signupUser } from "../services/api"

// Animations
const slideIn = keyframes`
  from {
    transform: translateX(50px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-50px);
    opacity: 0;
  }
`

// Styled Components
const Holder = styled.div`
  width: 380px;
  padding: 0 0 10px 0;
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
  margin-bottom: 0px;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
  padding-top: 0;
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
  // gap: 24px;
  height: 425px;
  align-items: center;
  justify-content: center;
  margin-top: 60px;
  
  .exiting {
    animation: ${slideOut} 0.4s ease-out forwards;
  }
  
  & > div {
    animation: ${slideIn} 0.4s ease-out;
    width: 100%;
  }
`

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 16px;
`

const InputLabel = styled.label`
  display: block;
  margin-left: 10px;
  margin-bottom: 12px;
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
  margin-bottom: 10px;
  
  &:focus {
    border: 1.5px solid ${(props) => (props.$error ? "#e74c3c" : "#BBDEFB")};
    outline: none;
    background: ${(props) => (props.$error ? "#fff0f0" : "#fff")};
    box-shadow: 0 0 0 3px ${(props) => (props.$error ? "rgba(231, 76, 60, 0.15)" : "rgba(66, 153, 225, 0.15)")};
  }
`

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 14px;
  margin-top: 6px;
  font-weight: 500;
`

const FormSelect = styled.select`
  width: 100%;
  height: 50px;
  border-radius: 12px;
  border: 1.5px solid #e1e1e1;
  padding: 0 16px;
  font-size: 16px;
  background: #f8f9fa;
  transition: all 0.3s ease;
  box-sizing: border-box;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23555' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
  
  &:focus {
    border: 1.5px solid #BBDEFB;
    outline: none;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
`

const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #555;
  cursor: pointer;
  
  input {
    margin-right: 8px;
    cursor: pointer;
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
  margin-top: 20px;
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

// Multi-step form components
const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin: 10px 0 20px 0;
`

const StepDot = styled.div<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => (props.$active ? "#3498db" : "#e1e1e1")};
  margin: 0 4px;
  transition: background-color 0.3s ease;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  align-items: center;
`

const BackButton = styled.button`
  width: 30%;
  height: 50px;
  border-radius: 12px;
  background: #f1f1f1;
  color: #555;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  margin-top: 20px;
  
  &:hover {
    background: #e1e1e1;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(1px);
  }
`

const NextButton = styled(SubmitButton)`
  width: 70%;
`

// 생년월일과 성별을 한 줄에 배치하기 위한 컨테이너
const BirthGenderRow = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  margin-bottom: 16px;
`

const BirthSection = styled.div`
  flex: 3;
`

const GenderSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 16px;
`

// 성별과 통신사를 한 줄에 배치하기 위한 컨테이너
const GenderCarrierRow = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  margin-bottom: 10px;
`

const CarrierSection = styled.div`
  flex: 1.5;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 3px;
`

// 생년월일 입력을 위한 컴포넌트
const BirthdayInputGroup = styled.div`
  display: flex;
  gap: 8px;
  
  input {
    text-align: center;
    padding: 0 4px;
  }
  
  span {
    display: flex;
    align-items: center;
    color: #555;
    font-size: 14px;
    margin: 0 2px;
  }
  
  input:nth-child(1) {
    width: 40%;
  }
  
  input:nth-child(3), input:nth-child(5) {
    width: 20%;
  }
`

// 전화번호 입력을 위한 컴포넌트
const PhoneInputGroup = styled.div`
  display: flex;
  gap: 8px;
  
  select {
    width: 30%;
  }
  
  input {
    width: 70%;
  }
`

// 약관 동의를 위한 컴포넌트
const AgreementGroup = styled.div`
  margin-bottom: 16px;
`

const AgreementTitle = styled.h4`
  font-size: 18px;
  color: #333;
  margin-bottom: 16px;
  font-weight: 600;
`

const AgreementItem = styled.div`
  margin-bottom: 12px;
`

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  font-size: 15px;
  color: #555;
  cursor: pointer;
  
  input {
    margin-right: 10px;
    margin-top: 3px;
    cursor: pointer;
  }
`

const AgreementText = styled.span`
  flex: 1;
`

const ViewTermsButton = styled.button`
  background: none;
  border: none;
  color: #3498db;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  text-decoration: underline;
  
  &:hover {
    color: #2980b9;
  }
`

const AllAgreementItem = styled(AgreementItem)`
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
`

const AllCheckboxLabel = styled(CheckboxLabel)`
  font-weight: 600;
  font-size: 16px;
  color: #333;
`

const SuccessMessage = styled.div`
  color: #27ae60;
  font-size: 14px;
  margin-top: 6px;
  font-weight: 500;
`

const PasswordMessage = styled.div`
  font-size: 14px;
  margin-top: 6px;
  font-weight: 500;
`

interface SignupFormProps {
  onSignupSuccess: () => void;
}

export default function SignupForm({ onSignupSuccess }: SignupFormProps) {
  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    gender: "",
    phoneService: "",
    phonePrefix: "010",
    phoneNumberRest: "",
    termsOfService: false,
    privacyPolicy: false,
    marketingAgreement: false,
    profileImage: "",
  })

  // UI state
  const [signupStep, setSignupStep] = useState(1)
  const [isExiting, setIsExiting] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [isUsernameVerified, setIsUsernameVerified] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [isPasswordMatch, setIsPasswordMatch] = useState(false)

  // Handle signup form changes
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement

    // 아이디 필드가 변경되면 검증 상태 초기화
    if (name === "email") {
      setIsUsernameVerified(false)
      setUsernameError("")
    }

    setSignupForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // 아이디 중복 확인 처리
  const handleCheckUsername = async (e: React.FormEvent) => {
    e.preventDefault()

    // 영문 소문자+숫자(4~16자) 또는 이메일 형식 허용
    const idRegex = /^([a-z0-9]{4,16}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})$/
    if (!idRegex.test(signupForm.email)) {
      setUsernameError("영문 소문자+숫자(4~16자) 또는 이메일 형식만 입력 가능합니다.")
      return
    }

    setIsCheckingUsername(true)

    try {
      const isAvailable = await checkUsernameAvailability(signupForm.email)

      if (!isAvailable) {
        setIsUsernameVerified(true)
        setUsernameError("")
      } else {
        setIsUsernameVerified(false)
        setUsernameError("이미 존재하는 아이디입니다.")
      }
    } finally {
      setIsCheckingUsername(false)
    }
  }

  // 모든 약관에 동의 체크박스 처리
  const handleAllAgreements = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target
    setSignupForm((prev) => ({
      ...prev,
      termsOfService: checked,
      privacyPolicy: checked,
      marketingAgreement: checked,
    }))
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()

    // 1단계 유효성 검사
    if (signupStep === 1) {
      if (!signupForm.email) {
        setUsernameError("아이디를 입력해주세요.")
        return
      }

      if (!isUsernameVerified) {
        setUsernameError("아이디 중복 확인이 필요합니다.")
        return
      }
    }

    // 2단계 유효성 검사
    if (signupStep === 2) {
      if (!signupForm.password) {
        alert("비밀번호를 입력해주세요.")
        return
      }
      if (signupForm.password !== signupForm.confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.")
        return
      }
    }

    // 3단계 유효성 검사
    if (signupStep === 3) {
      if (!signupForm.name) {
        alert("이름을 입력해주세요.")
        return
      }
      if (!signupForm.birthYear || !signupForm.birthMonth || !signupForm.birthDay) {
        alert("생년월일을 모두 입력해주세요.")
        return
      }
      if (!signupForm.gender) {
        alert("성별을 선택해주세요.")
        return
      }
      if (!signupForm.phoneService) {
        alert("통신사를 선택해주세요.")
        return
      }
      if (!signupForm.phoneNumberRest) {
        alert("전화번호를 입력해주세요.")
        return
      }
    }

    setIsExiting(true)

    // Delay to allow animation to complete
    setTimeout(() => {
      setSignupStep((prev) => prev + 1)
      setIsExiting(false)
    }, 300)
  }

  const handlePrevStep = () => {
    setIsExiting(true)

    // Delay to allow animation to complete
    setTimeout(() => {
      setSignupStep((prev) => prev - 1)
      setIsExiting(false)
    }, 300)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!signupForm.termsOfService) {
      alert("서비스 이용 약관에 동의해주세요.")
      return
    }
    if (!signupForm.privacyPolicy) {
      alert("개인정보 처리 방침에 동의해주세요.")
      return
    }

    // YYYY-MM-DD로 합치기
    const birthDate = `${signupForm.birthYear}-${signupForm.birthMonth.padStart(2, "0")}-${signupForm.birthDay.padStart(2, "0")}`
    // 전화번호 합치기
    const phoneNumber = `${signupForm.phonePrefix}-${signupForm.phoneNumberRest.slice(0, 4)}-${signupForm.phoneNumberRest.slice(4)}`

    const signupData = {
      email: signupForm.email,
      password: signupForm.password,
      name: signupForm.name,
      birthDate,
      gender: signupForm.gender,
      phoneService: signupForm.phoneService,
      phoneNumber,
      profileImage: signupForm.profileImage || "",
      termsOfService: signupForm.termsOfService,
      privacyPolicy: signupForm.privacyPolicy,
      marketingAgreement: signupForm.marketingAgreement,
    }

    // 실제 회원가입 API 호출 대신 콘솔 출력
    const result = await signupUser(signupData)
    if (result) {
        alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.")
        onSignupSuccess()
    } else {
        alert("회원가입에 실패했습니다. 다시 시도해주세요.")
    }
  }

  // 약관 보기 버튼 클릭 핸들러
  const handleViewTerms = (type: string) => {
    // 약관 보기 기능 구현
    alert(`${type} 약관 내용을 보여줍니다.`)
  }

  // 비밀번호, 비밀번호 확인 실시간 검증
  useEffect(() => {
    if (!signupForm.confirmPassword) {
      setPasswordError("")
      setIsPasswordMatch(false)
      return
    }
    if (signupForm.password === signupForm.confirmPassword) {
      setPasswordError("")
      setIsPasswordMatch(true)
    } else {
      setPasswordError("비밀번호가 일치하지 않습니다.")
      setIsPasswordMatch(false)
    }
  }, [signupForm.password, signupForm.confirmPassword])

  // 이름 입력: 숫자 입력 방지
  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣\s]/g, "")
    setSignupForm((prev) => ({
      ...prev,
      name: value,
    }))
  }

  // 생년월일 입력: 숫자만 허용
  const handleBirthInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const onlyNum = value.replace(/[^0-9]/g, "")
    setSignupForm((prev) => ({
      ...prev,
      [name]: onlyNum,
    }))
  }

  // 전화번호 입력: 0000-0000 자동 하이픈 (상태에는 숫자만 저장)
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "")
    if (value.length > 8) value = value.slice(0, 8)
    setSignupForm((prev) => ({
      ...prev,
      phoneNumberRest: value,
    }))
  }

  // 입력란에 하이픈 포함해서 보여주기
  const formatPhoneNumber = (value: string) => {
    if (value.length <= 4) return value
    return value.slice(0, 4) + "-" + value.slice(4)
  }

  return (
    <Holder>
      <FormHeader>
        <FormTitle>회원가입</FormTitle>
        <StepIndicator>
          <StepDot $active={signupStep === 1} />
          <StepDot $active={signupStep === 2} />
          <StepDot $active={signupStep === 3} />
          <StepDot $active={signupStep === 4} />
        </StepIndicator>
      </FormHeader>
      <StyledForm
        onSubmit={(e) => {
          if (signupStep === 4) {
            handleSignup(e)
          } else if (signupStep === 1 && !isUsernameVerified) {
            handleCheckUsername(e)
          } else {
            handleNextStep(e)
          }
        }}
      >
        {/* Step 1: Username */}
        {signupStep === 1 && (
          <div className={isExiting ? "exiting" : ""}>
            <InputGroup>
              <InputLabel htmlFor="signupUserId">아이디</InputLabel>
              <FormInput
                type="text"
                id="signupUserId"
                name="email"
                placeholder="영문 소문자+숫자(4~16자) 또는 이메일"
                value={signupForm.email}
                onChange={handleSignupChange}
                autoComplete="username"
                required
                $error={!!usernameError}
                style={isUsernameVerified ? { border: "1.5px solid #27ae60", background: "#f0fff4" } : {}}
                pattern="([a-z0-9]{4,16}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})"
              />
              {usernameError && <ErrorMessage>{usernameError}</ErrorMessage>}
              {isUsernameVerified && !usernameError && <SuccessMessage>사용 가능한 아이디입니다.</SuccessMessage>}
            </InputGroup>

            <SubmitButton type="submit" disabled={isCheckingUsername}>
              {isCheckingUsername ? "확인 중..." : isUsernameVerified ? "다음" : "중복 확인"}
            </SubmitButton>
          </div>
        )}

        {/* Step 2: Password */}
        {signupStep === 2 && (
          <div className={isExiting ? "exiting" : ""}>
            <InputGroup>
              <InputLabel htmlFor="signupPassword">비밀번호</InputLabel>
              <FormInput
                type="password"
                id="signupPassword"
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={signupForm.password}
                onChange={handleSignupChange}
                autoComplete="new-password"
                required
              />
            </InputGroup>

            <InputGroup style={{ marginBottom: 0 }}>
              <InputLabel htmlFor="confirmPassword">비밀번호 확인</InputLabel>
              <FormInput
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="비밀번호를 다시 입력하세요"
                value={signupForm.confirmPassword}
                onChange={handleSignupChange}
                autoComplete="new-password"
                required
                $error={!!passwordError}
                style={isPasswordMatch ? { border: "1.5px solid #27ae60", background: "#f0fff4" } : {}}
              />
              {passwordError && <PasswordMessage style={{ color: "#e74c3c" }}>{passwordError}</PasswordMessage>}
              {isPasswordMatch && !passwordError && (
                <PasswordMessage style={{ color: "#27ae60" }}>비밀번호가 일치합니다.</PasswordMessage>
              )}
            </InputGroup>

            <ButtonGroup>
              <BackButton type="button" onClick={handlePrevStep}>
                이전
              </BackButton>
              <NextButton type="submit">다음</NextButton>
            </ButtonGroup>
          </div>
        )}

        {/* Step 3: Personal Information */}
        {signupStep === 3 && (
          <div className={isExiting ? "exiting" : ""}>
            <InputGroup>
              <InputLabel htmlFor="name">이름</InputLabel>
              <FormInput
                type="text"
                id="name"
                name="name"
                placeholder="이름을 입력하세요"
                value={signupForm.name}
                onChange={handleNameInput}
                required
              />
            </InputGroup>

            <BirthGenderRow>
              <BirthSection>
                <InputLabel>생년월일</InputLabel>
                <BirthdayInputGroup>
                  <FormInput
                    type="text"
                    name="birthYear"
                    placeholder="출생년도"
                    maxLength={4}
                    value={signupForm.birthYear}
                    onChange={handleBirthInput}
                    required
                  />
                  <span>-</span>
                  <FormInput
                    type="text"
                    name="birthMonth"
                    placeholder="월"
                    maxLength={2}
                    value={signupForm.birthMonth}
                    onChange={handleBirthInput}
                    required
                  />
                  <span>-</span>
                  <FormInput
                    type="text"
                    name="birthDay"
                    placeholder="일"
                    maxLength={2}
                    value={signupForm.birthDay}
                    onChange={handleBirthInput}
                    required
                  />
                </BirthdayInputGroup>
              </BirthSection>
              <GenderSection>
                <InputLabel>성별</InputLabel>
                <RadioGroup>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="gender"
                      value="MALE"
                      checked={signupForm.gender === "MALE"}
                      onChange={handleSignupChange}
                      required
                    />
                    남성
                  </RadioLabel>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="gender"
                      value="FEMALE"
                      checked={signupForm.gender === "FEMALE"}
                      onChange={handleSignupChange}
                      required
                    />
                    여성
                  </RadioLabel>
                </RadioGroup>
              </GenderSection>
            </BirthGenderRow>

            <GenderCarrierRow>
              <CarrierSection>
                <InputLabel>통신사</InputLabel>
                <FormSelect name="phoneService" value={signupForm.phoneService} onChange={handleSignupChange} required>
                  <option value="">선택</option>
                  <option value="SKT">SKT</option>
                  <option value="KT">KT</option>
                  <option value="LGT">LG U+</option>
                  <option value="알뜰폰">알뜰폰</option>
                </FormSelect>
              </CarrierSection>
            </GenderCarrierRow>

            <InputGroup style={{ marginBottom: 0 }}>
              <InputLabel htmlFor="phoneNumber">전화번호</InputLabel>
              <PhoneInputGroup>
                <FormSelect
                  name="phonePrefix"
                  value={signupForm.phonePrefix}
                  onChange={handleSignupChange}
                  style={{ width: "30%" }}
                >
                  <option value="010">010</option>
                  <option value="011">011</option>
                  <option value="016">016</option>
                  <option value="017">017</option>
                  <option value="018">018</option>
                  <option value="019">019</option>
                </FormSelect>
                <FormInput
                  type="text"
                  id="phoneNumberRest"
                  name="phoneNumberRest"
                  placeholder="나머지 번호 입력"
                  maxLength={9}
                  value={formatPhoneNumber(signupForm.phoneNumberRest)}
                  onChange={handlePhoneInput}
                  required
                  style={{ width: "70%" }}
                />
              </PhoneInputGroup>
            </InputGroup>

            <ButtonGroup>
              <BackButton type="button" onClick={handlePrevStep}>
                이전
              </BackButton>
              <NextButton type="submit">다음</NextButton>
            </ButtonGroup>
          </div>
        )}

        {/* Step 4: Terms and Agreements */}
        {signupStep === 4 && (
          <div className={isExiting ? "exiting" : ""}>
            <AgreementGroup>
              <AgreementTitle>약관 동의</AgreementTitle>

              <AllAgreementItem>
                <AllCheckboxLabel>
                  <input
                    type="checkbox"
                    id="allAgreements"
                    checked={signupForm.termsOfService && signupForm.privacyPolicy && signupForm.marketingAgreement}
                    onChange={handleAllAgreements}
                  />
                  <AgreementText>모든 약관에 동의합니다</AgreementText>
                </AllCheckboxLabel>
              </AllAgreementItem>

              <AgreementItem>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    id="termsOfService"
                    name="termsOfService"
                    checked={signupForm.termsOfService}
                    onChange={handleSignupChange}
                    required
                  />
                  <AgreementText>
                    서비스 이용 약관 동의 (필수)
                    <ViewTermsButton type="button" onClick={() => handleViewTerms("서비스 이용 약관")}>
                      보기
                    </ViewTermsButton>
                  </AgreementText>
                </CheckboxLabel>
              </AgreementItem>

              <AgreementItem>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    id="privacyPolicy"
                    name="privacyPolicy"
                    checked={signupForm.privacyPolicy}
                    onChange={handleSignupChange}
                    required
                  />
                  <AgreementText>
                    개인정보 처리 방침 동의 (필수)
                    <ViewTermsButton type="button" onClick={() => handleViewTerms("개인정보 처리 방침")}>
                      보기
                    </ViewTermsButton>
                  </AgreementText>
                </CheckboxLabel>
              </AgreementItem>

              <AgreementItem>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    id="marketingAgreement"
                    name="marketingAgreement"
                    checked={signupForm.marketingAgreement}
                    onChange={handleSignupChange}
                  />
                  <AgreementText>
                    마케팅 정보 수신 동의 (선택)
                    <ViewTermsButton type="button" onClick={() => handleViewTerms("마케팅 정보 수신")}>
                      보기
                    </ViewTermsButton>
                  </AgreementText>
                </CheckboxLabel>
              </AgreementItem>
            </AgreementGroup>

            <ButtonGroup>
              <BackButton type="button" onClick={handlePrevStep}>
                이전
              </BackButton>
              <NextButton type="submit">회원가입</NextButton>
            </ButtonGroup>
          </div>
        )}
      </StyledForm>
    </Holder>
  )
}
