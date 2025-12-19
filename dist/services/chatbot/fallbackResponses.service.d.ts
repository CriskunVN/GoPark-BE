export function findMatchingPattern(message: any, userInfo: any): {
    type: string;
    content: string;
    buttons: {
        text: string;
        action: string;
    }[];
};
export namespace fallbackPatterns {
    namespace greeting {
        let patterns: string[];
        function response(userInfo: any): {
            type: string;
            content: string;
            buttons: {
                text: string;
                action: string;
            }[];
        };
    }
    namespace findParking {
        let patterns_1: string[];
        export { patterns_1 as patterns };
        export function response_1(userInfo: any): {
            type: string;
            content: string;
            buttons: {
                text: string;
                action: string;
            }[];
        };
        export { response_1 as response };
    }
    namespace price {
        let patterns_2: string[];
        export { patterns_2 as patterns };
        export function response_2(): {
            type: string;
            content: string;
            buttons: {
                text: string;
                action: string;
            }[];
        };
        export { response_2 as response };
    }
    namespace booking {
        let patterns_3: string[];
        export { patterns_3 as patterns };
        export function response_3(userInfo: any): {
            type: string;
            content: string;
            buttons: {
                text: string;
                action: string;
            }[];
        };
        export { response_3 as response };
    }
    namespace contact {
        let patterns_4: string[];
        export { patterns_4 as patterns };
        export function response_4(): {
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
        export { response_4 as response };
    }
    namespace cheapParking {
        let patterns_5: string[];
        export { patterns_5 as patterns };
        export function response_5(userInfo: any): {
            type: string;
            content: string;
            buttons: {
                text: string;
                action: string;
            }[];
        };
        export { response_5 as response };
    }
    namespace contactDetails {
        let patterns_6: string[];
        export { patterns_6 as patterns };
        export function response_6(): {
            type: string;
            content: string;
            buttons: ({
                text: string;
                action: string;
                data: {
                    email: string;
                    phone?: never;
                };
            } | {
                text: string;
                action: string;
                data: {
                    phone: string;
                    email?: never;
                };
            } | {
                text: string;
                action: string;
                data?: never;
            })[];
        };
        export { response_6 as response };
    }
    namespace bookingGuide {
        let patterns_7: string[];
        export { patterns_7 as patterns };
        export function response_7(userInfo: any): {
            type: string;
            content: string;
            buttons: {
                text: string;
                action: string;
            }[];
        };
        export { response_7 as response };
    }
    namespace nearbyParking {
        let patterns_8: string[];
        export { patterns_8 as patterns };
        export function response_8(userInfo: any): {
            type: string;
            content: string;
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
        export { response_8 as response };
    }
    namespace paymentMethods {
        let patterns_9: string[];
        export { patterns_9 as patterns };
        export function response_9(): {
            type: string;
            content: string;
            buttons: {
                text: string;
                action: string;
            }[];
        };
        export { response_9 as response };
    }
}
//# sourceMappingURL=fallbackResponses.service.d.ts.map