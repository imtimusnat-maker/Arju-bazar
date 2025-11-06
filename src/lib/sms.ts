import type { Order } from '@/lib/orders';

interface SendSmsParams {
    number: string;
    order: Partial<Order> & { id: string };
    template: string;
}

function formatMessage(template: string, order: Partial<Order> & { id: string }): string {
    let message = template;
    if (order.customerName) {
        message = message.replace(/\[customerName\]/g, order.customerName);
    }
    if (order.id) {
        message = message.replace(/\[orderId\]/g, order.id.slice(0, 7).toUpperCase());
    }
    // You can add more placeholder replacements here, e.g., for totalAmount
    // if (order.totalAmount) {
    //   message = message.replace(/\[totalAmount\]/g, order.totalAmount.toFixed(2));
    // }
    return message;
}

export const sendSms = async ({ number, order, template }: SendSmsParams) => {
    if (!number || !template) {
        console.error("SMS not sent: Missing number or template.");
        return;
    }

    const message = formatMessage(template, order);

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
