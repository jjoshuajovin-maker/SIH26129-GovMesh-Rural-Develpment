import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from './db.js';

const MOCK_SFTP_BASE = path.resolve(process.cwd(), 'mock_sftp');
const DIRS = {
  incoming: path.join(MOCK_SFTP_BASE, 'incoming'),
  processed: path.join(MOCK_SFTP_BASE, 'processed'),
  error: path.join(MOCK_SFTP_BASE, 'error'),
  outgoing: path.join(MOCK_SFTP_BASE, 'outgoing')
};

// Ensure directories exist
Object.values(DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export const sftpSimulator = {
  getDirectories() {
    return {
      host: 'demo-sftp.internal',
      port: 22,
      authMethod: 'SSH Key Simulation (RSA 4096)',
      directories: DIRS
    };
  },

  calculateFileChecksum(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    return hash;
  },

  calculateStringChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  },

  readCSV(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };
    
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row = { _line: index + 2 };
      headers.forEach((header, i) => {
        row[header] = values[i] !== undefined ? values[i] : '';
      });
      return row;
    });

    return { headers, rows, raw: content };
  },

  generateResultCSV(fileName, batchResults) {
    const outputFileName = fileName.endsWith('.csv')
      ? fileName.replace('.csv', '_RESULT.csv')
      : `${fileName}_RESULT.csv`;
    const outputPath = path.join(DIRS.outgoing, outputFileName);

    let csvContent = 'application_id,status,error_code,error_message\n';
    batchResults.forEach(res => {
      csvContent += `${res.applicationId},${res.status},${res.errorCode || ''},${res.errorMessage ? `"${res.errorMessage}"` : ''}\n`;
    });

    fs.writeFileSync(outputPath, csvContent, 'utf-8');
    return { outputFileName, outputPath, csvContent };
  }
};
