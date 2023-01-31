import { useSelector } from "react-redux";
import useAuth from "../hooks/useAuth";
import { RootState } from "../redux/store";
import UserAvatar from "./UserAvatar";

type CurrentUserAvatarProps = {
    width: number;
    height: number;
};

const CurrentUserAvatar = (props: CurrentUserAvatarProps) => {
    const { user } = useAuth();
    const { avatar } = useSelector((state: RootState) => state.avatar);

    return (
        <UserAvatar
            avatar={avatar}
            userId={user!.userId}
            userName={user!.userName}
            width={props.width}
            height={props.height}
        />
    );
};

export default CurrentUserAvatar;
