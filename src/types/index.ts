export interface Agent {
  id: string
  name: string
  email: string
  phone: string
  active: boolean
  access_leads: boolean
  access_docs: boolean
  access_msgs: boolean
  created_at: string
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  status: 'Hot' | 'Warm' | 'Cold'
  agent_id: string | null
  notes: string
  created_at: string
  agents?: { name: string } | null
}

export interface Message {
  id: string
  agent_id: string
  body: string
  from_broker: boolean
  created_at: string
}

export interface Document {
  id: string
  file_name: string
  file_url: string | null
  status: 'Pending' | 'Processing' | 'Scanned'
  extracted_data: Record<string, unknown> | null
  created_at: string
}
