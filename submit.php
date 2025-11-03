<?php
// Разрешаем CORS для всех доменов
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Обрабатываем preflight запрос
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Функция для логирования ошибок
function logError($message) {
    file_put_contents('error.log', date('Y-m-d H:i:s') . ' - ' . $message . "\n", FILE_APPEND);
}

// Основная функция обработки
function processForm() {
    // Получаем данные из POST запроса
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        return ['success' => false, 'message' => 'Нет данных от формы'];
    }
    
    // Проверяем обязательные поля
    if (empty($input['fullName']) || empty($input['attendance'])) {
        return ['success' => false, 'message' => 'Заполните обязательные поля'];
    }
    
    // Подготавливаем данные для записи
    $timestamp = date('Y-m-d H:i:s');
    $fullName = trim($input['fullName']);
    $attendance = ($input['attendance'] == 'yes') ? 'Да' : 'Нет';
    $guestsCount = $input['guestsCount'] ?? '1';
    $transport = ($input['transport'] == 'yes') ? 'Да' : 'Нет';
    $transportAddress = $input['transportAddress'] ?? '';
    $allergies = $input['allergies'] ?? '';
    $wishes = $input['wishes'] ?? '';
    
    // Формируем строку для записи
    $dataRow = [
        $timestamp,
        $fullName,
        $attendance,
        $guestsCount,
        $transport,
        $transportAddress,
        $allergies,
        $wishes
    ];
    
    // Пытаемся записать в Google Sheets через Google Apps Script
    $googleScriptResult = sendToGoogleAppsScript($dataRow);
    
    if ($googleScriptResult['success']) {
        return ['success' => true, 'message' => 'Ваш ответ успешно сохранен!'];
    } else {
        // Если не удалось отправить в Google, сохраняем локально
        return saveToLocalFile($dataRow);
    }
}

// Функция для отправки в Google Apps Script
function sendToGoogleAppsScript($dataRow) {
    // ЗАМЕНИТЕ НА ВАШ URL GOOGLE APPS SCRIPT
    $googleScriptURL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
    
    $postData = json_encode(['data' => $dataRow]);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $googleScriptURL);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($postData)
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode == 200) {
        return ['success' => true];
    } else {
        logError('Google Apps Script error: ' . $httpCode . ' - ' . $response);
        return ['success' => false];
    }
}

// Функция для сохранения в локальный файл (резервный вариант)
function saveToLocalFile($dataRow) {
    $filename = 'wedding_responses.csv';
    
    // Если файла нет, создаем заголовки
    if (!file_exists($filename)) {
        $headers = [
            'Timestamp',
            'Full Name', 
            'Attendance',
            'Guests Count',
            'Transport',
            'Transport Address',
            'Allergies',
            'Wishes'
        ];
        $handle = fopen($filename, 'w');
        fputcsv($handle, $headers);
        fclose($handle);
    }
    
    // Добавляем данные
    $handle = fopen($filename, 'a');
    fputcsv($handle, $dataRow);
    fclose($handle);
    
    return ['success' => true, 'message' => 'Данные сохранены локально!'];
}

// Обрабатываем запрос
try {
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $result = processForm();
        echo json_encode($result);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Только POST запросы']);
    }
} catch (Exception $e) {
    logError('General error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Внутренняя ошибка сервера']);
}
?>