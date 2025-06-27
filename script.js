let isMultiplayer = false;
let player1Name = "Player 1", player2Name = "Player 2";
let player1Score = 0, player2Score = 0;
let currentPlayer = "player1";
let currentQuestions = [];
let currentQuestionIndex = 0;
let selectedDifficulty = "easy";

let users = [];
let bannedUsers = [];
let hintsEnabled = true;

async function fetchQuestions(difficulty) {
    try {
        const response = await fetch(`http://localhost:3000/questions?difficulty=${difficulty}`);
        currentQuestions = await response.json();
        currentQuestionIndex = 0;
    } catch (error) {
        console.error("Error fetching questions:", error);
    }
}

function selectMode(mode) {
    isMultiplayer = mode === "multiplayer";
    document.getElementById("mode-selection").classList.add("hidden");
    if (isMultiplayer) {
        document.getElementById("player-inputs").classList.remove("hidden");
    } else {
        document.getElementById("difficulty-selection").classList.remove("hidden");
    }
}

function confirmPlayers() {
    player1Name = document.getElementById("player1-name").value || "Player 1";
    player2Name = document.getElementById("player2-name").value || "Player 2";

    if (bannedUsers.includes(player1Name) || bannedUsers.includes(player2Name)) {
        alert("One or both players are banned.");
        return;
    }

    users.push(player1Name, player2Name);
    updateUserList();
    document.getElementById("player-inputs").classList.add("hidden");
    document.getElementById("difficulty-selection").classList.remove("hidden");
}

async function startGame(difficulty) {
    selectedDifficulty = difficulty;
    await fetchQuestions(difficulty);

    document.getElementById("difficulty-selection").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");

    updateTurnInfo();
    showQuestion();
}

function updateTurnInfo() {
    if (isMultiplayer) {
        let turnText = currentPlayer === "player1" ? `${player1Name}'s Turn` : `${player2Name}'s Turn`;
        document.getElementById("turn-info").innerText = turnText;
    }
}

function showQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        showResult();
        return;
    }

    let questionData = currentQuestions[currentQuestionIndex];
    document.getElementById("question").innerText = questionData.question;

    let hintElement = document.getElementById("hint");
    hintElement.innerText = hintsEnabled ? questionData.hint : "Hints are disabled.";
    hintElement.style.display = "none";
    document.getElementById("result").innerText = "";

    let hintContainer = document.getElementById("hint-container");
    hintContainer.innerHTML = `<button onclick="showHint()">Show Hint</button>`;

    let answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = "";

    ["option1", "option2", "option3", "option4"].forEach(option => {
        const button = document.createElement("button");
        button.innerText = questionData[option];
        button.onclick = () => checkAnswer(questionData[option], questionData.correctAnswer);
        answersDiv.appendChild(button);
    });
}

function showHint() {
    if (hintsEnabled) {
        document.getElementById("hint").style.display = "block";
    }
}

function checkAnswer(selected, correct) {
    let resultText = "";
    if (selected === correct) {
        resultText = "✅ Correct!";
        if (currentPlayer === "player1") player1Score += 10;
        else player2Score += 10;
    } else {
        resultText = `❌ Wrong! Correct Answer: ${correct}`;
    }

    document.getElementById("result").innerText = resultText;

    setTimeout(() => {
        currentQuestionIndex++;
        if (isMultiplayer) {
            currentPlayer = currentPlayer === "player1" ? "player2" : "player1";
            updateTurnInfo();
        }
        showQuestion();
    }, 1500);
}

function showResult() {
    document.getElementById("game").classList.add("hidden");
    document.getElementById("game-result").classList.remove("hidden");

    let finalScoreText = isMultiplayer
        ? `${player1Name}: ${player1Score} | ${player2Name}: ${player2Score}`
        : `Final Score: ${player1Score}`;

    document.getElementById("final-scoreboard").innerText = finalScoreText;

    if (isMultiplayer) {
        let winner = player1Score > player2Score ? player1Name : player2Score > player1Score ? player2Name : "It's a tie!";
        document.getElementById("winner-message").innerText = `Winner: ${winner}`;
    }
    updateAdminScoreDisplay();
}

function restartGame() {
    location.reload();
}

function exitGame() {
    location.reload();
}

// ---------------- Admin Controls ----------------

function updateUserList() {
    const userList = document.getElementById("user-list");
    userList.innerHTML = "";
    users.forEach(user => {
        const li = document.createElement("li");
        li.innerText = user;
        userList.appendChild(li);
    });
}

function resetScores() {
    player1Score = 0;
    player2Score = 0;
    updateAdminScoreDisplay();
    alert("Scores reset.");
}

function updateAdminScoreDisplay() {
    const scoreBoard = document.getElementById("admin-score-display");
    if (scoreBoard) {
        scoreBoard.innerText = `${player1Name}: ${player1Score}\n${player2Name}: ${player2Score}`;
    }
}

function addCustomQuestion() {
    const q = document.getElementById("new-q").value;
    const o1 = document.getElementById("opt1").value;
    const o2 = document.getElementById("opt2").value;
    const o3 = document.getElementById("opt3").value;
    const o4 = document.getElementById("opt4").value;
    const correct = document.getElementById("correct").value;
    const hint = document.getElementById("hint-text").value;

    currentQuestions.push({
        question: q, option1: o1, option2: o2, option3: o3, option4: o4,
        correctAnswer: correct, hint: hint
    });

    alert("Question added.");
}

function deleteQuestion() {
    const index = parseInt(document.getElementById("delete-question-index").value);
    if (!isNaN(index) && index >= 0 && index < currentQuestions.length) {
        currentQuestions.splice(index, 1);
        alert("Question deleted.");
    } else {
        alert("Invalid index.");
    }
}

function viewAllQuestions() {
    console.log(currentQuestions);
    alert("All questions logged to console.");
}

function editQuestion() {
    const index = parseInt(document.getElementById("edit-index").value);
    const newText = document.getElementById("edit-text").value;
    if (currentQuestions[index]) {
        currentQuestions[index].question = newText;
        alert("Question updated.");
    } else {
        alert("Invalid index.");
    }
}

function banUser() {
    const name = document.getElementById("ban-user-name").value;
    if (!bannedUsers.includes(name)) {
        bannedUsers.push(name);
        alert(`${name} is now banned.`);
    }
}

function unbanUser() {
    const name = document.getElementById("ban-user-name").value;
    bannedUsers = bannedUsers.filter(user => user !== name);
    alert(`${name} is now unbanned.`);
}

function resetGameSession() {
    player1Score = 0;
    player2Score = 0;
    currentQuestionIndex = 0;
    currentPlayer = "player1";
    currentQuestions = [];
    alert("Game session reset.");
}

function exportQuestions() {
    const blob = new Blob([JSON.stringify(currentQuestions)], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "questions.json";
    link.click();
}

function importQuestions(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            currentQuestions = JSON.parse(e.target.result);
            alert("Questions imported successfully.");
        } catch {
            alert("Invalid JSON file.");
        }
    };
    reader.readAsText(file);
}

function toggleHints() {
    hintsEnabled = !hintsEnabled;
    alert(`Hints are now ${hintsEnabled ? "enabled" : "disabled"}.`);
}

function adminLogout() {
    location.reload();
}
