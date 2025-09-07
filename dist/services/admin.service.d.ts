export function getAdminDashboardStats(): Promise<{
    totalUsers: number;
    userChangePercent: number;
    totalParkingLots: number;
    newParkingLotsThisMonth: number;
    todayBookings: number;
    bookingChangePercent: number;
    thisMonthRevenue: number;
    revenueChangePercent: number;
    pendingApprovals: number;
    activeBookings: number;
}>;
export function getRecentActivities(limit?: number): Promise<{
    id: string;
    type: string;
    message: string;
    user: string;
    time: string;
    status: string;
}[]>;
export function getSystemStatus(): Promise<{
    apiService: {
        status: string;
        message: string;
    };
    database: {
        status: string;
        message: string;
    };
    paymentGateway: {
        status: string;
        message: string;
    };
    notification: {
        status: string;
        message: string;
    };
}>;
//# sourceMappingURL=admin.service.d.ts.map