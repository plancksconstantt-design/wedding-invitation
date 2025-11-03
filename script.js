document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('weddingForm');
    const successMessage = document.getElementById('successMessage');
    const transportDetails = document.getElementById('transportDetails');
    const guestsCountGroup = document.getElementById('guestsCountGroup');
    
    // Скрываем дополнительные поля при загрузке
    transportDetails.style.display = 'none';
    guestsCountGroup.style.display = 'none';
    
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
        
        // Проверяем обязательные поля
        if (!document.getElementById('fullName').value.trim()) {
            alert('Пожалуйста, введите ваше ФИО');
            return;
        }
        
        if (!document.querySelector('input[name="attendance"]:checked')) {
            alert('Пожалуйста, укажите, придете ли вы на свадьбу');
            return;
        }
        
        if (!document.querySelector('input[name="transport"]:checked')) {
            alert('Пожалуйста, укажите, нужен ли вам транспорт');
            return;
        }
        
        // Собираем данные формы
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            attendance: document.querySelector('input[name="attendance"]:checked').value,
            guestsCount: document.getElementById('guestsCount').value,
            transport: document.querySelector('input[name="transport"]:checked').value,
            transportAddress: document.getElementById('transportAddress').value,
            allergies: document.getElementById('allergies').value,
            wishes: document.getElementById('wishes').value
        };
        
        // Отправляем данные
        sendToGoogleSheets(formData);
    });
    
    function sendToGoogleSheets(data) {
        const googleScriptURL = 'https://script.google.com/macros/s/AKfycbxtobpDwLKtoq90lI6JyeczbOkAI-E0O66sOvlHaPZkBcw-9ZhVs-tFwMeF0xr4TEZe/exec';
        
        // Показываем загрузку
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправляем...';
        submitBtn.disabled = true;
        
        fetch(googleScriptURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            console.log('Результат:', result);
            
            if (result.success) {
                // Показываем сообщение об успехе
                form.style.display = 'none';
                successMessage.classList.remove('hidden');
                successMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Ошибка: ' + result.message);
                // Восстанавливаем кнопку
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        })
        .catch((error) => {
            console.error('Ошибка:', error);
            // Сохраняем локально и показываем успех
            saveToLocalStorage(data);
            form.style.display = 'none';
            successMessage.classList.remove('hidden');
            successMessage.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    function saveToLocalStorage(data) {
        // Сохраняем в localStorage на случай проблем с интернетом
        const responses = JSON.parse(localStorage.getItem('weddingResponses') || '[]');
        data.timestamp = new Date().toLocaleString('ru-RU');
        responses.push(data);
        localStorage.setItem('weddingResponses', JSON.stringify(responses));
        console.log('Данные сохранены локально');
        
        // Показываем сообщение о локальном сохранении
        const successText = successMessage.querySelector('p');
        successText.innerHTML = 'Спасибо за ваш ответ!<br><small>Данные сохранены локально (интернет проблемы)</small>';
    }
});