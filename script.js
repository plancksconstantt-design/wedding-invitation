document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('weddingForm');
    const successMessage = document.getElementById('successMessage');
    const transportDetails = document.getElementById('transportDetails');
    const guestsCountGroup = document.getElementById('guestsCountGroup');
    
    // Скрываем дополнительные поля при загрузке
    transportDetails.style.display = 'none';
    
    // Показываем/скрываем поле адреса в зависимости от выбора транспорта
    document.querySelectorAll('input[name="transport"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'yes') {
                transportDetails.style.display = 'flex';
            } else {
                transportDetails.style.display = 'none';
                document.getElementById('transportAddress').value = '';
            }
        });
    });
    
    // Показываем/скрываем количество гостей в зависимости от присутствия
    document.querySelectorAll('input[name="attendance"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'yes') {
                guestsCountGroup.style.display = 'flex';
            } else {
                guestsCountGroup.style.display = 'none';
                document.getElementById('guestsCount').value = '1';
            }
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Собираем данные формы
        const formData = {
            fullName: document.getElementById('fullName').value,
            attendance: document.querySelector('input[name="attendance"]:checked').value,
            guestsCount: document.getElementById('guestsCount').value,
            transport: document.querySelector('input[name="transport"]:checked').value,
            transportAddress: document.getElementById('transportAddress').value,
            allergies: document.getElementById('allergies').value,
            wishes: document.getElementById('wishes').value,
            timestamp: new Date().toLocaleString('ru-RU')
        };
        
        function sendToGoogleSheets(data) {
    // Замените на URL вашего submit.php на хостинге
    const phpScriptURL = 'https://ваш-сайт.vercel.app/submit.php';
    
    fetch(phpScriptURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log('Результат:', result);
        if (!result.success) {
            alert('Ошибка: ' + result.message);
        }
    })
    .catch((error) => {
        console.error('Ошибка:', error);
        saveToLocalStorage(data);
        alert('Данные сохранены локально из-за проблем с соединением');
    });
}
        
        // Показываем сообщение об успехе
        form.style.display = 'none';
        successMessage.classList.remove('hidden');
        
        // Прокручиваем к сообщению об успехе
        successMessage.scrollIntoView({ behavior: 'smooth' });
    });
    
    function sendToGoogleSheets(data) {
        // ЗАМЕНИТЕ ЭТОТ URL НА АДРЕС ВАШЕГО GOOGLE APPS SCRIPT
        const googleScriptURL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
        
        fetch(googleScriptURL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(() => {
            console.log('Данные отправлены в Google Таблицы');
        })
        .catch((error) => {
            console.error('Ошибка при отправке:', error);
            // Данные все равно сохранятся локально
            saveToLocalStorage(data);
        });
    }
    
    function saveToLocalStorage(data) {
        // Сохраняем в localStorage на случай проблем с интернетом
        const responses = JSON.parse(localStorage.getItem('weddingResponses') || '[]');
        responses.push(data);
        localStorage.setItem('weddingResponses', JSON.stringify(responses));
        console.log('Данные сохранены локально');
    }
});