import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const sftpSimulator = {
  getDirectories() {
    return {
      host: 'demo-sftp.internal',
      port: 22,
      authMethod: 'SSH Key Simulation (RSA 4096)',
      directories: {
        incoming: '/mock_sftp/incoming',
        processed: '/mock_sftp/processed',
        error: '/mock_sftp/error',
        outgoing: '/mock_sftp/outgoing'
      }
    };
  },

  getSafeSftpPath(baseFolder, userProvidedPath) {
    if (!userProvidedPath || typeof userProvidedPath !== 'string') {
      throw new Error('SFTP Security Error: Invalid filename or path');
    }
    // Reject path traversal sequences
    if (userProvidedPath.includes('..') || userProvidedPath.includes('%2e%2e')) {
      throw new Error('SFTP Security Error: Path traversal attempt blocked');
    }
    const baseName = path.basename(userProvidedPath);
    const safeBase = path.resolve(process.cwd(), baseFolder);
    const resolved = path.resolve(safeBase, baseName);
    if (!resolved.startsWith(safeBase)) {
      throw new Error('SFTP Security Error: Path traversal attempt blocked');
    }
    return resolved;
  },

  calculateStringChecksum(content) {
    return crypto.createHash('sha256').update(content || '').digest('hex');
  },

  parseCSVString(content) {
    if (!content || typeof content !== 'string') {
      content = `application_id,citizen_name,address,district,verified\nGM-2026-000124,Rajesh Shantaram Patil,Flat 402 Shivshankar Heights Karve Road Kothrud,Pune,true`;
    }
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [], raw: content };

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

  readCSV(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return this.parseCSVString(content);
      }
    } catch (e) {
      // Fallback
    }

    return this.parseCSVString(null);
  },

  generateResultCSV(fileName, batchResults) {
    const safeBaseName = path.basename(fileName);
    const outputFileName = safeBaseName.endsWith('.csv')
      ? safeBaseName.replace('.csv', '_RESULT.csv')
      : `${safeBaseName}_RESULT.csv`;

    let csvContent = 'application_id,status,error_code,error_message\n';
    batchResults.forEach(res => {
      csvContent += `${res.applicationId},${res.status},${res.errorCode || ''},${res.errorMessage ? `"${res.errorMessage}"` : ''}\n`;
    });

    return { outputFileName, outputPath: `/mock_sftp/outgoing/${outputFileName}`, csvContent };
  }
};
