export namespace responseTemplates {
    function text(content: any, options?: {}): {
        type: string;
        content: any;
    };
    function parkingList(parkingLots: any, location: any): {
        type: string;
        content: string;
        data: any;
        buttons: ({
            text: string;
            action: string;
            data: {
                lots: any;
                location: any;
            };
        } | {
            text: string;
            action: string;
            data?: never;
        })[];
    };
    function bookingSuccess(bookingData: any): {
        type: string;
        content: string;
        buttons: {
            text: string;
            action: string;
        }[];
    };
    function requireLogin(): {
        type: string;
        content: string;
        buttons: {
            text: string;
            action: string;
        }[];
    };
    function contactInfo(): {
        type: string;
        content: string;
        buttons: {
            text: string;
            action: string;
            data: {
                phone: string;
            };
        }[];
    };
    function bookingHistory(bookings: any): {
        type: string;
        content: string;
        buttons: {
            text: string;
            action: string;
            disabled: boolean;
        }[];
    };
    function paymentOptions(amount: any): {
        type: string;
        content: string;
        buttons: {
            text: string;
            action: string;
        }[];
    };
}
export namespace quickResponses {
    function noResultsFound(): {
        type: string;
        content: string;
        buttons: {
            text: string;
            action: string;
        }[];
    };
    function guestWelcome(): {
        type: string;
        content: string;
        buttons: {
            text: string;
            action: string;
        }[];
    };
}
//# sourceMappingURL=responseTemplates.service.d.ts.map