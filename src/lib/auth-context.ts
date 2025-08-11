// Simple authentication context for demo purposes
// In a production app, this would be replaced with a proper auth system

export interface CurrentUser {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  isLoggedIn: boolean;
}

// Mock current user - in production, this would come from authentication system
export const getCurrentUser = (): CurrentUser => {
  // This could be stored in localStorage, session, or fetched from an API
  const mockUser: CurrentUser = {
    id: "supervisor-001",
    name: "Sarah Williams",
    employeeId: "emp009",
    role: "Supervisor",
    isLoggedIn: true,
  };
  
  return mockUser;
};

// Function to get current user ID for API calls
export const getCurrentUserId = (): string => {
  return getCurrentUser().id;
};

// Function to get current user employee ID
export const getCurrentUserEmployeeId = (): string => {
  return getCurrentUser().employeeId;
};

// Function to get current user name for signatures
export const getCurrentUserName = (): string => {
  return getCurrentUser().name;
};
