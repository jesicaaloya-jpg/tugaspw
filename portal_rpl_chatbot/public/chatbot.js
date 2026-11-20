
// =====================================
// CHATBOT SMKN 9 MEDAN
// FRONTEND JAVASCRIPT
// =====================================

// Mengambil elemen HTML
const launcher = document.getElementById("chatbotLauncher");
const panel = document.getElementById("chatbotPanel");
const closeButton = document.getElementById("chatbotClose");
const form = document.getElementById("chatbotForm");
const input = document.getElementById("chatbotInput");
const messages = document.getElementById("chatbotMessages");

// =====================================
// MEMBUKA CHATBOT
// =====================================

function openChat() {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");

    input.focus();
}

// =====================================
// MENUTUP CHATBOT
// =====================================

function closeChat() {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
}

// =====================================
// MENAMPILKAN PESAN
// =====================================

function addMessage(text, sender) {

    const bubble = document.createElement("div");

    if (sender === "user") {
        bubble.className = "chat-message user-message";
    } else {
        bubble.className = "chat-message bot-message";
    }

    // Menghindari HTML dari input pengguna
    bubble.textContent = text;

    messages.appendChild(bubble);

    // Scroll otomatis ke pesan terbaru
    messages.scrollTop = messages.scrollHeight;
}

// =====================================
// MENGIRIM PERTANYAAN KE BACKEND
// =====================================

async function askBot(question) {

    // Menampilkan pertanyaan pengguna
    addMessage(question, "user");

    // Mengosongkan kolom input
    input.value = "";

    // Membuat indikator loading
    const waiting = document.createElement("div");

    waiting.className = "chat-message bot-message";
    waiting.textContent = "Sedang mencari jawaban...";

    messages.appendChild(waiting);

    messages.scrollTop = messages.scrollHeight;

    try {

        // Mengirim data ke server.js
        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: question
            })

        });

        // Mengubah respons menjadi JSON
        const result = await response.json();

        // Memeriksa status respons server
        if (!response.ok) {
            throw new Error(result.reply || "Terjadi kesalahan pada server.");
        }

        // Menampilkan jawaban chatbot
        waiting.textContent = result.reply ||
            "Maaf, belum ada jawaban untuk pertanyaan tersebut.";

    } catch (error) {

        console.error("Kesalahan chatbot:", error);

        waiting.textContent =
            "Maaf, chatbot tidak dapat terhubung ke server. Pastikan backend Node.js sedang berjalan.";

    }

    messages.scrollTop = messages.scrollHeight;
}

// =====================================
// EVENT TOMBOL CHATBOT
// =====================================

// Tombol membuka chatbot
launcher.addEventListener("click", openChat);

// Tombol menutup chatbot
closeButton.addEventListener("click", closeChat);

// =====================================
// EVENT FORM PERTANYAAN
// =====================================

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const question = input.value.trim();

    // Memeriksa apakah input kosong
    if (question === "") {
        return;
    }

    // Mengirim pertanyaan
    askBot(question);

});

// =====================================
// PERTANYAAN CEPAT
// =====================================

document.querySelectorAll(".chatbot-suggestions button")
    .forEach(function(button) {

        button.addEventListener("click", function() {

            const question = button.dataset.question;

            if (question) {
                askBot(question);
            }

        });

    });
