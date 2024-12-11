import { useState, useEffect } from "react";
import axios from "axios";
import classNames from "classnames/bind";
import styles from "./Users.module.scss";
import defaultAvatar from "../../assets/images/default-avatar.png";

const cx = classNames.bind(styles);

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3001/admin/users", {
        withCredentials: true,
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch users");
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:3001/admin/users/${userId}`, {
          withCredentials: true,
        });
        fetchUsers();
      } catch (error) {
        setError("Failed to delete user");
      }
    }
  };

  if (loading) return <div className={cx("loading")}>Loading...</div>;
  if (error) return <div className={cx("error")}>{error}</div>;

  return (
    <div className={cx("wrapper")}>
      <div className={cx("inner")}>
        <div className={cx("header")}>
          <h2>Users Management</h2>
          <span className={cx("total-users")}>Total: {users.length} users</span>
        </div>

        <div className={cx("content")}>
          {users.map((user) => (
            <div key={user._id} className={cx("user-card")}>
              <div className={cx("user-info")}>
                <img
                  src={user.avtUrl || defaultAvatar}
                  alt={user.username}
                  className={cx("avatar")}
                  onError={(e) => {
                    e.target.src = defaultAvatar;
                  }}
                />
                <div className={cx("details")}>
                  <h3 className={cx("username")}>{user.username}</h3>
                  <p className={cx("email")}>{user.email}</p>
                  <p className={cx("phone")}>
                    {user.phoneNumbers || "No phone number"}
                  </p>
                </div>
              </div>

              <div className={cx("status-section")}>
                <span
                  className={cx("status", {
                    verified: user.isEmailVerify,
                    unverified: !user.isEmailVerify,
                  })}
                >
                  {user.isEmailVerify ? "Verified" : "Unverified"}
                </span>
              </div>

              <div className={cx("actions")}>
                <button
                  className={cx("edit-btn")}
                  onClick={() => handleEdit(user)}
                >
                  <i className="fas fa-edit"></i>
                  Edit
                </button>
                <button
                  className={cx("delete-btn")}
                  onClick={() => handleDelete(user._id)}
                >
                  <i className="fas fa-trash-alt"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={async (updatedUser) => {
            try {
              await axios.put(
                `http://localhost:3001/admin/users/${selectedUser._id}`,
                updatedUser,
                { withCredentials: true }
              );
              fetchUsers();
              setIsModalOpen(false);
            } catch (error) {
              setError("Failed to update user");
            }
          }}
        />
      )}
    </div>
  );
}

function EditUserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    phoneNumbers: user.phoneNumbers || "",
    isEmailVerify: user.isEmailVerify,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={cx("modal-overlay")}>
      <div className={cx("modal")}>
        <div className={cx("modal-header")}>
          <h3>Edit User</h3>
          <button className={cx("close-btn")} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={cx("form-group")}>
            <label>Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>

          <div className={cx("form-group")}>
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className={cx("form-group")}>
            <label>Phone</label>
            <input
              type="text"
              value={formData.phoneNumbers}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumbers: e.target.value })
              }
            />
          </div>

          <div className={cx("form-group", "checkbox-group")}>
            <label>
              <input
                type="checkbox"
                checked={formData.isEmailVerify}
                onChange={(e) =>
                  setFormData({ ...formData, isEmailVerify: e.target.checked })
                }
              />
              Email Verified
            </label>
          </div>

          <div className={cx("modal-actions")}>
            <button
              type="button"
              className={cx("cancel-btn")}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className={cx("save-btn")}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Users;
