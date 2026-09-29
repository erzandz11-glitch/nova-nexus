# 🏛️ NOVA Community Syndicate (Nova Nexus)

Platform eksklusif komunitas kreator dan sindikat berlevel sovereign tier dengan antarmuka yang terinspirasi oleh **Discord modern** yang disempurnakan dengan **DNA kemewahan minimalis NOVA (Deep Obsidian & Muted Warm Gold/Titanium)**.

---

## ✨ Fitur Utama

- **Discord-Inspired Layout**: Struktur 3-kolom yang bersih dan intuitif:
  - **Left Sidebar**: Daftar saluran (Syndicate Core, Alpha & Intelligence, High-Ticket War Room), The Arena switcher, dan profil pengguna ringkas.
  - **Center Canvas**: Stream pesan & diskusi bersih, filter pencarian instan, dan quick dispatch bar yang praktis.
  - **Right Sidebar**: Roster anggota terorganisir per tingkatan (*The Board, Architects, Members*) dengan status real-time.
- **The Arena**: Dashboard leaderboard pendapatan dan volume terverifikasi dengan sistem ranking yang elegan dan bersih.
- **Sovereign Aesthetic**: Palet warna Deep Obsidian (`#080a0f`), Muted Warm Gold, dan Titanium Silver tanpa silau dan tanpa visual clutter.
- **Real-Time & Sound Integration**: Supabase PostgreSQL synchronization dan subtle audio feedback khas Nova.

---

## 🚀 Cara Menjalankan

1. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Menjalankan Mode Development**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

3. **Build untuk Produksi**:
   ```bash
   npm run build
   ```

---

## 📁 Struktur Folder

- `src/App.tsx`: Layout utama 3-kolom (Channels, Stream/Arena, Members Roster).
- `src/components/FeedMessage.tsx`: Komponen pesan obrolan bergaya Discord modern dengan boost dan reply.
- `src/pages/TheArena.tsx`: Halaman leaderboard dan volume audit creator.
- `src/nova-os/`: Sistem integrasi identitas, keyboard shortcut (⌘K), dan state management.
- `src/services/`: Supabase client dan audio feedback generator.
