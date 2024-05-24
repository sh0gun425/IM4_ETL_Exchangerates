console.log('Hello, World!');

let lineChart;
let currentIndex = 0; 
const currencies = ['EUR', 'USD', 'GBP'];

async function fetchChartData(currency, period) {
    try {
        let url = `https://267838-5.web.fhgr.ch/backend/endpoint.php?currency=${currency}`;
        if (period === 'day') {
            url += '&limit=8';
        } else if (period === 'week') {
            url += '&limit=56';
        } else if (period === 'month') {
            url += '&limit=224';
        }
        
        const response = await fetch(url);
        const data = await response.json();
        return data.reverse();
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
    
    // Initial currency and chart data
    const initialCurrency = currencies[currentIndex];
    const initialChartData = await fetchChartData(initialCurrency, 'day');
    lineChart = createChart(ctx, initialCurrency, initialChartData);

    // Time period buttons
    const dayButton = document.getElementById('button-day');
    const weekButton = document.getElementById('button-week');
    const monthButton = document.getElementById('button-month');

    // Highlight the selected button
    dayButton.classList.add('selected');

    dayButton.addEventListener('click', async function() {
        const currency = currencies[currentIndex]; // Currency remains the same
        const chartData = await fetchChartData(currency, 'day');
        updateChart(lineChart, currency, chartData);

        // Highlight the selected button
        dayButton.classList.add('selected');
        weekButton.classList.remove('selected');
        monthButton.classList.remove('selected');
    });

    weekButton.addEventListener('click', async function() {
        const currency = currencies[currentIndex]; //  Currency remains the same
        const chartData = await fetchChartData(currency, 'week');
        updateChart(lineChart, currency, chartData);

        // Highlight the selected button
        dayButton.classList.remove('selected');
        weekButton.classList.add('selected');
        monthButton.classList.remove('selected');
    });

    monthButton.addEventListener('click', async function() {
        const currency = currencies[currentIndex]; // Currency remains the same
        const chartData = await fetchChartData(currency, 'month');
        updateChart(lineChart, currency, chartData);

        // Highlight the selected button
        dayButton.classList.remove('selected');
        weekButton.classList.remove('selected');
        monthButton.classList.add('selected');
    });

    // Currency change buttons
    const leftArrowButton = document.querySelector('.button-change-curency_left');
    const rightArrowButton = document.querySelector('.button-change-curency_right');

    leftArrowButton.addEventListener('click', function() {
        changeCurrency(-1);
        // Mark the day button as selected when changing currency
        dayButton.classList.add('selected');
        weekButton.classList.remove('selected');
        monthButton.classList.remove('selected');
    });

    rightArrowButton.addEventListener('click', function() {
        changeCurrency(1);
        // Mark the day button as selected when changing currency
        dayButton.classList.add('selected');
        weekButton.classList.remove('selected');
        monthButton.classList.remove('selected');
    });

    // Set initial currency
    changeCurrency(currentIndex);

    // Add event listeners to the input fields
    const chfInput = document.getElementById('w1');
    const currencyInput = document.getElementById('w2');

    chfInput.addEventListener('input', async function() {
        const chfValue = parseFloat(chfInput.value);
        if (isNaN(chfValue)) {
            currencyInput.value = '';
            return;
        }
        
        const currencyCode = currencies[currentIndex];
        const exchangeRateData = await fetchLatestCurrencyData();
        const exchangeRate = parseFloat(exchangeRateData[currencyCode]);
        
        const convertedValue = chfValue * exchangeRate;
        currencyInput.value = convertedValue.toFixed(2);
    });

    currencyInput.addEventListener('input', async function() {
        const currencyValue = parseFloat(currencyInput.value);
        if (isNaN(currencyValue)) {
            chfInput.value = '';
            return;
        }

        const currencyCode = currencies[currentIndex];
        const exchangeRateData = await fetchLatestCurrencyData();
        const exchangeRate = parseFloat(exchangeRateData[currencyCode]);
        
        const convertedValue = currencyValue / exchangeRate;
        chfInput.value = convertedValue.toFixed(2);
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

    // Reset the input fields
    document.getElementById('w1').value = '';
    document.getElementById('w2').value = '';


    const currencyCodes = ['€', '$', '£'];
    const currencyCode = currencyCodes[currentIndex];
    document.getElementById('w2').placeholder = currencyCode;

    // Fetch new chart data
    const chartData = await fetchChartData(currency, 'day'); // Default to day
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
                    display: false,
                    labels: {
                        color: 'white',
                        font: {
                            size: 14
                        }
                    }
                },
                title: {
                    display: true,
                    text: `Exchange Rate for ${currency}`,
                    color: 'white',
                    font: {
                        size: 20
                    }
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
    chart.options.plugins.title.text = `Exchange Rate for ${currency}`; // Update chart title
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
