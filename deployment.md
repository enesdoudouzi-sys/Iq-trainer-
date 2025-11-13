# Deployment Guide - IQ Trainer App v2.0

## 🚀 Schnellstart

### Lokal testen
```bash
# 1. Repository klonen
git clone <your-repo-url>
cd IQ-trainer

# 2. HTTP Server starten
npx http-server . -p 8000

# 3. Browser öffnen
open http://localhost:8000
```

### Mit Docker (Optional)
```dockerfile
FROM node:20-slim
WORKDIR /app
COPY . .
EXPOSE 8000
CMD ["npx", "http-server", ".", "-p", "8000"]
```

```bash
docker build -t iq-trainer .
docker run -p 8000:8000 iq-trainer
```

## 📋 Vor dem Deployment checken

- [ ] Alle Daten sind offline verfügbar (IndexedDB + Service Worker)
- [ ] Service Worker registriert sich korrekt
- [ ] Alle Sprachen funktionieren
- [ ] Atemübung ist konfigurierbar
- [ ] Data Export/Import funktioniert
- [ ] Tests laufen durch (`npm test`)
- [ ] Lighthouse Score ist > 90
- [ ] HTTPS aktiviert (für PWA-Installation erforderlich)

## 🌍 App Store Vorbereitung

### 1. Screenshots generieren
```bash
# Nutze Playwright um Screenshots in verschiedenen Größen zu erstellen
npm run test -- --screenshot=on
```

### 2. Icons exportieren
- Mindestens: 192x192, 512x512 (PNG)
- Optional: WebP/AVIF Varianten
- Speichern unter `icons/` mit Versionsnummer

### 3. App Store Metadaten
Bearbeite `app-store-metadata.json`:
```json
{
  "title": "Daily IQ & Focus Trainer",
  "shortDescription": "Trainiere täglich deine kognitiven Fähigkeiten",
  "description": "Umfassender Trainer für IQ, Konzentration und mentales Wohlbefinden...",
  "screenshots": [
    "screenshots/app_1.png",
    "screenshots/app_2.png",
    "screenshots/app_3.png"
  ],
  "privacyUrl": "https://your-domain.com/privacy",
  "supportUrl": "https://github.com/your-repo/issues"
}
```

## 🔒 Sicherheit vor Production

1. **HTTPS aktivieren** (zwingend erforderlich)
   ```nginx
   server {
       listen 443 ssl;
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
   }
   ```

2. **CSP Header setzen**
   ```
   Content-Security-Policy: default-src 'self' data:; 
                           style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
                           font-src https://fonts.gstatic.com;
                           script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
                           img-src 'self' data:;
   ```

3. **CORS Header**
   ```
   Access-Control-Allow-Origin: https://your-domain.com
   Access-Control-Allow-Methods: GET, OPTIONS
   ```

## 🚢 Hosting-Optionen

### Option 1: GitHub Pages (Kostenlos)
```bash
# Push auf main/gh-pages branch
git push origin main

# App ist dann verfügbar unter: https://username.github.io/iq-trainer
```

### Option 2: Netlify (Kostenlos mit Custom Domain)
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Option 3: Vercel
```bash
npm install -g vercel
vercel --prod
```

### Option 4: Self-Hosted (Apache/Nginx)
```bash
# Kopiere Dateien auf Server
scp -r * user@server:/var/www/iq-trainer/

# Starte Nginx
sudo systemctl restart nginx
```

## 📊 Performance Monitoring

### Lighthouse Audit (lokal)
```bash
npm run test  # Runs Playwright tests
```

### Production Monitoring
```bash
# Mit curl
curl -I https://your-domain.com
# Sollte zeigen: Strict-Transport-Security, Content-Security-Policy

# Mit Chrome DevTools
# Öffne: https://your-domain.com → F12 → Lighthouse
```

## 🔄 CI/CD Pipeline

Die GitHub Actions Pipeline führt automatisch aus:
1. ✅ Unit Tests (Playwright)
2. ✅ Lighthouse Performance Audit
3. ✅ Accessibility Check (axe)
4. ✅ Security Scan (Snyk)
5. ✅ Manifest Validation

Logs sind verfügbar unter: **Actions** Tab im Repo

## 🎓 Weitere Verbesserungen (Roadmap)

### Phase 3 (Q1 2026)
- [ ] Native App mit Capacitor (iOS + Android)
- [ ] Server-Backend für optionale Sync
- [ ] Multiplayer Challenges
- [ ] Community Leaderboard

### Phase 4 (Q2 2026)
- [ ] AI-powered Tutoring
- [ ] Voice-based IQ Tests
- [ ] API für third-party integrations
- [ ] Mobile App Stores (Google Play, Apple App Store)

## 🛠️ Troubleshooting

### Service Worker funktioniert nicht
```bash
# Browser DevTools → Application → Service Workers
# Falls nicht registriert:
# 1. Prüfe HTTPS (Service Worker braucht HTTPS)
# 2. Check Browser Console für Fehler
# 3. Stelle sicher, dass sw.js im Root ist
```

### IndexedDB funktioniert nicht
```javascript
// In Browser Console:
indexedDB.databases().then(dbs => console.log(dbs));
// Sollte "IQTrainerDB" zeigen
```

### Export funktioniert nicht
```bash
# Prüfe Browser Permissions
# Firefox: about:config → dom.disable_beforeunload = false
```

## 📞 Support

- 🐛 **Bugs melden:** GitHub Issues
- 💬 **Diskussionen:** GitHub Discussions
- 📧 **E-Mail:** [your-email@example.com]
- 🌐 **Website:** [your-website.com]

---

**Version:** 2.0.0 | **Letztes Update:** November 2025
