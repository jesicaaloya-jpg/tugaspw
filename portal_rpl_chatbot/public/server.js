
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Membaca data chatbot dari knowledge.json
const knowledgePath = path.join(__dirname, "data", "knowledge.json");

let knowledge = {};

try {
    const data = fs.readFileSync(knowledgePath, "utf8");
    knowledge = JSON.parse(data);
    console.log("Data chatbot berhasil dimuat.");
} catch (error) {
    console.error("Gagal membaca knowledge.json:", error.message);
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Mengubah teks menjadi huruf kecil
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// Mencari jawaban berdasarkan kata kunci
function findAnswer(message) {
    const question = normalizeText(message);

    // Memeriksa pertanyaan pada FAQ
    if (Array.isArray(knowledge.faq)) {
        for (const item of knowledge.faq) {
            if (!Array.isArray(item.keywords)) continue;

            for (const keyword of item.keywords) {
                const normalizedKeyword = normalizeText(keyword);

                if (question.includes(normalizedKeyword)) {
                    return item.answer;
                }
            }
        }
    }

    // Informasi tentang sekolah
    if (
        question.includes("sekolah") ||
        question.includes("smkn 9")
    ) {
        const school = knowledge.school;

        if (school) {
            return `${school.name} berlokasi di ${school.location}. ${school.description}`;
        }
    }

    // Informasi jurusan
    if (
        question.includes("jurusan") ||
        question.includes("program keahlian")
    ) {
        const departments = knowledge.departments || [];

        if (departments.length > 0) {
            return "Jurusan yang informasinya tersedia: " +
                departments.map(item =>
                    `${item.name}: ${item.description}`
                ).join(" ");
        }
    }

    // Mencari informasi guru
    if (
        question.includes("guru") ||
        question.includes("pengajar") ||
        question.includes("nama guru")
    ) {
        const teachers = knowledge.teachers || [];

        if (teachers.length > 0) {
            return teachers.map(teacher =>
                `${teacher.name} mengajar ${teacher.subject || "mata pelajaran yang belum dicantumkan"}.`
            ).join(" ");
        }

        return "Daftar nama guru belum tersedia. Silakan lengkapi data guru pada file knowledge.json.";
    }

    return knowledge.fallback ||
        "Maaf, saya belum menemukan jawaban untuk pertanyaan tersebut.";
}

// Endpoint untuk chatbot
app.post("/api/chat", (req, res) => {
    const message = req.body.message;

    if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
            reply: "Silakan masukkan pertanyaan terlebih dahulu."
        });
    }

    const reply = findAnswer(message);

    res.json({
        reply: reply
    });
});

// Endpoint untuk memeriksa server
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Backend chatbot SMKN 9 Medan berjalan."
    });
});

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
