export interface AnalysisResult {
  authenticity_score: number;
  confidence: number;
  classification: string;
  risk_level: string;
  reason?: string;
  variance?: number;
  individual_scores?: Record<string, number>;
  overall_average?: number;
  is_deepfake: boolean;
  detector_version?: string;
  ai_name_detected?: boolean;
  detected_ai_keyword?: string;
  inconclusive_reason?: string;
}

export interface Analysis {
  id: string;
  original_filename: string;
  created_at: string;
  analysis_result: AnalysisResult;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface FileUploadProps {
  onFileSelect: (file: File | null, error?: string) => void;
  accept: Record<string, string[]>;
  maxSize: number;
  multiple?: boolean;
  selectedFile?: File | null;
}