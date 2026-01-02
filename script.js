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
let nome = localStorage.getItem("nome");

if (!nome) {
  nome = prompt("Inserisci il tuo nome:");
  localStorage.setItem("nome", nome);
}


let playerId = localStorage.getItem("playerId");
if (!playerId) {
    playerId = Math.random().toString(36).substring(2);
    localStorage.setItem("playerId", playerId);
}

database.ref("giocatori/" + playerId).set({
  nome: nome
});


let isHost = false;

// 👑 HOST (UNICO, STABILE)
const hostRef = database.ref("host");

// assegna host se non esiste
hostRef.once("value").then(snapshot => {
    if (!snapshot.exists()) {
        hostRef.set(playerId);
    }
});

// ascolta SEMPRE l'host
hostRef.on("value", snapshot => {
    const hostId = snapshot.val();
    isHost = hostId === playerId;

    const btn = document.getElementById("estraiBtn");
    if (btn) btn.disabled = !isHost;

    console.log("HOST:", hostId, "IO:", playerId, "isHost:", isHost);
});

// 🎯 STATO LOCALE
let numeriSegnati = [];
let vittorie = { ambo: false, terno: false, tombola: false };

// 🎟 CREA SCHEDINA
function creaSchedina() {
    numeriSegnati = [];
    vittorie = { ambo: false, terno: false, tombola: false };
    document.getElementById("schedina").innerHTML = "";

    let numeri = [];
    while (numeri.length < 15) {
        let n = Math.floor(Math.random() * 90) + 1;
        if (!numeri.includes(n)) numeri.push(n);
    }

    numeri.forEach(num => {
        const div = document.createElement("div");
        div.className = "casella";
        div.textContent = num;
        div.dataset.numero = num;
        document.getElementById("schedina").appendChild(div);
    });
}

// 🎲 ESTRAI NUMERO (SOLO HOST)
function estraiNumero() {
    if (!isHost) return;

    const ref = database.ref("numeriUsciti");

    ref.transaction(numeri => {
        if (numeri === null) numeri = [];

        if (numeri.length >= 90) return numeri;

        let disponibili = [];
        for (let i = 1; i <= 90; i++) {
            if (!numeri.includes(i)) disponibili.push(i);
        }

        const estratto = disponibili[Math.floor(Math.random() * disponibili.length)];
        numeri.push(estratto);

        database.ref("numeroCorrente").set(estratto);
        return numeri;
    });
}

// 👀 ASCOLTA NUMERO CORRENTE
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

function dichiaraVittoria(tipo) {
  database.ref("vittoria").set({
    tipo: tipo,
    giocatore: nome
  });
}

database.ref("vittoria").on("value", snap => {
  const v = snap.val();
  if (!v) return;

  alert(`🏆 ${v.tipo}! 🎉\nVince: ${v.giocatore}`);
});


// 🏆 CONTROLLO VITTORIE
function controllaVittoria() {
    const c = numeriSegnati.length;

    if (c >= 2 && !vittorie.ambo) {
        vittorie.ambo = true;
       dichiaraVittoria("AMBO")
    }
    if (c >= 3 && !vittorie.terno) {
       vittorie.terno = true;
       dichiaraVittoria("TERNO")
    }
    if (c >= 15 && !vittorie.tombola) {
        vittorie.tombola = true;
       dichiaraVittoria("TOMBOLA")
    }
}

// 🔄 RESET PARTITA (SOLO HOST)
function resetPartita() {
    if (!isHost) return alert("Solo l'host può resettare!");

    database.ref().set({
        host: playerId,
        numeriUsciti: [],
        numeroCorrente: null
    });

    document.getElementById("numero").textContent = "-";
    document.getElementById("listaNumeri").innerHTML = "";
    document.getElementById("schedina").innerHTML = "";
}



