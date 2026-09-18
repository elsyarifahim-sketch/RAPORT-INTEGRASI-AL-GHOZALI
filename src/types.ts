export interface ClassItem {
  id: string;
  nameLatin: string;
  nameAr: string;
  waliKelasName?: string;
  level?: '1' | '2' | '3';
}

export interface Subject {
  id: string;
  order: number;
  nameId: string;
  nameAr: string;
  category: 'pondok' | 'umum' | 'lisan';
}

export interface StudentRecord {
  id: string;
  no: number;
  classId: string; // ID of the class e.g. '1-int-a'
  name: string;
  nisn: string;
  scores: Record<string, number>; // subject id -> score (0-100)
  keterangan?: string;
}


export interface CalculatedStudent extends StudentRecord {
  totalScore: number;
  averageScore: number;
  rank: number;
}

export interface SchoolConfig {
  institutionName: string;
  schoolName: string;
  subTitleId: string;
  titleAr: string;
  subTitleAr: string;
  classLatin: string;
  classAr: string;
  academicYearLatin: string;
  academicYearAr: string;
  semesterLatin: string;
  semesterAr: string;
  placeNameAr: string;
  placeNameLatin: string;
  dateMasehi: string;
  dateHijri: string;
  dateTextAr: string;
  waliKelasName: string;
  waliKelasTitle: string;
  direkturName: string;
  direkturTitle: string;
  waliSantriLabelAr: string;
  waliKelasLabelAr: string;
  direkturLabelAr: string;
}
