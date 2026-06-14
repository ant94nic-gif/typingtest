# run.py
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
app.config['SECRET_KEY'] = 'секретный-ключ-для-сессий'

# Словари текстов (аналог выбора словаря на Клавагонках)
TEXTS_DICTIONARIES = {
    'default': [
        "Съешь ещё этих мягких французских булочек да выпей же чаю.",
        "В чащах юга жил-был цитрус? Да, но фальшивый экземпляр!",
        "Лёд тронулся."
    ],
    'quotes': [
        "Быть или не быть, вот в чём вопрос.",
        "Я знаю только то, что ничего не знаю.",
        "Повторение — мать учения."
    ],
    'code_snippets': [
        "def hello_world(): print('Hello, World!')",
        "for i in range(10): print(i)",
        "if x > 5: return True"
    ]
}

# Список для хранения результатов текущей сессии (вместо БД)
results_history = []


@app.route('/')
def index():
    """Главная страница - выбор словаря."""
    return render_template('index.html', dictionaries=TEXTS_DICTIONARIES.keys())


@app.route('/race')
def start_race():
    """
    Запускает гонку.
    Выбирает случайный текст из выбранного словаря.
    """
    dictionary_name = request.args.get('dict', 'default')
    text_to_type = TEXTS_DICTIONARIES[dictionary_name][0]  # Берем первый текст из категории

    return render_template(
        'race.html',
        original_text=text_to_type,
        dict_name=dictionary_name
    )


@app.route('/submit-result', methods=['POST'])
def submit_result():
    """
    Принимает результат от клиента через JSON.
    Сохраняет его в список results_history.
    """
    data = request.json
    result_entry = {
        'wpm': data['wpm'],
        'accuracy': data['accuracy'],
        'chars_typed': data['charsTyped'],
        'errors_made': data['errorsMade'],
        'time_sec': data['timeSpent']
    }
    results_history.append(result_entry)
    print(f"НОВЫЙ РЕЗУЛЬТАТ: {result_entry}")  # Вывод в консоль сервера
    return {'status': 'success'}


if __name__ == '__main__':
    app.run(debug=True)