// ========================
// MANAGER ACCESS
// ========================
const MANAGER_KEY = "QFCAirline123"; // change this to your secret password
let isManager = false;

// ========================
// DATA STORAGE
// ========================
let data = JSON.parse(localStorage.getItem("airlineData")) || [];

// ========================
// SAVE AIRLINE FUNCTION
// ========================
function saveAirline() {
  const airlineInput = document.getElementById("airline");
  const noteInput = document.getElementById("note");
  const notificationInput = document.getElementById("notification");
  const discountInput = document.getElementById("discount");
  const categoryInput = document.getElementById("category");
  const logoInput = document.getElementById("logo");
  const editIndexInput = document.getElementById("editIndex");
  const validityInput = document.getElementById("validity");

  const airline = airlineInput.value.trim();
  const note = noteInput.value.trim();
  const notification = notificationInput.value.trim();
  const discount = discountInput.value.trim();
  const category = categoryInput.value;
  const editIndex = editIndexInput.value;
  const validity = validityInput.value; // YYYY-MM-DD

  if (!airline || !discount || !validity) {
    alert("Airline, Discount, and Validity are required!");
    return;
  }

  const saveRecord = (logoData) => {
    const record = {
      airline,
      note,
      notification,
      discount,
      category,
      logo: logoData || "",
      validity // store exact YYYY-MM-DD
    };

    if (editIndex === "") {
      data.push(record);
    } else {
      data[editIndex] = record;
    }

    saveToStorage();
    clearForm();
    render();
  };

  if (logoInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function () {
      saveRecord(reader.result);
    };
    reader.readAsDataURL(logoInput.files[0]);
  } else {
    saveRecord("");
  }
}

// ========================
// CLEAR FORM
// ========================
function clearForm() {
  document.getElementById("airline").value = "";
  document.getElementById("note").value = "";
  document.getElementById("notification").value = "";
  document.getElementById("discount").value = "";
  document.getElementById("logo").value = "";
  document.getElementById("validity").value = "";
  document.getElementById("category").value = "cash";
  document.getElementById("editIndex").value = "";
}

// ========================
// LOCAL STORAGE
// ========================
function saveToStorage() {
  localStorage.setItem("airlineData", JSON.stringify(data));
}

// ========================
// RENDER FUNCTION
// ========================
function render() {
  const cashGrid = document.getElementById("cashGrid");
  const creditGrid = document.getElementById("creditGrid");

  cashGrid.innerHTML = "";
  creditGrid.innerHTML = "";

  const today = new Date();
  today.setHours(0,0,0,0); // ignore time

  data.forEach((a, i) => {
    const [year, month, day] = a.validity.split("-");
    const cardDate = new Date(year, month - 1, day); // local date
    const validityClass = cardDate < today ? "expired" : "";

    const validityDisplay = cardDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const card = `
      <div class="card">
        <div class="discount">${a.discount}</div>
        ${a.logo ? `<img src="${a.logo}">` : ""}
        <p><b>${a.airline}</b></p>
        <p>
          ${a.note}
          ${a.notification ? `<span class="notice">${a.notification}</span>` : ""}
        </p>
        <p class="validity ${validityClass}">Valid till: ${validityDisplay}</p>
        <div class="actions">
          <span onclick="edit(${i})">Edit</span>
          <span onclick="del(${i})">Delete</span>
        </div>
      </div>
    `;

    if (a.category === "cash") {
      cashGrid.innerHTML += card;
    } else {
      creditGrid.innerHTML += card;
    }
  });

  saveToStorage();
}

// ========================
// EDIT & DELETE
// ========================
function edit(i) {
  const a = data[i];
  document.getElementById("airline").value = a.airline;
  document.getElementById("note").value = a.note;
  document.getElementById("notification").value = a.notification || "";
  document.getElementById("discount").value = a.discount;
  document.getElementById("category").value = a.category;

  // Directly assign stored YYYY-MM-DD
  document.getElementById("validity").value = a.validity;

  document.getElementById("editIndex").value = i;
}

function del(i) {
  if (confirm("Delete this airline?")) {
    data.splice(i, 1);
    saveToStorage();
    render();
  }
}

// ========================
// LOCK PANEL
// ========================
window.addEventListener("DOMContentLoaded", () => {
  const lockBtn = document.getElementById("lockBtn");
  const controlsSection = document.querySelector(".controls");

  if (!lockBtn) return;

  let isLocked = false;

  lockBtn.addEventListener("click", () => {
    isLocked = !isLocked;

    controlsSection.querySelectorAll("input, select, button").forEach(el => {
      if (el.id !== "lockBtn") el.disabled = isLocked;
    });

    lockBtn.textContent = isLocked
      ? "🔓 Unlock Edit Panel"
      : "🔒 Lock Edit Panel";
  });
});

// ========================
// SAVE AS IMAGE
// ========================
function saveAsImage() {
  document.body.classList.add("print-mode");
  const sheet = document.getElementById("sheet");

  html2canvas(sheet, {
    scale: 3,
    useCORS: true,
    backgroundColor: null // allow background image
  }).then(canvas => {
    const timestamp = new Date().toISOString().replace(/[:.-]/g, "");
    const filename = `QFC-Airline-Discount-${timestamp}.jpg`;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.download = filename;
    link.click();

    document.body.classList.remove("print-mode");
  });
}


// ========================
// INITIAL RENDER
// ========================
window.onload = function() {
  const userKey = prompt("Enter manager key (leave blank if viewing only):");
  if (userKey === MANAGER_KEY) {
    isManager = true;
  } 
  fetch('airlineData.json')
    .then(res => res.json())
    .then(json => {
      data = json; // load from GitHub
      render();
    })
    .catch(err => {
      console.warn("GitHub JSON failed, fallback to localStorage:", err);
      data = JSON.parse(localStorage.getItem("airlineData")) || [];
      render();
    });
};

function applyPermissions() {
  const controls = document.querySelector(".controls");
  const actionButtons = document.querySelectorAll(".actions span");

  if (!isManager) {
    // Hide the edit panel entirely
    controls.style.display = "none";

    // Hide edit/delete buttons in cards
    actionButtons.forEach(btn => btn.style.display = "none");

    // Hide lock button for viewers
    const lockBtn = document.getElementById("lockBtn");
    if (lockBtn) lockBtn.style.display = "none";
  } else {
    // Show controls and action buttons for manager
    controls.style.display = "flex";
    actionButtons.forEach(btn => btn.style.display = "inline");
  }
}



