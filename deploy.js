const fs = require('fs');
const path = require('path');

console.log('🌐 SafariBus Online Deployment Setup');

// Update manifest for production
const manifestPath = path.join(__dirname, 'public', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Production settings
const productionDomain = process.env.DOMAIN || 'https://safaribus.co.tz';

manifest.start_url = productionDomain;
manifest.scope = productionDomain;

// Update theme colors for better mobile look
manifest.theme_color = '#0d6efd';
manifest.background_color = '#ffffff';

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`✅ Manifest updated for: ${productionDomain}`);

// Create production environment file
const envContent = `
NODE_ENV=production
CORS_ORIGIN=${productionDomain}
PORT=5000
`;

fs.writeFileSync(path.join(__dirname, '.env.production'), envContent.trim());
console.log('✅ Production environment created');

// Update index.html meta tags
const indexPath = path.join(__dirname, 'public', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Update theme color
indexContent = indexContent.replace(
    '<meta name="theme-color" content="#1976d2">',
    '<meta name="theme-color" content="#0d6efd">'
);

// Add production meta tags
const productionMeta = `
    <!-- Production Meta Tags -->
    <meta name="description" content="SafariBus - Book bus tickets online in Tanzania. Fast, easy, secure booking with mobile app.">
    <meta name="keywords" content="bus tickets, Tanzania, safari, booking, online, mobile app">
    <meta property="og:title" content="SafariBus - Online Bus Ticket Booking">
    <meta property="og:description" content="Book bus tickets in Tanzania easily">
    <meta property="og:url" content="${productionDomain}">
    <meta property="og:type" content="website">
`;

indexContent = indexContent.replace(
    '<!-- PWA Meta Tags -->',
    '<!-- PWA Meta Tags -->' + productionMeta
);

fs.writeFileSync(indexPath, indexContent);
console.log('✅ HTML updated for production');

console.log('\n🚀 Ready for deployment!');
console.log('\n📋 Next Steps:');
console.log('1. Deploy to Vercel: vercel --prod');
console.log('2. Or deploy to Netlify: netlify deploy --prod');
console.log('3. Share URL with customers');
console.log('\n📱 Mobile users can install PWA from the deployed URL!');
console.log(`🌐 Your app will be available at: ${productionDomain}`);

// Create deployment commands
console.log('\n💻 Deployment Commands:');
console.log('npm i -g vercel');
console.log('vercel');
console.log('# Follow prompts, then:');
console.log('vercel --prod');
