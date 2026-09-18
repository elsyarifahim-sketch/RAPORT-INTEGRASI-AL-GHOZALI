import React from 'react';
import { CertificateBorder } from './CertificateBorder';
import { ReportHeader } from './ReportHeader';
import { ReportTable } from './ReportTable';
import { ReportSignatures } from './ReportSignatures';
import { Subject, CalculatedStudent, SchoolConfig } from '../types';

interface ReportCertificateProps {
  student: CalculatedStudent;
  subjects: Subject[];
  config: SchoolConfig;
  className?: string;
  isPrintOnly?: boolean;
}

export const ReportCertificate: React.FC<ReportCertificateProps> = ({
  student,
  subjects,
  config,
  className = '',
  isPrintOnly = false,
}) => {
  return (
    <div
      className={`print-page mx-auto bg-white text-stone-900 ${
        isPrintOnly ? '' : 'shadow-2xl rounded-sm'
      } ${className}`}
      style={{
        width: '100%',
        maxWidth: '820px',
        minHeight: '1130px',
      }}
    >
      <CertificateBorder>
        <ReportHeader
          studentName={student.name}
          nisn={student.nisn}
          config={config}
        />

        <ReportTable
          subjects={subjects}
          scores={student.scores}
          totalScore={student.totalScore}
          averageScore={student.averageScore}
          rank={student.rank}
        />

        <ReportSignatures config={config} />
      </CertificateBorder>
    </div>
  );
};
