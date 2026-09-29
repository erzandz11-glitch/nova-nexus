# 🏛️ NOVA Community Syndicate (Nova Nexus)

Platform eksklusif komunitas kreator dan sindikat berlevel *sovereign tier* dengan arsitektur **Wadah Data Dinamis & Real-Time Sync Engine** serta antarmuka **Cyber Luxury Syndicate (Deep Obsidian `#06080e` & NOVA Cyber Cyan `#06b6d4` / Platinum Titanium)**.

---

## ✨ Fitur Utama

- **Wadah Data Dinamis (`NovaDataStore`)**: Seluruh transmisi, transaksi escrow, alokasi deal OTC, peringkat arena, dan notifikasi dikelola secara dinamis dengan persistensi lokal serta sinkronisasi Supabase Real-Time. Tidak lagi mengandalkan dummy data statis.
- **Empty States Futuristik**: Saluran dan arena yang belum terisi akan menampilkan visual *standby* yang elegan dengan tombol aksi langsung untuk menyiarkan alpha atau membuka penawaran.
- **Cyber Luxury Syndicate Layout**:
  - **Live Escrow Ticker**: Ticker transaksi berjalan di bagian atas dengan status konsensus node global.
  - **Left Sidebar**: Navigasi channel dengan simbol khas, tombol *The Arena Live Podium*, Direct Bridges (Telegram & Discord), dan kartu *Sovereign Pass*.
  - **Center Canvas**: Kotak Quick Dispatch interaktif, stream kartu pesan telemetri verified, dan mode debrief inline.
  - **Right Sidebar**: Roster anggota tersinkronisasi (*The Board, Architects, Members*) dengan status online / in-deal-room.
- **The Arena**: Dashboard leaderboard pendapatan dan volume terverifikasi dengan podium 3-tingkat (*Cyber Cyan, Platinum, Titanium*).
- **Security & Audio Resonance**: Dukungan verifikasi audit, token-gated channel VIP, dan feedback audio sintetis.

---

## 🚀 Cara Menjalankan

1. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Menjalankan Unit Test**:
   ```bash
   npx tsx src/services/__tests__/novaDataStore.test.ts
   ```

3. **Menjalankan Mode Development**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

4. **Build untuk Produksi**:
   ```bash
   npm run build
   ```

---

## 📁 Struktur Folder

- `src/App.tsx`: Komponen utama pengatur navigasi, store listener, dan feed/arena canvas.
- `src/services/novaDataStore.ts`: Mesin wadah data dinamis sentral (CRUD, event subscriber, persistent storage).
- `src/services/supabaseService.ts`: Jembatan koneksi PostgreSQL real-time cluster.
- `src/components/FeedMessage.tsx`: Kartu pesan telemetri futuristik dengan verified audit badge, lampiran metrik, dan interaksi boost/debrief.
- `src/components/DealRoomModal.tsx`: Modal pembuatan dan partisipasi deal tranche OTC.
- `src/pages/TheArena.tsx`: Halaman podium dan data table leaderboard audit pendapatan creator.
- `src/nova-os/`: Modul identitas SSO universal, command surface (⌘K), dan router navigasi ekosistem.
