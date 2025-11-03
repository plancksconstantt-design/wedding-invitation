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

    // Функция для экспорта данных из localStorage
    function exportLocalStorageData() {
        const responses = JSON.parse(localStorage.getItem('weddingResponses') || '[]');
        if (responses.length === 0) {
            console.log('Нет данных в localStorage');
            alert('Нет данных для экспорта');
            return;
        }
        
        // Создаем CSV для скачивания
        let csv = 'Дата,ФИО,Присутствие,Гости,Транспорт,Адрес,Аллергии,Пожелания\n';
        
        responses.forEach(response => {
            csv += `"${response.timestamp}","${response.fullName}","${response.attendance}","${response.guestsCount}","${response.transport}","${response.transportAddress}","${response.allergies}","${response.wishes}"\n`;
        });
        
        // Создаем ссылку для скачивания
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wedding_responses.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        console.log('Данные экспортированы в CSV');
        alert(`Экспортировано ${responses.length} ответов`);
    }

    // Делаем функцию экспорта доступной глобально
    window.exportLocalStorageData = exportLocalStorageData;
    
    // Добавляем кнопку экспорта для администратора (опционально)
    addExportButton();
    
    function addExportButton() {
        // Проверяем если это администратор (по URL параметру)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('admin')) {
            const exportBtn = document.createElement('button');
            exportBtn.textContent = '📥 Экспорт данных';
            exportBtn.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 5px;
                cursor: pointer;
                z-index: 1000;
            `;
            exportBtn.onclick = exportLocalStorageData;
            document.body.appendChild(exportBtn);
        }
    }
});