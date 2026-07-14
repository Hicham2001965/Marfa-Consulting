# دليل النشر — Marfa Consulting Deployment Guide

## 📋 محتويات الدليل

1. [النشر على GitHub Pages](#النشر-على-github-pages)
2. [النشر على خادم ويب](#النشر-على-خادم-ويب)
3. [تحسينات الأداء](#تحسينات-الأداء)
4. [الأمان والحماية](#الأمان-والحماية)
5. [المراقبة والتحليلات](#المراقبة-والتحليلات)
6. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## النشر على GitHub Pages

### ✅ تم بالفعل!

الموقع الآن متاح على:
```
https://hicham2001965.github.io/Marfa-Consulting/
```

### الخطوات المتخذة:

1. ✅ تفعيل GitHub Pages من الإعدادات
2. ✅ تعيين الفرع الرئيسي (main) كمصدر
3. ✅ تفعيل HTTPS تلقائياً
4. ✅ إضافة sitemap.xml و robots.txt

### الصيانة المستقبلية:

```bash
# لتحديث الموقع، قم بـ:
git add .
git commit -m "Update: Description of changes"
git push origin main

# سيتم تحديث الموقع تلقائياً خلال دقائق
```

---

## النشر على خادم ويب

### متطلبات الخادم:

- **نظام التشغيل**: Linux (Ubuntu/Debian) أو Windows
- **خادم الويب**: Apache أو Nginx
- **PHP**: اختياري (للميزات المتقدمة)
- **SSL**: شهادة SSL مجانية (Let's Encrypt)

### خطوات النشر على Apache:

```bash
# 1. تحميل الملفات
scp -r marfa-consulting/* user@server:/var/www/marfa-consulting/

# 2. تعيين الأذونات
chmod -R 755 /var/www/marfa-consulting/
chmod -R 644 /var/www/marfa-consulting/*
chmod -R 755 /var/www/marfa-consulting/css
chmod -R 755 /var/www/marfa-consulting/js

# 3. تفعيل mod_rewrite
a2enmod rewrite
systemctl restart apache2

# 4. إضافة Virtual Host
sudo nano /etc/apache2/sites-available/marfa-consulting.conf
```

### ملف Virtual Host:

```apache
<VirtualHost *:80>
    ServerName marfa-consulting.com
    ServerAlias www.marfa-consulting.com
    DocumentRoot /var/www/marfa-consulting

    <Directory /var/www/marfa-consulting>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/marfa-error.log
    CustomLog ${APACHE_LOG_DIR}/marfa-access.log combined

    # Redirect HTTP to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName marfa-consulting.com
    ServerAlias www.marfa-consulting.com
    DocumentRoot /var/www/marfa-consulting

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/marfa-consulting.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/marfa-consulting.com/privkey.pem

    <Directory /var/www/marfa-consulting>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/marfa-error.log
    CustomLog ${APACHE_LOG_DIR}/marfa-access.log combined
</VirtualHost>
```

### تفعيل الموقع:

```bash
sudo a2ensite marfa-consulting.conf
sudo systemctl restart apache2
```

### إضافة شهادة SSL (Let's Encrypt):

```bash
sudo apt-get install certbot python3-certbot-apache
sudo certbot --apache -d marfa-consulting.com -d www.marfa-consulting.com
```

---

## خطوات النشر على Nginx:

```bash
# 1. تثبيت Nginx
sudo apt-get install nginx

# 2. إنشاء ملف الإعدادات
sudo nano /etc/nginx/sites-available/marfa-consulting
```

### ملف إعدادات Nginx:

```nginx
server {
    listen 80;
    server_name marfa-consulting.com www.marfa-consulting.com;
    
    root /var/www/marfa-consulting;
    index index.html;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name marfa-consulting.com www.marfa-consulting.com;
    
    root /var/www/marfa-consulting;
    index index.html;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/marfa-consulting.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/marfa-consulting.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    gzip_min_length 1000;

    # Cache Control
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|otf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Rewrite rules
    try_files $uri $uri/ $uri.html =404;

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /500.html;
}
```

### تفعيل الموقع:

```bash
sudo ln -s /etc/nginx/sites-available/marfa-consulting /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## تحسينات الأداء

### 1. تحسين الصور

```bash
# تحويل الصور إلى WebP
cwebp input.jpg -o input.webp

# ضغط الصور
imagemin --out-dir=compressed images/*.{jpg,png}
```

### 2. تقليل حجم CSS و JavaScript

```bash
# استخدام UglifyJS
uglifyjs js/main.js -o js/main.min.js

# استخدام CleanCSS
cleancss css/styles.css -o css/styles.min.css
```

### 3. تفعيل CDN

```html
<!-- استخدام CDN للمكتبات الخارجية -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/css/bootstrap.min.css" rel="stylesheet">
```

### 4. قياس الأداء

```bash
# استخدام Google PageSpeed Insights
# https://pagespeed.web.dev/

# استخدام GTmetrix
# https://gtmetrix.com/

# استخدام WebPageTest
# https://www.webpagetest.org/
```

---

## الأمان والحماية

### 1. تحديث الملفات الحساسة

```bash
# حذف الملفات غير الضرورية
rm -f .git .gitignore .env

# تعيين الأذونات الصحيحة
chmod 644 *.html *.css *.js
chmod 755 css js
```

### 2. إضافة رؤوس الأمان

```apache
# في .htaccess
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

### 3. حماية من الهجمات

```bash
# تفعيل WAF (Web Application Firewall)
# استخدام ModSecurity
sudo apt-get install libapache2-mod-security2
```

---

## المراقبة والتحليلات

### 1. إضافة Google Analytics

```html
<!-- أضف هذا في رأس الصفحة -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 2. مراقبة الأداء

```bash
# استخدام New Relic
# استخدام Datadog
# استخدام Sentry للأخطاء
```

### 3. النسخ الاحتياطية

```bash
# إنشاء نسخة احتياطية يومية
0 2 * * * tar -czf /backup/marfa-$(date +\%Y\%m\%d).tar.gz /var/www/marfa-consulting/
```

---

## استكشاف الأخطاء

### المشكلة: الموقع لا يحمل

**الحل:**
```bash
# تحقق من أذونات الملفات
ls -la /var/www/marfa-consulting/

# تحقق من سجلات الأخطاء
tail -f /var/log/apache2/marfa-error.log

# تحقق من اتصال الخادم
curl -I https://marfa-consulting.com
```

### المشكلة: الموقع بطيء

**الحل:**
```bash
# قياس سرعة التحميل
ab -n 100 -c 10 https://marfa-consulting.com/

# تحقق من استخدام الموارد
top
free -h
df -h
```

### المشكلة: أخطاء SSL

**الحل:**
```bash
# تحديث شهادة SSL
sudo certbot renew

# التحقق من صحة الشهادة
openssl x509 -in /etc/letsencrypt/live/marfa-consulting.com/fullchain.pem -text -noout
```

---

## قائمة التحقق قبل النشر

- [ ] جميع الروابط تعمل بشكل صحيح
- [ ] الموقع يعمل على جميع المتصفحات
- [ ] الموقع متجاوب على جميع الأجهزة
- [ ] صور محسّنة وسريعة التحميل
- [ ] شهادة SSL مثبتة
- [ ] Google Analytics مفعّل
- [ ] Sitemap و robots.txt موجودان
- [ ] رؤوس الأمان مفعّلة
- [ ] النسخ الاحتياطية مجدولة
- [ ] المراقبة والتنبيهات مفعّلة

---

## الدعم والمساعدة

للمساعدة والدعم:
- 📧 البريد: atertourhich@gmail.com
- 🌐 الموقع: https://marfa-consulting.com
- 📞 الهاتف: [أضف رقمك]

---

**آخر تحديث**: يوليو 2026
**الإصدار**: 1.0.0
