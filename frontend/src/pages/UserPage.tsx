import Sidebar from "../components/Sidebar"

const UserPage: React.FC = () => {
  return (
    <>
      <Sidebar variant="user" />
      {/* TODO: if user not found, display a 404 page */}
    </>
  );
};

export default UserPage;