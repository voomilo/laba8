const questions = new Map([
    [1, {
      image: '/resources/apple.jpg',
      question: 'Что изображено на картинке?',
      options: ['Яблоко', 'Банан', 'Киви', 'Апельсин'],
      correct: 0
    }],
    [2, {
      image: '/resources/tigr.jpg',
      question: 'Какой это животное?',
      options: ['Лев', 'Тигр', 'Пантера', 'Гепард'],
      correct: 1
    }],
    [3, {
      image: '/resources/minsk.jpg',
      question: 'Какой это город?',
      options: ['Минск', 'Рим', 'Барселона', 'Лондон'],
      correct: 0
    }],
    [4, {
      image: '/resources/moto.jpg',
      question: 'Что изображено на картинке?',
      options: ['Автомобиль', 'Мотоцикл', 'Велосипед', 'Самокат'],
      correct: 1
    }],
    [5, {
      image: '/resources/product6.jpg',
      question: 'Что на картинке?',
      options: ['Свидетель из Фрязино', 'Гарри Поттер', 'Введите текст', 'Козинак'],
      correct: 2
    }],
    [6, {
      image: '/resources/sunflower.jpg',
      question: 'Какой это цветок?',
      options: ['Роза', 'Тюльпан', 'Лилия', 'Подсолнух'],
      correct: 3
    }],
    [7, {
      image: '/resources/v golovu.jpg',
      question: 'Какой это спорт?',
      options: ['Футбол', 'Баскетбол', 'Теннис', 'Волейбол'],
      correct: 0
    }],
    [8, {
      image: '/resources/foto.jpg',
      question: 'Что это?',
      options: ['Компьютер', 'Телефон', 'Планшет', 'Фотоаппарат'],
      correct: 3
    }],
    [9, {
      image: 'не придумал',
      question: 'не придумал',
      options: ['Чай', 'Чай', 'Чай', 'Чай'],
      correct: 1
    }],
    [10, {
      image: '/resources/product4.jpg',
      question: 'тоже не придумал',
      options: ['Тинькоф', 'Сигара', 'Да', 'Нет'],
      correct: 0
    }],
  ]);
  
  const ANSWER_TIME = 15000;
  const RETRY_INTERVAL = 5000;
  
  const questionImage = document.getElementById('question-image');
  const answersForm = document.getElementById('answers-form');
  const submitBtn = document.getElementById('submit-btn');
  const feedback = document.getElementById('feedback');
  const timeLeftEl = document.getElementById('time-left');
  const retryBtn = document.getElementById('retry-btn');
  
  let currentIndex = 0;
  let questionIds = Array.from(questions.keys());
  let timerId = null;
  let countdownId = null;
  let timeLeft = ANSWER_TIME / 1000;
  
  const userAnswers = new Map();
  
  function startQuiz() {
    currentIndex = 0;
    retryBtn.classList.add('hidden');
    feedback.textContent = '';
    userAnswers.clear();
    questionIds = Array.from(questions.keys());
    showQuestion(questionIds[currentIndex]);
  }
  
  function showQuestion(id) {
    const q = questions.get(id);
    questionImage.src = q.image;
    questionImage.alt = q.question;
    answersForm.innerHTML = '';
    feedback.textContent = '';
    submitBtn.disabled = true;
    timeLeft = ANSWER_TIME / 1000;
    timeLeftEl.textContent = timeLeft;
  
    q.options.forEach((option, i) => {
      const label = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'answer';
      radio.value = i;
      radio.addEventListener('change', () => {
        submitBtn.disabled = false;
      });
      label.appendChild(radio);
      label.appendChild(document.createTextNode(option));
      answersForm.appendChild(label);
    });
  
    startCountdown();
  
    if (timerId) clearTimeout(timerId);
  
    timerId = setTimeout(() => {
      processAnswer(null);
    }, ANSWER_TIME);
  }
  
  function startCountdown() {
    clearInterval(countdownId);
    countdownId = setInterval(() => {
      timeLeft--;
      timeLeftEl.textContent = timeLeft;
      if (timeLeft <= 0) clearInterval(countdownId);
    }, 1000);
  }
  
  function processAnswer(selectedIndex) {
    clearTimeout(timerId);
    clearInterval(countdownId);
    submitBtn.disabled = true;
  
    const currentQuestionId = questionIds[currentIndex];
    const question = questions.get(currentQuestionId);
  
    let answerIndex = selectedIndex;
    if (answerIndex === null) {
      answerIndex = -1;
    }
    const isCorrect = answerIndex === question.correct;
    userAnswers.set(currentQuestionId, { answerIndex, correct: isCorrect });
  
    if (answerIndex === -1) {
      feedback.textContent = `Время вышло! Правильный ответ: "${question.options[question.correct]}"`;
    } else if (isCorrect) {
      feedback.textContent = 'Правильно! Отлично сделано!';
    } else {
      feedback.textContent = `Неправильно! Правильный ответ: "${question.options[question.correct]}"`;
    }
  
    feedback.classList.remove('fade-in');
    void feedback.offsetWidth;
    feedback.classList.add('fade-in');
  
    setTimeout(() => {
      currentIndex++;
      if (currentIndex < questionIds.length) {
        showQuestion(questionIds[currentIndex]);
      } else {
        showWrongAnswersSequence();
      }
    }, 2000);
  }
  
  submitBtn.addEventListener('click', () => {
    const selected = answersForm.answer.value;
    if (selected !== undefined) {
      processAnswer(parseInt(selected, 10));
    }
  });
  
  retryBtn.classList.add('hidden');
  
  function showWrongAnswersSequence() {
    const wrongQuestions = [...userAnswers.entries()]
      .filter(([_, ans]) => !ans.correct)
      .map(([id, _]) => id);
  
    if (wrongQuestions.length === 0) {
      feedback.textContent = 'Поздравляем! Все ответы правильные!';
      answersForm.innerHTML = '';
      questionImage.src = '';
      timeLeftEl.textContent = '';
      submitBtn.disabled = true;
      return;
    }
  
    feedback.textContent = `Показываем вопросы с ошибками (${wrongQuestions.length}):`;
    answersForm.innerHTML = '';
    questionImage.src = '';
    timeLeftEl.textContent = '';
    submitBtn.disabled = true;
  
    let idx = 0;
  
    function showNextWrong() {
      if (idx >= wrongQuestions.length) {
        feedback.textContent += ' Повтор ошибок завершён.';
        return;
      }
      const qId = wrongQuestions[idx];
      const q = questions.get(qId);
      const ans = userAnswers.get(qId);
  
      questionImage.src = q.image;
      questionImage.alt = q.question;
  
      answersForm.innerHTML = `
        <p><strong>Ваш ответ:</strong> ${ans.answerIndex >= 0 ? q.options[ans.answerIndex] : 'Не отвечали'}</p>
        <p><strong>Правильный ответ:</strong> ${q.options[q.correct]}</p>
        <label>
          <input type="radio" name="retry-answer" value="0" /> ${q.options[0]}
        </label>
        <label>
          <input type="radio" name="retry-answer" value="1" /> ${q.options[1]}
        </label>
        <label>
          <input type="radio" name="retry-answer" value="2" /> ${q.options[2]}
        </label>
        <label>
          <input type="radio" name="retry-answer" value="3" /> ${q.options[3]}
        </label>
      `;
  
      submitBtn.disabled = false;
      feedback.textContent = `Ошибка в вопросе: "${q.question}". Выберите правильный ответ.`;
  
      submitBtn.addEventListener('click', () => {
        const selectedRetry = answersForm.querySelector('input[name="retry-answer"]:checked');
        if (selectedRetry) {
          const retryAnswerIndex = parseInt(selectedRetry.value, 10);
          const isCorrect = retryAnswerIndex === q.correct;
          userAnswers.set(qId, { answerIndex: retryAnswerIndex, correct: isCorrect });
          if (isCorrect) {
            feedback.textContent = 'Правильно! Отлично!';
          } else {
            feedback.textContent = `Неправильно! Правильный ответ: "${q.options[q.correct]}"`;
          }
  
          feedback.classList.remove('fade-in');
          void feedback.offsetWidth;
          feedback.classList.add('fade-in');
  
          idx++;
          setTimeout(showNextWrong, RETRY_INTERVAL);
        }
      });
    }
  
    showNextWrong();
  }
  
  window.onload = startQuiz;
  