import React, { useRef, useState} from 'react';
import styled from 'styled-components';

import profileImg from "../../assets/images/profile_img.png"
import google from "../../assets/images/ico_google.png"
import naver from "../../assets/images/ico_naver.png"
import kakao from "../../assets/images/ico_kakao.png"
import apple from "../../assets/images/ico_apple.png"

import InputModal from "../../components/Modal/InputModal.tsx";

interface userInfo {
    id: string
    username: string
    nickname: string
    phoneNumber: string
    profileImage: string
}

const Container = styled.div`
  width: 100%;
  min-height: 90vh;
  display: flex;
  flex-direction: column;
`;


const ContentWrapper = styled.section`
  width: 100%;
  min-height: 80vh;
  padding: 40px 0;
  display: flex;
  gap: 30px;
  align-items: center;
  justify-content: center;

  @media (max-width: 992px) {
    flex-direction: column;
    align-items: center;
  }
`;


const ProfileWrap = styled.div`
  display: flex;
  width: 100vh;
  height: 80%;
  gap: 40px;
  padding: 30px;
  border-radius: 10px;
  justify-content: center;
  align-items: stretch;
  
  

  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

// 기본 프로필 카드 섹션
const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  width: 250px;
  height: 300px;
  justify-content: center;
  gap: 20px;

  .img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
  }
`;

const ProfileInfo = styled.p`
  text-align: center;

  strong {
    display: block;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 5px;
  }

  span {
    color: #666;
    font-size: 14px;
  }
`;

// 선택 버튼 스타일 컴포넌트
const SelectButton = styled.button`
  display: inline-block;
  padding: 8px 18px;
  background: #f0f0f0;
  color: #333;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
  border: none;

  &:hover {
    background: #e0e0e0;
  }
`;

// 프로필 정보 섹션
const RightSection = styled.ul`
  display: flex;
  width: 500px;
  flex-direction: column;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  height: 300px;
  margin-top: 0;
  justify-content: center;
`;

// 프로필 정보 리스트
const ProfileInfoList = styled.ul`
  list-style: none;
  padding: 20px;
  margin: 0;
`;

// 프로필 정보 리스트 요소 스타일
const ProfileInfoItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }

  strong {
    font-size: 16px;
    font-weight: 600;
  }

  span {
    font-size: 14px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 20px;
  }
`;

// 계정 연동 아이콘 스타일
const AccountLinks = styled.div`
  display: flex;
  gap: 10px;

  img {
    height: 30px;
  }
`;

const ProfileCorrection: React.FC = () => {
    const [userInfo] = useState<userInfo>({
        id: "abcde12@gmail.com",
        username: "김수연",
        nickname: "김수연",
        phoneNumber: "010-0000-0000",
        profileImage: "../../assets/images/profile_img.png"
    })

    const [nickName, setNickName] = useState<string>(userInfo.nickname);
    const [phoneNumber, setPhoneNumber] = useState<string>(userInfo.phoneNumber);
    // 로컬 환경에서 url로만 이미지를 출력할 방법이 없어 import해서 사용
    const [profileImage, setProfileImage] = useState(profileImg);

    // 모달 오픈 state
    const [isNickNameModalOpen, setNickNameModalOpen] = useState<boolean>(false);
    const [isPhoneNumberModalOpen, setPhoneNumberModalOpen] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 사진 변경을 클릭했을 때 실행
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };


    return (
        <Container>

            <ContentWrapper>
                <ProfileWrap>
                    <LeftSection>
                        <span className="img">
                            <img src={ profileImage } alt="" />
                        </span>
                        <ProfileInfo>
                            <strong>{ userInfo.username }</strong>
                            <span>{ userInfo.id }</span>
                        </ProfileInfo>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            style={{ display: 'none' }}/>
                        <SelectButton onClick={() => fileInputRef.current?.click()}>사진 변경</SelectButton>
                    </LeftSection>
                    <RightSection>
                        <ProfileInfoList>
                            <ProfileInfoItem>
                                <strong>ID</strong>
                                <span>
                                    { userInfo.id }
                                </span>
                            </ProfileInfoItem>
                            <ProfileInfoItem>
                                <strong>닉네임</strong>
                                <span>
                                    { nickName }
                                    <SelectButton onClick={() => setNickNameModalOpen(true)}>변경</SelectButton>
                                </span>
                            </ProfileInfoItem>
                            <ProfileInfoItem>
                                <strong>전화번호</strong>
                                <span>
                                    { phoneNumber }
                                    <SelectButton onClick={() => setPhoneNumberModalOpen(true)}>변경</SelectButton>
                                </span>
                            </ProfileInfoItem>
                            <ProfileInfoItem>
                                <strong>계정 연동 현황</strong>
                                <AccountLinks>
                                    <img src={google} alt="Google" />
                                    <img src={naver} alt="Naver" />
                                    <img src={kakao} alt="Kakao" />
                                    <img src={apple} alt="Apple" />
                                </AccountLinks>
                            </ProfileInfoItem>
                        </ProfileInfoList>
                    </RightSection>

                </ProfileWrap>
            </ContentWrapper>

            <InputModal
                isOpen={isNickNameModalOpen}
                onClose={() => setNickNameModalOpen(false)}
                label="닉네임"
                onChange={setNickName}
            />

            <InputModal
                isOpen={isPhoneNumberModalOpen}
                onClose={() => setPhoneNumberModalOpen(false)}
                label="전화번호"
                onChange={setPhoneNumber}/>
        </Container>
    );
};

export default ProfileCorrection;
