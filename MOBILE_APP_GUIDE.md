# SafariBus Mobile App Deployment Guide

## Jinsi ya Kufanya System iwe Mobile App 📱

### 1. Local Testing (Kwa Matumizi ya Ndani)
```bash
# Start server
cd c:\Users\NICKSON\Desktop\buss-tickrt
npm start
```

### 2. Access kwa Mobile Phone

#### Njia A: Local Network (WiFi)
1. **Pata IP Address yako:**
   ```bash
   ipconfig
   # Tafuta line yenye "IPv4 Address" (k.m. 192.168.1.100)
   ```

2. **Badilisha server.js kuwa inasikiliza kwenye all interfaces:**
   ```javascript
   // Katika server.js, badilisha line hii:
   app.listen(PORT, '0.0.0.0', () => {
       console.log(`Server running on http://0.0.0.0:${PORT}`);
   });
   ```

3. **Access kwa simu:**
   - Fungua browser kwenye simu
   - Nenda `http://192.168.1.100:5000` (badilisha na IP yako)
   - App itaonyesha "📱 Sakinisha App" button

#### Njia B: Internet Deployment (Kwa Wote)
1. **Deploy kwa Heroku:**
   ```bash
   # Install Heroku CLI
   heroku login
   
   # Create app
   heroku create safari-bus-app
   
   # Deploy
   git add .
   git commit -m "Deploy PWA"
   git push heroku main
   ```

2. **Deploy kwa Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

### 3. Installation kwenye Simu

#### Android Phones:
1. **Fungua Chrome browser**
2. **Nenda kwa app URL**
3. **Subiri "📱 Sakinisha App" button kuonekana**
4. **Bonyeza button**
5. **Bonyeza "Sakinisha"**
6. **App itaonekana kwenye home screen**

#### iPhone:
1. **Fungua Safari browser**
2. **Nenda kwa app URL**
3. **Bonyeza "Share" icon (📤)**
4. **Bonyeza "Add to Home Screen"**
5. **Bonyeza "Add"**

### 4. PWA Features Zilizoongezwa

✅ **Offline Support** - App inafanya kazi bora bila internet
✅ **Install Prompt** - Inatoa ujumbe wa kusakinisha
✅ **App Icon** - Inaonekana kama real app
✅ **Full Screen** - Hakuna browser bars
✅ **Push Notifications Ready** - Inaweza kuongezwa baadaye
✅ **App Shortcuts** - Direct access kwa booking na dashboard

### 5. Testing Checklist

- [ ] Server inaenda kwenye port 5000
- [ ] Service worker inasajiliwa
- [ ] Install button inaonekana
- [ ] App inasakinishwa kwenye home screen
- [ ] Inafanya kazi offline (kwa pages zilizotembelea)
- [ ] Booking inafanya kazi
- [ ] Notifications zinatokea

### 6. Troubleshooting

#### Install Button Haionekani:
- Hakikisha unatumia Chrome/Safari (sio Opera mini)
- Subiri sekunde 10-15 baada ya kupage load
- Funga na ufunue browser upya
- Clear browser cache

#### App Haifanyi Kazi Offline:
- Fungua app mara moja internet iko
- Ruhusu service worker ikamilishe caching
- Jaribu tena bila internet

#### Connection Issues:
- Hakikisha server na simu ziko kwenye WiFi ileile
- Tafuta IP address sahihi
- Angalia firewall settings

### 7. Production Tips

1. **Use HTTPS** - PWA inahitaji HTTPS kwa production
2. **Domain Name** - Pata domain rahisi (k.m. safari-bus.co.tz)
3. **CDN** - Tumia CDN kwa fast loading
4. **Monitoring** - Add error tracking na analytics

### 8. Next Steps

- [ ] Add push notifications kwa booking reminders
- [ ] Add M-Pesa integration kwa payments
- [ ] Add GPS tracking kwa buses
- [ ] Add offline booking sync
- [ ] Add multi-language support

## Mawasiliano

Kwa msaada wa ziada:
- WhatsApp: +255 7XX XXX XXX
- Email: support@safaribus.co.tz

**Karibu SafariBus - Usafiri rahisi kwa simu yako!** 🚌🇹🇿
