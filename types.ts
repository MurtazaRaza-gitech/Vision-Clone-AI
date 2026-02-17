
export interface GenerationResult {
  id: string;
  originalImage: string;
  generatedImage: string;
  prompt: string;
  timestamp: number;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
