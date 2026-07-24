const input = document.querySelector("#sequenceInput");
const frameSelect = document.querySelector("#frameSelect");
const exampleBtn = document.querySelector("#exampleBtn");
const clearBtn = document.querySelector("#clearBtn");
const codonInput = document.querySelector("#codonInput");

const codonTable = {
  UUU: "F", UUC: "F", UUA: "L", UUG: "L",
  UCU: "S", UCC: "S", UCA: "S", UCG: "S",
  UAU: "Y", UAC: "Y", UAA: "*", UAG: "*",
  UGU: "C", UGC: "C", UGA: "*", UGG: "W",
  CUU: "L", CUC: "L", CUA: "L", CUG: "L",
  CCU: "P", CCC: "P", CCA: "P", CCG: "P",
  CAU: "H", CAC: "H", CAA: "Q", CAG: "Q",
  CGU: "R", CGC: "R", CGA: "R", CGG: "R",
  AUU: "I", AUC: "I", AUA: "I", AUG: "M",
  ACU: "T", ACC: "T", ACA: "T", ACG: "T",
  AAU: "N", AAC: "N", AAA: "K", AAG: "K",
  AGU: "S", AGC: "S", AGA: "R", AGG: "R",
  GUU: "V", GUC: "V", GUA: "V", GUG: "V",
  GCU: "A", GCC: "A", GCA: "A", GCG: "A",
  GAU: "D", GAC: "D", GAA: "E", GAG: "E",
  GGU: "G", GGC: "G", GGA: "G", GGG: "G"
};

const aminoNames = {
  A: "Alanine", R: "Arginine", N: "Asparagine", D: "Aspartic acid",
  C: "Cysteine", Q: "Glutamine", E: "Glutamic acid", G: "Glycine",
  H: "Histidine", I: "Isoleucine", L: "Leucine", K: "Lysine",
  M: "Methionine", F: "Phenylalanine", P: "Proline", S: "Serine",
  T: "Threonine", W: "Tryptophan", Y: "Tyrosine", V: "Valine",
  "*": "Stop codon"
};

const weights = {
  dna: { A: 313.21, T: 304.2, C: 289.18, G: 329.21 },
  rna: { A: 329.21, U: 306.17, C: 305.18, G: 345.21 },
  protein: {
    A: 89.09, R: 174.2, N: 132.12, D: 133.1, C: 121.15, Q: 146.15,
    E: 147.13, G: 75.07, H: 155.16, I: 131.17, L: 131.17, K: 146.19,
    M: 149.21, F: 165.19, P: 115.13, S: 105.09, T: 119.12, W: 204.23,
    Y: 181.19, V: 117.15
  }
};

const exampleSequence = `>insulin_fragment_practice
ATGGCCCTGTGGATGCGCCTCCTGCCCCTGCTGGCGCTGCTGGCCCTCTGGGGACCTGACCCAGCCGCAGCCTTTGTGAACCAACACCTGTGCGGCTCACACCTGGTGGAAGCTCTCTACCTAGTGTGCGGGGAACGAGGCTTCTTCTACACACCCAAGACCCGCCGGGAG`;

function cleanSequence(value) {
  return value
    .split(/\r?\n/)
    .filter((line) => !line.startsWith(">"))
    .join("")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

function detectType(seq) {
  if (!seq) return "-";
  if (/^[ACGTN]+$/.test(seq)) return "DNA";
  if (/^[ACGUN]+$/.test(seq)) return "RNA";
  if (/^[ACDEFGHIKLMNPQRSTVWY*]+$/.test(seq)) return "Protein";
  return "Mixed";
}

function countBases(seq, letters) {
  return letters.reduce((total, letter) => total + [...seq].filter((base) => base === letter).length, 0);
}

function formatSequence(seq, width = 60) {
  if (!seq) return "";
  return seq.match(new RegExp(`.{1,${width}}`, "g")).join("\n");
}

function molecularWeight(seq, type) {
  const table = type === "RNA" ? weights.rna : type === "Protein" ? weights.protein : weights.dna;
  const total = [...seq].reduce((sum, letter) => sum + (table[letter] || 0), 0);
  return `${Math.round(total).toLocaleString()} Da`;
}

function reverseComplement(seq, type) {
  const complements = type === "RNA"
    ? { A: "U", U: "A", C: "G", G: "C", N: "N" }
    : { A: "T", T: "A", C: "G", G: "C", N: "N" };
  return [...seq].reverse().map((base) => complements[base] || "N").join("");
}

function toRna(seq) {
  return seq.replaceAll("T", "U");
}

function translate(seq, frame = 0) {
  const rna = toRna(seq);
  let protein = "";
  for (let i = frame; i + 2 < rna.length; i += 3) {
    protein += codonTable[rna.slice(i, i + 3)] || "X";
  }
  return protein;
}

function findOrfs(seq) {
  const rna = toRna(seq);
  const orfs = [];
  for (let frame = 0; frame < 3; frame += 1) {
    for (let i = frame; i + 2 < rna.length; i += 3) {
      if (rna.slice(i, i + 3) !== "AUG") continue;
      for (let j = i + 3; j + 2 < rna.length; j += 3) {
        if (["UAA", "UAG", "UGA"].includes(rna.slice(j, j + 3))) {
          const protein = translate(rna.slice(i, j + 3));
          orfs.push({ frame: frame + 1, start: i + 1, end: j + 3, protein });
          break;
        }
      }
    }
  }
  return orfs.sort((a, b) => b.protein.length - a.protein.length).slice(0, 8);
}

function updateComposition(seq, type) {
  const letters = type === "RNA" ? ["A", "U", "C", "G"] : type === "Protein" ? ["A", "R", "N", "D"] : ["A", "T", "C", "G"];
  const html = letters.map((letter) => {
    const count = countBases(seq, [letter]);
    const pct = seq.length ? (count / seq.length) * 100 : 0;
    return `
      <div class="bar-row">
        <span>${letter}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        <small>${count} (${pct.toFixed(1)}%)</small>
      </div>
    `;
  }).join("");
  document.querySelector("#compositionBars").innerHTML = html || "No sequence entered.";
}

function updateCodonLookup() {
  const raw = codonInput.value.toUpperCase().replace(/[^ACGTU]/g, "").slice(0, 3);
  codonInput.value = raw;
  const output = document.querySelector("#codonOutput");
  if (raw.length !== 3) {
    output.textContent = "Enter a codon to identify the amino acid.";
    return;
  }
  const rna = toRna(raw);
  const amino = codonTable[rna];
  output.textContent = amino ? `${raw} -> ${amino} (${aminoNames[amino]})` : "Unknown codon.";
}

function updateApp() {
  const seq = cleanSequence(input.value);
  const type = detectType(seq);
  const gc = seq.length ? (countBases(seq, ["G", "C"]) / seq.length) * 100 : 0;
  const frame = Number(frameSelect.value);

  document.querySelector("#seqType").textContent = type;
  document.querySelector("#seqLength").textContent = seq.length.toLocaleString();
  document.querySelector("#gcContent").textContent = `${gc.toFixed(1)}%`;
  document.querySelector("#molWeight").textContent = seq ? molecularWeight(seq, type) : "0 Da";

  updateComposition(seq, type);

  const nucleic = type === "DNA" || type === "RNA";
  document.querySelector("#reverseComplement").textContent = nucleic
    ? formatSequence(reverseComplement(seq, type))
    : "Reverse complement is available for DNA or RNA sequences.";
  document.querySelector("#rnaOutput").textContent = type === "DNA"
    ? formatSequence(toRna(seq))
    : "Paste DNA to transcribe it into RNA.";
  document.querySelector("#proteinOutput").textContent = nucleic
    ? formatSequence(translate(seq, frame))
    : "Paste DNA or RNA to translate codons.";

  const orfList = document.querySelector("#orfList");
  const orfs = nucleic ? findOrfs(seq) : [];
  orfList.innerHTML = orfs.length
    ? orfs.map((orf) => `
      <div class="orf-item">
        <strong>Frame ${orf.frame}</strong>
        <span>${orf.start}-${orf.end}</span>
        <span>${orf.protein.length} aa</span>
        <code>${orf.protein}</code>
      </div>
    `).join("")
    : "No complete ORFs found. Try a longer coding DNA sequence.";
}

function drawHelix() {
  const canvas = document.querySelector("#helixCanvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const time = Date.now() / 800;

  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 2;

  for (let i = 0; i < 30; i += 1) {
    const x = 18 + i * 14;
    const phase = i * 0.55 + time;
    const y1 = h / 2 + Math.sin(phase) * 54;
    const y2 = h / 2 + Math.sin(phase + Math.PI) * 54;

    ctx.strokeStyle = "rgba(255,255,255,0.34)";
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();

    ctx.fillStyle = i % 2 ? "#f6c45f" : "#7fd5c5";
    ctx.beginPath();
    ctx.arc(x, y1, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = i % 2 ? "#7fd5c5" : "#f6c45f";
    ctx.beginPath();
    ctx.arc(x, y2, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  for (let strand = 0; strand < 2; strand += 1) {
    ctx.beginPath();
    for (let i = 0; i < 220; i += 1) {
      const x = 18 + i * 1.9;
      const y = h / 2 + Math.sin(i * 0.04 + time + strand * Math.PI) * 54;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  requestAnimationFrame(drawHelix);
}

exampleBtn.addEventListener("click", () => {
  input.value = exampleSequence;
  updateApp();
});

clearBtn.addEventListener("click", () => {
  input.value = "";
  updateApp();
});

input.addEventListener("input", updateApp);
frameSelect.addEventListener("change", updateApp);
codonInput.addEventListener("input", updateCodonLookup);

updateApp();
drawHelix();
