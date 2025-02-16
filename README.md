# 🏢 **Floor Management System**

## 🌟 Overview
The **Floor Management System** is a web-based application designed to optimize workspace management, including floor planning, seating arrangements, personnel management, and complaint tracking. It provides features for admins, managers, and employees to interact with the layout of the workspace and manage their work environment. 🚀

## 🛠️ Features

### 1. 🏗️ **Floor Management**
- **Floor Form Page**: 
  - Admins can enter floor length and width to define the workspace layout. 📏
  - If the required dimensions are not entered, the system redirects the admin back to the form to ensure data completion. 🔄
  
- **Floor Plan Management**: 
  - Managers can add and remove furniture to design the workspace efficiently. 🛋️
  - Furniture placement is saved in the 3D editor to retain changes for future modifications. 💾

### 2. 🧭 **Floor Navigation and Views**
- **Navbar Navigation**:
  - Users can seamlessly switch between different views such as 3D Editor, 360 View, Floorplan, and Staff Page. 📱🔄
  
- **Specific Floor Editing**:
  - Users can select a building and floor in the 3D editor to edit the workspace. 🏢🎮
  
- **360 View**:
  - Users can visualize the workspace in a 360-degree view before making any changes. 🔍🌍

### 3. 🗺️ **Floorplan and Seating Management**
- **Furniture Placement**:
  - Managers can drag and drop furniture items onto a 2D floor map to efficiently design the layout. 🖱️🛋️
  
- **Seating Management**:
  - Managers can assign and unassign employees to specific workspaces to optimize seating arrangements. 👩‍💻👨‍💻
  
- **Workspace Utilization**:
  - Managers can see employee distribution statistics and analyze workspace utilization. 📊💼

- **Crowd Density**:
  - Managers can assess how crowded the workspace is to make informed decisions about seating plans. 👥📈

### 4. 👤 **Personnel Management**
- **Employee Seating Assignment**:
  - Users can drag personnel onto specific workspaces to assign seating areas efficiently. 🪑👥
  
- **Employee Profile**:
  - Managers can view employees’ personal data for managing team assignments. 📝
  - Employees can view and update their personal account details, including changing their profile picture for personalization. 🖼️✨

### 5. 📝 **Complaint Management**
- **Employee Complaints**:
  - Employees can submit complaints related to workspace issues. 😡💬

- **Complaint Resolution**:
  - Managers can read, address, and resolve complaints to maintain a smooth working environment. ✅🔧

## ⚙️ Installation

### 📜 Prerequisites
- Next.js 🌐
- FastAPI ⚡
- A modern web browser (Google Chrome, Firefox, etc.) 🌍

### Steps to Set Up

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/floor-management-system.git
2. Install Docker 🐳
3. Build the project:
  ```bash
   Docker-compose up --build
