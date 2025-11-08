export type ShippingOption = {
  id: string;
  label: string;
  price: number;
};

export type Settings = {
  whatsappNumber: string;
  messengerLink: string;
  hotlineNumber?: string;
  heroImageUrl?: string;
  heroImageCdnUrl?: string;
  shippingOptions?: ShippingOption[];
  smsGreetingPlaced?: string;
  smsGreetingConfirmed?: string;
  smsGreetingDelivered?: string;
  welcomeMessage?: string;
};
