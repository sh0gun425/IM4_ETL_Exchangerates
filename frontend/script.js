console.log('Hello, World!');

let lineChart;
let currentIndex = 0;  // Initialisiert mit dem Index für 'EUR'
const currencies = ['EUR', 'USD', 'GBP'];

async function fetchChartData(currency, period) {
    try {
        let url = `https://267838-5.web.fhgr.ch/backend/endpoint.php?currency=${currency}`;
        if (period === 'day') {
            url += '&limit=8'; // Daten für einen Tag (8 Datensätze)
        } else if (period === 'week') {
            url += '&limit=56'; // Daten für eine Woche (56 Datensätze)
        } else if (period === 'month') {
            url += '&limit=224'; // Daten für einen Monat (224 Datensätze)
        }
        
        const response = await fetch(url);
        const data = await response.json();
        return data.reverse(); // Älteste Daten zuerst
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

document.addEventListener('DOMContentLoaded', function() {
    main();
});

async function main() {
    const fetchedData = await fetchLatestCurrencyData();
    updateExchangeRates(fetchedData);

    const ctx = document.getElementById('rateChart').getContext('2d');
    

    // Initialer Zeitraum: Tag
    const initialCurrency = currencies[currentIndex];
    const initialChartData = await fetchChartData(initialCurrency, 'day');
    lineChart = createChart(ctx, initialCurrency, initialChartData);

    // Event-Listener für die Zeitraum-Buttons hinzufügen
    const dayButton = document.getElementById('button-day');
    const weekButton = document.getElementById('button-week');
    const monthButton = document.getElementById('button-month');

        // Hervorheben des Tages-Buttons beim Laden der Seite
    dayButton.classList.add('selected');

    dayButton.addEventListener('click', async function() {
        const currency = currencies[currentIndex]; // Währung beibehalten
        const chartData = await fetchChartData(currency, 'day');
        updateChart(lineChart, currency, chartData);

        // Hervorheben des ausgewählten Buttons
        dayButton.classList.add('selected');
        weekButton.classList.remove('selected');
        monthButton.classList.remove('selected');
    });

    weekButton.addEventListener('click', async function() {
        const currency = currencies[currentIndex]; // Währung beibehalten
        const chartData = await fetchChartData(currency, 'week');
        updateChart(lineChart, currency, chartData);

        // Hervorheben des ausgewählten Buttons
        dayButton.classList.remove('selected');
        weekButton.classList.add('selected');
        monthButton.classList.remove('selected');
    });

    monthButton.addEventListener('click', async function() {
        const currency = currencies[currentIndex]; // Währung beibehalten
        const chartData = await fetchChartData(currency, 'month');
        updateChart(lineChart, currency, chartData);

        // Hervorheben des ausgewählten Buttons
        dayButton.classList.remove('selected');
        weekButton.classList.remove('selected');
        monthButton.classList.add('selected');
    });

    // Event-Listener für die Währungswechsel-Buttons hinzufügen
    const leftArrowButton = document.querySelector('.button-change-curency_left');
    const rightArrowButton = document.querySelector('.button-change-curency_right');

    leftArrowButton.addEventListener('click', function() {
        changeCurrency(-1);
    });

    rightArrowButton.addEventListener('click', function() {
        changeCurrency(1);
    });

    // Set initial currency
    changeCurrency(currentIndex);

    // Add event listener to the calculate button
    const calculateButton = document.getElementById('B1');
    calculateButton.addEventListener('click', async function(event) {
        event.preventDefault(); // Prevent form submission

        // Get the value of CHF input
        const chfValue = parseFloat(document.getElementById('w1').value);

        // Fetch the latest exchange rate for the selected currency
        const currencyCode = currencies[currentIndex];
        const exchangeRateData = await fetchLatestCurrencyData();
        const exchangeRate = parseFloat(exchangeRateData[currencyCode]);

        // Perform the currency conversion
        const convertedValue = chfValue * exchangeRate;

        // Update the currency input field with the converted value
        document.getElementById('w2').value = convertedValue.toFixed(2);
    });
}

async function changeCurrency(direction) {
    currentIndex = (currentIndex + direction + currencies.length) % currencies.length;
    const currency = currencies[currentIndex];
    const currencyTitle = document.querySelector('.currency-titel');
    const currencySymbol = document.querySelector('.currency-symbol');
    const currencyImage = document.querySelector('.sliderbild');
    
    const currencyTitles = ['Euro', 'Dollar', 'Pounds'];
    const currencySymbols = ['€', '$', '£'];
    const currencyImages = ['./img/Euro.png', './img/Dollar.png', './img/Pounds.png'];

    currencyTitle.textContent = currencyTitles[currentIndex];
    currencySymbol.textContent = currencySymbols[currentIndex];
    currencyImage.src = currencyImages[currentIndex];

    // Clear the input fields
    document.getElementById('w1').value = '';
    document.getElementById('w2').value = '';

    // Set the placeholder for the second currency input
    const currencyCodes = ['€', '$', '£'];
    const currencyCode = currencyCodes[currentIndex];
    document.getElementById('w2').placeholder = currencyCode;

    // Aktualisiere den Chart mit der neuen Währung
    const chartData = await fetchChartData(currency, 'day'); // Standardmäßig "day" Zeitraum
    updateChart(lineChart, currency, chartData);
}

function createChart(ctx, currency, data) {
    const labels = data.map(item => item.created_at);
    const currencyData = data.map(item => item.rate);

    const chartConfig = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: currency,
                    data: currencyData,
                    borderColor: '#D4DB49',
                    borderWidth: 3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        color: 'white'
                    },
                    title: {
                        display: true,
                        text: 'Time',
                        color: 'white'
                    },
                    ticks: {
                        color: 'white'
                    }
                },
                y: {
                    display: true,
                    grid: {
                        color: 'white'
                    },
                    title: {
                        display: true,
                        text: 'Exchange Rate',
                        color: 'white'
                    },
                    ticks: {
                        color: 'white'
                    }
                }
            }
        }
    };

    return new Chart(ctx, chartConfig);
}

function updateChart(chart, currency, data) {
    chart.data.labels = data.map(item => item.created_at);
    chart.data.datasets[0].data = data.map(item => item.rate);
    chart.data.datasets[0].label = currency;
    chart.update();
}

async function fetchLatestCurrencyData() {
    const currencies = ['USD', 'GBP', 'EUR'];
    const data = {};

    for (const currency of currencies) {
        try {
            const response = await fetch(`https://267838-5.web.fhgr.ch/backend/endpoint.php?currency=${currency}&latest=true`);
            const responseData = await response.json();
            
            if (Array.isArray(responseData) && responseData.length > 0) {
                data[currency] = responseData[0].rate;
            } else {
                console.error('Error: Unexpected response format for', currency);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return data;
}

function updateExchangeRates(data) {
    const dollarRateElement = document.getElementById('input-dollar-data');
    const poundRateElement = document.getElementById('input-pound-data');
    const euroRateElement = document.getElementById('input-euro-data');

    const newDollarRate = parseFloat(data['USD']).toFixed(3);
    const newPoundRate = parseFloat(data['GBP']).toFixed(3);
    const newEuroRate = parseFloat(data['EUR']).toFixed(3);

    dollarRateElement.textContent = newDollarRate;
    poundRateElement.textContent = newPoundRate;
    euroRateElement.textContent = newEuroRate;
}








// console.log('Hello, World!');

// let lineChart;

// async function fetchChartData(currency, start, end) {
//     if (!start || !end) {
//         try {
//             const response = await fetch(`https://267838-5.web.fhgr.ch/backend/endpoint.php?currency=${currency}&limit=8`);
//             const data = await response.json();
//             data.reverse();
//             return data;
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     } else {
//         try {
//             const response = await fetch(`https://267838-5.web.fhgr.ch/backend/endpoint.php?currency=${currency}&start=${start}&end=${end}`);
//             const data = await response.json();
//             return data;
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     }
// }

// document.addEventListener('DOMContentLoaded', function() {
//     main();
// });

// async function main() {
//     const fetchedData = await fetchLatestCurrencyData();
//     updateExchangeRates(fetchedData);

//     const ctx = document.getElementById('rateChart').getContext('2d');
//     let lineChart;

//     // Initialer Zeitraum: Tag
//     const initialCurrency = 'EUR';
//     const initialChartData = await fetchChartData(initialCurrency, 'day');
//     lineChart = createChart(ctx, initialCurrency, initialChartData);

//     // Event-Listener für die Zeitraum-Buttons hinzufügen
//     const dayButton = document.getElementById('button-day');
//     const weekButton = document.getElementById('button-week');
//     const monthButton = document.getElementById('button-month');

//     dayButton.addEventListener('click', async function() {
//         const currency = 'EUR'; // Währung beibehalten
//         const chartData = await fetchChartData(currency, 'day');
//         updateChart(lineChart, currency, chartData);
//     });

//     weekButton.addEventListener('click', async function() {
//         const currency = 'EUR'; // Währung beibehalten
//         const chartData = await fetchChartData(currency, 'week');
//         updateChart(lineChart, currency, chartData);
//     });

//     monthButton.addEventListener('click', async function() {
//         const currency = 'EUR'; // Währung beibehalten
//         const chartData = await fetchChartData(currency, 'month');
//         updateChart(lineChart, currency, chartData);
//     });
// }

// async function fetchChartData(currency, period) {
//     try {
//         let url = `https://267838-5.web.fhgr.ch/backend/endpoint.php?currency=${currency}`;
//         if (period === 'day') {
//             url += '&limit=8'; // Daten für einen Tag (24 Datensätze)
//         } else if (period === 'week') {
//             url += '&limit=56'; // Daten für eine Woche (24 Datensätze pro Tag über 7 Tage)
//         } else if (period === 'month') {
//             url += '&limit=224'; // Daten für einen Monat (24 Datensätze pro Tag über 28 Tage)
//         }
        
//         const response = await fetch(url);
//         const data = await response.json();
//         return data.reverse(); // Älteste Daten zuerst
//     } catch (error) {
//         console.error('Error:', error);
//         return [];
//     }
// }

// function createChart(ctx, currency, data) {
//     const labels = data.map(item => item.created_at);
//     const currencyData = data.map(item => item.rate);

//     const chartConfig = {
//         type: 'line',
//         data: {
//             labels: labels,
//             datasets: [
//                 {
//                     label: currency,
//                     data: currencyData,
//                     borderColor: '#D4DB49',
//                     borderWidth: 3,
//                     fill: false
//                 }
//             ]
//         },
//         options: {
//             responsive: true,
//             plugins: {
//                 legend: {
//                     display: false
//                 }
//             },
//             scales: {
//                 x: {
//                     display: true,
//                     grid: {
//                         color: 'white'
//                     },
//                     title: {
//                         display: true,
//                         text: 'Time',
//                         color: 'white'
//                     },
//                     ticks: {
//                         color: 'white'
//                     }
//                 },
//                 y: {
//                     display: true,
//                     grid: {
//                         color: 'white'
//                     },
//                     title: {
//                         display: true,
//                         text: 'Exchange Rate',
//                         color: 'white'
//                     },
//                     ticks: {
//                         color: 'white'
//                     }
//                 }
//             }
//         }
//     };

//     return new Chart(ctx, chartConfig);
// }

// function updateChart(chart, currency, data) {
//     chart.data.labels = data.map(item => item.created_at);
//     chart.data.datasets[0].data = data.map(item => item.rate);
//     chart.data.datasets[0].label = currency;
//     chart.update();
// }


// async function fetchLatestCurrencyData() {
//     const currencies = ['USD', 'GBP', 'EUR'];
//     const data = {};

//     for (const currency of currencies) {
//         try {
//             const response = await fetch(`https://267838-5.web.fhgr.ch/backend/endpoint.php?currency=${currency}&latest=true`);
//             const responseData = await response.json();
            
//             if (Array.isArray(responseData) && responseData.length > 0) {
//                 data[currency] = responseData[0].rate;
//             } else {
//                 console.error('Error: Unexpected response format for', currency);
//             }
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     }

//     return data;
// }

// function updateExchangeRates(data) {
//     const dollarRateElement = document.getElementById('input-dollar-data');
//     const poundRateElement = document.getElementById('input-pound-data');
//     const euroRateElement = document.getElementById('input-euro-data');

//     const oldDollarRate = parseFloat(dollarRateElement.textContent);
//     const oldPoundRate = parseFloat(poundRateElement.textContent);
//     const oldEuroRate = parseFloat(euroRateElement.textContent);

//     const newDollarRate = parseFloat(data['USD']).toFixed(3);
//     const newPoundRate = parseFloat(data['GBP']).toFixed(3);
//     const newEuroRate = parseFloat(data['EUR']).toFixed(3);

//     const dollarRateChangePercent = ((newDollarRate - oldDollarRate) / oldDollarRate) * 100;
//     const poundRateChangePercent = ((newPoundRate - oldPoundRate) / oldPoundRate) * 100;
//     const euroRateChangePercent = ((newEuroRate - oldEuroRate) / oldEuroRate) * 100;

//     dollarRateElement.textContent = newDollarRate;
//     poundRateElement.textContent = newPoundRate;
//     euroRateElement.textContent = newEuroRate;

//     // dollarRateElement.style.color = dollarRateChangePercent > 0 ? 'green' : dollarRateChangePercent < 0 ? 'red' : 'white';
//     // poundRateElement.style.color = poundRateChangePercent > 0 ? 'green' : poundRateChangePercent < 0 ? 'red' : 'white';
//     // euroRateElement.style.color = euroRateChangePercent > 0 ? 'green' : euroRateChangePercent < 0 ? 'red' : 'white';
// }


// document.addEventListener('DOMContentLoaded', function() {
//     const currencyTitles = ['Euro', 'Dollar', 'Pounds'];
//     const currencySymbols = ['€', '$', '£'];
//     const currencyImages = ['./img/Euro.png', './img/Dollar.png', './img/Pounds.png'];
//     let currentIndex = 0;

//     const leftArrowButton = document.querySelector('.button-change-curency_left');
//     const rightArrowButton = document.querySelector('.button-change-curency_right');

//     leftArrowButton.addEventListener('click', function() {
//         currentIndex = (currentIndex - 1 + 3) % 3;
//         changeCurrency(currentIndex);
//     });

//     rightArrowButton.addEventListener('click', function() {
//         currentIndex = (currentIndex + 1) % 3;
//         changeCurrency(currentIndex);
//     });

//     function changeCurrency(index) {
//         const currencyTitle = document.querySelector('.currency-titel');
//         const currencySymbol = document.querySelector('.currency-symbol');
//         const currencyImage = document.querySelector('.sliderbild');

//         currencyTitle.textContent = currencyTitles[index];
//         currencySymbol.textContent = currencySymbols[index];
//         currencyImage.src = currencyImages[index];

//         // Clear the input fields
//         document.getElementById('w1').value = '';
//         document.getElementById('w2').value = '';

//          // Set the placeholder for the second currency input
//          const currencyCodes = ['€', '$', '£'];
//          const currencyCode = currencyCodes[index];
//          document.getElementById('w2').placeholder = currencyCode;
//     }

//     // Set initial currency
//     changeCurrency(currentIndex);

//     // Add event listener to the calculate button
//     const calculateButton = document.getElementById('B1');
//     calculateButton.addEventListener('click', async function(event) {
//         event.preventDefault(); // Prevent form submission

//         // Get the value of CHF input
//         const chfValue = parseFloat(document.getElementById('w1').value);

//         // Fetch the latest exchange rate for the selected currency
//         const currencyCode = ['EUR', 'USD', 'GBP'][currentIndex];
//         const exchangeRateData = await fetchLatestCurrencyData();
//         const exchangeRate = parseFloat(exchangeRateData[currencyCode]);

//         // Perform the currency conversion
//         const convertedValue = chfValue * exchangeRate;

//         // Update the EUR input field with the converted value
//         document.getElementById('w2').value = convertedValue.toFixed(2);
//     });
// });