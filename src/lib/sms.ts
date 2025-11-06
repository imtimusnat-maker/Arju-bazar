import type { Order, OrderStatus } from '@/lib/orders';
import type { Settings } from '@/lib/settings';

interface SendSmsParams {
    number: string;
    order: { id: string; customerName?: string; };
    status: OrderStatus;
    settings: Partial<Settings>;
}

const getStatusMessage = (status: OrderStatus): string => {
    switch(status) {
        case 'order placed':
            return 'Your order has been placed.';
        case 'order confirmed':
            return 'Your order has been confirmed.';
        case 'order delivered':
            return 'Your order is out for delivery.';
        default:
            return ''; // No message for other statuses like 'completed' or 'cancelled'
    }
}

function getGreetingTemplate(status: OrderStatus, settings: Partial<Settings>): string | undefined {
    switch (status) {
        case 'order placed':
            return settings.smsGreetingPlaced;
        case 'order confirmed':
            return settings.smsGreetingConfirmed;
        case 'order delivered':
            return settings.smsGreetingDelivered;
        default:
            return undefined;
    }
}

function formatMessage(params: SendSmsParams): string | null {
    const { order, status, settings } = params;

    const greetingTemplate = getGreetingTemplate(status, settings);
    if (!greetingTemplate) {
        // No template configured for this status, so no message should be sent.
        return null;
    }

    // Use a global regular expression to replace all instances of the placeholder.
    let greeting = greetingTemplate.replace(/\[customerName\]/g, order.customerName || 'Valued Customer');
    
    const statusMessage = getStatusMessage(params.status);
    const orderId = order.id.slice(0, 7).toUpperCase();
    
    const invoiceLink = `${process.env.NEXT_PUBLIC_APP_URL || ''}/account/orders/${order.id}`;

    return `${greeting} ${statusMessage} Order ID: ${orderId}. View details: ${invoiceLink}`;
}

export const sendSms = async (params: SendSmsParams) => {
    const { number, status, settings } = params;

    if (!number) {
        console.error("SMS not sent: Missing number.");
        return;
    }
    
    // Only send for specific statuses
    if (!['order placed', 'order confirmed', 'order delivered'].includes(status)) {
        return;
    }
    
    const message = formatMessage(params);

    // If formatMessage returns null (e.g., no template for the status), don't send anything.
    if (!message) {
        return;
    }

    try {
        await fetch('/api/send-sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                number,
                message,
            }),
        });
    } catch (error) {
        console.error('Failed to call send-sms API route:', error);
    }
};
