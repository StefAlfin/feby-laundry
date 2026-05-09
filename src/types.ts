export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  service_type: string;
  scent: string;
  weight: number | null;
  status: string;
  total_price: number | null;
  notes: string | null;
  promo_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface Promo {
  id: number;
  title: string;
  description: string;
  code: string;
  valid_until: string;
  terms: string;
  created_at?: string;
}
