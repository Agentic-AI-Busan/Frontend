import { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { authenticatedFetch } from "../../services/api";
import flatpickr from 'flatpickr';
import { Korean } from 'flatpickr/dist/l10n/ko';
import 'flatpickr/dist/flatpickr.min.css';
import CheckModal from "../../components/Modal/CheckModal";
import bannerImg from "../../assets/images/profile_bg_image.jpg";
import defaultProfileImg from "../../assets/images/profile_img.png";

// Styled Components
const Container = styled.div`
margin: 0 auto;
padding: 32px 20px;
font-family: 'Pretendard', sans-serif;
color: #1a1a1a;
background-color: #f8f9fa;
min-height: 90vh;
display: flex;
align-items: center;
justify-content: center;
`

const MainContent = styled.main`
width: 100%;
max-width: 680px;
background-color: white;
border-radius: 20px;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
overflow: hidden;
`

const ProfileHeader = styled.div`
position: relative;
background: linear-gradient(135deg, #f8fafc, #f1f5f9);
`

const ProfileBanner = styled.img`
width: 100%;
height: 160px;
object-fit: cover;
opacity: 0.9;
`

const ProfileInfoContainer = styled.div`
padding: 0 28px 28px;
position: relative;
display: flex;
flex-direction: column;
align-items: flex-start;
`

const ProfileImageLarge = styled.img`
width: 100px;
height: 100px;
border-radius: 16px;
object-fit: cover;
border: 4px solid white;
position: absolute;
top: -50px;
background-color: white;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`

const ProfileActions = styled.div`
display: flex;
gap: 8px;
margin-left: 120px;
margin-top: 12px;
`

const ActionButton = styled.button<{ secondary?: boolean }>`
background: ${(props) => (props.secondary ? "transparent" : "#f8fafc")};
color: ${(props) => (props.secondary ? "#64748b" : "#475569")};
border: 1px solid ${(props) => (props.secondary ? "#e2e8f0" : "transparent")};
padding: 6px 12px;
border-radius: 6px;
font-size: 13px;
font-weight: 500;
cursor: pointer;
transition: all 0.2s;

&:hover {
background-color: ${(props) => (props.secondary ? "#f1f5f9" : "#f8fafc")};
}
`

const ProfileDetails = styled.div`
margin-top: 24px;
width: 100%;
`

const ProfileName = styled.h1`
font-size: 24px;
font-weight: 700;
margin: 0 0 6px 0;
color: #1a1a1a;
`

const ProfileStats = styled.div`
display: flex;
align-items: center;
gap: 16px;
margin-top: 8px;
`

const StatItem = styled.div`
display: flex;
align-items: center;
gap: 6px;
color: #64748b;
font-size: 14px;
`

const StatValue = styled.span`
color: #1a1a1a;
font-weight: 500;
`
const ProfileFields = styled.div`
padding: 0 28px 15px;
`

const ProfileField = styled.div`
display: grid;
grid-template-columns: 160px 1fr 70px;
align-items: center;
padding: 16px 0;
border-bottom: 1px solid #f1f5f9;

&:last-child {
border-bottom: none;
}

@media (max-width: 768px) {
grid-template-columns: 1fr;
gap: 10px;
}
`

const FieldLabel = styled.div`
font-size: 15px;
font-weight: 500;
color: #4b5563;
`

const FieldValue = styled.div`
font-size: 15px;
color: #1a1a1a;
`

const EditButton = styled.button`
background: none;
border: none;
color: #64748b;
font-size: 14px;
font-weight: 500;
cursor: pointer;
justify-self: end;
padding: 8px 16px;
border-radius: 6px;
transition: all 0.2s;

&:hover {
background-color: #f8fafc;
color: #475569;
}

&:disabled {
color: #cbd5e1;
cursor: not-allowed;
&:hover {
background-color: transparent;
}
}
`

const EditInput = styled.input`
width: 100%;
padding: 10px 14px;
border: 1px solid #e2e8f0;
border-radius: 8px;
font-size: 15px;
outline: none;
transition: all 0.2s;
background-color: #f8fafc;

&:focus {
border-color: #cbd5e1;
box-shadow: 0 0 0 3px rgba(203, 213, 225, 0.1);
background-color: white;
}
`

const SelectInput = styled.select`
width: 100%;
padding: 10px 14px;
border: 1px solid #e2e8f0;
border-radius: 8px;
font-size: 15px;
outline: none;
background-color: #f8fafc;
transition: all 0.2s;

&:focus {
border-color: #cbd5e1;
box-shadow: 0 0 0 3px rgba(203, 213, 225, 0.1);
background-color: white;
}
`


const MyPage: React.FC = () => {
  const [totalPlan, setTotalPlan] = useState(0);
  const [user, setUser] = useState({
    name: "김수연",
    email: "abcde12@gmail.com",
    nickname: "김수연",
    gender: "여성",
    birthday: "1990-01-01",
    phone: "010-1234-5678",
    profileImage: defaultProfileImg,
  })

  const birthdayRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState({
    name: false,
    nickname: false,
    gender: false,
    birthday: false,
    phone: false,
  })

  const [editValues, setEditValues] = useState({
    name: user.name,
    nickname: user.nickname,
    gender: user.gender,
    birthday: user.birthday,
    phone: user.phone,
  })

  const [phoneError, setPhoneError] = useState(false);

  const handleEditChange = (field: string, value: string) => {
    if (field === "birthday") {
      setEditValues((prev) => ({
        ...prev,
        birthday: value,
      }));
      setUser((prev) => ({
        ...prev,
        birthday: value,
      }));
      setIsEditing((prev) => ({
        ...prev,
        birthday: false,
      }));
      alert("수정되었습니다.");
      return;
    }
    setEditValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (field === "phone") {
      setPhoneError(!/^\d{3}-\d{4}-\d{4}$/.test(value));
    }
  }

  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prev) => ({
          ...prev,
          profileImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  useEffect(() => {
    if (isEditing.birthday && birthdayRef.current) {
      flatpickr(birthdayRef.current, {
        locale: Korean,
        dateFormat: "Y-m-d",
        maxDate: "today",
        defaultDate: editValues.birthday,
        onChange: (selectedDates) => {
          if (selectedDates[0]) {
            const year = selectedDates[0].getFullYear();
            const month = String(selectedDates[0].getMonth() + 1).padStart(2, '0');
            const day = String(selectedDates[0].getDate()).padStart(2, '0');
            handleEditChange("birthday", `${year}-${month}-${day}`);
          }
        }
      });
    }
  }, [isEditing.birthday]);

  useEffect(() => {
    const fetchTotalPlan = async () => {
      try {
        const response = await authenticatedFetch(`/api/user/total-plan`, { method: 'GET' });
        const data = await response.json();
        if (data.isSuccess && data.result) {
          setTotalPlan(data.result.totalElements);
        }
      } catch (error) {
        console.error('Total plan fetch error:', error);
      }
    }
    fetchTotalPlan();
  }, []);

  const handleSave = (field: string) => {
    if (field === "birthday") {
      setIsEditing((prev) => ({
        ...prev,
        birthday: false,
      }));
      return;
    }
    if (field === "phone" && !/^\d{3}-\d{4}-\d{4}$/.test(editValues.phone)) {
      setPhoneError(true);
      return;
    }
    setUser((prev) => ({
      ...prev,
      [field]: editValues[field as keyof typeof editValues],
    }));
    setIsEditing((prev) => ({
      ...prev,
      [field]: false,
    }));
    if (field === "phone") setPhoneError(false);
    alert("수정되었습니다.");
  }

  const toggleEdit = (field: string) => {
    setIsEditing((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof isEditing],
    }))
    // Reset edit value to current user value when toggling edit mode
    setEditValues((prev) => ({
      ...prev,
      [field]: user[field as keyof typeof user],
    }))
  }

  const formatBirthday = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${year}년 ${month}월 ${day}일`;
  }

  const handleDeleteConfirm = () => {
    setUser((prev) => ({
      ...prev,
      profileImage: defaultProfileImg,
    }));
    setIsDeleteModalOpen(false);
    alert("프로필 사진이 삭제되었습니다.");
  }

  return (
    <Container>
      <MainContent>
        <ProfileHeader>
          <ProfileBanner src={bannerImg} alt="배너 이미지" />
          <ProfileInfoContainer>
            <ProfileImageLarge src={user.profileImage} alt={user.name} />
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handlePhotoChange}
            />
            <ProfileActions>
              <ActionButton onClick={handlePhotoButtonClick}>사진 변경</ActionButton>
              <ActionButton onClick={() => setIsDeleteModalOpen(true)}>사진 삭제</ActionButton>
            </ProfileActions>
            <ProfileDetails>
              <ProfileName>{user.name}</ProfileName>
              <ProfileStats>
                <StatItem>
                  <span>지금까지의 여행</span>
                  <StatValue>{totalPlan}개</StatValue>
                </StatItem>
              </ProfileStats>
            </ProfileDetails>
          </ProfileInfoContainer>
        </ProfileHeader>

        <ProfileFields>
          {/* email */}
          <ProfileField>
            <FieldLabel>이메일</FieldLabel>
            <FieldValue>{user.email}</FieldValue>
            <EditButton disabled>Edit</EditButton>
          </ProfileField>

          {/* 이름 */}
          <ProfileField>
            <FieldLabel>이름</FieldLabel>
            <FieldValue>
              {user.name}
            </FieldValue>
            <EditButton disabled>Edit</EditButton>
          </ProfileField>

          {/* 닉네임 */}
          <ProfileField>
            <FieldLabel>닉네임</FieldLabel>
            <FieldValue>
              {isEditing.nickname ? (
                <EditInput
                  value={editValues.nickname}
                  onChange={(e) => handleEditChange("nickname", e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {handleSave("nickname");}
                  }}
                />
              ) : (
                user.nickname
              )}
            </FieldValue>
            {isEditing.nickname ? (
              <EditButton onClick={() => handleSave("nickname")}>Save</EditButton>
            ) : (
              <EditButton onClick={() => toggleEdit("nickname")}>Edit</EditButton>
            )}
          </ProfileField>

          {/* 성별 */}
          <ProfileField>
            <FieldLabel>성별</FieldLabel>
            <FieldValue>
              {isEditing.gender ? (
                <SelectInput
                  value={editValues.gender}
                  onChange={(e) => handleEditChange("gender", e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {handleSave("gender");}
                  }}
                >
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                  <option value="기타">기타</option>
                  <option value="비공개">비공개</option>
                </SelectInput>
              ) : (
                user.gender
              )}
            </FieldValue>
            {isEditing.gender ? (
              <EditButton onClick={() => handleSave("gender")}>Save</EditButton>
            ) : (
              <EditButton onClick={() => toggleEdit("gender")}>Edit</EditButton>
            )}
          </ProfileField>

          {/* 생년월일 */}
          <ProfileField>
            <FieldLabel>생년월일</FieldLabel>
            <FieldValue>
              {isEditing.birthday ? (
                <EditInput
                  ref={birthdayRef}
                  value={editValues.birthday}
                  readOnly
                  autoFocus
                  style={{ backgroundColor: '#fff', cursor: 'pointer' }}
                />
              ) : (
                formatBirthday(user.birthday)
              )}
            </FieldValue>
            {isEditing.birthday ? (
              <EditButton onClick={() => handleSave("birthday")}>Save</EditButton>
            ) : (
              <EditButton onClick={() => toggleEdit("birthday")}>Edit</EditButton>
            )}
          </ProfileField>

          {/* 전화번호 */}
          <ProfileField className="editable">
            <FieldLabel>전화번호</FieldLabel>
            <FieldValue>
              {isEditing.phone ? (
                <>
                  <EditInput
                    value={editValues.phone}
                    onChange={(e) => handleEditChange("phone", e.target.value)}
                    autoFocus
                    style={phoneError ? { borderColor: 'red' } : {}}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {handleSave("phone");}
                    }}
                  />
                  {phoneError && (
                    <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                      000-0000-0000 형식으로 입력해 주세요.
                    </div>
                  )}
                </>
              ) : (
                user.phone
              )}
            </FieldValue>
            {isEditing.phone ? (
              <EditButton onClick={() => handleSave("phone")}>Save</EditButton>
            ) : (
              <EditButton onClick={() => toggleEdit("phone")}>Edit</EditButton>
            )}
          </ProfileField>
        </ProfileFields>
      </MainContent>

      <CheckModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="프로필 사진 삭제"
        message="사진을 삭제하시겠습니까?"
      />
    </Container>
  )
}

export default MyPage;