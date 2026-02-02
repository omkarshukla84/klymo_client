"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDeviceFingerprint, DeviceIdentity } from '@/lib/device';

interface UserContextType {
  deviceId: string | null;
  genderVerified: boolean;
  gender: 'M' | 'F' | null;
  nickname: string;
  bio: string;
  matchPreference: 'M' | 'F' | 'Any';
  setUserInfo: (info: Partial<UserContextType>) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [genderVerified, setGenderVerified] = useState(false);
  const [gender, setGender] = useState<'M' | 'F' | null>(null);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [matchPreference, setMatchPreference] = useState<'M' | 'F' | 'Any'>('Any');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initDevice = async () => {
      let id = DeviceIdentity.getStoredId();
      if (!id) {
        id = await getDeviceFingerprint();
        DeviceIdentity.setStoredId(id);
      }
      setDeviceId(id);
      setIsLoading(false);
    };
    initDevice();
  }, []);

  const setUserInfo = (info: Partial<UserContextType>) => {
    if (info.genderVerified !== undefined) setGenderVerified(info.genderVerified);
    if (info.gender !== undefined) setGender(info.gender);
    if (info.nickname !== undefined) setNickname(info.nickname);
    if (info.bio !== undefined) setBio(info.bio);
    if (info.matchPreference !== undefined) setMatchPreference(info.matchPreference);
  };

  return (
    <UserContext.Provider value={{ 
      deviceId, 
      genderVerified, 
      gender, 
      nickname, 
      bio, 
      matchPreference,
      setUserInfo,
      isLoading
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
