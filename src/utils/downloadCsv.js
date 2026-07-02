import { downloadBlob } from './download';

const escapeCell = value => {
  const text = value == null ? '' : String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
};

export const downloadCsv = (filename, rows) => {
  const [header, ...dataRows] = rows;
  const csv = [
    header.map(escapeCell).join(','),
    ...dataRows.map(row => row.map(escapeCell).join(','))
  ].join('\n');
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), filename);
};
