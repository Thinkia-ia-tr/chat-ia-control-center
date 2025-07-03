export interface Referral {
  id: string;
  conversation_id: string;
  conversation_title: string;
  conversation_date: string; // Fecha de la conversación
  client_type: string;
  client_value: string;
  referral_type: string;
  created_at: string;
  notes?: string;
}

export interface ClientData {
  type: string;
  value: string;
}