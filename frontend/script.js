console.log('Hello, World!');

let lineChart;

async function fetchData(currency, start, end) {

    if(!start || !end) {
        try {
            const response = await fetch(`https://267838-5.web.fhgr.ch/endpoint.php?currency=${currency}&limit=24`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        try {
            const response = await fetch(`https://267838-5.web.fhgr.ch/endpoint.php?currency=${currency}&start=${start}&end=${end}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
        }
    }

}

async function main() {
    const currency = 'USD'; // Set your default currency here or obtain it from user input
    let data = await fetchData(currency);
    console.log(data);

    const ctx = document.getElementById('myChart').getContext('2d');
    
    let labels = [];
    let currencyData = [];

    data.forEach(item => {
        labels.push(item.created_at);
        if (item.code === currency) {
            currencyData.push(item.rate);
        }
    });

    //filter the returned data to only have the timestamps once for the x axis
    labels = labels.filter((item, index) => labels.indexOf(item) === index);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: currency,
                data: currencyData,
                borderColor: 'red',
                fill: false
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Exchange Rate'
                }
            }
        }
    };

    lineChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: chartOptions
    });
}

main();

// Assuming you have a dropdown/select element with id 'currencySelect' for currency selection
const currencySelect = document.getElementById('currencySelect');

currencySelect.addEventListener('change', async function() {
    const newCurrency = currencySelect.value;
    const newData = await fetchData(newCurrency);
    
    let labels = [];
    let currencyData = [];

    newData.forEach(item => {
        labels.push(item.created_at);
        currencyData.push(item.rate);
    });

    //filter the returned data to only have the timestamps once for the x axis
    labels = labels.filter((item, index) => labels.indexOf(item) === index);

    // Update chart data
    lineChart.data.labels = labels;
    lineChart.data.datasets[0].data = currencyData;
    lineChart.data.datasets[0].label = newCurrency;
    
    // Update chart
    lineChart.update();
});

