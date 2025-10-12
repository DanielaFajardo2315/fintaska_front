export interface User {

    profile: string | null;

    fullName: string;

    username: string;

    email?: string;

    rol: 'usuario' | 'admin';

    registerDate: string; 

    settings: {
        theme: string;
        notifications: boolean;
        planner?: string | null; 
    };

    tasks: string | null;
    board: string | null;
    finances: string | null;
}

