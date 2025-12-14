<script>
// Deklarasi variabel global
let a = 12;
let b = 4;

// Fungsi untuk mengalikan input dengan 2
function PerkalianDengan2(b) {
  // Deklarasi variabel lokal 'a' di dalam fungsi
  let a = b * 2;
  return a;
}

// Menampilkan hasil dari fungsi (memanggil fungsi dengan nilai b=4)
document.write("Dua kali dari ", b, " adalah ", PerkalianDengan2(b), "<br>");

// Menampilkan nilai 'a' global (tidak terpengaruh oleh 'a' lokal di dalam fungsi)
document.write("Nilai dari a adalah ", a);
</script>