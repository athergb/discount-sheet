// ========================
// MANAGER ACCESS
// ========================
const MANAGER_KEY = "QFCAirline123";
let isManager = false;

// ========================
// DATA STORAGE
// ========================
let data = [];

// ========================
// SAVE AIRLINE FUNCTION
// ========================
function saveAirline() {
  if (!isManager) return;

  const airline = document.getElementById("airline").value.trim();
  const note = document.getElementById("note").value.trim();
  const notification = document.getElementById("notification").value.trim();
  const discount = document.getElementById("discount").value.trim();
  const category = document.getElementById("category").value;
  const editIndex = document.getElementById("editIndex").value;
  const validity = document.getElementById("validity").value;
  const logoInput = document.getElementById("logo");

  if (!airline || !discount || !validity) {
    alert("Airline, Discount, and Validity are required!");
    return;
  }

  const saveRecord = (logoData) => {
    const record = { airline, note, notification, discount, category, logo: logoData||"", validity };
    if (editIndex === "") data.push(record); else data[editIndex] = record;
    localStorage.setItem("airlineData", JSON.stringify(data));
    clearForm(); render();
  };

  if (logoInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = () => saveRecord(reader.result);
    reader.readAsDataURL(logoInput.files[0]);
  } else saveRecord("");
}

// ========================
// CLEAR FORM
// ========================
function clearForm() {
  ["airline","note","notification","discount","logo","validity","category","editIndex"].forEach(id=>document.getElementById(id).value=(id==="category"?"cash":""));
}

// ========================
// RENDER FUNCTION
// ========================
function render() {
  const cashGrid = document.getElementById("cashGrid");
  const creditGrid = document.getElementById("creditGrid");
  cashGrid.innerHTML=""; creditGrid.innerHTML="";

  const today = new Date(); today.setHours(0,0,0,0);

  data.forEach((a,i)=>{
    const parts=a.validity.split("-"); 
    const cardDate=new Date(parts[0],parts[1]-1,parts[2]);
    const validityClass = cardDate < today ? "expired" : "";
    const validityDisplay = cardDate.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});

    const actionsHTML = isManager ? `<div class="actions"><span onclick="edit(${i})">Edit</span><span onclick="del(${i})">Delete</span></div>` : "";

    const card = `<div class="card">
      <div class="discount">${a.discount}</div>
      ${a.logo?`<img src="${a.logo}">`:''}
      <p><b>${a.airline}</b></p>
      <p>${a.note}${a.notification?`<span class="notice">${a.notification}</span>`:''}</p>
      <p class="validity ${validityClass}">Valid till: ${validityDisplay}</p>
      ${actionsHTML}
    </div>`;

    if(a.category==="cash") cashGrid.innerHTML+=card; else creditGrid.innerHTML+=card;
  });

  if(!isManager) document.querySelector(".controls").style.display="none";
}

// ========================
// EDIT / DELETE
// ========================
function edit(i){if(!isManager)return;
  const a=data[i];
  ["airline","note","notification","discount","category","validity"].forEach(id=>document.getElementById(id).value=a[id]);
  document.getElementById("editIndex").value=i;
}

function del(i){if(!isManager)return;
  if(confirm("Delete this airline?")){data.splice(i,1);localStorage.setItem("airlineData",JSON.stringify(data));render();}
}

// ========================
// LOCK PANEL
// ========================
window.addEventListener("DOMContentLoaded",()=>{
  const lockBtn=document.getElementById("lockBtn");
  if(!lockBtn) return;
  let isLocked=false;
  lockBtn.addEventListener("click",()=>{
    isLocked=!isLocked;
    document.querySelector(".controls").querySelectorAll("input,select,button").forEach(el=>{if(el.id!=="lockBtn")el.disabled=isLocked;});
    lockBtn.textContent=isLocked?"🔓 Unlock Edit Panel":"🔒 Lock Edit Panel";
  });
});

// ========================
// SAVE AS IMAGE
// ========================
function saveAsImage(){
  document.body.classList.add("print-mode");
  html2canvas(document.getElementById("sheet"),{scale:3,useCORS:true,backgroundColor:null}).then(canvas=>{
    const link=document.createElement("a");
    link.href=canvas.toDataURL("image/jpeg",0.95);
    link.download=`QFC-Airline-Discount-${new Date().toISOString().replace(/[:.-]/g,"")}.jpg`;
    link.click();document.body.classList.remove("print-mode");
  });
}

// ========================
// EXPORT JSON
// ========================
function downloadAirlineData(){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download="airlineData.json";
  link.click();
}

// ========================
// INITIAL LOAD
// ========================
window.onload=function(){
  const userKey=prompt("Enter manager key (leave blank if viewing only):");
  if(userKey===MANAGER_KEY){isManager=true; data=JSON.parse(localStorage.getItem("airlineData"))||[];}
  else{fetch('airlineData.json').then(r=>r.json()).then(j=>{data=j;isManager=false;render();}).catch(err=>{console.warn(err);data=[];render();});}
  render();
};
