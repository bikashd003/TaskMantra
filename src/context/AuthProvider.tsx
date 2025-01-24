"use client"
import { useSession } from "next-auth/react";
import React, { createContext, useContext } from "react";

interface AuthContextProps {
    session: any;
    loading: boolean;
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextProps>({
    session: null,
    loading: true,
    isAuthenticated: false
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session, status } = useSession();

    return (
        <AuthContext.Provider value={{ session, loading: status === "loading", isAuthenticated: !!session }}>
            {children}
        </AuthContext.Provider>

    );
};

export default AuthProvider;