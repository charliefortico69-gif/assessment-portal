const net = require('net');
const { spawn } = require('child_process');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

async function findAvailablePort(startPort = 5000) {
  for (let port = startPort; port < startPort + 100; port++) {
    if (await checkPort(port)) {
      return port;
    }
  }
  throw new Error('No available port found');
}

async function startServer() {
  try {
    const port = await findAvailablePort(5000);
    console.log(`Found available port: ${port}`);
    
    // Update .env file
    const fs = require('fs');
    const envContent = fs.readFileSync('.env', 'utf8');
    const updatedEnv = envContent.replace(/PORT=\d+/, `PORT=${port}`);
    fs.writeFileSync('.env', updatedEnv);
    
    console.log(`Updated .env file with PORT=${port}`);
    console.log('Starting server...');
    
    // Start the server
    const server = spawn('node', ['server.js'], {
      stdio: 'inherit',
      env: { ...process.env, PORT: port }
    });
    
    server.on('error', (err) => {
      console.error('Server error:', err);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();