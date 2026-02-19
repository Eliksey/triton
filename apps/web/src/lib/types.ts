export type Language = 'ru' | 'en';

export type Issue = {
  id: string;
  title: string;
  releaseMonth: string;
  description: string | null;
  pdfUrl: string;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthUser = {
  sub: string;
  username: string;
  role: string;
};

