import { createContext, useContext, useState } from 'react';
import SimpleLogoLoader from '../components/Loader/Loader';

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {/* {loading && <SimpleLogoLoader/> } */}
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);