
export const baseUrl = "http://localhost:8000";
export const imageWidth = 488;
export const imageHeight = 680;
export const gridCardSizeFactor = 0.5;
export const popupImageSizeFactor = 0.7
export const variantImageSizeFactor = 0.4
export const searchBarDrawerWidth = 280
export const deckManagerDrawerWidth = 450;
export const maximumCardCopiesStandard = 4
export const navBarHeight = 50;

export const numberFormat = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumSignificantDigits: 2,
    maximumSignificantDigits: 2
})

export const manaCurveChartOptions = {
    responsive: true,
    scales: {
        y: {  
          ticks: {
            color: "black",
            font: {
              size: 15, 
            },
            stepSize: 1,
            beginAtZero: true
          }
        },
        x: { 
          ticks: {
            color: "black", 
            font: {
              size: 15
            },
            stepSize: 1,
            beginAtZero: true
          }
        }
      },
    plugins: {
        colors: {
            enabled: false
          },
          legend: {
            display: false,
          },
        title: {
            display: true,
            text: 'Mana curve',
            font: {
                size: 18
              },
              color: "black", 
        },
    },
};
