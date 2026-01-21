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

  // Clone sheet so live layout never moves
  const clone = sheet.cloneNode(true);
  clone.style.width = "1100px";
  clone.style.margin = "0 auto";
  clone.style.background = "#ffffff";

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0";
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  const canvas = await html2canvas(clone, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true
  });

  document.body.removeChild(wrapper);

  const img = canvas.toDataURL("image/jpeg", 0.92);
  const link = document.createElement("a");
  link.download = "QFC-Airline-Discount-A4.jpg";
  link.href = img;
  link.click();
}

async function saveForWhatsApp() {
  const sheet = document.getElementById("sheet");

  const clone = sheet.cloneNode(true);
  clone.style.width = "900px";     // WhatsApp friendly width
  clone.style.background = "#ffffff";

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0";
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  const canvas = await html2canvas(clone, {
    scale: 1.5,
    backgroundColor: "#ffffff",
    useCORS: true
  });

  document.body.removeChild(wrapper);

  const img = canvas.toDataURL("image/jpeg", 0.9);
  const link = document.createElement("a");
  link.download = "QFC-Airline-Discount-WhatsApp.jpg";
  link.href = img;
  link.click();
}

window.onload = loadData;


