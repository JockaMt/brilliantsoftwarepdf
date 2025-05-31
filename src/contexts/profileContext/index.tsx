import React, { createContext, useContext, useState, ReactNode } from "react";

interface Profile {
  name: string;
  avatarUrl?: string;
  // outras informações do perfil
}

interface ProfileContextType {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
  {children}
  </ProfileContext.Provider>
);
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
