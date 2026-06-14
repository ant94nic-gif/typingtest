// static/js/script.js
document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('input-field');
    const originalTextSpan = document.getElementById('original-text');
    const timerDisplay = document.getElementById('time-left');
    const statsPanel = document.getElementById('stats-panel');
    const resultScreen = document.getElementById('result-screen');

    let timerInterval;
    let timeElapsed = 0;
    let isRaceRunning = false;
    let correctChars = 0;
    let errorsMade = 0;
    let totalChars;

    // --- ИНИЦИАЛИЗАЦИЯ ---
    function init() {
        totalChars = originalTextSpan.textContent.length;
        resetGame();
        setupTextHighlighting(); // Подготовка подсветки
    }

    // --- ФАЗА 1: СТАРТ ГОНКИ (ОТ ПЕРВОГО НАЖАТИЯ) ---
    inputField.addEventListener('focus', () => {
        if (!isRaceRunning) {
            startRace();
        }
    });

    function startRace() {
        isRaceRunning = true;
        timeElapsed = 0;
        updateTimerDisplay();
        timerInterval = setInterval(updateTimer, 100);
        inputField.value = '';
        inputField.disabled = false;
        inputField.focus();
    }

    // --- ФАЗА 2: ТАЙМЕР ---
    function updateTimer() {
        timeElapsed += 0.1; // Увеличиваем каждые 100мс
        updateLiveStats();
    }

    function updateTimerDisplay() {
        timerDisplay.textContent = timeElapsed.toFixed(1);
    }

    // --- ФАЗА 3: ПОДСЧЕТ СКОРОСТИ И ТОЧНОСТИ В РЕАЛЬНОМ ВРЕМЕНИ ---
    function updateLiveStats() {
        updateTimerDisplay();

        const minutesPassed = timeElapsed / 60;
        const speed = Math.round((correctChars + errorsMade) / minutesPassed || 0);
        const accuracy = ((correctChars + errorsMade) > 0)
            ? Math.round((correctChars / (correctChars + errorsMade)) * 100)
            : 100;

        document.querySelector('#speed span').textContent = speed;
        document.querySelector('#accuracy span').textContent = accuracy;
    }

    // --- ФАЗА 4: ПРОВЕРКА ВВОДА И ПОДСВЕТКА ---
    function checkInput() {
        const userValue = inputField.value;
        const spans = originalTextSpan.querySelectorAll('span');

        spans.forEach((span, index) => {
            if (index < userValue.length) {
                const isCorrect = userValue[index] === span.textContent;

                if (isCorrect && !span.classList.contains('visited')) {
                    correctChars++;
                    span.classList.add('typed-correct', 'visited');
                } else if (!isCorrect && !span.classList.contains('visited')) {
                    errorsMade++;
                    span.classList.add('incorrect', 'visited');
                }

                span.classList.toggle('typed-correct', isCorrect);
                span.classList.toggle('incorrect', !isCorrect);
            } else {
                span.classList.remove('typed-correct', 'incorrect');
                if (span.classList.contains('visited')) {
                    span.classList.remove('visited'); // Если стерли ошибку
                }
            }
        });

        updateLiveStats();

        // Проверка завершения набора
        if (userValue.length === totalChars) {
            endRace();
        }
    }

    // Функция для подготовки текста (оборачивание в span'ы)
    function setupTextHighlighting() {
        const text = originalTextSpan.textContent;
        const spansHtml = [...text].map(char =>
            `<span>${char === ' ' ? '\u00A0' : char}</span>` // Неразрывный пробел
        ).join('');
        originalTextSpan.innerHTML = spansHtml;
    }

    // --- ФАЗА 5: ЗАВЕРШЕНИЕ ГОНКИ ---
    function endRace() {
        clearInterval(timerInterval);
        isRaceRunning = false;
        inputField.disabled = true;
        resultScreen.classList.remove('hidden');

        const finalSpeedEl = document.getElementById('final-speed');
        const finalAccuracyEl = document.getElementById('final-accuracy');

        const minutesPassed = timeElapsed / 60;
        const finalSpeed = Math.round(correctChars / minutesPassed);
        const finalAccuracy = ((correctChars + errorsMade) > 0)
            ? Math.round((correctChars / (correctChars + errorsMade)) * 100)
            : 100;

        finalSpeedEl.textContent = `Ваш результат: ${finalSpeed} знаков/мин`;
        finalAccuracyEl.textContent = `Точность: ${finalAccuracy}%`;

        // Отправляем данные на сервер
        fetch('/submit-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                wpm: finalSpeed,
                accuracy: finalAccuracy,
                charsTyped: correctChars + errorsMade,
                errorsMade: errorsMade,
                timeSpent: timeElapsed
            })
        });
    }

    function playAgain() {
        window.location.href = '/'; // Возвращаемся на главную страницу
    }

    function resetGame() {
        correctChars = 0;
        errorsMade = 0;
        Array.from(originalTextSpan.querySelectorAll('span')).forEach(span => {
            span.className = ''; // Сбрасываем классы у всех символов
        });
        document.querySelector('#speed span').textContent = '0';
        document.querySelector('#accuracy span').textContent = '100';
    }

    // --- СОБЫТИЯ ---
    inputField.addEventListener('input', checkInput);
    document.getElementById('play-again-btn').addEventListener('click', playAgain);

    // Запуск инициализации
    init();
});