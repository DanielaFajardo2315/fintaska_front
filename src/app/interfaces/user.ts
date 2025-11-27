import { Board } from "./board";
import { Finance } from "./finance.interface";
import { Task } from "./task.interface";

export interface User {
    _id?: string;
    profile?: string | undefined;
    fullName: string;
    username?: string;
    email: string;
    password?: string;
    rol?: "usuario" | "admin";
    registerDate?: Date;
    settings?: {
        theme: string;
        notifications?: boolean;
    }
    planner?: {
        notifications?: string[];
        tasks?: Array<Task | string>;
        board?: Array<Board | string>;
        finances?: Array<Finance | string>;
    }
}




