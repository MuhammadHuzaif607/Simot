import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EditUserModal from './EditUserModal';

const UserData = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null); // Track which user is being deleted
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Track saving state for edit
  const [editData, setEditData] = useState({
    _id: '',
    userName: '',
    email: '',
    role: '',
  });
  const [filterText, setFilterText] = useState(''); // State for filtering

  // Retrieve the current user ID from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = currentUser.user.id; // Extract current user ID

  // Fetch all users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/users`
        ); // Replace with your API endpoint
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle user deletion
  const handleDelete = async (userId) => {
    setLoadingDeleteId(userId); // Set loading for the delete action
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/auth/user/${userId}`
      ); // Replace with your API endpoint
      setUsers(users.filter((user) => user._id !== userId));
      setLoadingDeleteId(null); // Reset the loading state once deletion is complete
    } catch (error) {
      console.error('Error deleting user:', error);
      setLoadingDeleteId(null); // Reset the loading state on error
    }
  };

  // Handle edit button click
  const handleEditClick = (user) => {
    setEditData({
      _id: user._id,
      userName: user.name,
      email: user.email,
      role: user.role,
    });
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditData({ _id: '', userName: '', email: '', role: '' });
  };

  // Handle saving changes after editing a user
  const handleSaveChanges = async () => {
    setIsSaving(true); // Set saving state to true
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/edituser/${editData._id}`,
        {
          name: editData.userName,
          email: editData.email,
          role: editData.role,
        }
      ); // Update user API

      // Update the local state with the edited user data
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === editData._id
            ? {
                ...user,
                name: editData.userName,
                email: editData.email,
                role: editData.role,
              }
            : user
        )
      );

      setIsModalOpen(false); // Close the modal
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsSaving(false); // Reset saving state
    }
  };

  // Filter users based on filterText
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(filterText.toLowerCase()) ||
      user.email.toLowerCase().includes(filterText.toLowerCase()) ||
      user.role.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between p-4 text-white">
        <h1 className="text-3xl">User Page</h1>
        <Link to="/add-user" className="button-color px-4 py-2 rounded-md">
          Add User
        </Link>
      </div>

      {/* Filter input */}
      <div className="flex justify-left mb-4">
        <input
          type="text"
          placeholder="Search"
          className="p-2 rounded bg-gray-700 text-white"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      <div className="w-full 2xl:min-h-[550px] xl:min-h-[400px] lg:min-h-[350px] md:min-h-[300px] sm:max-h-[250px] overflow-y-auto">
        <table className="w-full text-center overflow-y-auto table-fixed min-w-[600px]">
          <thead className="bg-[#393b63] sticky top-0 z-10 text-white">
            <tr>
              <th className="w-1/4 py-2 px-2">User Name</th>
              <th className="w-1/4 py-2">Email</th>
              <th className="w-1/4 py-2">Role</th>
              <th className="w-1/6 py-2">Action</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-4">
                  Loading...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr className="bg-[#0f9bee]" key={user._id}>
                  <td className="py-2 px-2">{user.name}</td>
                  <td className="py-2 px-2">{user.email}</td>
                  <td className="py-2 px-2">{user.role}</td>
                  <td className="flex-row justify-between space-y-1 sm:flex-col">
                    <button
                      className={`w-20 py-1 px-2 rounded text-white ${
                        currentUserId === user._id
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                      onClick={() => handleEditClick(user)}
                      disabled={currentUserId === user._id} // Disable for current user
                      style={{
                        cursor:
                          currentUserId === user._id
                            ? 'not-allowed'
                            : 'pointer',
                      }} // Add cursor style
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(user._id)}
                      className={`w-20 py-1 px-2 rounded text-white ${
                        loadingDeleteId === user._id ||
                        currentUserId === user._id
                          ? 'bg-red-400 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                      disabled={
                        loadingDeleteId === user._id ||
                        currentUserId === user._id
                      } // Disable for current user
                      style={{
                        cursor:
                          loadingDeleteId === user._id ||
                          currentUserId === user._id
                            ? 'not-allowed'
                            : 'pointer',
                      }} // Add cursor style
                    >
                      {loadingDeleteId === user._id ? (
                        <div className="flex justify-center items-center">
                          <loading />
                          Del....
                        </div>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-4">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSaveChanges}
        editData={editData}
        setEditData={setEditData}
        isSaving={isSaving} // Pass the saving state to the modal
      />
    </div>
  );
};

export default UserData;
