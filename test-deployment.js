#!/usr/bin/env node

/**
 * Deployment Test Script
 * Run this to verify your app is ready for Render deployment
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Testing Deployment Readiness...\n');

let errors = 0;
let warnings = 0;

// Test 1: Check if dist folder exists
console.log('1️⃣  Checking build output...');
if (existsSync(join(__dirname, 'dist'))) {
  console.log('   ✅ dist/ folder exists');
  
  if (existsSync(join(__dirname, 'dist', 'index.html'))) {
    console.log('   ✅ dist/index.html exists');
  } else {
    console.log('   ❌ dist/index.html NOT FOUND');
    errors++;
  }
  
  if (existsSync(join(__dirname, 'dist', 'assets'))) {
    console.log('   ✅ dist/assets/ folder exists');
  } else {
    console.log('   ⚠️  dist/assets/ folder NOT FOUND');
    warnings++;
  }
} else {
  console.log('   ❌ dist/ folder NOT FOUND - Run "npm run build" first');
  errors++;
}

// Test 2: Check package.json scripts
console.log('\n2️⃣  Checking package.json scripts...');
const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));

if (pkg.scripts?.build) {
  console.log('   ✅ "build" script exists:', pkg.scripts.build);
} else {
  console.log('   ❌ "build" script NOT FOUND');
  errors++;
}

if (pkg.scripts?.start) {
  console.log('   ✅ "start" script exists:', pkg.scripts.start);
} else {
  console.log('   ❌ "start" script NOT FOUND');
  errors++;
}

// Test 3: Check server.js
console.log('\n3️⃣  Checking server.js...');
if (existsSync(join(__dirname, 'server.js'))) {
  console.log('   ✅ server.js exists');
  
  const serverContent = readFileSync(join(__dirname, 'server.js'), 'utf-8');
  
  if (serverContent.includes('express')) {
    console.log('   ✅ Uses Express');
  } else {
    console.log('   ⚠️  Doesn\'t use Express');
    warnings++;
  }
  
  if (serverContent.includes('app.get(\'*\'')) {
    console.log('   ✅ Has catch-all route for SPA');
  } else {
    console.log('   ❌ Missing catch-all route - Client-side routing will fail');
    errors++;
  }
  
  if (serverContent.includes('process.env.PORT')) {
    console.log('   ✅ Uses PORT environment variable');
  } else {
    console.log('   ⚠️  Doesn\'t use PORT env var - May fail on Render');
    warnings++;
  }
} else {
  console.log('   ❌ server.js NOT FOUND');
  errors++;
}

// Test 4: Check render.yaml
console.log('\n4️⃣  Checking render.yaml...');
if (existsSync(join(__dirname, 'render.yaml'))) {
  console.log('   ✅ render.yaml exists');
  
  const renderConfig = readFileSync(join(__dirname, 'render.yaml'), 'utf-8');
  
  if (renderConfig.includes('buildCommand')) {
    console.log('   ✅ Has buildCommand');
  } else {
    console.log('   ⚠️  Missing buildCommand');
    warnings++;
  }
  
  if (renderConfig.includes('startCommand')) {
    console.log('   ✅ Has startCommand');
  } else {
    console.log('   ⚠️  Missing startCommand');
    warnings++;
  }
  
  if (renderConfig.includes('VITE_SUPABASE_URL')) {
    console.log('   ✅ Has VITE_SUPABASE_URL env var');
  } else {
    console.log('   ⚠️  Missing VITE_SUPABASE_URL env var');
    warnings++;
  }
  
  if (renderConfig.includes('VITE_SUPABASE_ANON_KEY')) {
    console.log('   ✅ Has VITE_SUPABASE_ANON_KEY env var');
  } else {
    console.log('   ⚠️  Missing VITE_SUPABASE_ANON_KEY env var');
    warnings++;
  }
} else {
  console.log('   ⚠️  render.yaml NOT FOUND (can configure via dashboard)');
  warnings++;
}

// Test 5: Check environment variables
console.log('\n5️⃣  Checking environment variables...');
console.log('   ℹ️  Note: These should be set in Render dashboard, not locally');

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName} is set`);
  } else {
    console.log(`   ⚠️  ${varName} NOT SET (must be set in Render dashboard)`);
  }
});

// Test 6: Check dependencies
console.log('\n6️⃣  Checking dependencies...');
if (pkg.dependencies?.express) {
  console.log('   ✅ express is in dependencies');
} else {
  console.log('   ❌ express NOT in dependencies');
  errors++;
}

if (pkg.dependencies?.['@supabase/supabase-js']) {
  console.log('   ✅ @supabase/supabase-js is in dependencies');
} else {
  console.log('   ❌ @supabase/supabase-js NOT in dependencies');
  errors++;
}

if (pkg.dependencies?.['react-router-dom']) {
  console.log('   ✅ react-router-dom is in dependencies');
} else {
  console.log('   ❌ react-router-dom NOT in dependencies');
  errors++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 SUMMARY');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
  console.log('✅ All checks passed! Ready to deploy to Render.');
  console.log('\n📝 Next steps:');
  console.log('   1. Push code to GitHub');
  console.log('   2. Connect repository in Render');
  console.log('   3. Set environment variables in Render dashboard');
  console.log('   4. Deploy!');
} else {
  if (errors > 0) {
    console.log(`❌ ${errors} error(s) found - Must fix before deploying`);
  }
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} warning(s) found - Should review`);
  }
  
  console.log('\n📝 Recommended actions:');
  if (errors > 0) {
    console.log('   1. Fix all errors listed above');
    console.log('   2. Run "npm run build" to create dist folder');
    console.log('   3. Run this script again to verify');
  }
  if (warnings > 0) {
    console.log('   1. Review warnings above');
    console.log('   2. Set environment variables in Render dashboard');
  }
}

console.log('\n💡 For detailed troubleshooting, see: RENDER_PORTAL_FIX.md');

process.exit(errors > 0 ? 1 : 0);
