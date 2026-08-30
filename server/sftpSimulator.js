import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { db } from './db.js';

const IS_VERCEL = !!process.env.VERCEL;
const MOCK_SFTP_BASE = IS_VERCEL
  ? path.join(os.tmpdir(), 'mock_sftp')
  : path.resolve(process.cwd(), 'mock_sftp');

const DIRS = {
  incoming: path.join(MOCK_SFTP_BASE, 'incoming'),
  processed: path.join(MOCK_SFTP_BASE, 'processed'),
  error: path.join(MOCK_SFTP_BASE, 'error'),
  outgoing: path.join(MOCK_SFTP_BASE, 'outgoing')
};

// Safely ensure directories exist
Object.values(DIRS).forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    // Ignore directory creation failure on read-only filesystems
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
    try {
      if (!fs.existsSync(filePath)) return null;
      const fileBuffer = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(fileBuffer).digest('hex');
    } catch (e) {
      return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    }
  },

  calculateStringChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  },

  readCSV(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length > 0) {
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
        }
      }
    } catch (e) {
      // Fallback
    }

    // Default sample fallback parsed CSV
    const defaultRaw = `application_id,citizen_name,address,district,verified\nGM-2026-000124,Demo Citizen,Gram Panchayat Ward No 4 Village Khed,Pune,true`;
    return {
      headers: ['application_id', 'citizen_name', 'address', 'district', 'verified'],
      rows: [
        { application_id: 'GM-2026-000124', citizen_name: 'Demo Citizen', address: 'Gram Panchayat Ward No 4 Village Khed', district: 'Pune', verified: 'true' }
      ],
      raw: defaultRaw
    };
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

    try {
      fs.writeFileSync(outputPath, csvContent, 'utf-8');
    } catch (e) {
      // File writing fallback for serverless
    }

    return { outputFileName, outputPath, csvContent };
  }
};
