const SECTIONS = [
  ['Mulai cepat', [
    'Masuk dengan email dan password dari pengembang KASINO. Pendaftaran mandiri tidak tersedia, akun dibuatkan untuk tiap usaha.',
    'Kalau akunmu memegang lebih dari satu usaha, ketuk nama usaha di kiri atas untuk berpindah.',
    'Menu bawah: Kasir (catat penjualan), Riwayat (omzet dan struk), Harga (daftar produk), Atur (data usaha dan warna).',
    'Bagian atas halaman Kasir menampilkan omzet dan jumlah transaksi hari ini.',
  ]],
  ['Mencatat penjualan (Kasir)', [
    'Ketuk satuan produk, misalnya Loyang atau Potong. Produk masuk ke pesanan dan angka di kartunya bertambah. Gunakan kolom Cari produk dan pilihan kategori untuk menemukan produk lebih cepat.',
    'Untuk pesanan khusus, ketuk Isi harga custom lalu ketik harganya.',
    'Ketuk bar total di bawah (Lihat pesanan). Di sana kamu bisa mengubah jumlah dengan tombol plus dan minus, dan mengubah harga tiap item bila perlu.',
    'Isi Nama pembeli (boleh kosong) dan Nama kasir. Nama kasir diingat di perangkat itu, jadi tidak perlu diketik ulang.',
    'Isi Uang diterima atau pilih tombol cepat. Dikosongkan berarti uang pas. Kembalian terhitung otomatis. Pilih metode bayar: Tunai, QRIS, atau Transfer. QRIS dan Transfer hanya dicatat sebagai metode, pembayarannya dilakukan di luar KASINO.',
    'Ketuk Simpan transaksi. Struk langsung muncul.',
  ]],
  ['Ongkir', [
    'Isi kolom Ongkir di panel pesanan kalau pesanan dikirim. Total, tombol uang cepat, dan kembalian dihitung dari subtotal ditambah ongkir, jadi pembayaran sudah termasuk ongkir.',
    'Di struk, baris Subtotal dan Ongkir hanya muncul kalau ongkirnya diisi.',
    'Omzet di Riwayat menghitung total yang diterima, termasuk ongkir. Jumlah ongkirnya ditampilkan di kartu omzet.',
  ]],
  ['Nomor nota', [
    'Tiap transaksi otomatis mendapat nomor nota unik, misalnya ROT.101126.001. Awalnya dari nama usaha, lalu tanggal (hari, bulan, tahun), lalu urutan hari itu yang mulai dari 001 lagi tiap hari.',
    'Nomor nota tampil di struk dan di daftar Riwayat, jadi transaksi mudah dicari.',
  ]],
  ['Struk: kirim dan cetak', [
    'Kirim gambar struk (PNG): di HP muncul menu bagikan, pilih WhatsApp dan gambarnya langsung terlampir. Di laptop gambarnya terunduh, lalu lampirkan di WhatsApp lewat tombol klip.',
    'Cetak / simpan PDF: membuka PDF berukuran selebar struk. Pilih lebar kertas 58 mm atau 80 mm di sebelahnya. Hasil cetak bergantung pada printer dan perangkatmu.',
    'Kirim teks lewat WhatsApp: isi nomor pelanggan (08…), atau kosongkan lalu pilih kontak di WhatsApp.',
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
    'Kartu berwarna menampilkan omzet, jumlah transaksi, dan rata-rata. Bagian Terjual menunjukkan produk dan jumlahnya.',
    'Pemilik bisa menghapus transaksi yang salah catat. Omzet langsung berkurang dan tidak bisa dibatalkan.',
  ]],
  ['Pengaturan usaha (menu Atur)', [
    'Ubah nama usaha, jenis usaha, nomor telepon, dan alamat. Nama, alamat, dan telepon tampil di struk.',
    'Pilih warna tema aplikasi: Laut, Sakura, Jeruk, Ungu, atau Hutan. Tiap usaha menyimpan pilihannya sendiri.',
  ]],
  ['Peran: pemilik dan kasir', [
    'Pemilik: bisa semuanya, termasuk produk, pengaturan, dan menghapus transaksi.',
    'Kasir: mencatat transaksi serta melihat produk dan riwayat. Tidak bisa mengubah produk, pengaturan, atau menghapus transaksi.',
  ]],
  ['Pasang di layar utama HP', [
    'iPhone: buka KASINO di Safari, ketuk Bagikan, lalu Add to Home Screen.',
    'Android: buka di Chrome, ketuk menu titik tiga, lalu Add to Home screen atau Install app.',
    'KASINO akan muncul sebagai ikon sendiri dan terbuka tanpa kolom alamat browser.',
  ]],
  ['Masalah yang sering muncul', [
    'Salah catat transaksi: minta pemilik menghapusnya di Riwayat, lalu catat ulang.',
    'Foto produk gagal: gunakan foto gambar biasa dengan ukuran maksimal 8 MB.',
    'Tampilan tidak berubah setelah pembaruan: muat ulang halaman.',
    'KASINO butuh koneksi internet. Mode tanpa internet belum tersedia.',
    'Lupa password, butuh akun baru, atau ada pertanyaan lain: hubungi pengembang lewat DM @jucardelin atau email jodirahmanto@gmail.com.',
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
