
export type Language = 'UZ' | 'EN' | 'RU';
export type InputType = 'document' | 'youtube';

export interface Slide {
  title: string;
  bullets: string[];
}

export interface Presentation {
  title: string;
  slides: Slide[];
}

export interface AppState {
  inputText: string;
  language: Language;
  inputType: InputType;
  isProcessing: boolean;
  isThinkingEnabled: boolean;
  error: string | null;
  presentation: Presentation | null;
}

export interface PPTXExportData {
  requestSchema: object;
  pythonPrompt: string;
}
