let data = [];

/* =========================
   LOAD DATA
========================= */
async function loadData() {
  try {
    const res = await fetch("airlineData.json");
    data = await res.json();
  } catch {
    data = [];
  }
  render();
}

/* =========================
   RENDER
========================= */
function render() {
  cashGrid.innerHTML = "";
  creditGrid.innerHTML = "";

  const today = new Date();
  today.setHours(0,0,0,0);

  data.forEach(a => {
    const d = new Date(a.validity);
    const expired = d < today ? "expired" : "";

    const card = `
      <div class="card">
        <div class="discount">${a.discount}</div>
        ${a.logo ? `<img src="${a.logo}">` : ""}
        <p><b>${a.airline}</b></p>
        <p>${a.note} ${a.notification ? `<span class="notice">${a.notification}</span>` : ""}</p>
        <p class="validity ${expired}">Valid till: ${d.toDateString()}</p>
      </div>
    `;

    (a.category === "cash" ? cashGrid : creditGrid).innerHTML += card;
  });
}

/* =========================
   SAVE AS JPG (LOCKED)
========================= */
async function saveAsJPG() {
  const sheet = document.getElementById("sheet");

  const canvas = await html2canvas(sheet, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    width: sheet.offsetWidth,
    height: sheet.scrollHeight
  });

  const link = document.createElement("a");
  link.download = "QFC-Airline-Discount.jpg";
  link.href = canvas.toDataURL("image/jpeg", 0.95);
  link.click();
}

window.onload = loadData;
