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

// 👤 PLAYER ID
let playerId = localStorage.getItem("playerId");
if (!playerId) {
    playerId = Math.random().toString(36).substring(2);
    localStorage.setItem("playerId", playerId);
}

let isHost = false;

// 👑 HOST LOGIC
const hostRef = database.ref("host");
hostRef.once("value", snap => {
    if (!snap.exists()) {
        hostRef.set(playerId);
        isHost = true;
    } else {
        isHost = snap.val() === playerId;
    }
    document.getElementById("estraiBtn").disabled = !isHost;
});

// 🎯 GAME STATE
let schedinaNumeri = [];
let numeriSegnati = [];
let vittorie = { ambo: false, terno: false, tombola: false };

// 🎟 CREA SCHEDINA
function creaSchedina() {
    schedinaNumeri = [];
    numeriSegnati = [];
    vittorie = { ambo: false, terno: false, tombola: false };
    document.getElementById("schedina").innerHTML = "";

    while (schedinaNumeri.length < 15) {
        let n = Math.floor(Math.random() * 90) + 1;
        if (!schedinaNumeri.includes(n)) schedinaNumeri.push(n);
    }

    schedinaNumeri.forEach(num => {
        const div = document.createElement("div");
        div.className = "casella";
        div.textContent = num;
        div.dataset.numero = num;
        document.getElementById("schedina").appendChild(div);
    });
}

// 🎲 ESTRAI NUMERO (HOST)
function estraiNumero() {
    if (!isHost) return;

    const numero = Math.floor(Math.random() * 90) + 1;
    database.ref("numeroCorrente").set(numero);
    database.ref("numeriUsciti").push(numero);
}

// 👀 LISTENER REALTIME
database.ref("numeroCorrente").on("value", snap => {
    const numero = snap.val();
    if (!numero) return;

    document.getElementById("numero").textContent = numero;

    const span = document.createElement("span");
    span.textContent = numero;
    document.getElementById("listaNumeri").appendChild(span);

    document.querySelectorAll(".casella").forEach(c => {
        if (parseInt(c.dataset.numero) === numero && !c.classList.contains("segnato")) {
            c.classList.add("segnato");
            numeriSegnati.push(numero);
            controllaVittoria();
        }
    });
});

// 🏆 CONTROLLO VITTORIA
function controllaVittoria() {
    const count = numeriSegnati.length;

    if (count >= 2 && !vittorie.ambo) {
        alert("🎉 AMBO!");
        vittorie.ambo = true;
    }
    if (count >= 3 && !vittorie.terno) {
        alert("🎉 TERNO!");
        vittorie.terno = true;
    }
    if (count >= 15 && !vittorie.tombola) {
        alert("🏆 TOMBOLA!!!");
        vittorie.tombola = true;
    }
}

// 🔄 RESET PARTITA (HOST)
function resetPartita() {
    if (!isHost) return alert("Solo l'host può resettare!");

    database.ref().set({
        host: playerId,
        numeroCorrente: null,
        numeriUsciti: []
    });

    document.getElementById("numero").textContent = "-";
    document.getElementById("listaNumeri").innerHTML = "";
    document.getElementById("schedina").innerHTML = "";
}
