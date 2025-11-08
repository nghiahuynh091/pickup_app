#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const path = require('path');

function getCurrentIP() {
  const interfaces = os.networkInterfaces();
  
  for (const interfaceName in interfaces) {
    const networkInterface = interfaces[interfaceName];
    
    for (const connection of networkInterface || []) {
      // Look for IPv4 addresses that are not internal (loopback)
      if (connection.family === 'IPv4' && !connection.internal) {
        // Prefer WiFi interfaces
        if (interfaceName.toLowerCase().includes('wi-fi') || 
            interfaceName.toLowerCase().includes('wlan') ||
            interfaceName.toLowerCase().includes('en0')) {
          return connection.address;
        }
      }
    }
  }
  
  // Fallback: return any non-internal IPv4 address
  for (const interfaceName in interfaces) {
    const networkInterface = interfaces[interfaceName];
    
    for (const connection of networkInterface || []) {
      if (connection.family === 'IPv4' && !connection.internal) {
        return connection.address;
      }
    }
  }
  
  return null;
}

function updateEnvFile(ip) {
  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add SERVER_HOST
    const serverHostRegex = /^EXPO_PUBLIC_SERVER_HOST=.*$/m;
    const newServerHostLine = `EXPO_PUBLIC_SERVER_HOST="${ip}"`;
    
    if (serverHostRegex.test(envContent)) {
      envContent = envContent.replace(serverHostRegex, newServerHostLine);
    } else {
      // Add at the end
      envContent += `\n${newServerHostLine}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Updated .env file with IP: ${ip}`);
  } catch (error) {
    console.error('❌ Error updating .env file:', error);
  }
}

function main() {
  console.log('🔍 Detecting current network IP...');
  
  const ip = getCurrentIP();
  
  if (ip) {
    console.log(`📱 Current IP address: ${ip}`);
    updateEnvFile(ip);
    
    console.log('\n🎯 Next steps:');
    console.log('1. Restart your Expo development server');
    console.log('2. Your mobile devices should now connect automatically');
    console.log('\n💡 Run this script whenever you switch WiFi networks:');
    console.log('   npm run update-ip');
  } else {
    console.log('❌ Could not detect IP address');
    console.log('💡 Please set EXPO_PUBLIC_SERVER_HOST manually in .env file');
  }
}

main();