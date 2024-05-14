<?php

include 'config.php';

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    die("Verbindung fehlgeschlagen: " . $e->getMessage());
}

$sql = "SELECT * FROM ExchangeRates";


if (isset($_GET['currency'])) {
    $currency = $_GET['currency'];
    $sql = "SELECT * FROM ExchangeRates WHERE code = '$currency'";
} else {
    $sql = "SELECT * FROM ExchangeRates";
}

$stmt = $pdo->query($sql);

if ($stmt->rowCount() > 0) {
    $data = $stmt->fetchAll();
    header('Content-Type: application/json');
    echo json_encode($data);
} else {
    echo json_encode("Keine Ergebnisse gefunden");
}


$pdo = null;
?>

