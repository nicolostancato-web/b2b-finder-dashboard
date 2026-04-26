export interface ClientProfile {
  id: number
  codice_cliente: string
  ragione_sociale: string
  partita_iva: string | null
  sede_comune: string | null
  sede_provincia: string | null
  sede_regione: string | null
  sede_lat: number | null
  sede_lng: number | null
  ateco_principale: string | null
  fatturato_eur: number | null
  regioni_interesse: string[] | null
  importo_min: number
  importo_max: number
  tier: 'watcher' | 'strategic' | 'premium'
  subscription_active: boolean
  subscription_expires_at: string | null
  email_contatto: string | null
}

export interface Match {
  gara_ocid: string
  company_id: number
  gara_buyer: string
  gara_amount_eur: number
  gara_cpv_id: string | null
  gara_cpv_description: string | null
  gara_locality: string | null
  gara_provincia: string | null
  gara_regione: string | null
  gara_lat: number | null
  gara_lng: number | null
  gara_macro_area: string | null
  gara_deadline: string | null
  gara_release_date: string | null
  gara_source_url: string | null
  company_ragione_sociale: string | null
  company_sede_comune: string | null
  company_sede_provincia: string | null
  company_sede_regione: string | null
  company_sede_lat: number | null
  company_sede_lng: number | null
  match_score: number
  match_label: 'alta' | 'media' | 'bassa'
  score_soa: number | null
  score_cpv_ateco: number | null
  score_geografia: number | null
  score_dimensione: number | null
  score_contattabilita: number | null
  score_qualita: number | null
  distanza_km: number | null
  rapporto_importo_fatturato: number | null
  giorni_alla_scadenza: number | null
  breakdown_json: Record<string, unknown> | null
}
