"use client";
import React from "react";

interface FloorUsersListProps {
  floorName: string;
  users: string[];
}

export default function FloorUsersList({ floorName, users }: FloorUsersListProps) {
  return (
    <div style={styles.usersListContainer}>
      <h2 style={styles.usersListTitle}>{floorName} - Users</h2>
      <ul style={styles.usersList}>
        {users.map((user, index) => (
          <li key={index} style={styles.userListItem}>
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  usersListContainer: {
    marginTop: "1rem",
    padding: "1rem",
    borderRadius: "8px",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  usersListTitle: {
    fontSize: "1.2rem",
    marginBottom: "0.5rem",
    fontWeight: "bold",
  },
  usersList: {
    listStyleType: "none",
    padding: 0,
  },
  userListItem: {
    marginBottom: "0.4rem",
    fontSize: "0.9rem",
  },
};
