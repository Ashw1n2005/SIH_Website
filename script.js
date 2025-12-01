// Elements
const drop = document.getElementById('drop');
const fileInput = document.getElementById('fileInput');
const pickBtn = document.getElementById('pickBtn');
const analysis = document.getElementById('analysis');
const messageEl = document.getElementById('message');
const detailsEl = document.getElementById('details');
const totalFilesEl = document.getElementById('totalFiles');
const totalSizeEl = document.getElementById('totalSize');
const topTypeEl = document.getElementById('topType');
const topFolderEl = document.getElementById('topFolder');
const previewEl = document.getElementById('preview');
const clearBtn = document.getElementById('clearBtn');

function humanBytes(bytes){
  if(bytes === 0) return '0 B';
  const units = ['B','KB','MB','GB','TB'];
  const i = Math.floor(Math.log(bytes)/Math.log(1024));
  return (bytes/Math.pow(1024,i)).toFixed(i ? (i < 2 ? 1 : 2) : 0) + ' ' + units[i];
}

function analyzeFiles(fileList){
  const files = Array.from(fileList);
  if(files.length === 0) return null;

  const totals = { count: files.length, size: 0 };
  const types = {};
  const folders = {};
  let largest = { size:0, name:'' };

  files.forEach(f => {
    totals.size += f.size;
    const rel = f.webkitRelativePath || f.name;

    const folder = rel.includes("/") ? rel.split("/").slice(0,-1).join("/") : "/";
    folders[folder] = (folders[folder] || 0) + 1;

    const extMatch = f.name.match(/\.([0-9A-Za-z]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : "(no ext)";
    types[ext] = (types[ext] || 0) + 1;

    if(f.size > largest.size)
      largest = { size: f.size, name: rel };
  });

  const topType = Object.entries(types).sort((a,b)=>b[1]-a[1])[0];
  const topFolder = Object.entries(folders).sort((a,b)=>b[1]-a[1])[0];

  return {
    totals,
    largest,
    topType: topType ? {ext: topType[0], count: topType[1]} : null,
    topFolder: topFolder ? {path: topFolder[0], count: topFolder[1]} : null,
    files
  };
}

function showAnalysis(result, files){
  if(!result){
    messageEl.textContent = "No files found.";
    analysis.style.display = "block";
    return;
  }

  messageEl.textContent = "Analysis complete — details below:";
  detailsEl.innerHTML = `
    <div>Files analyzed: <strong>${result.totals.count}</strong></div>
    <div>Total size: <strong>${humanBytes(result.totals.size)}</strong></div>
    <div>Largest file: <strong>${result.largest.name}</strong> (${humanBytes(result.largest.size)})</div>
  `;

  totalFilesEl.textContent = result.totals.count;
  totalSizeEl.textContent = humanBytes(result.totals.size);
  topTypeEl.textContent = result.topType ? `${result.topType.ext} (${result.topType.count})` : "—";
  topFolderEl.textContent = result.topFolder ? `${result.topFolder.path} (${result.topFolder.count})` : "—";

  previewEl.innerHTML = files
    .sort((a,b)=>b.size - a.size)
    .slice(0,30)
    .map(f => {
      const rel = f.webkitRelativePath || f.name;
      return `<div>${rel} — <strong>${humanBytes(f.size)}</strong></div>`;
    })
    .join("");

  analysis.style.display = "block";
}

// Click events
pickBtn.addEventListener('click', () => fileInput.click());
drop.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', e => {
  const files = e.target.files;
  const result = analyzeFiles(files);
  showAnalysis(result, files);
});

// Drag & Drop
['dragenter','dragover'].forEach(evt => {
  drop.addEventListener(evt, e => {
    e.preventDefault();
    drop.classList.add('drag');
  });
});
['dragleave','drop'].forEach(evt => {
  drop.addEventListener(evt, e => {
    e.preventDefault();
    drop.classList.remove('drag');
  });
});

drop.addEventListener('drop', e => {
  const files = e.dataTransfer.files;
  if(files.length){
    const result = analyzeFiles(files);
    showAnalysis(result, files);
  }
});

clearBtn.addEventListener('click', () => {
  analysis.style.display = "none";
  previewEl.textContent = "No files yet.";
  totalFilesEl.textContent = "—";
  totalSizeEl.textContent = "—";
  topTypeEl.textContent = "—";
  topFolderEl.textContent = "—";
  fileInput.value = "";
});
