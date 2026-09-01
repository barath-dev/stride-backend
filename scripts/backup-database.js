// scripts/backup-database.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const createBackup = async () => {
  try {
    console.log('🔄 Creating database backup...');

    // Create backups directory
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Get current timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(
      backupDir,
      `stride-db-backup-${timestamp}.sql`
    );

    // Load database config
    const config = require('../config/config.js')[
      process.env.NODE_ENV || 'production'
    ];

    console.log('📦 Backing up database...');
    console.log(`Host: ${config.host}`);
    console.log(`Database: ${config.database}`);

    // Create backup command
    const backupCommand = [
      'pg_dump',
      `-h ${config.host}`,
      `-U ${config.username}`,
      `-p ${config.port}`,
      `-d ${config.database}`,
      '--no-password',
      '--clean',
      '--create',
      '--verbose',
      `> "${backupFile}"`,
    ].join(' ');

    // Set password environment variable
    const env = {
      ...process.env,
      PGPASSWORD: config.password,
    };

    execSync(backupCommand, {
      stdio: 'inherit',
      shell: true,
      env,
    });

    // Verify backup file exists and has content
    if (fs.existsSync(backupFile)) {
      const stats = fs.statSync(backupFile);
      if (stats.size > 0) {
        console.log(`✅ Backup completed successfully!`);
        console.log(`📁 Backup file: ${backupFile}`);
        console.log(
          `📊 Backup size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`
        );
        return backupFile;
      } else {
        throw new Error('Backup file is empty');
      }
    } else {
      throw new Error('Backup file was not created');
    }
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Make sure pg_dump is installed and in your PATH');
    console.error('2. Verify database connection details in config.js');
    console.error('3. Check if the database password is correct');
    console.error('4. Ensure the database is accessible from your machine');
    throw error;
  }
};

// Also backup migration state
const backupMigrationState = () => {
  try {
    console.log('📋 Backing up migration files...');

    const migrationDir = path.join(__dirname, '../src/migrations');
    const backupDir = path.join(__dirname, '../backups/migrations');

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Copy all migration files
    const migrations = fs
      .readdirSync(migrationDir)
      .filter(file => file.endsWith('.js'));

    migrations.forEach(migration => {
      const source = path.join(migrationDir, migration);
      const dest = path.join(backupDir, migration);
      fs.copyFileSync(source, dest);
    });

    console.log(`✅ Backed up ${migrations.length} migration files`);
    return backupDir;
  } catch (error) {
    console.error('❌ Migration backup failed:', error.message);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    const dbBackup = await createBackup();
    const migrationBackup = backupMigrationState();

    console.log('\n🎉 All backups completed successfully!');
    console.log('📁 Database backup:', dbBackup);
    console.log('📁 Migration backup:', migrationBackup);

    return { dbBackup, migrationBackup };
  } catch (error) {
    console.error('\n💥 Backup process failed!');
    console.error(
      'Please fix the issues above before proceeding with optimizations.'
    );
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createBackup, backupMigrationState, main };
