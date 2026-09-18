import React from 'react';
import { CertificateBorder } from './CertificateBorder';
import { ReportHeader } from './ReportHeader';
import { ReportTable } from './ReportTable';
import { ReportSignatures } from './ReportSignatures';
import { Subject, CalculatedStudent, SchoolConfig } from '../types';
import { getSubjectsForClass } from '../data/curriculumSubjects';
import { INITIAL_CLASSES } from '../data/initialData';
import { getWaliKelasForClass } from '../data/waliKelasDatabase';

interface ReportCertificateProps {
  student: CalculatedStudent;
  subjects: Subject[];
  config: SchoolConfig;
  className?: string;
  isPrintOnly?: boolean;
  onOpenDateSettings?: () => void;
  id?: string;
}

export const ReportCertificate: React.FC<ReportCertificateProps> = ({
  student,
  subjects,
  config,
  className = '',
  isPrintOnly = false,
  onOpenDateSettings,
  id = 'raport-certificate-container',
}) => {
  const effectiveSubjects = student.classId
    ? getSubjectsForClass(student.classId)
    : subjects;

  // Resolve official class information and homeroom teacher name & academic title
  const classInfo = student.classId
    ? INITIAL_CLASSES.find((c) => c.id === student.classId)
    : undefined;

  const resolvedWaliKelas =
    (student.classId ? getWaliKelasForClass(student.classId) : undefined) ||
    classInfo?.waliKelasName ||
    config.waliKelasName;

  const resolvedClassAr = classInfo?.nameAr || config.classAr;
  const resolvedClassLatin = classInfo?.nameLatin || config.classLatin;

  const effectiveConfig: SchoolConfig = {
    ...config,
    classAr: resolvedClassAr,
    classLatin: resolvedClassLatin,
    waliKelasName: resolvedWaliKelas,
  };

  return (
    <div
      id={id}
      className={`rapor-page mx-auto bg-white text-stone-900 ${
        isPrintOnly ? '' : 'shadow-2xl rounded-sm'
      } ${className}`}
      style={{
        width: '210mm',
        height: '297mm',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        margin: '0 auto',
      }}
    >
      <CertificateBorder>
        <ReportHeader
          studentName={student.name}
          nisn={student.nisn}
          config={effectiveConfig}
        />

        <ReportTable
          subjects={effectiveSubjects}
          scores={student.scores}
          totalScore={student.totalScore}
          averageScore={student.averageScore}
          rank={student.rank}
        />

        <ReportSignatures config={effectiveConfig} onOpenDateSettings={onOpenDateSettings} />
      </CertificateBorder>
    </div>
  );
};

