import React from "react";
import { Navigate } from "react-router";

type Props = {};

const Home = (props: Props) => {
    return <Navigate to="/messages" />;
};

export default Home;
