import { useSelector } from "react-redux";
import useAuth from "../hooks/useAuth";
import { RootState } from "../redux/store";
import UserAvatar from "./UserAvatar";

type CurrentUserAvatarProps = {
    width: number;
    height: number;
};

const CurrentUserAvatar = (props: CurrentUserAvatarProps) => {
    const { userId, userName } = useAuth();
    const { avatar } = useSelector((state: RootState) => state.avatar);

    return <UserAvatar avatar={avatar} userId={userId} userName={userName} width={props.width} height={props.height} />;
};

export default CurrentUserAvatar;
