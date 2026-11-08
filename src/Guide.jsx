const SECTIONS = [
  ['Mulai cepat', [
    'Masuk dengan email dan password dari pemilik atau admin KASINO.',
    'Kalau akunmu memegang lebih dari satu usaha, ketuk nama usaha di kiri atas untuk berpindah.',
    'Menu bawah: Kasir (catat penjualan), Riwayat (omzet dan struk), Harga (daftar produk), Atur (data usaha dan warna).',
  ]],
  ['Mencatat penjualan (Kasir)', [
    'Ketuk satuan produk, misalnya Loyang atau Potong. Produk masuk ke pesanan dan angka di kartunya bertambah.',
    'Untuk pesanan khusus, ketuk Isi harga custom lalu ketik harganya.',
    'Ketuk bar total di bawah (Lihat pesanan) untuk mengubah jumlah dengan tombol plus dan minus. Harga tiap item juga bisa diedit di sana.',
    'Isi Uang diterima, atau pilih tombol cepat. Dikosongkan berarti uang pas. Kembalian terhitung otomatis. Pilih metode bayar: Tunai, QRIS, atau Transfer.',
    'Ketuk Simpan transaksi. Struk langsung muncul. Ringkasan Hari ini di bagian atas ikut bertambah.',
  ]],
  ['Struk: kirim dan cetak', [
    'Kirim lewat WhatsApp: isi nomor pelanggan (08…), atau kosongkan lalu pilih kontak di WhatsApp.',
    'Cetak struk: pilih lebar kertas 58 mm atau 80 mm, lalu ketuk Cetak. Hasilnya bergantung pada printer dan perangkatmu. Tujuan Save as PDF juga bisa dipakai untuk arsip.',
    'Struk transaksi lama bisa dibuka lagi dari Riwayat lewat tombol Lihat struk.',
  ]],
  ['Mengelola produk (menu Harga)', [
    'Hanya pemilik yang bisa menambah, mengubah, dan menghapus produk.',
    'Produk baru: isi nama, kategori, dan foto (boleh dikosongkan). Satu produk bisa punya beberapa satuan dan harga, misalnya Loyang dan Potong. Ketuk Tambah satuan untuk menambah.',
    'Centang Harga custom kalau harganya diisi saat transaksi, misalnya kue pesanan khusus.',
    'Menghapus produk tidak menghapus riwayat penjualannya.',
  ]],
  ['Riwayat dan omzet', [
    'Pilih Hari atau Bulan, lalu geser periode dengan tanda panah atau pilih tanggal.',
    'Kartu hijau menampilkan omzet, jumlah transaksi, dan rata-rata. Bagian Terjual menunjukkan produk dan jumlahnya.',
    'Pemilik bisa menghapus transaksi yang salah catat. Omzet langsung berkurang dan tidak bisa dibatalkan.',
  ]],
  ['Pengaturan usaha (menu Atur)', [
    'Ubah nama usaha, jenis usaha, nomor telepon, dan alamat. Nama, telepon, dan alamat tampil di struk.',
    'Pilih warna tema aplikasi. Tiap usaha menyimpan pilihannya sendiri.',
  ]],
  ['Peran: pemilik dan kasir', [
    'Pemilik: bisa semuanya, termasuk produk, pengaturan, dan menghapus transaksi.',
    'Kasir: mencatat transaksi serta melihat produk dan riwayat. Tidak bisa mengubah produk, pengaturan, atau menghapus transaksi.',
  ]],
  ['Masalah yang sering muncul', [
    'Salah catat transaksi: minta pemilik menghapusnya di Riwayat, lalu catat ulang.',
    'Lupa password atau butuh akun baru: hubungi admin KASINO.',
    'Foto produk gagal: gunakan foto gambar biasa dengan ukuran maksimal 8 MB.',
    'Tampilan tidak berubah setelah pembaruan: muat ulang halaman.',
    'KASINO butuh koneksi internet. Mode tanpa internet belum tersedia.',
  ]],
]

export default function Guide({ onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet guide" onClick={(e) => e.stopPropagation()}>
        <div className="row between"><h2>Panduan KASINO</h2><button className="small" onClick={onClose}>Tutup</button></div>
        <p className="muted">Ketuk judul untuk membuka langkah-langkahnya.</p>
        {SECTIONS.map(([title, items], k) => (
          <details key={title} open={k === 0}>
            <summary>{title}</summary>
            <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
          </details>
        ))}
      </div>
    </div>
  )
}
