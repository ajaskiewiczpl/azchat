import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import { ApiClient } from "../api/ApiClient";
import { OpenAPI } from "../api/generated";

type Props = {}

const HomePage = (props: Props) => {

  const [userName, setUserName] = useState('');

  const api = new ApiClient();

  const handleGetUserInfo = async () => {
    try {
      const response = await api.userProfile.getApiUserProfile();
      setUserName(response);
    } catch (err) {

    }
  }

  return (
    <div>
      <Typography>User name: {userName}</Typography>
      <br></br>
      <Button variant="contained" onClick={handleGetUserInfo}>Get user info</Button>
    </div>
  )
}

export default HomePage