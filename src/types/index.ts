export interface Cliente {
  id: string;
  nome: string;
  documento?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  criado_em: string;
}

export interface Projeto {
  id: string;
  cliente_id: string;
  titulo: string;
  status: 'levantamento' | 'contrato' | 'instalacao' | 'finalizado';
  potencia_kwp?: number;
  inversor_modelo?: string;
  modulos_modelo?: string;
  modulos_quantidade?: number;
  checklist?: any;
  instalacao_checklist?: any;
  dimensionamento?: any;
  criado_em: string;
}
