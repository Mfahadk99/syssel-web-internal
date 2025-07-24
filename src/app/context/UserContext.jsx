import { createContext, useContext, useEffect, useMemo, useState } from "react";
import useAuthStore from '@/app/store/useAuthStore';

const UserContext = createContext({
  userType: null,
  setUserType: () => {},
  isCurrentProfile: () => false,
});

export const UserProvider = ({ children }) => {
  const [userType, setUserType] = useState(null);
  const { currentProfile } = useAuthStore();

  useEffect(() => {
    if (currentProfile?.profileType) {
      setUserType(currentProfile.profileType);
    }
  }, [currentProfile]);

  const isCurrentProfile = (profileId) => {
    return profileId === currentProfile?._id;
  };

  const value = useMemo(
    () => ({ 
      userType, 
      setUserType, 
      isCurrentProfile 
    }), 
    [userType, currentProfile]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
