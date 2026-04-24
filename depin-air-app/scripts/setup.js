const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function run(command) {
  console.log(`\x1b[36mRunning: ${command}\x1b[0m`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (e) {
    console.error(`\x1b[31mCommand failed: ${command}\x1b[0m`);
    process.exit(1);
  }
}

console.log('\x1b[32m🚀 Starting DePIN-Air Setup...\x1b[0m');

// 1. Install dependencies
console.log('\x1b[34m📦 Installing dependencies...\x1b[0m');
run('npm install');

// 2. Setup environment
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('\x1b[34m📄 Creating .env from .env.example...\x1b[0m');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
  } else {
    console.warn('\x1b[33m⚠️ .env.example not found. Creating empty .env\x1b[0m');
    fs.writeFileSync(envPath, '');
  }
} else {
  console.log('\x1b[34m✅ .env already exists.\x1b[0m');
}

// 3. Build project
console.log('\x1b[34m🏗️ Building project...\x1b[0m');
run('npm run build');

console.log('\x1b[32m✨ Setup complete! Starting dev server...\x1b[0m');

// 4. Start dev server
run('npm run dev');
