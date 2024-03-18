const storedPlaces = JSON.parse(localStorage.getItem('places'));
let savedPlaces = []

function handleSearchClick(input) {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({
        address: input,
        region: 'US'
    }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results.length > 0)
        {
            console.log(results);
        }
        else 
        {
            alert(`Invalid address: ${input}`);
        }
    })
}


//function that runs on document load, adds event listeners to our search button
$(document).ready(() => {
    const goBtn = $('#goBtn');
    const searchInput = $('#searchBar');
    goBtn.on('click', () => {
        console.log(searchInput.val());
        const input = searchInput.val();
        handleSearchClick(input);
    })
});