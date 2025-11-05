export interface User {
    id: string;
    email: string | null;
    name: string;
    phone: string;
    address: string;
    orderCount?: number;
    totalSpent?: number;
}
