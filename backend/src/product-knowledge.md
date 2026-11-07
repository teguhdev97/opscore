# OpsCore — fakta produk

OpsCore adalah workspace pengetahuan dan operasional untuk manufaktur umum, dikembangkan oleh Teguh Muhammad Harits. Nama awal proyek adalah IndusMind AI.

## Fitur yang tersedia
- Landing page dan dashboard frontend React + TypeScript + TanStack Query.
- Knowledge Base (/app/knowledge): mencari dokumen contoh, melihat pratinjau, dan simulasi upload. Hanya metadata nama dokumen disimpan di browser; PDF tidak diproses.
- AI Assistant (/app/assistant): simulasi tanya jawab SOP dan contoh sitasi. Belum terhubung ke dokumen atau model. Ini BERBEDA dari panel bantuan produk mengambang ini.
- Checklists (/app/checklists): mencentang item contoh. Progres disimpan di browser, belum tersinkron antarperangkat.
- Compliance (/app/compliance) dan Activity Log (/app/activity): data ilustrasi, bukan hasil audit nyata.
- Settings (/app/settings): preferensi lokal. Status integrasi di halaman ini masih ilustrasi prototype, bukan pemeriksaan kesehatan backend.
- Panel bantuan produk tersedia pada semua halaman. Status buka/tutup, draf, dan riwayat disimpan lokal. Jika backend diaktifkan, panel mengirim pesan dan riwayat terbatas ke backend lalu provider AI melalui 9router. Jika tidak, panel menyediakan FAQ lokal.

## Cara mencoba
Buka /app/knowledge, lihat SOP contoh, jelajahi /app/assistant, lalu /app/checklists. Jangan mengklaim rangkaian ini sudah melakukan RAG atau membuat checklist otomatis dari PDF.

## Rencana, belum aktif
Login serta peran Admin/Safety Lead/Operator, Aiven PostgreSQL, upload PDF asli, pencarian RAG beserta nama dokumen dan nomor halaman, persetujuan checklist, integrasi WorkBuddy MCP. Deployment backend ditargetkan ke Tencent Cloud; frontend di Vercel. Provider chatbot produk direncanakan melalui 9router di VPS1. Tidak perlu menjalankan model lokal di server backend.

## Harga dan batas
Demo bisa dibuka tanpa pendaftaran. Harga produk belum ditetapkan. Tidak ada klaim pelanggan nyata, sertifikasi, jaminan bebas halusinasi, atau kepatuhan resmi. Jangan mengarang kontak, SLA, tanggal rilis, atau kemampuan.

## Privasi
Jangan memasukkan informasi rahasia ke prototype. Backend ini tidak menyimpan percakapan ke database dan tidak mencatat isi pesan dalam log aplikasi. Provider upstream dapat memiliki kebijakan retensi sendiri; jangan menjanjikan zero retention. Menghapus percakapan panel hanya menghapus riwayat lokal, bukan data yang mungkin disimpan provider.
