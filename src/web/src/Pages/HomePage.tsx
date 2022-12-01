import { useEffect } from "react";
import { redirect, useNavigate } from "react-router-dom";

export default function HomePage() {

    const navigate = useNavigate();

    useEffect(() => {
        function redirectToLoginIfNeeded() {
    
          // TODO check JWT Token
    
          navigate("/signin");
        }
    
        redirectToLoginIfNeeded();
      }, []);
    
    return (
        <div></div>
    );
}