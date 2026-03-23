import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

const login = async (email, password) => {
    try{
        const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
            email, 
            password,
        });
        return response.data;
    } catch(error){
        throw error.response?.data || {message : "An unknown error occured"};
    }
};

const register = async (username, email, password) => {
    try{
        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
            username, 
            email,
            password,
        });
        return response.data;
    } catch(error){
        throw error.response?.data || {message : "An unknown error occured"};
    }
}

const getPorfile = async () => {
    try{
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        return response.data;
    } catch(error){
        throw error.response?.data || {message : "An unknown error occured"}
    }
}

const updateProfile = async (userData) => {
    try{
        const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, userData);
        return response.data;
    } catch(error){
        throw error.response?.data || {message : "An unknown error occured"}
    }
}

const changePassword = async (password) => {
    try{
        const response = axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD, password);
        return response.data;
    }  catch(error){
        throw error.response?.data || {message : "An unknown error occured"};
    }
}

const authService = {
    login,
    register,
    getPorfile,
    updateProfile,
    changePassword
}

export default authService;