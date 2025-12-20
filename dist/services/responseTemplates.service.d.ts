export namespace responseTemplates {
    function text(content: any, options?: {}): {
        type: string;
        content: any;
    };
    function parkingList(parkingLots: any, location: any, options?: {}): {
        type: string;
        content: string;
        data: any;
        buttons: ({
            text: string;
            action: string;
            data: {
                lots: any;
            };
        } | {
            text: string;
            action: string;
            data?: never;
        })[];
        quickReplies: string[];
    };
    function bookingForm(parkingLot: any, availableSlot: any, userId: any): {
        type: string;
        content: string;
        data: {
            parkingLotId: any;
            parkingLotName: any;
            slotId: any;
            slotNumber: any;
            zone: any;
            pricePerHour: any;
            address: any;
            estimatedPrice: string;
            paymentMethods: any;
            requiresLogin: boolean;
            userId: any;
        };
        steps: {
            step: number;
            title: string;
            completed: boolean;
        }[];
        buttons: ({
            text: string;
            action: string;
            data: {
                slotId: any;
                minHours: number;
                maxHours: number;
                userId?: never;
                parkingLotId?: never;
            };
        } | {
            text: string;
            action: string;
            data: {
                userId: any;
                slotId?: never;
                minHours?: never;
                maxHours?: never;
                parkingLotId?: never;
            };
        } | {
            text: string;
            action: string;
            data: {
                parkingLotId: any;
                slotId?: never;
                minHours?: never;
                maxHours?: never;
                userId?: never;
            };
        })[];
    };
    function confirmBooking(bookingDetails: any): {
        type: string;
        content: string;
        data: any;
        buttons: ({
            text: string;
            action: string;
            data: {
                slotId: any;
                startTime: any;
                endTime: any;
                vehicleId: any;
                paymentMethod: string;
            };
        } | {
            text: string;
            action: string;
            data?: never;
        })[];
    };
    function bookingHistory(bookings: any, userId: any): {
        type: string;
        content: string;
        data: {
            active: any;
            past: any;
        };
        buttons: ({
            text: string;
            action: string;
            disabled: boolean;
        } | {
            text: string;
            action: string;
            disabled?: never;
        })[];
    };
    function paymentOptions(amount: any, bookingId: any, paymentMethods?: string[]): {
        type: string;
        content: string;
        data: {
            amount: any;
            bookingId: any;
            currency: string;
        };
        options: {
            id: string;
            name: string;
            icon: string;
            description: string;
            available: boolean;
        }[];
        buttons: ({
            text: string;
            action: string;
            primary: boolean;
        } | {
            text: string;
            action: string;
            primary?: never;
        })[];
    };
    function notification(title: any, message: any, type?: string): {
        type: string;
        content: any;
        data: {
            title: any;
            type: string;
            timestamp: string;
        };
        buttons: {
            text: string;
            action: string;
        }[];
    };
    function contactInfo(): {
        type: string;
        content: string;
        buttons: ({
            text: string;
            action: string;
            data: {
                phone: string;
                email?: never;
                address?: never;
            };
        } | {
            text: string;
            action: string;
            data: {
                email: string;
                phone?: never;
                address?: never;
            };
        } | {
            text: string;
            action: string;
            data: {
                address: string;
                phone?: never;
                email?: never;
            };
        } | {
            text: string;
            action: string;
            data?: never;
        })[];
    };
    function tutorial(step?: number): {
        type: string;
        content: string;
        data: {
            currentStep: number;
            totalSteps: number;
            steps: {
                title: string;
                content: string;
                image: string;
            }[];
        };
        buttons: ({
            text: string;
            action: string;
            disabled: boolean;
        } | {
            text: string;
            action: string;
            disabled?: never;
        })[];
    };
}
export namespace quickResponses {
    function noParkingFound(location: any): string;
    function requireLogin(): string;
    function noSlotsAvailable(parkingLotName: any): string;
    function bookingSuccess(bookingId: any, parkingLotName: any, slotNumber: any): string;
    function systemError(): string;
}
//# sourceMappingURL=responseTemplates.service.d.ts.map