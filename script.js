// ========================
// MANAGER CONFIG
// ========================
const MANAGER_KEY = "QFCAirline123";
let isManager = false;
let data = [];

// ========================
// SAVE AIRLINE
// ========================
function saveAirline() {
  if (!isManager) return;

  const airline = airline.value.trim();
  const note = noteInput.value.trim();
  const notification = notificationInput.value.trim();
  const discount = discountInput.value.trim();
  const category = categoryInput.value;
  const validity = validityInput.value;
  const editIndex = editIndexInput.value;

  if (!airline || !discount || !validity) {
    alert("Airline, Discount & Validity required");
    return;
  }

  const record = {
    airline,
    note,
    notification,
    discount,
    category,
    validity,
    logo: ""
  };

  const save = (logoData) => {
    record.logo = logoData || "";
    if (editIndex === "") data.push(record);
    else data[editIndex] = record;

    localStorage.setItem("airlineData", JSON.stringify(data));
    clearForm();
    render();
  };

  if (logo.files.length) {
    const r = new FileReader();
    r.onload = () => save(r.result);
    r.readAsDataURL(logo.files[0]);
  } else save("");
}

// ========================
// RENDER
// ========================
function render() {
  cashGrid.innerHTML = "";
  creditGrid.innerHTML = "";

  const today = new Date();
  today.setHours(0,0,0,0);

  data.forEach((a, i) => {
    const [y,m,d] = a.validity.split("-");
    const cardDate = new Date(y, m-1, d);
    const expired = cardDate < today ? "expired" : "";

    const displayDate = cardDate.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});

    const actions = isManager ? `
      <div class="actions">
        <span onclick="edit(${i})">Edit</span>
        <span onclick="del(${i})">Delete</span>
      </div>` : "";

    const html = `
      <div class="card">
        <div class="discount">${a.discount}</div>
        ${a.logo ? `<img src="${a.logo}">` : ""}
        <p><b>${a.airline}</b></p>
        <p>${a.note} ${a.notification ? `<span class="notice">${a.notification}</span>` : ""}</p>
        <p class="validity ${expired}">Valid till: ${displayDate}</p>
        ${actions}
      </div>
    `;

    (a.category === "cash" ? cashGrid : creditGrid).innerHTML += html;
  });

  document.querySelector(".controls").style.display = isManager ? "flex" : "none";
}

// ========================
// EDIT / DELETE
// ========================
function edit(i) {
  if (!isManager) return;
  const a = data[i];
  airline.value = a.airline;
  note.value = a.note;
  notification.value = a.notification;
  discount.value = a.discount;
  category.value = a.category;
  validity.value = a.validity;
  editIndex.value = i;
}

function del(i) {
  if (!isManager) return;
  if (confirm("Delete?")) {
    data.splice(i,1);
    localStorage.setItem("airlineData", JSON.stringify(data));
    render();
  }
}

// ========================
// UTIL
// ========================
function clearForm() {
  airline.value = note.value = notification.value = discount.value = validity.value = "";
  logo.value = "";
  editIndex.value = "";
  category.value = "cash";
}

// ========================
// SAVE AS JPG
// ========================
function saveAsImage() {
  html2canvas(sheet,{
    scale:4,
    useCORS:true,
    backgroundColor:null
  }).then(c=>{
    const a=document.createElement("a");
    a.href=c.toDataURL("image/jpeg",0.95);
    a.download="QFC-Airline-Discount.jpg";
    a.click();
  });
}

// ========================
// INIT
// ========================
window.onload = () => {
  const key = prompt("Enter manager key (leave blank to view)");
  isManager = key === MANAGER_KEY;
  data = isManager
    ? JSON.parse(localStorage.getItem("airlineData")) || []
    : [];
  if (!isManager) {
    fetch("airlineData.json").then(r=>r.json()).then(j=>{data=j;render();});
  } else render();
};
