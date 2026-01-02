// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyD7uCXlJjnLV0RrbM3Ai9SOrIVIdrvUt4w",
  authDomain: "tombola-online-6f922.firebaseapp.com",
  databaseURL: "https://tombola-online-6f922-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tombola-online-6f922",
  storageBucket: "tombola-online-6f922.firebasestorage.app",
  messagingSenderId: "520956930846",
  appId: "1:520956930846:web:ffe20c108ace202f05b70f"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 🏠 STANZA
let stanza = localStorage.getItem("stanza");
if (!stanza) {
    stanza = prompt("Inserisci codice stanza:");
    localStorage.setItem("stanza", stanza.toUpperCase());
}
document.getElementById("codiceStanza").textContent = stanza;

const baseRef = database.ref("stanze/" + stanza);

let nome = localStorage.getItem("nome");
if (!nome) {
    nome = prompt("Inserisci il tuo nome:");
    localStorage.setItem("nome", nome);
}

// 👤 GIOCATORE
let playerId = localStorage.getItem("playerId");
if (!playerId) {
    playerId = Math.random().toString(36).substring(2);
    localStorage.setItem("playerId", playerId);
}

let nome = localStorage.getItem("nome");
if (!nome) {
    nome = prompt("Inserisci il tuo nome:");
    localStorage.setItem("nome", nome);
}

baseRef.child("giocatori/" + playerId).set({ nome });

// 👑 HOST
let isHost = false;
const hostRef = baseRef.child("host");

hostRef.once("value").then(snap => {
    if (!snap.exists()) hostRef.set(playerId);
});

hostRef.on("value", snap => {
    isHost = snap.val() === playerId;
    document.getElementById("estraiBtn").disabled = !isHost;
    document.getElementById("ruolo").textContent = isHost ? "👑 Sei l'host" : "👤 Sei un giocatore";
});

// 🎯 SCHEDINA
let numeriSegnati = [];
let vittorie = { ambo:false, terno:false, tombola:false };

function creaSchedina() {
    numeriSegnati = [];
    vittorie = { ambo:false, terno:false, tombola:false };
    document.getElementById("schedina").innerHTML = "";

    let numeri = [];
    while (numeri.length < 15) {
        let n = Math.floor(Math.random() * 90) + 1;
        if (!numeri.includes(n)) numeri.push(n);
    }

    numeri.forEach(n => {
        const d = document.createElement("div");
        d.className = "casella";
        d.textContent = n;
        d.dataset.numero = n;
        document.getElementById("schedina").appendChild(d);
    });
}

// 🎲 ESTRAZIONE (ANTI-DOPPIO)
function estraiNumero() {
    if (!isHost) return;

    baseRef.child("numeriUsciti").transaction(numeri => {
        if (numeri === null) numeri = [];

        if (numeri.length >= 90) return numeri;

        let disponibili = [];
        for (let i = 1; i <= 90; i++) {
            if (!numeri.includes(i)) disponibili.push(i);
        }

        const estratto = disponibili[Math.floor(Math.random() * disponibili.length)];
        numeri.push(estratto);

        baseRef.child("numeroCorrente").set(estratto);
        return numeri;
    });
}

// 👀 ASCOLTA NUMERI (SINGOLA FONTE)
baseRef.child("numeriUsciti").on("value", snap => {
    const numeri = snap.val() || [];

    document.getElementById("listaNumeri").innerHTML = "";
    numeri.forEach(n => {
        const s = document.createElement("span");
        s.textContent = n;
        document.getElementById("listaNumeri").appendChild(s);
    });

    const ultimo = numeri[numeri.length - 1];
    if (ultimo) {
        document.getElementById("numero").textContent = ultimo;

        document.querySelectorAll(".casella").forEach(c => {
            if (parseInt(c.dataset.numero) === ultimo && !c.classList.contains("segnato")) {
                c.classList.add("segnato");
                numeriSegnati.push(ultimo);
                controllaVittoria();
            }
        });
    }
});

// 🏆 VITTORIE GLOBALI
function controllaVittoria() {
    const c = numeriSegnati.length;

    if (c >= 2 && !vittorie.ambo) {
        vittorie.ambo = true;
        baseRef.child("vittoria").set({ tipo:"AMBO", nome });
    }
    if (c >= 3 && !vittorie.terno) {
        vittorie.terno = true;
        baseRef.child("vittoria").set({ tipo:"TERNO", nome });
    }
    if (c >= 15 && !vittorie.tombola) {
        vittorie.tombola = true;
        baseRef.child("vittoria").set({ tipo:"TOMBOLA", nome });
    }
}

baseRef.child("vittoria").on("value", snap => {
    const v = snap.val();
    if (v) alert(`🏆 ${v.tipo}! Vince ${v.nome}`);
});

// 🔄 RESET STANZA
function resetPartita() {
    if (!isHost) return alert("Solo l'host!");

    baseRef.set({
        host: playerId,
        numeriUsciti: [],
        numeroCorrente: null
    });

    document.getElementById("schedina").innerHTML = "";
}





