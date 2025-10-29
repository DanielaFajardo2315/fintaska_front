export interface User {
    _id: string;
    profile?: string | null;
    fullName: string;
    username?: string;
    email: string;
    password: string;
    rol: "usuario" | "admin";
    registerDate?: Date;
    settings?: {
        theme: string;
        notifications?: boolean;
    }
    planner?: {
        notifications?: string[];
        tasks?: string[];
        board?: string[];
        finances?: string[];
    }
}




