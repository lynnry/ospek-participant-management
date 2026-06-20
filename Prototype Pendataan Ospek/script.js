let dataPeserta = [];
let nimPesertaAkanDihapus = null;

const dummyParticipants = [
    { nama: "Rian Aditya", nim: "120140001", prodi: "Teknik Informatika", kelompok: "3", hp: "081234567890" },
    { nama: "Siti Aminah", nim: "120140023", prodi: "Teknik Informatika", kelompok: "5", hp: "085712345678" },
    { nama: "Gede Sihombing", nim: "120130089", prodi: "Teknik Elektro", kelompok: "3", hp: "082198765432" }
];

document.addEventListener("DOMContentLoaded", () => {
    loadDataFromLocalStorage();
    updateDashboardStats();
    renderTable(dataPeserta);
});

function loadDataFromLocalStorage() {
    const storageData = localStorage.getItem("ospek_participants");
    if (storageData) {
        dataPeserta = JSON.parse(storageData);
    } else {
        dataPeserta = [...dummyParticipants];
        saveDataToLocalStorage();
    }
}

function saveDataToLocalStorage() {
    localStorage.setItem("ospek_participants", JSON.stringify(dataPeserta));
}

function switchPage(pageName) {
    document.querySelectorAll('.content-section').forEach(section => section.classList.add('hidden'));
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

    if (pageName === 'dashboard') {
        document.getElementById('page-dashboard').classList.remove('hidden');
        document.getElementById('menu-dashboard').classList.add('active');
        document.getElementById('page-title').innerText = "Dashboard";
        updateDashboardStats();
    } else if (pageName === 'peserta') {
        document.getElementById('page-peserta').classList.remove('hidden');
        document.getElementById('menu-peserta').classList.add('active');
        document.getElementById('page-title').innerText = "Kelola Data Peserta";
        renderTable(dataPeserta);
    }
}

function updateDashboardStats() {
    document.getElementById('stat-total-peserta').innerText = dataPeserta.length;

    const uniqueKelompok = new Set(dataPeserta.map(p => p.kelompok.trim()));
    document.getElementById('stat-total-kelompok').innerText = uniqueKelompok.size;

    const uniqueProdi = new Set(dataPeserta.map(p => p.prodi.trim().toLowerCase()));
    document.getElementById('stat-total-prodi').innerText = uniqueProdi.size;
}

function handleFormSubmit(event) {
    event.preventDefault();

    const nama = document.getElementById('nama').value.trim();
    const nim = document.getElementById('nim').value.trim();
    const prodi = document.getElementById('prodi').value.trim();
    const kelompok = document.getElementById('kelompok').value.trim();
    const hp = document.getElementById('hp').value.trim();
    const oldNim = document.getElementById('old-nim').value;

    if (!nama || !nim || !prodi || !kelompok || !hp) {
        showAlert("Semua field wajib diisi tanpa terkecuali!", "danger");
        return;
    }

    if (oldNim === "") {
        const isDuplicate = dataPeserta.some(peserta => peserta.nim === nim);
        if (isDuplicate) {
            showAlert(`Gagal! Mahasiswa dengan NIM ${nim} sudah terdaftar sebelumnya.`, "danger");
            return;
        }
        dataPeserta.push({ nama, nim, prodi, kelompok, hp });
        showAlert("Data peserta berhasil ditambahkan ke sistem!", "success");
    } else {
        if (oldNim !== nim) {
            const isDuplicate = dataPeserta.some(peserta => peserta.nim === nim);
            if (isDuplicate) {
                showAlert(`Gagal update! NIM ${nim} sudah digunakan oleh peserta lain.`, "danger");
                return;
            }
        }

        const indexTarget = dataPeserta.findIndex(peserta => peserta.nim === oldNim);
        if (indexTarget !== -1) {
            dataPeserta[indexTarget] = { nama, nim, prodi, kelompok, hp };
            showAlert("Perubahan data peserta berhasil diperbarui!", "success");
        }
    }

    saveDataToLocalStorage();
    resetForm();
    renderTable(dataPeserta);
}

function showAlert(message, type) {
    const alertBox = document.getElementById('form-alert');
    alertBox.innerText = message;
    alertBox.className = `alert alert-${type}`;
    
    setTimeout(() => {
        alertBox.classList.add('hidden');
    }, 4000);
}

function resetForm() {
    document.getElementById('form-peserta-ospek').reset();
    document.getElementById('old-nim').value = "";
    document.getElementById('form-title').innerText = "Tambah Peserta Baru";
    document.getElementById('btn-submit').innerText = "Simpan Data";
    document.getElementById('btn-cancel').classList.add('hidden');
    document.getElementById('nim').disabled = false;
}

function renderTable(arrayData) {
    const tbody = document.getElementById('list-peserta-tbody');
    tbody.innerHTML = "";

    if (arrayData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-message">
                        <h4>Tidak Ada Data Peserta</h4>
                        <p>Silakan input data baru melalui form yang tersedia atau sesuaikan kata kunci pencarian Anda.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    arrayData.forEach(peserta => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${peserta.nama}</strong></td>
            <td>${peserta.nim}</td>
            <td>${peserta.prodi}</td>
            <td><span class="badge">Kelompok ${peserta.kelompok}</span></td>
            <td>${peserta.hp}</td>
            <td>
                <button class="btn btn-secondary btn-action" onclick="prepareEdit('${peserta.nim}')">Edit</button>
                <button class="btn btn-danger btn-action" onclick="openDeleteModal('${peserta.nim}', '${peserta.nama}')">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function prepareEdit(nim) {
    const peserta = dataPeserta.find(p => p.nim === nim);
    
    if (peserta) {
        document.getElementById('nama').value = peserta.nama;
        document.getElementById('nim').value = peserta.nim;
        document.getElementById('prodi').value = peserta.prodi;
        document.getElementById('kelompok').value = peserta.kelompok;
        document.getElementById('hp').value = peserta.hp;
        document.getElementById('old-nim').value = peserta.nim;

        document.getElementById('form-title').innerText = "Ubah Data Peserta";
        document.getElementById('btn-submit').innerText = "Simpan Perubahan";
        document.getElementById('btn-cancel').classList.remove('hidden');
        
        document.getElementById('form-peserta-ospek').scrollIntoView({ behavior: 'smooth' });
    }
}

function openDeleteModal(nim, nama) {
    nimPesertaAkanDihapus = nim;
    document.getElementById('modal-nama-peserta').innerText = nama;
    document.getElementById('delete-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('delete-modal').classList.add('hidden');
    nimPesertaAkanDihapus = null;
}

document.getElementById('btn-confirm-delete').addEventListener('click', () => {
    if (nimPesertaAkanDihapus) {
        dataPeserta = dataPeserta.filter(peserta => peserta.nim !== nimPesertaAkanDihapus);
        saveDataToLocalStorage();
        renderTable(dataPeserta);
        closeModal();
        resetForm();
    }
});

function handleSearch() {
    const keyword = document.getElementById('search-input').value.toLowerCase().trim();
    
    const hasilFilter = dataPeserta.filter(peserta => {
        return peserta.nama.toLowerCase().includes(keyword) || peserta.nim.includes(keyword);
    });

    renderTable(hasilFilter);
}