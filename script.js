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
    console.log('Данные для отправки:', data);
    
    // Показываем успех сразу
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.textContent = 'Отправляем...';
    submitBtn.disabled = true;
    
    // Сохраняем локально ВСЕГДА
    saveToLocalStorage(data);
    
    // Показываем успех
    setTimeout(() => {
        form.style.display = 'none';
        successMessage.classList.remove('hidden');
        successMessage.scrollIntoView({ behavior: 'smooth' });
        console.log('Форма завершена - данные в localStorage');
    }, 1000);
    
    // Пытаемся отправить на Google Apps Script (в фоне)
    try {
        // Простой POST без ожидания ответа
        fetch('https://script.google.com/macros/s/AKfycbxtobpDwLKtoq90lI6JyeczbOkAI-E0O66sOvlHaPZkBcw-9ZhVs-tFwMeF0xr4TEZe/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }).then(() => console.log('Фоновая отправка завершена'));
    } catch (e) {
        console.log('Фоновая отправка не удалась, но данные сохранены локально');
    }
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