import type { Order, OrderStatus } from '@/lib/orders';

interface SendSmsParams {
    number: string;
    order: Partial<Order> & { id: string };
    status: OrderStatus;
    greetingTemplate: string;
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

function formatMessage(params: SendSmsParams): string {
    const { greetingTemplate, order } = params;

    let greeting = greetingTemplate || 'Hello [customerName],';
    
    if (order.customerName) {
        greeting = greeting.replace(/\[customerName\]/g, order.customerName);
    } else {
        // Fallback if customer name is not available for some reason
        greeting = greeting.replace(/\[customerName\]/g, 'Valued Customer');
    }

    const statusMessage = getStatusMessage(params.status);
    const orderId = order.id.slice(0, 7).toUpperCase();
    
    // For now, the invoice link points to the general orders page.
    // In a production app, you might want a direct link to the specific order.
    const invoiceLink = `${process.env.NEXT_PUBLIC_APP_URL || ''}/account/orders`;

    return `${greeting} ${statusMessage} Order ID: ${orderId}. View details: ${invoiceLink}`;
}

export const sendSms = async ({ number, order, status, greetingTemplate }: SendSmsParams) => {
    if (!number || !greetingTemplate) {
        console.error("SMS not sent: Missing number or greeting template.");
        return;
    }
    
    // Only send for specific statuses
    if (!['order placed', 'order confirmed', 'order delivered'].includes(status)) {
        return;
    }

    const message = formatMessage({ number, order, status, greetingTemplate });

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
