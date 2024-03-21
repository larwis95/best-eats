const storedPlaces = JSON.parse(localStorage.getItem('places'));
const searchDiv = $('#searchDiv');
const search = $('#searchBar');
const bodyEl = $('body');
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
        radius: '8046.72'

    }
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    return new Promise((resolve, error) => {
        service.nearbySearch(query, (results) => {
        resolve(results);
        console.log(results);
        sortRestarants(results);
        })
    })
};

function sortRestarants(restaurants) {
    const highRated = restaurants.sort((a, b) => b.rating - a.rating).slice(0, 5);
    renderList(highRated);
};

//function to render the intial restaurant list, restaurant[i].name = name of restaurant, restaurant[i].rating = rating, restaurant.place_id = place id
function renderList(restaurants) {
    const initialBody = $('#initialBody');
        console.log('render list');
    const navDiv = $('#navSearch');
    initialBody.empty();
    navDiv.empty()
    const navSearch = navDiv.append(`
    <input class="input has-text-centered" type="text" placeholder="San Jose, CA" id="searchBar">
   `);
   const navBtn = navDiv.append(`<button class="button has-text-centered goBtn">Go</button>`)
   addNavHandler(navSearch, navBtn);
   
    console.table(restaurants);

}

function addNavHandler(searchBar, btn){
    $(btn).on("click", ()=>{
        const input = $(searchBar).val()
        handleSearchClick(input)
    })
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
                id: place.place_id,
                name: place.name,
                phone: place.formatted_phone_number,
                rating: place.rating,
                reviews: place.reviews,
                website: place.website
            };
            console.log(info);
            createModal(info);
        }
    });
    console.log(restaurant);
};

function createModal(restaurant) {
    bodyEl.append(`
    <div class="modal">
        <div class="modal-background"></div>
        <div class="modal-card" style="border: 1px solid #D16014">
            <header class="modal-card-head">
                <p class="modal-card-title">${restaurant.name}</p>
                <p class="m-1">Rating: ${restaurant.rating} ☆</p>
                <button class="delete m-1" aria-label="close"></button>
            </header>
            <section class="modal-card-body">
                <div class="m-4 p-2" style="border: 1px solid white">
                    <ul id="modalInfo">
                        <li class="p2">${restaurant.address}</li>
                        <li class="p2"><a href="${restaurant.website}">Website</a></li>
                        <li class="p2">${restaurant.phone}<li>
                    </ul>
                </div>
                <h2 style="font-weight: bolder">Reviews</h2>
                <ul id="reviewUL">
                </ul>
            </section>
            <footer class="modal-card-foot is-flex is-justify-content-center">
                <button class="button is-success" id="favButton">Save to Favorites</button>
            </footer>
        </div>
    </div>`);
    addReviews(restaurant.reviews);
    showModal();
    addModalHandlers(restaurant);
};

function addReviews(reviews) {
    const ulEl = $('#reviewUL');
    for (let i = 0; i < reviews.length; i++)
    {
        let author = reviews[i].author_name;
        let rating = reviews[i].rating;
        let time = reviews[i].relative_time_description;
        let text = reviews[i].text;
        ulEl.append(`
            <li class="m-1 p-1" style="border-bottom: 1px solid white">
                <article class="media">
                    <div class="media-content">
                        <div class="content">
                            <p>
                            <strong>${author}</strong> | <small>${rating} ☆</small> | <small>${time}</small>
                            <br>
                            ${text}
                            </p>
                        </div>
                    </div>
                </article>
            </li>
        `);

    }
};

function showModal() {
    const modal = $('.modal');
    modal.addClass('is-active');
};

function addModalHandlers(restaurant) {
    const modalBg = $('.modal-background');
    const closeBtn = $('.delete');
    const favBtn = $('#favButton');
    closeBtn.on('click', () => {
        closeModal();
    });
    modalBg.on('click', () => {
        closeModal();
    });
    favBtn.on('click', () => {
        const favInfo = {id: restaurant.id, name: restaurant.name};
        let found = false;
        for (let i = 0; i < savedPlaces.length; i++) 
        {
            if (savedPlaces[i].id === restaurant.id)
            {
                found = true;
            }
        }
        if (found === false) 
        {
            savedPlaces.push(favInfo);
            setLocalStorage();
        }
        else 
        {
            $('.modal-card-foot').append('<p id="errorText">Already saved to favorites!</p>');
              setTimeout(() => {
                const text = $('#errorText');
                text.remove();
            }, 1000);
        }
    });
};

function setLocalStorage() {
    localStorage.setItem('places', JSON.stringify(savedPlaces));
};

function closeModal() {
    const modal = $('.modal');
    modal.remove();
};

//function that runs on document load, adds event listeners to our search button
$(document).ready(() => {
    
    if (storedPlaces !== null)
    {
        savedPlaces = storedPlaces;
    }
    const goBtn = $('#goBtn');
    goBtn.on('click', () => {
        console.log(search.val());
        const input = search.val();
        if (input !== '') 
        {
            handleSearchClick(input);
        }
        else
        {
            searchDiv.append(`
            <p id="errorText">Type something first!`);
            search.val('');
            setTimeout(() => {
                const text = $('#errorText');
                text.remove();
            }, 1000);
        }
    })
    generateSidebarList();
});

// Function to generate list items in the sidebar
function generateSidebarList() {
  const $sidebarList = $('#sidebar-list');

  // Loop through the items and create list items
  savedPlaces.forEach(savedPlaces => {
    $sidebarList.append(`<li class= 'menu-list-item' data-place='${savedPlaces.id}'>${savedPlaces.name} <button class= 'menu-delete-btn'> X </button> </li>`); // Append the <li> to the <ul>
  });
  $sidebarList.on("click",(event)=>{
    favoritesAddhandle(event)
  } )
}

function favoritesAddhandle(event) {
    event.stopPropagation();
    const targFav = $(event.target)
    if(targFav.get(0).nodeName === "BUTTON"){
        deleteFav(event)
        console.log(targFav.get(0));
    } else if(targFav.get(0).nodeName === "LI") {
        console.log(targFav.get(0));
        getModalInfo(targFav.attr('data-place'))
    }
    
}

function deleteFav(event) {
    const delBut = $(event.target);
    const delLI = delBut.closest('LI');
    const idDel = delLI.attr('data-place');
    for(i = 0; i < storedPlaces.length; i++) {
        if(savedPlaces[i].id === idDel) {
            savedPlaces.splice(i, 1)
            delLI.remove()
            setLocalStorage()
        }
    }
}