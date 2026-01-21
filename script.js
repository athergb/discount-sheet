// ========================
// MANAGER CONFIG
// ========================
const MANAGER_KEY = "QFCAirline123";
let isManager = false;
let data = [];
let GITHUB_TOKEN = "";

// ========================
// ELEMENTS
// ========================
const airlineInput = document.getElementById("airline");
const noteInput = document.getElementById("note");
const notificationInput = document.getElementById("notification");
const discountInput = document.getElementById("discount");
const categoryInput = document.getElementById("category");
const validityInput = document.getElementById("validity");
const editIndexInput = document.getElementById("editIndex");
const logoInput = document.getElementById("logo");

const cashGrid = document.getElementById("cashGrid");
const creditGrid = document.getElementById("creditGrid");
const sheet = document.getElementById("sheet");

// ========================
// MANAGER LOGIN + GITHUB TOKEN
// ========================
window.onload = async () => {
  const key = prompt("Enter manager key (leave blank to view)");
  isManager = key === MANAGER_KEY;

  if (isManager) {
    GITHUB_TOKEN = prompt("Enter GitHub Token (required to sync)");

    const saved = localStorage.getItem("airlineData");
    if (saved) {
      data = JSON.parse(saved);
      render();
    } else {
      await loadFromGitHub();
    }
  } else {
    await loadFromGitHub();
  }
};

// ========================
// LOAD DATA FROM GITHUB
// ========================
async function loadFromGitHub() {
  try {
    const res = await fetch("airlineData.json");
    data = await res.json();
  } catch {
    data = [];
  }
  render();
}

// ========================
// SAVE AIRLINE
// ========================
function saveAirline() {
  if (!isManager) return;

  const airline = airlineInput.value.trim();
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

  const saveRecord = (logoData = "") => {
    record.logo = logoData;

    if (editIndex === "") data.push(record);
    else data[editIndex] = record;

    localStorage.setItem("airlineData", JSON.stringify(data));
    updateGitHubJSON(); // <-- GitHub sync
    clearForm();
    render();
  };

  if (logoInput.files.length) {
    const reader = new FileReader();
    reader.onload = () => saveRecord(reader.result);
    reader.readAsDataURL(logoInput.files[0]);
  } else {
    saveRecord();
  }
}

// ========================
// RENDER
// ========================
function render() {
  cashGrid.innerHTML = "";
  creditGrid.innerHTML = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  data.forEach((a, i) => {
    const [y, m, d] = a.validity.split("-");
    const cardDate = new Date(y, m - 1, d);
    cardDate.setHours(0, 0, 0, 0);

    const isExpired = cardDate < today;
    const displayDate = cardDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const actions = isManager
      ? `<div class="actions">
           <span onclick="edit(${i})">Edit</span>
           <span onclick="del(${i})">Delete</span>
         </div>`
      : "";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="discount">${a.discount}</div>
      ${a.logo ? `<img src="${a.logo}" loading="eager">` : ""}
      <p><b>${a.airline}</b></p>
      <p>${a.note || ""} ${a.notification ? `<span class="notice">${a.notification}</span>` : ""}</p>
      <p class="validity ${isExpired ? "expired" : ""}">
        Valid till: ${displayDate}
      </p>
      ${actions}
    `;

    (a.category === "cash" ? cashGrid : creditGrid).appendChild(card);
  });

  document.querySelector(".controls").style.display = isManager ? "flex" : "none";
}

// ========================
// EDIT / DELETE
// ========================
function edit(i) {
  if (!isManager) return;
  const a = data[i];

  airlineInput.value = a.airline;
  noteInput.value = a.note;
  notificationInput.value = a.notification;
  discountInput.value = a.discount;
  categoryInput.value = a.category;
  validityInput.value = a.validity;
  editIndexInput.value = i;
}

function del(i) {
  if (!isManager) return;
  if (confirm("Delete this airline?")) {
    data.splice(i, 1);
    localStorage.setItem("airlineData", JSON.stringify(data));
    updateGitHubJSON();
    render();
  }
}

// ========================
// UTIL
// ========================
function clearForm() {
  airlineInput.value =
  noteInput.value =
  notificationInput.value =
  discountInput.value =
  validityInput.value = "";

  logoInput.value = "";
  editIndexInput.value = "";
  categoryInput.value = "cash";
}

// ========================
// SAVE AS JPG
// ========================
function saveAsImage() {
  html2canvas(sheet, {
    scale: 3,
    useCORS: true,
    backgroundColor: "#ffffff"
  }).then(canvas => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.download = "QFC-Airline-Discount.jpg";
    link.click();
  });
}

// ========================
// UPDATE GITHUB
// ========================
async function updateGitHubJSON() {
  if (!isManager || !GITHUB_TOKEN) return;

  const owner = "athergb";
  const repo = "discount-sheet";
  const path = "airlineData.json";

  const apiURL = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const fileRes = await fetch(apiURL, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
  });

  const fileData = await fileRes.json();

  const content = btoa(
    unescape(encodeURIComponent(JSON.stringify(data, null, 2)))
  );

  await fetch(apiURL, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Update airline discount data",
      content,
      sha: fileData.sha
    })
  });
}


