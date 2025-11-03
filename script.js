document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('weddingForm');
    const successMessage = document.getElementById('successMessage');
    const transportDetails = document.getElementById('transportDetails');
    const guestsCountGroup = document.getElementById('guestsCountGroup');
    
    transportDetails.style.display = 'none';
    guestsCountGroup.style.display = 'none';
    
    document.querySelectorAll('input[name="transport"]').forEach(radio => {
        radio.addEventListener('change', function() {
            transportDetails.style.display = this.value === 'yes' ? 'flex' : 'none';
            if (this.value !== 'yes') document.getElementById('transportAddress').value = '';
        });
    });
    
    document.querySelectorAll('input[name="attendance"]').forEach(radio => {
        radio.addEventListener('change', function() {
            guestsCountGroup.style.display = this.value === 'yes' ? 'flex' : 'none';
            if (this.value !== 'yes') document.getElementById('guestsCount').value = '1';
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!document.getElementById('fullName').value.trim()) {
            alert('Пожалуйста, введите ваше ФИО');
            return;
        }
        
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            attendance: document.querySelector('input[name="attendance"]:checked')?.value,
            guestsCount: document.getElementById('guestsCount').value,
            transport: document.querySelector('input[name="transport"]:checked')?.value,
            transportAddress: document.getElementById('transportAddress').value,
            allergies: document.getElementById('allergies').value,
            wishes: document.getElementById('wishes').value
        };

        if (!formData.attendance || !formData.transport) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        sendToGoogleSheets(formData);
    });
    
    function sendToGoogleSheets(data) {
        // ВАШ НОВЫЙ URL
        const googleScriptURL = 'https://script.google.com/macros/s/AKfycbxtobpDwLKtoq90lI6JyeczbOkAI-E0O66sOvlHaPZkBcw-9ZhVs-tFwMeF0xr4TEZe/exec';
        
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправляем...';
        submitBtn.disabled = true;
        
        console.log('Отправка данных:', data);
        
        fetch(googleScriptURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            console.log('Ответ получен:', response);
            return response.json();
        })
        .then(result => {
            console.log('Результат:', result);
            
            if (result.success) {
                form.style.display = 'none';
                successMessage.classList.remove('hidden');
                successMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Ошибка: ' + result.message);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        })
        .catch((error) => {
            console.error('Ошибка fetch:', error);
            saveToLocalStorage(data);
            form.style.display = 'none';
            successMessage.classList.remove('hidden');
            successMessage.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    function saveToLocalStorage(data) {
        const responses = JSON.parse(localStorage.getItem('weddingResponses') || '[]');
        data.timestamp = new Date().toLocaleString('ru-RU');
        responses.push(data);
        localStorage.setItem('weddingResponses', JSON.stringify(responses));
        console.log('Данные сохранены локально:', data);
        
        const successText = successMessage.querySelector('p');
        successText.innerHTML = 'Спасибо за ваш ответ!<br><small>Данные сохранены локально</small>';
    }
});