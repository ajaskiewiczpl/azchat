import { useDispatch } from "react-redux";
import { clearToken } from "../redux/authSlice";

const useLogout = () => {
    const dispatch = useDispatch();
    const logout = () => {
        dispatch(clearToken()); // it's enough to clear the token and credentials info from the store - RequireAuth component will see that there are no credentials and will redirect to sign in page
    };

    return logout;
};

export default useLogout;
