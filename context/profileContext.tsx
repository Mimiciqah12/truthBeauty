import React, { createContext, useContext, useState } from "react";

const defaultAvatar = require("../assets/images/anynomous-pic.png");

type ProfileContextType = {
  profilePic: any; 
  setProfilePic: (uri: any) => void;
  resetProfilePic: () => void;
  skinType: string;
  setSkinType: (type: string) => void;
  skinConcerns: string[];
  setSkinConcerns: (items: string[]) => void;
};

const ProfileContext = createContext<ProfileContextType>({
  profilePic: defaultAvatar,
  setProfilePic: () => {},
  resetProfilePic: () => {},

  skinType: "",
  setSkinType: () => {},

  skinConcerns: [],
  setSkinConcerns: () => {},
});

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profilePic, setProfilePic] = useState<any>(defaultAvatar);
  const resetProfilePic = () => setProfilePic(defaultAvatar);
  const [skinType, setSkinType] = useState<string>("");
  const [skinConcerns, setSkinConcerns] = useState<string[]>([]);

  return (
    <ProfileContext.Provider
      value={{
        profilePic,
        setProfilePic,
        resetProfilePic,
        skinType,
        setSkinType,
        skinConcerns,
        setSkinConcerns,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
