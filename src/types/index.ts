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
  dimensionamento?: any;
  homologacao_dados?: any;
  criado_em: string;
}

export interface Orcamento {
  id: string;
  cliente_id: string;
  dados: any;
  criado_em: string;
}

export interface Profissional {
  id: string;
  usuario_id: string;
  nome: string;
  especialidade: string;
  telefone: string;
  foto_url?: string;
  instagram_url?: string;
  site_url?: string;
  estado: string;
  cidade: string;
  criado_em: string;
  nome_completo?: string;
  endereco_residencia?: string;
  cpf?: string;
  rg?: string;
  cnh?: string;
  crea?: string;
  foto_documento_url?: string;
  foto_segurando_documento_url?: string;
  status_aprovacao?: 'pendente' | 'aprovado' | 'reprovado';
}
