export enum Phase {
  DIAGNOSIS = 'DIAGNOSIS',
  HOSPITALIZATION = 'HOSPITALIZATION',
  DISCHARGE = 'DISCHARGE',
  FRAILTY = 'FRAILTY'
}

export enum BorrmannType {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV'
}

export interface NavItem {
  id: Phase;
  label: string;
  icon: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface StomachProps {
  viewMode: 'anatomy' | 'borrmann' | 'surgery' | 'healthy';
  borrmannType?: BorrmannType;
  highlightPart?: string;
  onClickPart?: (part: string) => void;
}