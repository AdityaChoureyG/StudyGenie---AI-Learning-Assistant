/* eslint-disable react-refresh/only-export-components */
import React, {createContext, useContext, useState, useEffect, useCallback} from "react";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("useAuth must be used within an AuthProvider");
    }
    console.log("AuthContext value:", context);
    return context;
}

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuthStatus = useCallback(async () => {
        try{
            // Make API call to check auth status
            const token = localStorage.getItem("token");
            const userStr = localStorage.getItem("user");

            if(token && userStr){
                setUser(JSON.parse(userStr));
                setIsAuthenticated(true);
            }
        } catch(error){
            console.error("Failed to check auth status", error);
            logout();
        } finally{
            setLoading(false);
        }

    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const login = (userData, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false); 

        window.location.href = "/";
    }

    const updateUser = (updatedUserData) => {   
        const newUserData = {...user, ...updatedUserData};
        localStorage.setItem("user", JSON.stringify(newUserData));
        setUser(updatedUserData);
    }


    const value = {
        user, 
        loading, 
        isAuthenticated, 
        login, 
        logout,
        updateUser,
        checkAuthStatus
    };

    return <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
}

