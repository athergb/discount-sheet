let data = JSON.parse(localStorage.getItem("airlineData")) || [];

function saveAirline() {
  let airline = document.getElementById("airline").value;
  let note = document.getElementById("note").value;
  let notification = document.getElementById("notification").value;
  let discount = document.getElementById("discount").value;
  let category = document.getElementById("category").value;
  let logoInput = document.getElementById("logo");
  let editIndex = document.getElementById("editIndex").value;

  if (!airline || !discount) {
    alert("Airline & Discount required");
    return;
  }

  let reader = new FileReader();

  reader.onload = function () {
    let record = {
      airline,
      note,
      notification,   // ✅ SAVED
      discount,
      category,
      logo: reader.result || ""
    };

    if (editIndex === "") {
      data.push(record);
    } else {
      data[editIndex] = record;
      document.getElementById("editIndex").value = "";
    }

    saveToStorage();   // ✅ SAVE TO LOCALSTORAGE
    clearForm();
    render();
  };

  if (logoInput.files.length > 0) {
    reader.readAsDataURL(logoInput.files[0]);
  } else {
    reader.onload();
  }
}

function render() {
  document.getElementById("cashGrid").innerHTML = "";
  document.getElementById("creditGrid").innerHTML = "";

  data.forEach((a, i) => {
    let card = `
  <div class="card">
    <div class="discount">${a.discount}</div>

    ${a.logo ? `<img src="${a.logo}">` : ""}

    <p><b>${a.airline}</b></p>

    <p>
      ${a.note}
      ${a.notification && a.notification.trim() !== ""
        ? `<span class="notice">${a.notification}</span>`
        : ""}
    </p>

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
}

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

function clearForm() {
  airline.value = "";
  note.value = "";
  notification.value = "";
  discount.value = "";
  logo.value = "";
}

function saveToStorage() {
  localStorage.setItem("airlineData", JSON.stringify(data));
}

window.onload = function () {
  render();
};

function saveAsImage() {

  // 1️⃣ ENABLE PRINT MODE (hide buttons, stabilize layout)
  document.body.classList.add("print-mode");

  const sheet = document.getElementById("sheet");

  html2canvas(sheet, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    windowWidth: sheet.scrollWidth,
    windowHeight: sheet.scrollHeight
  }).then(canvas => {

    // 2️⃣ SAVE JPG
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.download = "QFC-Airline-Discount-Sheet.jpg";
    link.click();

    // 3️⃣ DISABLE PRINT MODE (VERY IMPORTANT)
    document.body.classList.remove("print-mode");
  });
}

// ========================
// LOCK / UNLOCK EDIT PANEL
// ========================
const lockBtn = document.getElementById("lockBtn");
const controlsSection = document.querySelector(".controls");

let isLocked = false;

lockBtn.addEventListener("click", () => {
  isLocked = !isLocked;

  // Toggle all inputs, selects, and save button inside controls
  controlsSection.querySelectorAll("input, select, button").forEach(el => {
    if (el.id !== "lockBtn") el.disabled = isLocked;
  });

  // Update lock button text
  lockBtn.textContent = isLocked ? "🔓 Unlock Edit Panel" : "🔒 Lock Edit Panel";
});


