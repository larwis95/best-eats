const storedPlaces = JSON.parse(localStorage.getItem('places'));
let savedPlaces = [];


function handleSearchClick(input) {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({
        address: input,
        region: 'US'
    }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results.length > 0)
        {
            console.log(results)
            const loc = results[0].geometry.location
            const coords = {lat: loc.lat(), lng: loc.lng()};
            console.log(results)
            findRestaurants(coords);
        }
        else 
        {
            alert(`Invalid address: ${input}`);
        }
    })
};

function findRestaurants(coords) {
    console.log(coords)
    const query = {
        location: coords,
        types: ['restaurant'],
        radius: '3300'

    }
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    const restList = new Promise((resolve, error) => {
            service.nearbySearch(query, (results) => {
                resolve(results)
                console.log(results);
                sortRestarants(results);
            })
        })
}

function sortRestarants(restaurants) {
    const highRated = restaurants.sort((a, b) => b.rating - a.rating).slice(0, 5);
    renderList(highRated);
}

//function to render the intial restaurant list, restaurant[i].name = name of restaurant, restaurant[i].rating = rating, restaurant.place_id = place id
function renderList(restaurants) {
    console.table(restaurants);

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

