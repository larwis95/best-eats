const storedPlaces = JSON.parse(localStorage.getItem('places'));
const searchDiv = $('#searchDiv');
const search = $('#searchBar');
const bodyEl = $('body')
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
            search.val('');
        }
        else 
        {
            searchDiv.append(`
            <p id="errorText">${input} is not a valid search!`);
            search.val('');
            setTimeout(() => {
                const text = $('#errorText');
                text.remove();
            }, 1000);
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
    new Promise((resolve, error) => {
        service.nearbySearch(query, (results) => {
        resolve(results);
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

function getModalInfo(id) {
    const request = {
        placeId: id
    };
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    const restaurant = service.getDetails(request, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) 
        {
            console.log(place)
            let info = {
                address: place.formatted_address,
                name: place.name,
                phone: place.formatted_phone_number,
                rating: place.rating,
                reviews: place.reviews,
                website: place.website
            };
            createModal(info);
        }
    });
    console.log(restaurant);
};

function createModal(restaurant) {
    bodyEl.append(`
    <div class="modal">
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">${restaurant.name}</p>
                <p>Rating: ${restaurant.rating} ☆</p>
                <button class="delete" aria-label="close"></button>
            </header>
            <section class="modal-card-body">
                <h2>Reviews</h2>
                <ul id="reviewUL">
                </ul>
            </section>
            <footer class="modal-card-foot">
                <button class="button is-success">Save to Favorites</button>
            </footer>
        </div>
    </div>`);
    addReviews(restaurant.reviews);
    showModal();
}

function addReviews(reviews) {
    const ulEl = $('#reviewUL');
    for (let i = 0; i < reviews.length; i++)
    {
        let author = reviews[i].author_name;
        let rating = reviews[i].rating;
        let time = reviews[i].relative_time_description;
        let text = reviews[i].text;
        ulEl.append(`
            <li>
                <article class="media">
                    <div class="media-content">
                        <div class="content">
                        <p>
                        <strong>${author}</strong> <small>${rating} ☆</small> <small>${time}</small>
                        <br>
                        ${text};
                        </p>
                        </div>
                    </div>
                </article>
            </li>
        `);

    }
}

function showModal() {
    const modal = $('.modal');
    modal.addClass('is-active');
}


//function that runs on document load, adds event listeners to our search button
$(document).ready(() => {
    const goBtn = $('#goBtn');
    goBtn.on('click', () => {
        console.log(search.val());
        const input = search.val();
        handleSearchClick(input);
    })
});