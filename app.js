let employees = [];
let attendance = [];

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('-translate-x-full');
}

document.addEventListener('click', function (e) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar.contains(e.target) && !e.target.closest('button[onclick="toggleSidebar()"]') && sidebar.classList.contains('-translate-x-0')) {
    sidebar.classList.add('-translate-x-full');
  }
});

function showSection(section) {
  document.getElementById('attendanceSection').classList.add('hidden');
  document.getElementById('employeesSection').classList.add('hidden');
  document.getElementById(section + 'Section').classList.remove('hidden');
  toggleSidebar();
}

function addEmployee() {
  const name = document.getElementById('employeeName').value.trim();
  const phone = document.getElementById('employeePhone').value.trim();
  if (name) {
    employees.push({ name, phone });
    updateEmployeeManage();
    document.getElementById('employeeName').value = '';
    document.getElementById('employeePhone').value = '';
  }
}

function updateEmployeeManage() {
  const ul = document.getElementById('employeeListManage');
  ul.innerHTML = '';
  employees.forEach(e => {
    const li = document.createElement('li');
    li.textContent = `${e.name} (${e.phone})`;
    ul.appendChild(li);
  });
}

function bulkUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    employees = rows.map(r => ({ name: r.Name, phone: r.Phone }));
    updateEmployeeManage();
  };
  reader.readAsArrayBuffer(file);
}

function startSession() {
  const date = document.getElementById('attendanceDate').value;
  if (!date) return alert('Please select a date.');
  attendance = employees.map(e => ({ ...e, present: true }));
  const container = document.getElementById('employeeList');
  container.innerHTML = '';
  attendance.forEach((e, i) => {
    const btn = document.createElement('button');
    btn.textContent = e.name;
    btn.className = 'bg-green-600 hover:bg-green-500 text-white p-2 rounded';
    btn.onclick = () => toggleAttendance(i, btn);
    container.appendChild(btn);
  });
}

function toggleAttendance(index, btn) {
  attendance[index].present = !attendance[index].present;
  btn.className = attendance[index].present
    ? 'bg-green-600 hover:bg-green-500 text-white p-2 rounded'
    : 'bg-red-600 hover:bg-red-500 text-white p-2 rounded';
}

function downloadExcel() {
  const ws = XLSX.utils.json_to_sheet(attendance.map(e => ({
    Name: e.name,
    Phone: e.phone,
    Status: e.present ? 'Present' : 'Absent'
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  XLSX.writeFile(wb, "attendance.xlsx");
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.text("Attendance Report", 10, 10);
  attendance.forEach((e, i) => {
    pdf.text(`${e.name} (${e.phone}): ${e.present ? 'Present' : 'Absent'}`, 10, 20 + i * 10);
  });
  pdf.save("attendance.pdf");
}