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


let numeriDisponibili = [];
let numeriUsciti = [];

// inizializza numeri da 1 a 90
for (let i = 1; i <= 90; i++) {
    numeriDisponibili.push(i);
}

function estraiNumero() {
    if (numeriDisponibili.length === 0) {
        alert("Tutti i numeri sono stati estratti!");
        return;
    }

    const index = Math.floor(Math.random() * numeriDisponibili.length);
    const numero = numeriDisponibili.splice(index, 1)[0];

    numeriUsciti.push(numero);

    document.getElementById("numero").textContent = numero;

    const span = document.createElement("span");
    span.textContent = numero;
    document.getElementById("listaNumeri").appendChild(span);
    // segna il numero sulla schedina
document.querySelectorAll(".casella").forEach(casella => {
    if (parseInt(casella.dataset.numero) === numero) {
        casella.classList.add("segnato");
    }
});

}

let schedinaNumeri = [];

function creaSchedina() {
    schedinaNumeri = [];
    document.getElementById("schedina").innerHTML = "";

    while (schedinaNumeri.length < 15) {
        let n = Math.floor(Math.random() * 90) + 1;
        if (!schedinaNumeri.includes(n)) {
            schedinaNumeri.push(n);
        }
    }

    schedinaNumeri.forEach(num => {
        const div = document.createElement("div");
        div.className = "casella";
        div.textContent = num;
        div.dataset.numero = num;
        document.getElementById("schedina").appendChild(div);
    });
}
