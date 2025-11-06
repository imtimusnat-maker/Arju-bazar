import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { number, message } = await request.json();

        if (!number || !message) {
            return NextResponse.json({ error: 'Missing number or message' }, { status: 400 });
        }

        const apiKey = process.env.SMS_API_KEY;
        const senderId = process.env.SMS_SENDER_ID;

        if (!apiKey || !senderId) {
            console.error("SMS API Key or Sender ID is not configured in environment variables.");
            return NextResponse.json({ error: 'Server configuration error for SMS' }, { status: 500 });
        }

        const encodedMessage = encodeURIComponent(message);
        
        // Ensure the number is in the correct format
        const formattedNumber = number.startsWith('88') ? number : `88${number.replace(/\D/g, '')}`;

        const apiUrl = `http://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${formattedNumber}&senderid=${senderId}&message=${encodedMessage}`;
        
        const smsApiResponse = await fetch(apiUrl, { method: 'GET' });

        if (!smsApiResponse.ok) {
             const errorText = await smsApiResponse.text();
             console.error(`SMS API call failed with status: ${smsApiResponse.status}`, errorText);
             return NextResponse.json({ error: 'Failed to send SMS', details: errorText }, { status: smsApiResponse.status });
        }

        const responseText = await smsApiResponse.text();
        
        // The API returns a simple string. We'll parse it to get the code.
        const responseCode = parseInt(responseText.trim(), 10);
        
        if (responseCode === 202) {
             return NextResponse.json({ success: true, message: 'SMS submitted successfully' });
        } else {
            console.error(`SMS API returned an error code: ${responseCode}`);
            return NextResponse.json({ success: false, error: `SMS API Error Code: ${responseCode}` }, { status: 400 });
        }

    } catch (error) {
        console.error('Error in send-sms route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
