import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../services/api';
import defaultProfileImg from '../assets/images/default_profile_img.jpeg';


interface User {
    name: string;
    nickname: string;
    email: string;
    birthDay: string;
    gender: string;
    profileImage: string;
    phoneNumber: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const profile = await getUserProfile();
                if (profile) {
                    const userProfile = {
                        ...profile.result,
                        profileImage: defaultProfileImg
                    };
                    setUser(userProfile);
                }
            } catch (error) {
                console.error('사용자 프로필 로드 실패:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const setUserWithDefaultImage = (newUser: User | null) => {
        if (newUser) {
            setUser({
                ...newUser,
                profileImage: defaultProfileImg
            });
        } else {
            setUser(null);
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser: setUserWithDefaultImage, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}