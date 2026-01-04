// FIREBASE
firebase.initializeApp({
  apiKey: "AIzaSyD7uCXlJjnLV0RrbM3Ai9SOrIVIdrvUt4w",
  authDomain: "tombola-online-6f922.firebaseapp.com",
  databaseURL: "https://tombola-online-6f922-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tombola-online-6f922"
});

const db = firebase.database();

let stanza, baseRef, playerId, nome, isHost = false;

// LOGIN STANZA
function entraStanza() {
  stanza = document.getElementById("inputStanza").value.trim();
  if (!stanza) return alert("Inserisci una stanza");

  document.getElementById("login").style.display = "none";
  document.getElementById("gioco").style.display = "block";
  document.getElementById("codiceStanza").textContent = stanza;

  baseRef = db.ref("stanze/" + stanza);

  playerId = localStorage.getItem("playerId") || Math.random().toString(36).substr(2);
  localStorage.setItem("playerId", playerId);

  nome = localStorage.getItem("nome") || prompt("Il tuo nome?");
  localStorage.setItem("nome", nome);

  const giocatoreRef = baseRef.child("giocatori/" + playerId);
  giocatoreRef.set({ nome });
  giocatoreRef.onDisconnect().remove();

  assegnaHost();
  ascoltaNumeri();
  ascoltaVittoria();
}

// HOST AUTOMATICO
function assegnaHost() {
  const hostRef = baseRef.child("host");

  hostRef.once("value").then(snap => {
    if (!snap.exists()) hostRef.set(playerId);
  });

  hostRef.on("value", snap => {
    isHost = snap.val() === playerId;
    document.getElementById("estraiBtn").disabled = !isHost;
    document.getElementById("ruolo").textContent = isHost ? "👑 Sei l'host" : "👤 Giocatore";
  });

  baseRef.child("giocatori").on("value", snap => {
    if (!snap.exists()) baseRef.remove();
  });
}

// ESTRAZIONE
function estraiNumero() {
  if (!isHost) return;

  baseRef.child("numeriUsciti").transaction(numeri => {
    if (!numeri) numeri = [];
    if (numeri.length >= 90) return numeri;

    let disp = [];
    for (let i = 1; i <= 90; i++) if (!numeri.includes(i)) disp.push(i);
    numeri.push(disp[Math.floor(Math.random()*disp.length)]);
    return numeri;
  });
}

// ASCOLTO NUMERI
function ascoltaNumeri() {
  baseRef.child("numeriUsciti").on("value", snap => {
    const numeri = snap.val() || [];

    // storico
    const lista = document.getElementById("listaNumeri");
    lista.innerHTML = "";
    numeri.forEach(n => {
      const s = document.createElement("span");
      s.textContent = n;
      lista.appendChild(s);
    });

    // ultimo numero
    const ultimo = numeri[numeri.length - 1];
    document.getElementById("numero").textContent = ultimo || "-";

    // segna schedina
    if (!ultimo) return;

    document.querySelectorAll(".casella").forEach(c => {
      const n = parseInt(c.dataset.numero);
      if (n === ultimo && !c.classList.contains("segnato")) {
        c.classList.add("segnato");
        numeriSegnati.push(n);
        controllaVittoria();
      }
    });
  });
}



// SCHEDINA
let numeriSchedina = [];
let numeriSegnati = [];
let vittorie = { ambo:false, terno:false, tombola:false };

function creaSchedina() {
  numeriSchedina = [];
  numeriSegnati = [];
  vittorie = { ambo:false, terno:false, tombola:false };

  const s = document.getElementById("schedina");
  s.innerHTML = "";

  while (numeriSchedina.length < 15) {
    let n = Math.floor(Math.random() * 90) + 1;
    if (!numeriSchedina.includes(n)) numeriSchedina.push(n);
  }

  numeriSchedina.forEach(n => {
    const d = document.createElement("div");
    d.className = "casella";
    d.textContent = n;
    d.dataset.numero = n;
    s.appendChild(d);
  });
}

// VITTORIA
function controllaVittoria() {
  if (numeriSegnati.length >= 2 && !vittorie.ambo) {
    vittorie.ambo = true;
    baseRef.child("vittoria").set({ tipo:"AMBO", nome });
  }
  if (numeriSegnati.length >= 3 && !vittorie.terno) {
    vittorie.terno = true;
    baseRef.child("vittoria").set({ tipo:"TERNO", nome });
  }
  if (numeriSegnati.length >= 15 && !vittorie.tombola) {
    vittorie.tombola = true;
    baseRef.child("vittoria").set({ tipo:"TOMBOLA", nome });
  }
}


// RESET
function resetPartita() {
  if (!isHost) return;
  baseRef.child("numeriUsciti").set([]);
  baseRef.child("vittoria").remove();
}



