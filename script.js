let data = JSON.parse(localStorage.getItem("airlineData")) || [];

function saveAirline() {
  let airline = document.getElementById("airline").value.trim();
  let note = document.getElementById("note").value.trim();
  let notification = document.getElementById("notification").value.trim();
  let discount = document.getElementById("discount").value.trim();
  let category = document.getElementById("category").value;
  let logoInput = document.getElementById("logo");
  let editIndex = document.getElementById("editIndex").value;

  if (!airline || !discount) {
    alert("Airline & Discount required");
    return;
  }

// Auto Validity: 7 days from today
  let today = new Date();
  let validityDate = new Date(today.setDate(today.getDate() + 7));
  let options = { year: "numeric", month: "long", day: "numeric" };
  let validity = validityDate.toLocaleDateString("en-US", options);

  // Function to actually save the record
  const saveRecord = (logoData) => {
    let record = {
      airline,
      note,
      notification,
      discount,
      category,
      logo: logoData || "", // default empty if no file
      validity
    };

    if (editIndex === "") {
      data.push(record);
    } else {
      data[editIndex] = record;
      document.getElementById("editIndex").value = "";
    }

    saveToStorage();
    clearForm();
    render();
  };

  // Handle file upload
  if (logoInput.files.length > 0) {
    let reader = new FileReader();
    reader.onload = function () {
      saveRecord(reader.result);
    };
    reader.readAsDataURL(logoInput.files[0]);
  } else {
    saveRecord(""); // no logo
  }
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
      validity // ✅ save validity
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

  let today = new Date();

data.forEach((a, i) => {
    // Set default validity if missing
    if (!a.validity) {
      let defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      let options = { year: "numeric", month: "long", day: "numeric" };
      a.validity = defaultDate.toLocaleDateString("en-US", options);
    }

    // Check if expired
    let validityClass = "";
    let cardDate = new Date(a.validity);
    if (cardDate < today) validityClass = "expired";
  
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

// Save back any auto-updated validity for old records
  saveToStorage();
}
function edit(i) {
  let a = data[i];
  document.getElementById("airline").value = a.airline;
  document.getElementById("note").value = a.note;
  document.getElementById("notification").value = a.notification || "";
  document.getElementById("discount").value = a.discount;
  document.getElementById("category").value = a.category;
  document.getElementById("validity").value = a.validity || ""; // ✅ add this
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
  validity.value = ""; // ✅ reset validity
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
    scale: 3,
    backgroundColor: "#ffffff",
    useCORS: true,
    windowWidth: sheet.scrollWidth,
    windowHeight: sheet.scrollHeight
  }).then(canvas => {

    // 2️⃣ CREATE TIMESTAMPED FILE NAME
    const timestamp = new Date().toISOString().replace(/[:.-]/g, "");
    const filename = `QFC-Airline-Discount-${timestamp}.jpg`;

    // 3️⃣ DOWNLOAD JPG
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.download = filename;
    link.click();

    // 4️⃣ DISABLE PRINT MODE
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

  let isLocked = false;

  lockBtn.addEventListener("click", () => {
    isLocked = !isLocked;

    // Disable/enable all inputs, selects, and buttons except lockBtn
    controlsSection.querySelectorAll("input, select, button").forEach(el => {
      if (el.id !== "lockBtn") el.disabled = isLocked;
    });

    // Update button text
    lockBtn.textContent = isLocked
      ? "🔓 Unlock Edit Panel"
      : "🔒 Lock Edit Panel";
  });
});



