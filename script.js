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
  const sheet = document.getElementById("sheet");

  if (!sheet) {
    alert("Sheet container not found");
    return;
  }

  html2canvas(sheet, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  }).then(canvas => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.download = "airline-discount-sheet.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }).catch(err => {
    console.error(err);
    alert("Image export failed. Check console.");
  });
}
