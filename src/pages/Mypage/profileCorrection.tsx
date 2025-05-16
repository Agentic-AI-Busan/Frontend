import { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { authenticatedFetch } from "../../services/api";
import flatpickr from 'flatpickr';
import { Korean } from 'flatpickr/dist/l10n/ko';
import 'flatpickr/dist/flatpickr.min.css';
import CheckModal from "../../components/Modal/CheckModal";
import bannerImg from "../../assets/images/profile_bg_image.jpg";
import defaultProfileImg from "../../assets/images/profile_img.png";
import { useUser } from "../../contexts/UserContext";

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
  const { user: userContext, setUser: setUserContext } = useUser();

  const [user, setUser] = useState({
    name: "",
    email: "",
    nickname: "",
    gender: "",
    birthday: "",
    phone: "",
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

  const formatPhoneNumber = (phone: string) => {
    // 하이픈이 없는 경우에만 포맷팅
    if (!phone.includes('-')) {
      return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    return phone;
  };

  const handleEditChange = (field: string, value: string) => {
    if (field === "phone") {
      // 숫자와 하이픈만 허용
      const cleaned = value.replace(/[^\d-]/g, '');
      // 하이픈 자동 추가
      let formatted = cleaned;
      if (cleaned.length > 3 && !cleaned.includes('-')) {
        formatted = cleaned.replace(/(\d{3})(\d{0,4})(\d{0,4})/, (_, p1, p2, p3) => {
          let result = p1;
          if (p2) result += `-${p2}`;
          if (p3) result += `-${p3}`;
          return result;
        });
      }
      setEditValues((prev) => ({
        ...prev,
        phone: formatted,
      }));
      setPhoneError(!/^\d{3}-\d{4}-\d{4}$/.test(formatted));
      return;
    }
    setEditValues((prev) => ({
      ...prev,
      [field]: value,
    }));
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
            const formattedDate = `${year}-${month}-${day}`;
            handleEditChange("birthday", formattedDate);
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

  useEffect(() => {
    if (userContext) {
      setUser(prev => ({
        ...prev,
        name: userContext.name || "",
        email: userContext.email || "",
        nickname: userContext.nickname || "",
        gender: userContext.gender === 'MALE' ? '남성' : '여성',
        birthday: userContext.birthDay || "",
        phone: formatPhoneNumber(userContext.phoneNumber || ""),
        profileImage: userContext.profileImage || defaultProfileImg,
      }))
    }
  }, [userContext])

  const handleSave = async (field: string) => {
    if (field === "phone" && !/^\d{3}-\d{4}-\d{4}$/.test(editValues.phone)) {
      setPhoneError(true);
      return;
    }

    try {
      // API 스펙에 맞게 필드명과 값을 변환
      const apiFieldMap: { [key: string]: string } = {
        nickname: 'nickname',
        phone: 'phoneNumber',
        gender: 'gender',
        birthday: 'birthDay'
      };

      let apiValue;
      if (field === 'gender') {
        apiValue = editValues.gender === '남성' ? 'MALE' : 'FEMALE';
      } else if (field === 'birthday') {
        apiValue = editValues.birthday; // YYYY-MM-DD 형식
      } else if (field === 'phone') {
        apiValue = editValues.phone.replace(/-/g, ''); // 하이픈 제거
      } else {
        apiValue = editValues[field as keyof typeof editValues];
      }

      // 기존 사용자 정보를 기반으로 요청 본문 생성
      const requestBody = {
        nickname: user.nickname,
        phoneNumber: user.phone.replace(/-/g, ''), // 하이픈 제거
        profileImage: user.profileImage,
        gender: user.gender === '남성' ? 'MALE' : 'FEMALE',
        birthDay: user.birthday
      };

      // 수정하려는 필드만 업데이트
      requestBody[apiFieldMap[field] as keyof typeof requestBody] = apiValue;

      console.log('Request Body:', requestBody);

      const response = await authenticatedFetch('/api/users/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Response Data:', data);
      
      if (data.isSuccess) {
        // 성공 시 상태 업데이트
        const updatedValue = field === 'gender' 
          ? (apiValue === 'MALE' ? '남성' : '여성')
          : field === 'phone'
          ? formatPhoneNumber(apiValue) // 하이픈 추가
          : apiValue;

        setUser((prev) => ({
          ...prev,
          [field]: updatedValue,
        }));
        if (userContext) {
          setUserContext({
            ...userContext,
            [field === 'birthday' ? 'birthDay' : field === 'phone' ? 'phoneNumber' : field]: 
              field === 'phone' ? apiValue : apiValue,
          });
        }
        setIsEditing((prev) => ({
          ...prev,
          [field]: false,
        }));
        if (field === "phone") setPhoneError(false);
        alert("수정되었습니다.");
      } else {
        console.error('API Error:', data);
        alert(`수정에 실패했습니다. ${data.message || ''}`);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert("수정 중 오류가 발생했습니다.");
    }
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
                >
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
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