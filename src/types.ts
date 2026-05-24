export type JobStatus = 'applied' | 'interview' | 'offer' | 'rejected' | 'pending';
export type JobSource = 'LinkedIn' | 'Kariyer.net' | 'Indeed' | 'Glassdoor' | 'Diğer';

export interface JobApplication {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  source: JobSource;
  url?: string;
  dateApplied: string;
  salaryExpectation?: string;
  location?: string;
  workType?: 'Remote' | 'Hibrit' | 'Ofis';
  notes: string;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export type ReminderType = 'Takip e-postası' | 'Mülakat hazırlığı' | 'Yanıt bekleme' | 'Özel';

export interface Reminder {
  id: string;
  jobId?: string;
  type: ReminderType;
  date: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: number;
}

export interface CompanyNote {
  id: string;
  company: string;
  industry?: string;
  rating?: number;
  disposition?: 'Olumlu' | 'Olumsuz' | 'Nötr';
  notes: string;
  updatedAt: number;
}
