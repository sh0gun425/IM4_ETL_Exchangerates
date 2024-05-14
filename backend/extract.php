<?php


$url = "https://api.currencybeacon.com/v1/latest?base=CHF&api_key=Rm4hrUiRB7MpOgJjdQy7nOSBgY7LmGPX";

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$output = curl_exec($ch);

curl_close($ch);


$data = json_decode($output, true);

$exchangeRate = [];

$usd = $data['response']['rates']['USD'];
$gbp = $data['response']['rates']['GBP'];
$eur = $data['response']['rates']['EUR'];

$exchangeRate['USD'] = $usd;
$exchangeRate['GBP'] = $gbp;
$exchangeRate['EUR'] = $eur;

// print_r($weather_data);
// echo $weather_data[0]['latitude'];

// echo json_encode($exchangeRate);

?>