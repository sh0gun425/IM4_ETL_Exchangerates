<?php

require_once 'config.php';


try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    die("Verbindung fehlgeschlagen: " . $e->getMessage());
}

if(isset($_GET['currency']) && isset($_GET['start']) && isset($_GET['end'])) {
    $currency = $_GET['currency'];
    $start = $_GET['start'];
    $end = $_GET['end'];
    $sql = "SELECT * FROM ExchangeRates WHERE code = '$currency' AND created_at BETWEEN '$start' AND '$end'";
} elseif (isset($_GET['currency']) && isset($_GET['latest'])) {
    $currency = $_GET['currency'];
    $sql = "SELECT * FROM ExchangeRates WHERE code = '$currency' ORDER BY created_at DESC LIMIT 1";
} elseif (isset($_GET['currency']) && isset($_GET['createdAt'])) {
    $currency = $_GET['currency'];
    $createdAt = $_GET['createdAt'];
    $sql = "SELECT * FROM ExchangeRates WHERE code = '$currency' AND created_at = '$createdAt'";
} elseif (isset($_GET['start']) && isset($_GET['end'])) {
    $start = $_GET['start'];
    $end = $_GET['end'];
    $sql = "SELECT * FROM ExchangeRates WHERE created_at BETWEEN '$start' AND '$end'";
} elseif (isset($_GET['latest'])) {
    $sql = "SELECT * FROM ExchangeRates ORDER BY created_at DESC LIMIT 1";
} elseif (isset($_GET['createdAt'])) {
    $createdAt = $_GET['createdAt'];
    $sql = "SELECT * FROM ExchangeRates WHERE created_at = '$createdAt'";
} elseif (isset($_GET['limit']) && isset($_GET['currency'])) {
    $limit = $_GET['limit'];
    $currency = $_GET['currency'];
    $limit = $limit * 3;
    $sql = "SELECT * FROM ExchangeRates WHERE code = '$currency' ORDER BY created_at DESC LIMIT $limit";
} elseif (isset($_GET['currency'])) {
    $currency = $_GET['currency'];
    $sql = "SELECT * FROM ExchangeRates WHERE code = '$currency'";
} elseif (isset($_GET['limit'])) {
    $limit = $_GET['limit'];
    $limit = $limit * 3;
    $sql = "SELECT * FROM ExchangeRates ORDER BY created_at DESC LIMIT $limit";
} else {
    $sql = "SELECT * FROM ExchangeRates";
}

$stmt = $pdo->query($sql);

$stmt->execute();

if ($stmt->rowCount() > 0) {
    $data = $stmt->fetchAll();
    header('Content-Type: application/json');
    echo json_encode($data);
} else {
    echo json_encode("Keine Ergebnisse gefunden");
}

$pdo = null;

?>