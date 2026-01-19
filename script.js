// ========================
// DATA STORAGE
// ========================
let data = JSON.parse(localStorage.getItem("airlineData")) || [];

// ========================
// SAVE AIRLINE FUNCTION
// ========================
function saveAirline() {
  // Get all form elements
  const airlineInput = document.getElementById("airline");
  const noteInput = document.getElementById("note");
  const notificationInput = document.getElementById("notification");
  const discountInput = document.getElementById("discount");
  const categoryInput = document.getElementById("category");
  const logoInput = document.getElementById("logo");
  const editIndexInput = document.getElementById("editIndex");

  // Get values
  let airline = airlineInput.value.trim();
  let note = noteInput.value.trim();
  let notification = notificationInput.value.trim();
  let discount = discountInput.value.trim();
  let category = categoryInput.value;
  let editIndex = editIndexInput.value;

  if (!airline || !discount) {
    alert("Airline & Discount are required!");
    return;
  }

  // Auto Validity: 7 days from today
  let today = new Date();
  let validityDate = new Date();
  validityDate.setDate(today.getDate() + 7);
  let options = { year: "numeric", month: "long", day: "numeric" };
  let validity = validityDate.toLocaleDateString("en-US", options);

  // Save record function
  const saveRecord = (logoData) => {
    let record = {
      airline,
      note,
      notification,
      discount,
      category,
      logo: logoData || "",
      validity
    };

    if (editIndex === "") {
      data.push(record);
    } else {
      data[editIndex] = record;
      editIndexInput.value = "";
    }

    saveToStorage();
    clearForm();
    render();
  };

  // Handle logo upload asynchronously
  if (logoInput.files.length > 0) {
    let reader = new FileReader();
    reader.onload = function () {
      saveRecord(reader.result);
    };
    reader.readAsDataURL(logoInput.files[0]);
  } else {
    saveRecord(""); // Save without logo
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

  let today = new Date();

  data.forEach((a, i) => {
    // Set default validity if missing
    if (!a.validity) {
      let defaultDate = new Date();
      defaultDate.setDate(today.getDate() + 7);
      let options = { year: "numeric", month: "long", day: "numeric" };
      a.validity = defaultDate.toLocaleDateString("en-US", options);
    }

    // Check if expired
    let cardDate = new Date(a.validity);
    let validityClass = cardDate < today ? "expired" : "";

    let card = `
      <div class="card">
        <div class="discount">${a.discount}</div>
        ${a.logo ? `<img src="${a.logo}">` : ""}
        <p><b>${a.airline}</b></p>
        <p>
          ${a.note}
          ${a.notification ? `<span class="notice">${a.notification}</span>` : ""}
        </p>
        ${a.validity ? `<p class="validity ${validityClass}">Valid till: ${a.validity}</p>` : ""}
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

  // Save any auto-updated validity back to storage
  saveToStorage();
}

// ========================
// EDIT & DELETE FUNCTIONS
// ========================
function edit(i) {
  let a = data[i];
  document.getElementById("airline").value = a.airline;
  document.getElementById("note").value = a.note;
  document.getElementById("notification").value = a.notification || "";
  document.getElementById("discount").value = a.discount;
  document.getElementById("category").value = a.category;
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
// SAVE AS IMAGE FUNCTION
// ========================
function saveAsImage() {
  document.body.classList.add("print-mode");

  const sheet = document.getElementById("sheet");

  html2canvas(sheet, {
    scale: 3,
    backgroundColor: "#ffffff",
    useCORS: true,
    windowWidth: sheet.scrollWidth,
    windowHeight: sheet.scrollHeight
  }).then(canvas => {
    const timestamp = new Date().toISOString().replace(/[:.-]/g, "");
    const filename = `QFC-Airline-Discount-${timestamp}.jpg`;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.download = filename;
    link.click();

    document.body.classList.remove("print-mode");
  }).catch(err => {
    alert("Error generating image: " + err);
    document.body.classList.remove("print-mode");
  });
}

// ========================
// LOCK / UNLOCK EDIT PANEL
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
// INITIAL RENDER
// ========================
window.onload = render;
