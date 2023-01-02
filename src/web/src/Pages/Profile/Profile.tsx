import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import AvatarSettings from "./AvatarSettings";

type Props = {};

const Profile = (props: Props) => {
    return (
        <Container maxWidth="sm">
            <Paper elevation={4} sx={{ m: 2, p: 2 }}>
                <AvatarSettings />
            </Paper>
        </Container>
    );
};

export default Profile;
