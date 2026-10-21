# 🚀 Food ERP - Performance & Stress Testing Suite (Grafana k6)

Suite pengujian performa dan breaking-point untuk mengukur kapasitas arsitektur Food ERP (Nginx + Spring Boot + PostgreSQL).

---

## 📦 Prasyarat

Pastikan **k6** sudah terpasang di komputer Anda:
```powershell
winget install k6 --source winget
```

Verifikasi instalasi:
```bash
k6 version
```

---

## 🎯 Cara Menjalankan Pengujian

### 1. Menembak Server Production (AWS EC2)
Ganti `<IP-EC2>` dengan Public IPv4 server AWS EC2 Anda:

```bash
k6 run -e TARGET_HOST=http://<IP-EC2> tests/load/stress-test.js
```

### 2. Menembak Server Lokal (Development)
```bash
k6 run -e TARGET_HOST=http://localhost:8080 tests/load/stress-test.js
```

---

## 📊 Metrik yang Dianalisis untuk Portofolio LinkedIn:
- **`http_reqs` (Throughput / RPS)**: Berapa banyak request per detik yang sanggup dilayani.
- **`p(95)` & `p(99)` latency**: Response time untuk 95% dan 99% pengguna.
- **`http_req_failed`**: Persentase request yang gagal/timeout saat beban memuncak.
- **Grafik CPU/RAM di AWS CloudWatch**: Apakah CPU mencapai 100% atau bottleneck ada di connection pool database.
