const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const backupController = {
  // GET /api/backup - List available backups
  async listBackups(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const files = fs.readdirSync(BACKUP_DIR);
      const backups = files
        .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(BACKUP_DIR, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            sizeBytes: stats.size,
            createdAt: stats.mtime
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt);

      res.json({ success: true, backups });
    } catch (error) {
      console.error('List backups error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve backups.' });
    }
  },

  // POST /api/backup/create - Create backup
  async createBackup(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const connection = await pool.getConnection();
      try {
        // Get list of tables
        const [tablesResult] = await connection.query('SHOW TABLES');
        const dbNameKey = Object.keys(tablesResult[0])[0];
        const tables = tablesResult.map(row => row[dbNameKey]);

        const backupData = {
          timestamp: new Date().toISOString(),
          tables: {}
        };

        for (const table of tables) {
          const [rows] = await connection.query(`SELECT * FROM \`${table}\``);
          backupData.tables[table] = rows;
        }

        // Generate filename
        const now = new Date();
        const timestamp = now.getFullYear() +
          String(now.getMonth() + 1).padStart(2, '0') +
          String(now.getDate()).padStart(2, '0') + '_' +
          String(now.getHours()).padStart(2, '0') +
          String(now.getMinutes()).padStart(2, '0') +
          String(now.getSeconds()).padStart(2, '0');

        const filename = `backup_${timestamp}.json`;
        const filePath = path.join(BACKUP_DIR, filename);

        fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');

        res.json({
          success: true,
          message: `Backup created successfully: ${filename}`,
          filename
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Create backup error:', error);
      res.status(500).json({ success: false, message: 'Failed to create backup.' });
    }
  },

  // POST /api/backup/restore - Restore backup
  async restoreBackup(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const { filename } = req.body;
      if (!filename) {
        return res.status(400).json({ success: false, message: 'Filename is required.' });
      }

      const filePath = path.join(BACKUP_DIR, filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'Backup file not found.' });
      }

      const backupContent = fs.readFileSync(filePath, 'utf8');
      const backupData = JSON.parse(backupContent);

      if (!backupData.tables) {
        return res.status(400).json({ success: false, message: 'Invalid backup file format.' });
      }

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        for (const tableName of Object.keys(backupData.tables)) {
          // Clear current table data
          await connection.query(`DELETE FROM \`${tableName}\``);

          const rows = backupData.tables[tableName];
          if (rows && rows.length > 0) {
            const columns = Object.keys(rows[0]);
            const placeholders = columns.map(() => '?').join(', ');
            const insertQuery = `INSERT INTO \`${tableName}\` (${columns.map(c => `\`${c}\``).join(', ')}) VALUES (${placeholders})`;
            
            for (const row of rows) {
              const values = columns.map(col => {
                const val = row[col];
                // Convert Date strings back to Date objects or properly formatted DB strings if needed
                // mysql2/promise handles ISO Date strings well, but we should pass null for nulls
                return val === undefined ? null : val;
              });
              await connection.execute(insertQuery, values);
            }
          }
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        await connection.commit();

        res.json({
          success: true,
          message: 'Database restored successfully from backup.'
        });
      } catch (err) {
        await connection.rollback();
        try {
          await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        } catch (e) {}
        throw err;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Restore backup error:', error);
      res.status(500).json({ success: false, message: 'Failed to restore backup.' });
    }
  },

  // DELETE /api/backup/:filename - Delete backup file
  async deleteBackup(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const { filename } = req.params;
      const filePath = path.join(BACKUP_DIR, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'Backup file not found.' });
      }

      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Backup file deleted successfully.' });
    } catch (error) {
      console.error('Delete backup error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete backup file.' });
    }
  }
};

module.exports = backupController;
